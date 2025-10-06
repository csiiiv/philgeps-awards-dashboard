#!/usr/bin/env python3
"""
Test script to verify production API endpoints
"""

import requests
import json

def test_api_endpoint(url, name):
    """Test an API endpoint and return the result"""
    try:
        response = requests.get(url, timeout=30)
        return {
            "name": name,
            "url": url,
            "status_code": response.status_code,
            "success": response.status_code == 200,
            "content_type": response.headers.get('content-type', 'unknown'),
            "content_length": len(response.content),
            "is_json": 'application/json' in response.headers.get('content-type', ''),
            "has_data": False,
            "error": None
        }
    except Exception as e:
        return {
            "name": name,
            "url": url,
            "status_code": 0,
            "success": False,
            "content_type": "error",
            "content_length": 0,
            "is_json": False,
            "has_data": False,
            "error": str(e)
        }

def main():
    print("🧪 Testing Production API Endpoints")
    print("=" * 60)
    
    # Test endpoints
    endpoints = [
        ("Local API - Filter Options", "http://localhost:3200/api/v1/contracts/filter-options/"),
        ("Tunneled API - Filter Options", "https://philgeps-api.simple-systems.dev/api/v1/contracts/filter-options/"),
        ("Local API - Schema", "http://localhost:3200/api/schema/"),
        ("Tunneled API - Schema", "https://philgeps-api.simple-systems.dev/api/schema/"),
        ("Frontend", "https://philgeps.simple-systems.dev"),
    ]
    
    results = []
    
    for name, url in endpoints:
        print(f"\n🔍 Testing {name}...")
        result = test_api_endpoint(url, name)
        results.append(result)
        
        print(f"   URL: {url}")
        print(f"   Status: {result['status_code']}")
        print(f"   Success: {result['success']}")
        print(f"   Content-Type: {result['content_type']}")
        print(f"   Content Length: {result['content_length']} bytes")
        print(f"   Is JSON: {result['is_json']}")
        if result['error']:
            print(f"   Error: {result['error']}")
    
    # Test local API data if it's working
    if results[0]['success']:  # Local API filter options
        print(f"\n📊 Testing Local API Data...")
        try:
            response = requests.get("http://localhost:3200/api/v1/contracts/filter-options/", timeout=30)
            data = response.json()
            print(f"   Data Keys: {list(data.keys())}")
            print(f"   Contractors: {len(data.get('contractors', []))}")
            print(f"   Areas: {len(data.get('areas', []))}")
            print(f"   Organizations: {len(data.get('organizations', []))}")
            print(f"   Business Categories: {len(data.get('business_categories', []))}")
            print(f"   Years: {len(data.get('years', []))}")
        except Exception as e:
            print(f"   Error parsing local API data: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    
    working = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    print(f"✅ Working: {len(working)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")
    
    print("\n✅ Working Endpoints:")
    for result in working:
        print(f"   • {result['name']}: {result['status_code']}")
    
    print("\n❌ Failed Endpoints:")
    for result in failed:
        print(f"   • {result['name']}: {result['status_code']} - {result['error'] or 'Unknown error'}")
    
    # Recommendations
    print("\n🔧 Recommendations:")
    
    if results[0]['success'] and not results[1]['success']:
        print("   • Local API is working but tunneled API is not")
        print("   • Check Cloudflare tunnel configuration")
        print("   • Verify tunnel is pointing to localhost:3200")
        print("   • Check if tunnel service is running")
    
    if results[4]['success']:  # Frontend
        print("   • Frontend is accessible at https://philgeps.simple-systems.dev")
        print("   • Frontend should work once API tunnel is fixed")
    
    print("\n💡 Next Steps:")
    print("   1. Fix Cloudflare tunnel configuration")
    print("   2. Ensure tunnel points to localhost:3200")
    print("   3. Test frontend with working API")
    print("   4. Verify all features work end-to-end")

if __name__ == "__main__":
    main()
