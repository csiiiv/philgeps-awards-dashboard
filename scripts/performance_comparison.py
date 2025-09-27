#!/usr/bin/env python3
"""
Performance comparison script to demonstrate the benefits of pre-computed search column.

This script compares:
1. Original method: Multiple LOWER() calls on individual columns
2. CONCAT method: Single LOWER() call on concatenated fields
3. Pre-computed column: Direct search on search_text column
"""

import time
import duckdb
import os

def benchmark_search_methods():
    """Compare different search methods for performance"""
    
    # Test keywords
    test_keywords = ['construction', 'road', 'bridge', 'flood control']
    
    # Connect to DuckDB
    conn = duckdb.connect()
    
    print("=== Keyword Search Performance Comparison ===")
    print(f"Test keywords: {test_keywords}")
    print(f"Testing on facts_awards_all_time.parquet")
    print()
    
    # Method 1: Original (multiple LOWER calls)
    print("1. Original Method (Multiple LOWER calls):")
    original_query = f"""
    SELECT COUNT(*) as count 
    FROM read_parquet('data/parquet/facts_awards_all_time.parquet') 
    WHERE (
        LOWER(award_title) LIKE LOWER('%{test_keywords[0]}%') OR 
        LOWER(notice_title) LIKE LOWER('%{test_keywords[0]}%') OR
        LOWER(awardee_name) LIKE LOWER('%{test_keywords[0]}%') OR
        LOWER(organization_name) LIKE LOWER('%{test_keywords[0]}%') OR
        LOWER(business_category) LIKE LOWER('%{test_keywords[0]}%') OR
        LOWER(area_of_delivery) LIKE LOWER('%{test_keywords[0]}%')
    )
    """
    
    start_time = time.time()
    result1 = conn.execute(original_query).fetchone()
    original_time = time.time() - start_time
    print(f"   Results: {result1[0]:,}")
    print(f"   Time: {original_time:.3f} seconds")
    print()
    
    # Method 2: CONCAT method (single LOWER call)
    print("2. CONCAT Method (Single LOWER call):")
    concat_query = f"""
    SELECT COUNT(*) as count 
    FROM read_parquet('data/parquet/facts_awards_all_time.parquet') 
    WHERE LOWER(CONCAT(
        COALESCE(award_title, ''), ' ',
        COALESCE(notice_title, ''), ' ',
        COALESCE(awardee_name, ''), ' ',
        COALESCE(organization_name, ''), ' ',
        COALESCE(business_category, ''), ' ',
        COALESCE(area_of_delivery, '')
    )) LIKE LOWER('%{test_keywords[0]}%')
    """
    
    start_time = time.time()
    result2 = conn.execute(concat_query).fetchone()
    concat_time = time.time() - start_time
    print(f"   Results: {result2[0]:,}")
    print(f"   Time: {concat_time:.3f} seconds")
    print()
    
    # Method 3: Pre-computed column (if available)
    print("3. Pre-computed Column Method:")
    try:
        # Check if search_text column exists
        check_query = "SELECT search_text FROM read_parquet('data/parquet/facts_awards_all_time.parquet') LIMIT 1"
        conn.execute(check_query).fetchone()
        
        precomputed_query = f"""
        SELECT COUNT(*) as count 
        FROM read_parquet('data/parquet/facts_awards_all_time.parquet') 
        WHERE search_text LIKE '%{test_keywords[0]}%'
        """
        
        start_time = time.time()
        result3 = conn.execute(precomputed_query).fetchone()
        precomputed_time = time.time() - start_time
        print(f"   Results: {result3[0]:,}")
        print(f"   Time: {precomputed_time:.3f} seconds")
        print()
        
        # Performance comparison
        print("=== Performance Comparison ===")
        print(f"Original method:     {original_time:.3f}s")
        print(f"CONCAT method:       {concat_time:.3f}s ({concat_time/original_time:.1f}x faster)")
        print(f"Pre-computed method: {precomputed_time:.3f}s ({precomputed_time/original_time:.1f}x faster)")
        print()
        print(f"CONCAT vs Original:  {((original_time - concat_time) / original_time * 100):.1f}% improvement")
        print(f"Pre-computed vs Original: {((original_time - precomputed_time) / original_time * 100):.1f}% improvement")
        
    except Exception as e:
        print(f"   Error: {e}")
        print("   Note: search_text column not found. Run rebuild script first.")
        print()
        print("=== Performance Comparison ===")
        print(f"Original method: {original_time:.3f}s")
        print(f"CONCAT method:   {concat_time:.3f}s ({concat_time/original_time:.1f}x faster)")
        print(f"CONCAT vs Original: {((original_time - concat_time) / original_time * 100):.1f}% improvement")
    
    conn.close()

def estimate_storage_impact():
    """Estimate the storage impact of adding search_text column"""
    
    conn = duckdb.connect()
    
    # Get current file size
    current_size = os.path.getsize('data/parquet/facts_awards_all_time.parquet')
    
    # Get average search_text length
    result = conn.execute("""
    SELECT 
        AVG(LENGTH(award_title) + LENGTH(notice_title) + LENGTH(awardee_name) + 
            LENGTH(organization_name) + LENGTH(business_category) + LENGTH(area_of_delivery)) as avg_length
    FROM read_parquet('data/parquet/facts_awards_all_time.parquet')
    """).fetchone()
    
    avg_length = result[0] if result[0] else 0
    total_rows = conn.execute("SELECT COUNT(*) FROM read_parquet('data/parquet/facts_awards_all_time.parquet')").fetchone()[0]
    
    # Estimate additional storage
    additional_bytes = total_rows * avg_length
    additional_mb = additional_bytes / (1024 * 1024)
    new_total_mb = (current_size + additional_bytes) / (1024 * 1024)
    increase_percent = (additional_bytes / current_size) * 100
    
    print("=== Storage Impact Estimate ===")
    print(f"Current file size: {current_size / (1024 * 1024):.1f} MB")
    print(f"Average search_text length: {avg_length:.1f} characters")
    print(f"Estimated additional storage: {additional_mb:.1f} MB")
    print(f"Estimated new total size: {new_total_mb:.1f} MB")
    print(f"Storage increase: {increase_percent:.1f}%")
    
    conn.close()

if __name__ == "__main__":
    benchmark_search_methods()
    print()
    estimate_storage_impact()
