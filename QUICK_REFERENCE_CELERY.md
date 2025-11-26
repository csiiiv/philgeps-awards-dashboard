# Celery Queue System - Quick Reference

## 🔄 How the Queueing Works

```
Frontend Request → Django API → RabbitMQ Queue → Celery Worker → Redis Result
                       ↓                                 ↓
                  Returns task_id                  Updates progress
                  immediately                    via WebSocket
```

### Your Current Setup

- **Workers:** 4 concurrent (configurable via `CELERY_WORKER_CONCURRENCY`)
- **Broker:** RabbitMQ on port 5672
- **Result Backend:** Redis on port 6379
- **Scheduler:** Celery Beat (for periodic tasks)
- **Monitoring:** Flower on port 5555 (optional)

### Processing Capacity

- Can process **4 tasks simultaneously**
- Additional tasks wait in queue (FIFO)
- No limit on queue size
- Tasks persist if worker restarts

---

## 🧪 Stress Testing

### Quick Test (5 tasks)

```bash
cd /mnt/6E9A84429A8408B3/_VSC/LINUX/PHILGEPS/philgeps-awards-dashboard/test
./stress_test_simple.sh
```

### Detailed Test (20 tasks)

```bash
cd /mnt/6E9A84429A8408B3/_VSC/LINUX/PHILGEPS/philgeps-awards-dashboard/test
python3 stress_test_celery.py
```

### Custom Test

Edit the script variables:
```bash
# In stress_test_simple.sh
NUM_TASKS=50  # Number of tasks to submit

# In stress_test_celery.py
NUM_TASKS = 100              # Number of tasks
CONCURRENT_REQUESTS = 10     # Submit rate
TASK_TYPE = "export"         # Or "aggregates"
```

---

## 📊 Monitoring Tools

### 1. RabbitMQ Management UI
```
URL: http://localhost:15672
User: guest
Pass: guest

See:
- Queue depth (tasks waiting)
- Message rate (tasks/second)
- Consumer count (active workers)
```

### 2. Flower (Celery Monitor)
```bash
# Start Flower
docker compose -f docker-compose.backend.yml --profile monitoring up -d

# Access
http://localhost:5555

See:
- Active tasks
- Completed tasks
- Failed tasks
- Worker status
- Task history
```

### 3. Worker Logs
```bash
# Follow worker logs
docker logs philgeps-celeryworker -f

# Check for errors
docker logs philgeps-celeryworker | grep -i error
```

### 4. Redis CLI
```bash
# Connect to Redis
docker exec -it philgeps-redis redis-cli

# Check task results
KEYS celery-task-meta-*
DBSIZE

# Get specific task result
GET celery-task-meta-<task-id>
```

### 5. API Endpoints
```bash
# Check active tasks
curl http://localhost:3200/api/v1/data-processing/tasks/active/

# Check task status
curl "http://localhost:3200/api/v1/data-processing/tasks/status/?task_id=<id>"
```

---

## ⚡ Performance Tuning

### Scale Workers Up

```bash
# Edit .env
CELERY_WORKER_CONCURRENCY=8

# Restart
docker compose -f docker-compose.backend.yml restart celeryworker
```

### Add More Worker Containers

```bash
# Scale to 3 workers (4 threads each = 12 total)
docker compose -f docker-compose.backend.yml up -d --scale celeryworker=3
```

### Increase Redis Memory

```bash
# Edit .env
REDIS_MAX_MEMORY=1gb

# Restart
docker compose -f docker-compose.backend.yml restart redis
```

---

## 🐛 Troubleshooting

### Tasks Not Processing

```bash
# Check worker is running
docker compose -f docker-compose.backend.yml ps celeryworker

# Check worker can connect to RabbitMQ
docker logs philgeps-celeryworker | grep -i "connected"

# Check RabbitMQ health
docker logs philgeps-rabbitmq --tail=50
```

### High Queue Depth

```bash
# Check queue in RabbitMQ UI
http://localhost:15672

# Or via CLI
docker exec philgeps-rabbitmq rabbitmqctl list_queues

# Solutions:
1. Add more workers (scale up)
2. Increase worker concurrency
3. Check for stuck tasks (Flower)
```

### Tasks Failing

```bash
# Check worker logs
docker logs philgeps-celeryworker -f

# Check specific task in Flower
http://localhost:5555

# Common issues:
- Out of memory (reduce concurrency)
- Missing files (check parquet data)
- Database connection limit (reduce workers)
```

---

## 📈 Expected Performance

### With 4 Workers (Default)

| Tasks | Queue Time | Total Time |
|-------|------------|------------|
| 5     | ~0s        | ~10s       |
| 10    | ~5s        | ~20s       |
| 20    | ~10s       | ~40s       |
| 50    | ~30s       | ~90s       |

### With 8 Workers

| Tasks | Queue Time | Total Time |
|-------|------------|------------|
| 10    | ~0s        | ~15s       |
| 20    | ~5s        | ~25s       |
| 50    | ~10s       | ~50s       |

---

## 🎯 Quick Commands

```bash
# Status check
docker compose -f docker-compose.backend.yml ps

# View logs
docker logs philgeps-celeryworker -f
docker logs philgeps-backend -f

# Restart services
docker compose -f docker-compose.backend.yml restart celeryworker
docker compose -f docker-compose.backend.yml restart redis

# Clear Redis cache
docker exec philgeps-redis redis-cli FLUSHDB

# Submit test task
curl -X POST http://localhost:3200/api/v1/data-processing/tasks/export/ \
  -H "Content-Type: application/json" \
  -d '{"contractors":[],"areas":[],"organizations":[],"business_categories":[],"keywords":[],"time_ranges":[]}'
```

---

## 📚 Documentation Files

- **Full Guide:** `docs/FRONTEND_ENDPOINTS_GUIDE.md`
- **Stress Testing:** `test/README_STRESS_TESTING.md`
- **Deployment:** `DEPLOYMENT_GUIDE.md`
- **Docker Setup:** `DOCKER_COMPOSE_FILES.md`

---

## ✅ System Health Check

Run this to verify everything is working:

```bash
# 1. Check all services are running
docker compose -f docker-compose.backend.yml ps

# Expected:
# ✓ philgeps-backend (healthy)
# ✓ philgeps-rabbitmq (healthy)
# ✓ philgeps-redis (healthy)
# ✓ philgeps-celeryworker (Up)
# ✓ philgeps-celerybeat (Up)

# 2. Test API connectivity
curl http://localhost:3200/api/v1/

# Expected: JSON response with API info

# 3. Check RabbitMQ
curl -u guest:guest http://localhost:15672/api/overview

# Expected: JSON with RabbitMQ status

# 4. Check Redis
docker exec philgeps-redis redis-cli PING

# Expected: PONG

# 5. Submit test task
cd test && ./stress_test_simple.sh

# Expected: Tasks submitted successfully
```

---

**Everything working?** Check the full guide at `docs/FRONTEND_ENDPOINTS_GUIDE.md` for detailed information! 🚀

