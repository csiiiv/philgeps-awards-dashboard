#!/usr/bin/env python3
"""
Optimize search performance with multiple strategies.
"""

import duckdb
import time
import os

def test_search_optimizations():
    """Test different search optimization strategies"""
    
    conn = duckdb.connect()
    
    print("=== Search Performance Optimization ===")
    
    # Test 1: Current performance baseline
    print("\n1. Current Performance Baseline:")
    start = time.time()
    result = conn.execute("SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_all_time.parquet') WHERE search_text LIKE '%construction%'").fetchone()
    baseline_time = time.time() - start
    print(f"   Baseline search: {baseline_time:.3f}s ({result[0]:,} results)")
    
    # Test 2: Optimized query with better column selection
    print("\n2. Optimized Query Structure:")
    start = time.time()
    result = conn.execute("""
        SELECT COUNT(*) FROM (
            SELECT contract_number, award_title, notice_title, search_text
            FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
            WHERE search_text LIKE '%construction%'
        )
    """).fetchone()
    optimized_time = time.time() - start
    print(f"   Optimized query: {optimized_time:.3f}s ({result[0]:,} results)")
    
    # Test 3: Test with different search patterns
    print("\n3. Search Pattern Performance:")
    patterns = [
        ("%construction%", "Contains"),
        ("construction%", "Starts with"),
        ("%construction", "Ends with")
    ]
    
    for pattern, description in patterns:
        start = time.time()
        result = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_all_time.parquet') WHERE search_text LIKE '{pattern}'").fetchone()
        pattern_time = time.time() - start
        print(f"   {description}: {pattern_time:.3f}s ({result[0]:,} results)")
    
    # Test 4: Multiple keywords with different approaches
    print("\n4. Multiple Keywords Performance:")
    keywords = ['construction', 'road']
    
    # Approach A: OR conditions
    start = time.time()
    or_conditions = " OR ".join([f"search_text LIKE '%{kw}%'" for kw in keywords])
    result_a = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_all_time.parquet') WHERE ({or_conditions})").fetchone()
    time_a = time.time() - start
    print(f"   OR conditions: {time_a:.3f}s ({result_a[0]:,} results)")
    
    # Approach B: Using CONTAINS (if available)
    try:
        start = time.time()
        contains_conditions = " OR ".join([f"CONTAINS(search_text, '{kw}')" for kw in keywords])
        result_b = conn.execute(f"SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_all_time.parquet') WHERE ({contains_conditions})").fetchone()
        time_b = time.time() - start
        print(f"   CONTAINS function: {time_b:.3f}s ({result_b[0]:,} results)")
    except Exception as e:
        print(f"   CONTAINS function: Not available ({e})")
    
    # Test 5: Pagination performance
    print("\n5. Pagination Performance:")
    page_sizes = [10, 20, 50, 100]
    for page_size in page_sizes:
        start = time.time()
        result = conn.execute(f"""
            SELECT * FROM read_parquet('data/parquet/facts_awards_all_time.parquet') 
            WHERE search_text LIKE '%construction%' 
            LIMIT {page_size}
        """).fetchone()
        page_time = time.time() - start
        print(f"   Page size {page_size}: {page_time:.3f}s")
    
    conn.close()

def create_search_index():
    """Create a search-optimized parquet file with better structure"""
    
    print("\n=== Creating Search-Optimized Parquet ===")
    
    conn = duckdb.connect()
    
    # Create an optimized version with better column ordering
    print("Creating search-optimized parquet file...")
    
    start = time.time()
    conn.execute("""
    COPY (
        SELECT 
            -- Primary key first for better performance
            contract_number,
            -- Date fields for filtering
            award_date,
            EXTRACT(YEAR FROM award_date::DATE) as award_year,
            -- Amount for sorting
            contract_amount,
            -- Searchable text fields
            search_text,
            award_title,
            notice_title,
            awardee_name,
            organization_name,
            business_category,
            area_of_delivery
        FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
        ORDER BY award_date DESC, contract_amount DESC
    ) TO 'data/parquet/facts_awards_search_optimized.parquet' (FORMAT PARQUET)
    """)
    
    optimize_time = time.time() - start
    print(f"Search-optimized parquet created in {optimize_time:.3f}s")
    
    # Test the optimized file
    start = time.time()
    result = conn.execute("SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_search_optimized.parquet') WHERE search_text LIKE '%construction%'").fetchone()
    test_time = time.time() - start
    print(f"Optimized search time: {test_time:.3f}s ({result[0]:,} results)")
    
    # Test pagination on optimized file
    start = time.time()
    result = conn.execute("""
        SELECT * FROM read_parquet('data/parquet/facts_awards_search_optimized.parquet') 
        WHERE search_text LIKE '%construction%' 
        LIMIT 20
    """).fetchone()
    page_time = time.time() - start
    print(f"Optimized pagination time: {page_time:.3f}s")
    
    conn.close()

def analyze_query_plan():
    """Analyze the query execution plan"""
    
    print("\n=== Query Execution Plan Analysis ===")
    
    conn = duckdb.connect()
    
    # Get query plan for search
    plan = conn.execute("EXPLAIN SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_all_time.parquet') WHERE search_text LIKE '%construction%'").fetchall()
    
    print("Query execution plan:")
    for line in plan:
        print(f"  {line[0]}")
    
    conn.close()

if __name__ == "__main__":
    test_search_optimizations()
    create_search_index()
    analyze_query_plan()
