#!/usr/bin/env python3
"""
Test script to simulate frontend API calls to Django backend
"""

import requests
import json

# Test configuration
FRONTEND_URL = "http://localhost:3000"
API_URL = "http://localhost:3200/api/v1"

def test_api_endpoint(endpoint, method="GET", data=None, headers=None):
    """Test an API endpoint and return the result"""
    url = f"{API_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        
        return {
            "status_code": response.status_code,
            "success": response.status_code == 200,
            "has_data": "data" in response.json() if response.status_code == 200 else False,
            "response_keys": list(response.json().keys()) if response.status_code == 200 else [],
            "content_length": len(response.content)
        }
    except Exception as e:
        return {
            "status_code": 0,
            "success": False,
            "error": str(e),
            "has_data": False,
            "response_keys": []
        }

def main():
    print("🧪 Testing Frontend API Calls to Django Backend")
    print("=" * 60)
    
    # Test 1: Contract Search (main frontend call)
    print("\n1️⃣ Testing Contract Search (chip-search)...")
    search_data = {
        "contractors": [],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [],
        "page": 1,
        "page_size": 20,
        "sortBy": "award_date",
        "sortDirection": "desc",
        "include_flood_control": False
    }
    
    result1 = test_api_endpoint("/contracts/chip-search/", "POST", search_data)
    print(f"   Status: {result1['status_code']}")
    print(f"   Success: {result1['success']}")
    print(f"   Has Data: {result1['has_data']}")
    print(f"   Response Keys: {result1['response_keys']}")
    
    # Test 2: Aggregates (analytics data)
    print("\n2️⃣ Testing Aggregates (chip-aggregates)...")
    aggregates_data = {
        "contractors": [],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [],
        "topN": 20,
        "include_flood_control": False
    }
    
    result2 = test_api_endpoint("/contracts/chip-aggregates/", "POST", aggregates_data)
    print(f"   Status: {result2['status_code']}")
    print(f"   Success: {result2['success']}")
    print(f"   Has Data: {result2['has_data']}")
    print(f"   Response Keys: {result2['response_keys']}")
    
    # Test 3: Filter Options
    print("\n3️⃣ Testing Filter Options...")
    result3 = test_api_endpoint("/contracts/filter-options/")
    print(f"   Status: {result3['status_code']}")
    print(f"   Success: {result3['success']}")
    print(f"   Has Data: {result3['has_data']}")
    print(f"   Content Length: {result3['content_length']} bytes")
    
    # Test 4: Organizations (entity search)
    print("\n4️⃣ Testing Organizations...")
    result4 = test_api_endpoint("/organizations/")
    print(f"   Status: {result4['status_code']}")
    print(f"   Success: {result4['success']}")
    print(f"   Has Data: {result4['has_data']}")
    print(f"   Response Keys: {result4['response_keys']}")
    
    # Test 5: CORS Headers
    print("\n5️⃣ Testing CORS Headers...")
    cors_headers = {
        "Origin": "http://localhost:3000",
        "Referer": "http://localhost:3000"
    }
    result5 = test_api_endpoint("/contracts/chip-search/", "POST", search_data, cors_headers)
    print(f"   Status: {result5['status_code']}")
    print(f"   Success: {result5['success']}")
    print(f"   CORS Working: {result5['success']}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    
    tests = [
        ("Contract Search", result1),
        ("Aggregates", result2),
        ("Filter Options", result3),
        ("Organizations", result4),
        ("CORS Headers", result5)
    ]
    
    passed = sum(1 for _, result in tests if result['success'])
    total = len(tests)
    
    print(f"✅ Passed: {passed}/{total}")
    
    for test_name, result in tests:
        status = "✅" if result['success'] else "❌"
        print(f"   {status} {test_name}: {result['status_code']}")
    
    if passed == total:
        print("\n🎉 All tests passed! Frontend should be able to connect to Django API.")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Check Django server and CORS configuration.")
    
    print("\n🔧 Frontend Environment Check:")
    print(f"   Frontend URL: {FRONTEND_URL}")
    print(f"   API URL: {API_URL}")
    print("   Environment: VITE_API_URL should be set to http://localhost:3200")

if __name__ == "__main__":
    main()
