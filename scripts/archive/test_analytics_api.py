#!/usr/bin/env python3
"""
Test the analytics API performance directly.
"""

import time
import sys
import os

# Add the Django project to the Python path
sys.path.append('/mnt/6E9A84429A8408B3/_VSC/LINUX/production2/production1/backend/django')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contracts.settings')

import django
django.setup()

from contracts.parquet_search import ParquetSearchService

def test_analytics_performance():
    """Test analytics API performance"""
    
    print("=== Testing Analytics API Performance ===")
    
    service = ParquetSearchService()
    keywords = ['drainage', 'dike', 'flood', 'slope protection', 'revetment']
    
    # Test 1: chipAggregatesPaginated
    print("\n1. Testing chipAggregatesPaginated:")
    start = time.time()
    result1 = service.chip_aggregates_paginated(
        keywords=keywords,
        page=1,
        page_size=20,
        dimension='by_contractor',
        include_flood_control=True
    )
    time1 = time.time() - start
    print(f"   Time: {time1:.3f}s")
    print(f"   Success: {result1['success']}")
    print(f"   Data count: {len(result1['data']) if result1['success'] else 0}")
    print(f"   Total count: {result1['pagination']['total_count'] if result1['success'] else 0}")
    
    # Test 2: chipAggregates (time-based data)
    print("\n2. Testing chipAggregates (time-based data):")
    start = time.time()
    result2 = service.chip_aggregates(
        keywords=keywords,
        include_flood_control=True
    )
    time2 = time.time() - start
    print(f"   Time: {time2:.3f}s")
    print(f"   Success: {result2['success']}")
    print(f"   Data keys: {list(result2['data'].keys()) if result2['success'] else []}")
    
    # Test 3: Combined time
    total_time = time1 + time2
    print(f"\n3. Combined Analytics Time: {total_time:.3f}s")
    
    # Test 4: Multiple calls (simulating frontend behavior)
    print("\n4. Testing Multiple Calls (simulating frontend):")
    start = time.time()
    
    # Simulate the frontend making both calls
    for i in range(3):  # Test 3 iterations
        result1 = service.chip_aggregates_paginated(
            keywords=keywords,
            page=1,
            page_size=20,
            dimension='by_contractor',
            include_flood_control=True
        )
        result2 = service.chip_aggregates(
            keywords=keywords,
            include_flood_control=True
        )
    
    multiple_time = time.time() - start
    print(f"   Time for 3 iterations: {multiple_time:.3f}s")
    print(f"   Average per iteration: {multiple_time/3:.3f}s")
    
    # Test 5: Check if there are any performance issues
    print("\n5. Performance Analysis:")
    if total_time > 5.0:
        print(f"   ⚠️  WARNING: Analytics is slow ({total_time:.3f}s)")
        print("   Possible causes:")
        print("   - Not using optimized parquet files")
        print("   - Database connection issues")
        print("   - Memory constraints")
        print("   - Network delays")
    else:
        print(f"   ✅ Analytics is fast ({total_time:.3f}s)")
    
    return total_time

if __name__ == "__main__":
    test_analytics_performance()
