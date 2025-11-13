#!/bin/bash

echo "========================================"
echo "PhilGEPS Dashboard Performance Monitor"
echo "Press Ctrl+C to stop"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to get color based on value
get_cpu_color() {
    local cpu=$1
    cpu=${cpu%.*}  # Remove decimal part
    if [ "$cpu" -lt 50 ]; then
        echo -e "${GREEN}"
    elif [ "$cpu" -lt 80 ]; then
        echo -e "${YELLOW}"
    else
        echo -e "${RED}"
    fi
}

# Main monitoring loop
while true; do
    clear
    echo "========================================"
    echo "PhilGEPS Performance Monitor"
    echo "Time: $(date '+%H:%M:%S')"
    echo "========================================"
    echo ""
    
    # Docker stats
    echo "📊 Container Resources:"
    echo "----------------------------------------"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    
    echo ""
    echo "🔌 Active Connections:"
    echo "----------------------------------------"
    
    # Backend connections
    BACKEND_CONN=$(docker exec philgeps-backend-ram netstat -an 2>/dev/null | grep :8000 | grep ESTABLISHED | wc -l)
    echo "Backend (port 8000): $BACKEND_CONN connections"
    
    # Frontend connections
    FRONTEND_CONN=$(docker exec philgeps-frontend netstat -an 2>/dev/null | grep :80 | grep ESTABLISHED | wc -l)
    echo "Frontend (port 80): $FRONTEND_CONN connections"
    
    # Redis connections (if available)
    REDIS_CONN=$(docker exec philgeps-redis redis-cli client list 2>/dev/null | wc -l)
    if [ "$REDIS_CONN" -gt 0 ]; then
        echo "Redis: $REDIS_CONN connections"
    fi
    
    # Health check
    echo ""
    echo "❤️  Service Health:"
    echo "----------------------------------------"
    BACKEND_HEALTH=$(docker inspect philgeps-backend-ram --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    FRONTEND_HEALTH=$(docker inspect philgeps-frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    REDIS_STATUS=$(docker inspect philgeps-redis --format='{{.State.Status}}' 2>/dev/null || echo "not running")
    
    if [ "$BACKEND_HEALTH" = "healthy" ]; then
        echo -e "Backend:  ${GREEN}✅ $BACKEND_HEALTH${NC}"
    else
        echo -e "Backend:  ${RED}❌ $BACKEND_HEALTH${NC}"
    fi
    
    if [ "$FRONTEND_HEALTH" = "healthy" ]; then
        echo -e "Frontend: ${GREEN}✅ $FRONTEND_HEALTH${NC}"
    else
        echo -e "Frontend: ${RED}❌ $FRONTEND_HEALTH${NC}"
    fi
    
    if [ "$REDIS_STATUS" = "running" ]; then
        echo -e "Redis:    ${GREEN}✅ $REDIS_STATUS${NC}"
    else
        echo -e "Redis:    ${YELLOW}⚠️  $REDIS_STATUS${NC}"
    fi
    
    # System resources
    echo ""
    echo "💻 System Resources:"
    echo "----------------------------------------"
    
    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    echo "CPU Usage: ${CPU_USAGE}%"
    
    # Memory usage
    MEM_INFO=$(free -h | awk '/^Mem:/ {print $3 "/" $2}')
    echo "Memory: $MEM_INFO"
    
    # Disk usage for Docker
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
    echo "Disk: $DISK_USAGE used"
    
    # Recent requests (last 5)
    echo ""
    echo "📝 Recent API Requests:"
    echo "----------------------------------------"
    docker logs philgeps-backend-ram --tail 5 2>/dev/null | grep -E "GET|POST|PUT|DELETE" | tail -5 || echo "No recent requests"
    
    echo ""
    echo "----------------------------------------"
    echo "Refreshing in 5 seconds... (Ctrl+C to stop)"
    
    sleep 5
done
