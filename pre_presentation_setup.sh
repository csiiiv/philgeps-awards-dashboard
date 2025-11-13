#!/bin/bash

echo "========================================"
echo "PhilGEPS Dashboard Pre-Presentation Setup"
echo "Preparing for 40-50 concurrent users"
echo "========================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if system is optimized
echo "🔍 Step 1: Checking system optimizations..."
SOMAXCONN=$(cat /proc/sys/net/core/somaxconn)
if [ "$SOMAXCONN" -lt 4096 ]; then
    echo -e "${YELLOW}⚠️  System not optimized. Run: sudo ./optimize_system.sh${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ System optimizations detected${NC}"
fi

# Stop any running containers
echo ""
echo "🛑 Step 2: Stopping existing containers..."
docker compose -f docker-compose.cloudflared.ram.yml down 2>/dev/null || true

# Build with latest changes
echo ""
echo "🔨 Step 3: Building with RAM optimization..."
docker compose -f docker-compose.cloudflared.ram.yml build --no-cache

# Start services
echo ""
echo "🚀 Step 4: Starting services..."
docker compose -f docker-compose.cloudflared.ram.yml up -d

# Wait for services to be healthy
echo ""
echo "⏳ Step 5: Waiting for services to be healthy..."
MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    BACKEND_HEALTH=$(docker inspect philgeps-backend-ram --format='{{.State.Health.Status}}' 2>/dev/null || echo "starting")
    FRONTEND_HEALTH=$(docker inspect philgeps-frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "starting")
    
    if [ "$BACKEND_HEALTH" = "healthy" ] && [ "$FRONTEND_HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✅ All services are healthy!${NC}"
        break
    fi
    
    echo "   Backend: $BACKEND_HEALTH | Frontend: $FRONTEND_HEALTH"
    sleep 5
    WAITED=$((WAITED + 5))
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "${RED}⚠️  Services took too long to start. Check logs.${NC}"
fi

# Warm up cache with common endpoints
echo ""
echo "🔥 Step 6: Warming up cache..."
sleep 5  # Give services a moment

echo "   - Testing backend connection..."
curl -s -o /dev/null -w "   Backend API: %{http_code}\n" "http://localhost:3200/api/v1/"

echo "   - Preloading analytics summary..."
curl -s -o /dev/null -w "   Analytics: %{http_code}\n" "http://localhost:3200/api/v1/analytics/summary/"

echo "   - Preloading contractors..."
curl -s -o /dev/null -w "   Contractors: %{http_code}\n" "http://localhost:3200/api/v1/entities/contractors/?page=1&page_size=20"

echo "   - Preloading contracts..."
curl -s -o /dev/null -w "   Contracts: %{http_code}\n" "http://localhost:3200/api/v1/contracts/?page=1&page_size=20"

echo "   - Testing frontend..."
curl -s -o /dev/null -w "   Frontend: %{http_code}\n" "http://localhost:3000/"

# Show status
echo ""
echo "📊 Step 7: Service Status"
echo "================================"
docker compose -f docker-compose.cloudflared.ram.yml ps

# Show resource usage
echo ""
echo "💾 Step 8: Resource Usage"
echo "================================"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3200/api/v1/"
echo "   Admin: http://localhost:3200/admin/"
echo ""
echo "📊 Monitor performance with:"
echo "   ./monitor_performance.sh"
echo ""
echo "📝 View logs with:"
echo "   docker compose -f docker-compose.cloudflared.ram.yml logs -f"
echo ""
echo -e "${YELLOW}💡 Tip: Keep monitor_performance.sh running during presentation${NC}"
echo ""
