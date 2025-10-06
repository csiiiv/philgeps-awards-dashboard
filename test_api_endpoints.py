#!/usr/bin/env python3
"""
Comprehensive API endpoint testing script for PHILGEPS Awards Dashboard
Tests all OpenAPI endpoints to ensure they're working correctly.
"""

import requests
import json
import sys
from typing import Dict, Any

BASE_URL = "http://localhost:3200"

def test_endpoint(method: str, endpoint: str, data: Dict[Any, Any] = None, expected_status: int = 200) -> bool:
    """Test a single endpoint and return success status"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, params=data or {})
        elif method.upper() == "POST":
            response = requests.post(url, json=data or {})
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        if response.status_code == expected_status:
            print(f"✅ {method} {endpoint} - Status: {response.status_code}")
            return True
        else:
            print(f"❌ {method} {endpoint} - Expected: {expected_status}, Got: {response.status_code}")
            if response.text:
                print(f"   Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return False

def main():
    """Run comprehensive API tests"""
    print("🧪 Testing PHILGEPS Awards Dashboard API Endpoints")
    print("=" * 60)
    
    tests = [
        # Contract Search & Analytics
        ("POST", "/api/v1/contracts/chip-search/", {}),
        ("POST", "/api/v1/contracts/chip-aggregates/", {}),
        ("POST", "/api/v1/contracts/chip-aggregates-paginated/", {}),
        ("POST", "/api/v1/contracts/chip-export-estimate/", {}),
        ("GET", "/api/v1/contracts/filter-options/"),
        
        # Entity Search
        ("GET", "/api/v1/organizations/"),
        ("GET", "/api/v1/contractors/"),
        ("GET", "/api/v1/business-categories/"),
        ("GET", "/api/v1/areas-of-delivery/"),
        
        # OpenAPI Documentation
        ("GET", "/api/schema/"),
        ("GET", "/api/docs/"),
        ("GET", "/api/redoc/"),
    ]
    
    passed = 0
    total = len(tests)
    
    for method, endpoint, *args in tests:
        data = args[0] if args else None
        if test_endpoint(method, endpoint, data):
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the API implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
