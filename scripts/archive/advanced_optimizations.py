#!/usr/bin/env python3
"""
Advanced optimization strategies for parquet search performance.
"""

import duckdb
import time
import os

def test_optimization_strategies():
    """Test different optimization strategies"""
    
    conn = duckdb.connect()
    
    print("=== Advanced Optimization Strategies ===")
    
    # Strategy 1: Create a materialized view with indexes
    print("\n1. Creating materialized view with search optimization...")
    
    # Create a view that pre-filters and indexes the data
    conn.execute("""
    CREATE OR REPLACE VIEW contracts_searchable AS
    SELECT 
        *,
        search_text,
        -- Create searchable tokens for better performance
        string_split(search_text, ' ') as search_tokens,
        -- Create year for partitioning
        EXTRACT(YEAR FROM award_date::DATE) as award_year
    FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
    """)
    
    # Test the view
    start = time.time()
    result = conn.execute("SELECT COUNT(*) FROM contracts_searchable WHERE search_text LIKE '%construction%'").fetchone()
    view_time = time.time() - start
    print(f"   View search time: {view_time:.3f}s ({result[0]:,} results)")
    
    # Strategy 2: Test with different LIKE patterns
    print("\n2. Testing different search patterns...")
    
    patterns = [
        ("%construction%", "Contains"),
        ("construction%", "Starts with"),
        ("%construction", "Ends with"),
        ("construction", "Exact match")
    ]
    
    for pattern, description in patterns:
        start = time.time()
        result = conn.execute(f"SELECT COUNT(*) FROM contracts_searchable WHERE search_text LIKE '{pattern}'").fetchone()
        pattern_time = time.time() - start
        print(f"   {description}: {pattern_time:.3f}s ({result[0]:,} results)")
    
    # Strategy 3: Test with multiple keywords using different approaches
    print("\n3. Testing multiple keyword strategies...")
    
    keywords = ['construction', 'road']
    
    # Approach A: Multiple LIKE conditions
    start = time.time()
    like_conditions = " OR ".join([f"search_text LIKE '%{kw}%'" for kw in keywords])
    result_a = conn.execute(f"SELECT COUNT(*) FROM contracts_searchable WHERE ({like_conditions})").fetchone()
    time_a = time.time() - start
    print(f"   Multiple LIKE: {time_a:.3f}s ({result_a[0]:,} results)")
    
    # Approach B: Using string functions
    start = time.time()
    contains_conditions = " OR ".join([f"CONTAINS(search_text, '{kw}')" for kw in keywords])
    result_b = conn.execute(f"SELECT COUNT(*) FROM contracts_searchable WHERE ({contains_conditions})").fetchone()
    time_b = time.time() - start
    print(f"   CONTAINS function: {time_b:.3f}s ({result_b[0]:,} results)")
    
    # Approach C: Using regex
    start = time.time()
    regex_pattern = "|".join(keywords)
    result_c = conn.execute(f"SELECT COUNT(*) FROM contracts_searchable WHERE search_text REGEXP '{regex_pattern}'").fetchone()
    time_c = time.time() - start
    print(f"   REGEXP: {time_c:.3f}s ({result_c[0]:,} results)")
    
    # Strategy 4: Test partitioning by year
    print("\n4. Testing year-based partitioning...")
    
    # Test with year filter
    start = time.time()
    result = conn.execute("""
        SELECT COUNT(*) FROM contracts_searchable 
        WHERE search_text LIKE '%construction%' 
        AND award_year >= 2020
    """).fetchone()
    year_time = time.time() - start
    print(f"   With year filter (2020+): {year_time:.3f}s ({result[0]:,} results)")
    
    # Strategy 5: Test with different page sizes
    print("\n5. Testing pagination performance...")
    
    page_sizes = [10, 20, 50, 100]
    for page_size in page_sizes:
        start = time.time()
        result = conn.execute(f"""
            SELECT * FROM contracts_searchable 
            WHERE search_text LIKE '%construction%' 
            LIMIT {page_size}
        """).fetchone()
        page_time = time.time() - start
        print(f"   Page size {page_size}: {page_time:.3f}s")
    
    conn.close()

def create_optimized_parquet():
    """Create an optimized parquet file with better structure"""
    
    print("\n=== Creating Optimized Parquet Structure ===")
    
    conn = duckdb.connect()
    
    # Create an optimized version with better column ordering and types
    print("Creating optimized parquet file...")
    
    start = time.time()
    conn.execute("""
    COPY (
        SELECT 
            contract_number,
            award_date,
            award_year,
            contract_amount,
            awardee_name,
            organization_name,
            business_category,
            area_of_delivery,
            award_title,
            notice_title,
            search_text,
            -- Create additional searchable columns
            LOWER(award_title) as award_title_lower,
            LOWER(notice_title) as notice_title_lower,
            LOWER(awardee_name) as awardee_name_lower,
            LOWER(organization_name) as organization_name_lower,
            LOWER(business_category) as business_category_lower,
            LOWER(area_of_delivery) as area_of_delivery_lower
        FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
    ) TO 'data/parquet/facts_awards_optimized.parquet' (FORMAT PARQUET)
    """)
    
    optimize_time = time.time() - start
    print(f"Optimized parquet created in {optimize_time:.3f}s")
    
    # Test the optimized file
    start = time.time()
    result = conn.execute("SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_optimized.parquet') WHERE search_text LIKE '%construction%'").fetchone()
    test_time = time.time() - start
    print(f"Optimized search time: {test_time:.3f}s ({result[0]:,} results)")
    
    conn.close()

if __name__ == "__main__":
    test_optimization_strategies()
    create_optimized_parquet()
