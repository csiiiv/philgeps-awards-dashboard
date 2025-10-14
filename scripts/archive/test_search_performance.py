#!/usr/bin/env python3
"""
Test script to measure search performance with the new pre-computed search column.
"""

import time
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend', 'django'))

from contracts.parquet_search import ParquetSearchService

def test_search_performance():
    """Test search performance with different methods"""
    
    print("=== Search Performance Test ===")
    
    # Initialize the search service
    search_service = ParquetSearchService()
    
    # Test keywords
    test_cases = [
        ['construction'],
        ['road'],
        ['bridge'],
        ['flood control'],
        ['construction', 'road'],
        ['construction', 'bridge', 'flood control']
    ]
    
    for keywords in test_cases:
        print(f"\nTesting keywords: {keywords}")
        
        # Test search_contracts_with_chips method
        start_time = time.time()
        result = search_service.search_contracts_with_chips(
            keywords=keywords,
            page_size=20,
            include_flood_control=True
        )
        search_time = time.time() - start_time
        
        print(f"  Results: {result['pagination']['total_count']:,} contracts")
        print(f"  Time: {search_time:.3f} seconds")
        print(f"  Success: {result['success']}")
        
        # Test chip_aggregates method
        start_time = time.time()
        aggregates = search_service.chip_aggregates(
            keywords=keywords,
            include_flood_control=True
        )
        aggregate_time = time.time() - start_time
        
        print(f"  Aggregates time: {aggregate_time:.3f} seconds")
        print(f"  Aggregates success: {aggregates['success']}")

def test_file_sizes():
    """Check the file sizes before and after"""
    
    print("\n=== File Size Comparison ===")
    
    import glob
    
    # Check current file sizes
    parquet_files = glob.glob('data/parquet/facts_awards_*.parquet')
    for file_path in parquet_files:
        size_mb = os.path.getsize(file_path) / (1024 * 1024)
        print(f"{os.path.basename(file_path)}: {size_mb:.1f} MB")
    
    # Check backup file sizes
    backup_files = glob.glob('data/parquet/backup/*/facts_awards_*.parquet')
    if backup_files:
        print("\nBackup files:")
        for file_path in backup_files:
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            print(f"{os.path.basename(file_path)}: {size_mb:.1f} MB")

if __name__ == "__main__":
    test_search_performance()
    test_file_sizes()
