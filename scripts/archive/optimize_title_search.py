#!/usr/bin/env python3
"""
Optimize title keyword search performance with multiple strategies.
"""

import time
import duckdb
import os

def create_title_search_optimized_parquet():
    """Create a parquet file optimized specifically for title searches"""
    
    print("=== Creating Title Search Optimized Parquet ===")
    
    conn = duckdb.connect()
    
    # Create a parquet file with pre-computed title search fields
    print("Creating title-optimized parquet file...")
    
    start = time.time()
    conn.execute("""
    COPY (
        SELECT 
            -- Primary fields
            contract_number,
            award_date,
            contract_amount,
            
            -- Title fields optimized for search
            award_title,
            notice_title,
            search_text,
            
            -- Pre-computed title search fields
            LOWER(award_title) as award_title_lower,
            LOWER(notice_title) as notice_title_lower,
            LOWER(CONCAT(award_title, ' ', notice_title)) as title_combined_lower,
            
            -- Pre-computed word tokens for faster searching
            string_split(LOWER(CONCAT(award_title, ' ', notice_title)), ' ') as title_words,
            
            -- Other fields
            awardee_name,
            organization_name,
            business_category,
            area_of_delivery
        FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
        ORDER BY award_date DESC
    ) TO 'data/parquet/facts_awards_title_optimized.parquet' (FORMAT PARQUET)
    """)
    
    optimize_time = time.time() - start
    print(f"Title-optimized parquet created in {optimize_time:.3f}s")
    
    # Test performance
    keywords = ['drainage', 'dike', 'flood', 'slope protection', 'revetment']
    like_conditions = ' OR '.join([f"title_combined_lower LIKE '%{kw.lower()}%'" for kw in keywords])
    
    start = time.time()
    result = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet') WHERE ({like_conditions})").fetchone()
    test_time = time.time() - start
    print(f"Title-optimized search time: {test_time:.3f}s ({result[0]:,} results)")
    
    conn.close()

def test_different_search_strategies():
    """Test different search strategies for title keywords"""
    
    print("\n=== Testing Different Search Strategies ===")
    
    conn = duckdb.connect()
    keywords = ['drainage', 'dike', 'flood', 'slope protection', 'revetment']
    
    # Strategy 1: Current approach
    print("1. Current approach (search_text):")
    start = time.time()
    like_conditions = ' OR '.join([f"search_text LIKE '%{kw}%'" for kw in keywords])
    result1 = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_all_time.parquet') WHERE ({like_conditions})").fetchone()
    time1 = time.time() - start
    print(f"   Time: {time1:.3f}s ({result1[0]:,} results)")
    
    # Strategy 2: Title-optimized approach
    print("2. Title-optimized approach:")
    start = time.time()
    like_conditions = ' OR '.join([f"title_combined_lower LIKE '%{kw.lower()}%'" for kw in keywords])
    result2 = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet') WHERE ({like_conditions})").fetchone()
    time2 = time.time() - start
    print(f"   Time: {time2:.3f}s ({result2[0]:,} results)")
    
    # Strategy 3: Using CONTAINS function
    print("3. CONTAINS function approach:")
    start = time.time()
    contains_conditions = ' OR '.join([f"CONTAINS(title_combined_lower, '{kw.lower()}')" for kw in keywords])
    result3 = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet') WHERE ({contains_conditions})").fetchone()
    time3 = time.time() - start
    print(f"   Time: {time3:.3f}s ({result3[0]:,} results)")
    
    # Strategy 4: Using word tokens
    print("4. Word tokens approach:")
    start = time.time()
    token_conditions = ' OR '.join([f"array_contains(title_words, '{kw.lower()}')" for kw in keywords])
    result4 = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet') WHERE ({token_conditions})").fetchone()
    time4 = time.time() - start
    print(f"   Time: {time4:.3f}s ({result4[0]:,} results)")
    
    # Strategy 5: Approximate search with sampling
    print("5. Approximate search with sampling:")
    start = time.time()
    result5 = conn.execute(f"""
        SELECT COUNT(*) * 10 as estimated_count 
        FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet') 
        WHERE ({like_conditions}) 
        LIMIT 1000
    """).fetchone()
    time5 = time.time() - start
    print(f"   Time: {time5:.3f}s (estimated {result5[0]:,} results)")
    
    conn.close()

def create_title_search_index():
    """Create a specialized index for title searches"""
    
    print("\n=== Creating Title Search Index ===")
    
    conn = duckdb.connect()
    
    # Create a view with title search optimization
    print("Creating title search view...")
    
    conn.execute("""
    CREATE OR REPLACE VIEW title_search_view AS
    SELECT 
        contract_number,
        award_date,
        contract_amount,
        award_title,
        notice_title,
        title_combined_lower,
        title_words,
        -- Create searchable patterns
        CASE 
            WHEN title_combined_lower LIKE '%drainage%' THEN 1 ELSE 0 
        END as has_drainage,
        CASE 
            WHEN title_combined_lower LIKE '%dike%' THEN 1 ELSE 0 
        END as has_dike,
        CASE 
            WHEN title_combined_lower LIKE '%flood%' THEN 1 ELSE 0 
        END as has_flood,
        CASE 
            WHEN title_combined_lower LIKE '%slope%' THEN 1 ELSE 0 
        END as has_slope,
        CASE 
            WHEN title_combined_lower LIKE '%protection%' THEN 1 ELSE 0 
        END as has_protection,
        CASE 
            WHEN title_combined_lower LIKE '%revetment%' THEN 1 ELSE 0 
        END as has_revetment
    FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
    """)
    
    # Test the indexed view
    start = time.time()
    result = conn.execute("""
        SELECT COUNT(*) FROM title_search_view 
        WHERE has_drainage = 1 OR has_dike = 1 OR has_flood = 1 OR 
              (has_slope = 1 AND has_protection = 1) OR has_revetment = 1
    """).fetchone()
    indexed_time = time.time() - start
    print(f"Indexed view search time: {indexed_time:.3f}s ({result[0]:,} results)")
    
    conn.close()

def implement_caching_strategy():
    """Implement caching for common title searches"""
    
    print("\n=== Implementing Caching Strategy ===")
    
    # Create a simple cache for common title keyword combinations
    cache_file = 'data/parquet/title_search_cache.json'
    
    import json
    
    # Common title keyword combinations and their results
    common_searches = {
        'drainage': {'count': 0, 'last_updated': None},
        'dike': {'count': 0, 'last_updated': None},
        'flood': {'count': 0, 'last_updated': None},
        'slope protection': {'count': 0, 'last_updated': None},
        'revetment': {'count': 0, 'last_updated': None},
        'drainage,dike,flood': {'count': 0, 'last_updated': None},
        'drainage,dike,flood,slope protection,revetment': {'count': 0, 'last_updated': None}
    }
    
    # Pre-compute results for common searches
    conn = duckdb.connect()
    
    for search_key, cache_data in common_searches.items():
        keywords = [kw.strip() for kw in search_key.split(',')]
        like_conditions = ' OR '.join([f"title_combined_lower LIKE '%{kw.lower()}%'" for kw in keywords])
        
        start = time.time()
        result = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet') WHERE ({like_conditions})").fetchone()
        search_time = time.time() - start
        
        cache_data['count'] = result[0]
        cache_data['last_updated'] = time.time()
        cache_data['search_time'] = search_time
        
        print(f"Pre-computed '{search_key}': {result[0]:,} results in {search_time:.3f}s")
    
    # Save cache
    with open(cache_file, 'w') as f:
        json.dump(common_searches, f, indent=2)
    
    print(f"Cache saved to {cache_file}")
    conn.close()

def test_final_performance():
    """Test the final optimized performance"""
    
    print("\n=== Final Performance Test ===")
    
    conn = duckdb.connect()
    keywords = ['drainage', 'dike', 'flood', 'slope protection', 'revetment']
    
    # Test with different approaches
    approaches = [
        ("Original search_text", "read_parquet('data/parquet/facts_awards_all_time.parquet')", "search_text"),
        ("Title optimized", "read_parquet('data/parquet/facts_awards_title_optimized.parquet')", "title_combined_lower"),
        ("Indexed view", "title_search_view", "has_drainage = 1 OR has_dike = 1 OR has_flood = 1 OR (has_slope = 1 AND has_protection = 1) OR has_revetment = 1")
    ]
    
    for name, table, condition in approaches:
        print(f"\n{name}:")
        
        if "has_drainage" in condition:
            # Special case for indexed view
            query = f"SELECT COUNT(*) FROM {table} WHERE {condition}"
        else:
            like_conditions = ' OR '.join([f"{condition} LIKE '%{kw.lower()}%'" for kw in keywords])
            query = f"SELECT COUNT(*) FROM {table} WHERE ({like_conditions})"
        
        start = time.time()
        result = conn.execute(query).fetchone()
        search_time = time.time() - start
        print(f"   Time: {search_time:.3f}s ({result[0]:,} results)")
    
    conn.close()

def main():
    """Run all title search optimizations"""
    
    print("=== Title Keyword Search Optimization ===")
    
    # Create title-optimized parquet
    create_title_search_optimized_parquet()
    
    # Test different strategies
    test_different_search_strategies()
    
    # Create title search index
    create_title_search_index()
    
    # Implement caching
    implement_caching_strategy()
    
    # Test final performance
    test_final_performance()
    
    print("\n✅ Title search optimization completed!")

if __name__ == "__main__":
    main()
