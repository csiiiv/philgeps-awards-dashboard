#!/bin/bash

API_URL="http://localhost:3200/api/v1"
CONCURRENT=10
REQUESTS=5

test_endpoint() {
    local name=$1
    local url=$2
    local payload=$3
    
    echo "Testing: $name"
    
    local start=$(date +%s.%N)
    
    for i in $(seq 1 $REQUESTS); do
        curl -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$payload" \
            -s -o /dev/null &
    done
    
    wait
    
    local end=$(date +%s.%N)
    local duration=$(echo "$end - $start" | bc)
    local rps=$(echo "scale=2; $REQUESTS / $duration" | bc)
    
    echo "  ✓ Completed: $REQUESTS requests in ${duration}s (${rps} req/s)"
    echo ""
}

echo "=== Quick Load Test ==="
echo "Concurrent users: $CONCURRENT"
echo "Requests per test: $REQUESTS"
echo ""

# Test 1: chip-search with filters
test_endpoint "Chip Search (2 contractors)" "$API_URL/contracts/chip-search/" '{
    "contractors": ["NEWINGTON", "S-ANG"],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": [],
    "time_ranges": [],
    "include_flood_control": false,
    "limit": 50,
    "offset": 0
}'

# Test 2: chip-aggregates
test_endpoint "Chip Aggregates (3 contractors)" "$API_URL/contracts/chip-aggregates/" '{
    "contractors": ["NEWINGTON", "S-ANG", "LOUREL"],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": [],
    "time_ranges": [],
    "topN": 20,
    "include_flood_control": false
}'

echo "=== Load Test Complete ==="
