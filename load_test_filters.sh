#!/bin/bash

# PhilGEPS Dashboard - Complex Filter Load Test
# Tests advanced search with multiple filter combinations

API_URL="http://localhost:3200/api/v1"
CONCURRENT_USERS=20
REQUESTS_PER_USER=5
TOTAL_REQUESTS=$((CONCURRENT_USERS * REQUESTS_PER_USER))

echo "=========================================="
echo "PhilGEPS Dashboard - Complex Filter Load Test"
echo "=========================================="
echo "API URL: $API_URL"
echo "Concurrent Users: $CONCURRENT_USERS"
echo "Requests per User: $REQUESTS_PER_USER"
echo "Total Requests per Test: $TOTAL_REQUESTS"
echo ""

# Create temp directory for results
RESULTS_DIR="/tmp/philgeps_filter_test_$(date +%s)"
mkdir -p "$RESULTS_DIR"

echo "📊 Test Results Directory: $RESULTS_DIR"
echo ""

# Test function for POST requests with JSON payload
run_post_test() {
    local endpoint=$1
    local name=$2
    local payload=$3
    
    echo "Testing: $name"
    echo "Endpoint: $endpoint"
    echo "Payload: $payload"
    
    local start_time=$(date +%s.%N)
    
    # Run concurrent requests
    for ((i=1; i<=CONCURRENT_USERS; i++)); do
        (
            for ((j=1; j<=REQUESTS_PER_USER; j++)); do
                response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" \
                    -X POST \
                    -H "Content-Type: application/json" \
                    -d "$payload" \
                    "$endpoint" 2>&1)
                
                local http_code=$(echo "$response" | cut -d: -f1)
                local req_time=$(echo "$response" | cut -d: -f2)
                
                echo "$http_code:$req_time" >> "$RESULTS_DIR/${name// /_}.txt"
            done
        ) &
    done
    
    # Wait for all background jobs
    wait
    
    local end_time=$(date +%s.%N)
    local total_duration=$(echo "$end_time - $start_time" | bc)
    
    # Analyze results
    if [ -f "$RESULTS_DIR/${name// /_}.txt" ]; then
        success=$(grep -c "^200:" "$RESULTS_DIR/${name// /_}.txt" 2>/dev/null || echo 0)
        failed=$(grep -cv "^200:" "$RESULTS_DIR/${name// /_}.txt" 2>/dev/null || echo 0)
        
        avg_time=$(awk -F: '{sum+=$2; count++} END {if(count>0) print sum/count; else print 0}' "$RESULTS_DIR/${name// /_}.txt")
        min_time=$(awk -F: '{print $2}' "$RESULTS_DIR/${name// /_}.txt" | sort -n | head -1)
        max_time=$(awk -F: '{print $2}' "$RESULTS_DIR/${name// /_}.txt" | sort -n | tail -1)
        
        local rps=$(echo "scale=2; $TOTAL_REQUESTS / $total_duration" | bc)
        
        echo "  ✓ Success: $success"
        echo "  ✗ Failed: $failed"
        echo "  ⏱  Total Time: ${total_duration}s"
        echo "  📈 Requests/sec: $rps"
        echo "  ⚡ Avg Response: ${avg_time}s"
        echo "  🚀 Min Response: ${min_time}s"
        echo "  🐌 Max Response: ${max_time}s"
    fi
    
    echo ""
}

# Test 1: Multiple Contractors Filter
echo "=========================================="
echo "Test 1: Multiple Contractors Filter"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Multi Contractor Filter" \
    # Test 1: Multiple Contractors Filter
test_endpoint "Multi Contractor Filter" "http://localhost:3200/api/v1/contracts/chip-search/" '{
        "contractors": ["NEWINGTON", "S-ANG", "LOUREL DEVELOPMENT CORPORATION"],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [],
        "include_flood_control": false,
        "value_range": {"min": 0, "max": 1000000000000},
        "limit": 50,
        "offset": 0
    }'

# Test 2: Contractor + Area Filter
echo "=========================================="
echo "Test 2: Contractor + Area Filter"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Contractor Area Filter" \
    '{
        "contractors": ["NEWINGTON"],
        "areas": ["NCR", "REGION III"],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [],
        "include_flood_control": false,
        "limit": 50,
        "offset": 0
    }'

# Test 3: Business Category Filter
echo "=========================================="
echo "Test 3: Business Category Filter"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Business Category Filter" \
    '{
        "contractors": [],
        "areas": [],
        "organizations": [],
        "business_categories": ["Construction", "Goods"],
        "keywords": [],
        "time_ranges": [],
        "include_flood_control": false,
        "limit": 100,
        "offset": 0
    }'

# Test 4: Time Range Filter
echo "=========================================="
echo "Test 4: Time Range Filter"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Time Range Filter" \
    '{
        "contractors": [],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [["2023-01-01", "2023-12-31"]],
        "include_flood_control": false,
        "limit": 100,
        "offset": 0
    }'

# Test 5: Complex Multi-Filter (Kitchen Sink)
echo "=========================================="
echo "Test 5: Complex Multi-Filter"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Complex Multi Filter" \
    '{
        "contractors": ["NEWINGTON", "S-ANG"],
        "areas": ["NCR"],
        "organizations": ["DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS"],
        "business_categories": ["Construction"],
        "keywords": ["road", "bridge"],
        "time_ranges": [["2023-01-01", "2024-12-31"]],
        "include_flood_control": false,
        "value_range": {"min": 1000000, "max": 100000000},
        "limit": 100,
        "offset": 0
    }'

# Test 6: Value Range Filter
echo "=========================================="
echo "Test 6: Value Range Filter"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Value Range Filter" \
    '{
        "contractors": [],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [],
        "include_flood_control": false,
        "value_range": {"min": 10000000, "max": 50000000},
        "limit": 100,
        "offset": 0
    }'

# Test 7: Keyword Search
echo "=========================================="
echo "Test 7: Keyword Search"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Keyword Search" \
    '{
        "contractors": [],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": ["construction", "infrastructure"],
        "time_ranges": [],
        "include_flood_control": false,
        "limit": 100,
        "offset": 0
    }'

# Test 8: Chip Aggregates (like your example)
echo "=========================================="
echo "Test 8: Chip Aggregates"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-aggregates/" \
    "Chip Aggregates" \
    '{
        "contractors": ["NEWINGTON", "S-ANG", "LOUREL DEVELOPMENT CORPORATION"],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [],
        "topN": 20,
        "include_flood_control": false,
        "value_range": {"min": 0, "max": 1000000000000}
    }'

# Test 9: Organization + Time Range
echo "=========================================="
echo "Test 9: Organization + Time Range"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Organization Time Filter" \
    '{
        "contractors": [],
        "areas": [],
        "organizations": ["DEPARTMENT OF EDUCATION"],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [["2024-01-01", "2024-12-31"]],
        "include_flood_control": false,
        "limit": 50,
        "offset": 0
    }'

# Test 10: Pagination Stress Test (multiple offsets)
echo "=========================================="
echo "Test 10: Pagination Stress"
echo "=========================================="
run_post_test "$API_URL/contracts/chip-search/" \
    "Pagination Stress" \
    '{
        "contractors": [],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": [],
        "include_flood_control": false,
        "limit": 100,
        "offset": 1000
    }'

# Summary
echo "=========================================="
echo "Complex Filter Load Test Complete!"
echo "=========================================="
echo ""
echo "📁 Detailed results saved to: $RESULTS_DIR"
echo ""
echo "Summary by test:"
for file in "$RESULTS_DIR"/*.txt; do
    if [ -f "$file" ]; then
        name=$(basename "$file" .txt | tr '_' ' ')
        total=$(wc -l < "$file")
        success=$(grep -c "^200:" "$file" 2>/dev/null || echo 0)
        success_rate=$(echo "scale=1; $success * 100 / $total" | bc)
        avg_time=$(awk -F: '{sum+=$2; count++} END {if(count>0) printf "%.3f", sum/count; else print 0}' "$file")
        echo "  $name: $success/$total (${success_rate}%) - Avg: ${avg_time}s"
    fi
done

echo ""
echo "Performance Recommendations:"
echo "  - Response times < 1s: Excellent ✅"
echo "  - Response times 1-3s: Good 👍"
echo "  - Response times > 3s: Needs optimization ⚠️"
