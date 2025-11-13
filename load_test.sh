#!/bin/bash

# PhilGEPS Dashboard Load Test
# Tests various endpoints with concurrent requests

API_URL="http://localhost:3200/api/v1"
FRONTEND_URL="http://localhost:3000"
CONCURRENT_USERS=20
REQUESTS_PER_USER=10
TOTAL_REQUESTS=$((CONCURRENT_USERS * REQUESTS_PER_USER))

echo "=========================================="
echo "PhilGEPS Dashboard Load Test"
echo "=========================================="
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Concurrent Users: $CONCURRENT_USERS"
echo "Requests per User: $REQUESTS_PER_USER"
echo "Total Requests: $TOTAL_REQUESTS"
echo ""

# Create temp directory for results
RESULTS_DIR="/tmp/philgeps_load_test_$(date +%s)"
mkdir -p "$RESULTS_DIR"

echo "📊 Test Results Directory: $RESULTS_DIR"
echo ""

# Test function
run_test() {
    local endpoint=$1
    local name=$2
    local method=${3:-GET}
    
    echo "Testing: $name"
    echo "Endpoint: $endpoint"
    echo "Method: $method"
    
    local start_time=$(date +%s.%N)
    local success=0
    local failed=0
    local total_time=0
    
    # Run concurrent requests
    for ((i=1; i<=CONCURRENT_USERS; i++)); do
        (
            for ((j=1; j<=REQUESTS_PER_USER; j++)); do
                local req_start=$(date +%s.%N)
                
                if [ "$method" = "GET" ]; then
                    response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" "$endpoint" 2>&1)
                else
                    response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" -X "$method" "$endpoint" 2>&1)
                fi
                
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
        
        # Calculate average response time
        avg_time=$(awk -F: '{sum+=$2; count++} END {if(count>0) print sum/count; else print 0}' "$RESULTS_DIR/${name// /_}.txt")
        
        # Calculate min/max
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

# Test 1: API Root
echo "=========================================="
echo "Test 1: API Root Endpoint"
echo "=========================================="
run_test "$API_URL/" "API Root"

# Test 2: Contracts Search
echo "=========================================="
echo "Test 2: Contracts Search"
echo "=========================================="
run_test "$API_URL/contracts/?limit=10" "Contracts Search"

# Test 3: Contractors Aggregation
echo "=========================================="
echo "Test 3: Contractors Aggregation"
echo "=========================================="
run_test "$API_URL/contractors/?limit=20" "Contractors Aggregation"

# Test 4: Organizations Aggregation  
echo "=========================================="
echo "Test 4: Organizations Aggregation"
echo "=========================================="
run_test "$API_URL/organizations/?limit=20" "Organizations Aggregation"

# Test 5: Business Categories
echo "=========================================="
echo "Test 5: Business Categories"
echo "=========================================="
run_test "$API_URL/business-categories/?limit=20" "Business Categories"

# Test 6: Frontend Homepage
echo "=========================================="
echo "Test 6: Frontend Homepage"
echo "=========================================="
run_test "$FRONTEND_URL/" "Frontend Homepage"

# Summary
echo "=========================================="
echo "Load Test Complete!"
echo "=========================================="
echo ""
echo "📁 Detailed results saved to: $RESULTS_DIR"
echo ""
echo "Summary by endpoint:"
for file in "$RESULTS_DIR"/*.txt; do
    if [ -f "$file" ]; then
        name=$(basename "$file" .txt | tr '_' ' ')
        total=$(wc -l < "$file")
        success=$(grep -c "^200:" "$file" 2>/dev/null || echo 0)
        success_rate=$(echo "scale=1; $success * 100 / $total" | bc)
        echo "  $name: $success/$total requests succeeded (${success_rate}%)"
    fi
done

echo ""
echo "Run 'cat $RESULTS_DIR/*.txt' to see all response times"
