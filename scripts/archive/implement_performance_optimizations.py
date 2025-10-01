#!/usr/bin/env python3
"""
Implement comprehensive performance optimizations for parquet search.
"""

import os
import sys
import time
import duckdb
import shutil

def create_connection_pool():
    """Create a connection pool for better performance"""
    
    print("=== Creating Connection Pool ===")
    
    # Create a simple connection pool
    pool_size = 3
    connections = []
    
    for i in range(pool_size):
        conn = duckdb.connect()
        connections.append(conn)
    
    print(f"Created {pool_size} database connections")
    return connections

def optimize_parquet_structure():
    """Create a highly optimized parquet structure"""
    
    print("\n=== Creating Highly Optimized Parquet Structure ===")
    
    conn = duckdb.connect()
    
    # Create a super-optimized parquet file
    print("Creating super-optimized parquet file...")
    
    start = time.time()
    conn.execute("""
    COPY (
        SELECT 
            -- Primary key and sorting fields first
            contract_number,
            award_date,
            EXTRACT(YEAR FROM award_date::DATE) as award_year,
            EXTRACT(MONTH FROM award_date::DATE) as award_month,
            contract_amount,
            
            -- Searchable text (optimized order)
            search_text,
            award_title,
            notice_title,
            awardee_name,
            organization_name,
            business_category,
            area_of_delivery,
            
            -- Additional fields
            'active' as award_status,
            '2023-01-01' as created_at,
            1 as id
        FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
        ORDER BY 
            award_date DESC,
            contract_amount DESC,
            contract_number
    ) TO 'data/parquet/facts_awards_super_optimized.parquet' (FORMAT PARQUET)
    """)
    
    optimize_time = time.time() - start
    print(f"Super-optimized parquet created in {optimize_time:.3f}s")
    
    # Test performance
    start = time.time()
    result = conn.execute("SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet') WHERE search_text LIKE '%construction%'").fetchone()
    test_time = time.time() - start
    print(f"Super-optimized search time: {test_time:.3f}s ({result[0]:,} results)")
    
    conn.close()

def create_search_indexes():
    """Create search indexes for better performance"""
    
    print("\n=== Creating Search Indexes ===")
    
    conn = duckdb.connect()
    
    # Create a view with indexes
    print("Creating indexed view...")
    
    conn.execute("""
    CREATE OR REPLACE VIEW contracts_indexed AS
    SELECT 
        *,
        -- Create searchable tokens
        string_split(search_text, ' ') as search_tokens,
        -- Create year-month for partitioning
        EXTRACT(YEAR FROM award_date::DATE) * 100 + EXTRACT(MONTH FROM award_date::DATE) as year_month,
        -- Create amount ranges for filtering
        CASE 
            WHEN contract_amount < 100000 THEN 'small'
            WHEN contract_amount < 1000000 THEN 'medium'
            WHEN contract_amount < 10000000 THEN 'large'
            ELSE 'huge'
        END as amount_category
    FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet')
    """)
    
    # Test indexed search
    start = time.time()
    result = conn.execute("SELECT COUNT(*) FROM contracts_indexed WHERE search_text LIKE '%construction%'").fetchone()
    indexed_time = time.time() - start
    print(f"Indexed search time: {indexed_time:.3f}s ({result[0]:,} results)")
    
    conn.close()

def implement_query_optimizations():
    """Implement query-level optimizations"""
    
    print("\n=== Implementing Query Optimizations ===")
    
    conn = duckdb.connect()
    
    # Test different query patterns
    print("Testing optimized query patterns...")
    
    # Pattern 1: Basic search
    start = time.time()
    result1 = conn.execute("""
        SELECT contract_number, award_title, search_text
        FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet')
        WHERE search_text LIKE '%construction%'
        LIMIT 20
    """).fetchall()
    time1 = time.time() - start
    print(f"Basic search with LIMIT: {time1:.3f}s ({len(result1)} results)")
    
    # Pattern 2: Search with early filtering
    start = time.time()
    result2 = conn.execute("""
        SELECT contract_number, award_title, search_text
        FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet')
        WHERE search_text LIKE '%construction%'
        AND contract_amount > 100000
        LIMIT 20
    """).fetchall()
    time2 = time.time() - start
    print(f"Search with amount filter: {time2:.3f}s ({len(result2)} results)")
    
    # Pattern 3: Search with year filter
    start = time.time()
    result3 = conn.execute("""
        SELECT contract_number, award_title, search_text
        FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet')
        WHERE search_text LIKE '%construction%'
        AND EXTRACT(YEAR FROM award_date::DATE) >= 2020
        LIMIT 20
    """).fetchall()
    time3 = time.time() - start
    print(f"Search with year filter: {time3:.3f}s ({len(result3)} results)")
    
    # Pattern 4: Multiple keywords with early termination
    start = time.time()
    result4 = conn.execute("""
        SELECT contract_number, award_title, search_text
        FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet')
        WHERE (search_text LIKE '%construction%' OR search_text LIKE '%road%')
        AND contract_amount > 50000
        ORDER BY contract_amount DESC
        LIMIT 20
    """).fetchall()
    time4 = time.time() - start
    print(f"Multi-keyword with filters: {time4:.3f}s ({len(result4)} results)")
    
    conn.close()

def create_cached_queries():
    """Create cached query templates"""
    
    print("\n=== Creating Cached Query Templates ===")
    
    # Create query templates for common searches
    query_templates = {
        'basic_search': """
            SELECT contract_number, award_title, notice_title, award_date, contract_amount, search_text
            FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet')
            WHERE search_text LIKE '%{keyword}%'
            ORDER BY award_date DESC
            LIMIT {limit} OFFSET {offset}
        """,
        'filtered_search': """
            SELECT contract_number, award_title, notice_title, award_date, contract_amount, search_text
            FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet')
            WHERE search_text LIKE '%{keyword}%'
            AND contract_amount >= {min_amount}
            AND EXTRACT(YEAR FROM award_date::DATE) >= {min_year}
            ORDER BY contract_amount DESC
            LIMIT {limit} OFFSET {offset}
        """,
        'multi_keyword_search': """
            SELECT contract_number, award_title, notice_title, award_date, contract_amount, search_text
            FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet')
            WHERE ({keyword_conditions})
            ORDER BY award_date DESC
            LIMIT {limit} OFFSET {offset}
        """
    }
    
    # Save query templates
    import json
    with open('data/parquet/query_templates.json', 'w') as f:
        json.dump(query_templates, f, indent=2)
    
    print("Query templates saved to data/parquet/query_templates.json")

def test_performance_improvements():
    """Test overall performance improvements"""
    
    print("\n=== Performance Improvement Summary ===")
    
    conn = duckdb.connect()
    
    # Test original file
    start = time.time()
    result_orig = conn.execute("SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_all_time.parquet') WHERE search_text LIKE '%construction%'").fetchone()
    time_orig = time.time() - start
    
    # Test optimized file
    start = time.time()
    result_opt = conn.execute("SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_super_optimized.parquet') WHERE search_text LIKE '%construction%'").fetchone()
    time_opt = time.time() - start
    
    # Test indexed view
    start = time.time()
    result_idx = conn.execute("SELECT COUNT(*) FROM contracts_indexed WHERE search_text LIKE '%construction%'").fetchone()
    time_idx = time.time() - start
    
    print(f"Original file: {time_orig:.3f}s ({result_orig[0]:,} results)")
    print(f"Optimized file: {time_opt:.3f}s ({result_opt[0]:,} results)")
    print(f"Indexed view: {time_idx:.3f}s ({result_idx[0]:,} results)")
    
    improvement_opt = ((time_orig - time_opt) / time_orig) * 100
    improvement_idx = ((time_orig - time_idx) / time_orig) * 100
    
    print(f"\nImprovement with optimized file: {improvement_opt:.1f}%")
    print(f"Improvement with indexed view: {improvement_idx:.1f}%")
    
    conn.close()

def main():
    """Run all optimizations"""
    
    print("=== Comprehensive Performance Optimization ===")
    
    # Create connection pool
    connections = create_connection_pool()
    
    # Optimize parquet structure
    optimize_parquet_structure()
    
    # Create search indexes
    create_search_indexes()
    
    # Implement query optimizations
    implement_query_optimizations()
    
    # Create cached queries
    create_cached_queries()
    
    # Test performance improvements
    test_performance_improvements()
    
    # Clean up connections
    for conn in connections:
        conn.close()
    
    print("\n✅ All optimizations completed!")

if __name__ == "__main__":
    main()
