#!/bin/bash
# Simple Celery Stress Test Script
# Quickly submit multiple tasks to test the queue

API_BASE="http://localhost:3200"
NUM_TASKS=10

echo "═══════════════════════════════════════════════════"
echo "  CELERY QUEUE STRESS TEST"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Submitting $NUM_TASKS tasks to the queue..."
echo ""

# Counter for successes and failures
SUCCESS=0
FAILED=0

for i in $(seq 1 $NUM_TASKS); do
    echo -n "Task $i/$NUM_TASKS: "
    
    # Submit export task
    RESPONSE=$(curl -s -X POST \
        "$API_BASE/api/v1/data-processing/tasks/export/" \
        -H "Content-Type: application/json" \
        -d '{
            "contractors": ["Test Corporation"],
            "areas": [],
            "organizations": [],
            "business_categories": [],
            "keywords": [],
            "time_ranges": []
        }' 2>&1)
    
    # Check if successful
    if echo "$RESPONSE" | grep -q "task_id"; then
        TASK_ID=$(echo "$RESPONSE" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
        echo "✓ Submitted - Task ID: $TASK_ID"
        ((SUCCESS++))
    else
        echo "✗ Failed"
        ((FAILED++))
    fi
    
    # Small delay between submissions
    sleep 0.2
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "  SUMMARY"
echo "═══════════════════════════════════════════════════"
echo "  Total tasks: $NUM_TASKS"
echo "  Successful:  $SUCCESS"
echo "  Failed:      $FAILED"
echo ""
echo "Check task status:"
echo "  • Frontend: http://localhost:3000"
echo "  • Flower: http://localhost:5555"
echo "  • RabbitMQ: http://localhost:15672"
echo ""
echo "Check logs:"
echo "  docker logs philgeps-celeryworker -f"
echo ""





