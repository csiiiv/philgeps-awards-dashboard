# Celery Queue Stress Testing Guide

## 🎯 Purpose

Test the Celery + RabbitMQ queue system to ensure it can handle:
- Multiple concurrent task submissions
- Queue management under load
- Worker distribution
- Real-time progress updates
- System stability

---

## 📋 Prerequisites

Make sure all services are running:
```bash
docker compose -f docker-compose.backend.yml ps
```

You should see:
- ✅ philgeps-backend (healthy)
- ✅ philgeps-rabbitmq (healthy)
- ✅ philgeps-redis (healthy)
- ✅ philgeps-celeryworker
- ✅ philgeps-celerybeat

---

## 🚀 Quick Start

### Method 1: Simple Bash Script (Recommended for Quick Test)

```bash
cd test
chmod +x stress_test_simple.sh
./stress_test_simple.sh
```

This will:
- Submit 10 tasks to the queue
- Show success/failure for each
- Display summary

### Method 2: Python Script (Detailed Testing)

```bash
cd test
python3 stress_test_celery.py
```

This will:
- Submit 20 tasks concurrently
- Monitor task execution
- Show detailed statistics
- Check task statuses

---

## ⚙️ Configuration

### Bash Script (`stress_test_simple.sh`)

Edit these variables at the top of the file:
```bash
API_BASE="http://localhost:3200"  # API endpoint
NUM_TASKS=10                       # Number of tasks to submit
```

### Python Script (`stress_test_celery.py`)

Edit these variables at the top of the file:
```python
API_BASE_URL = "http://localhost:3200"
NUM_TASKS = 20              # Number of tasks to submit
CONCURRENT_REQUESTS = 5     # How many to submit at once
TASK_TYPE = "export"        # "export" or "aggregates"
```

---

## 📊 Monitoring Tools

### 1. Frontend TaskManager

**URL:** http://localhost:3000

**Features:**
- Real-time task progress bars
- Task history
- Download completed exports
- Cancel running tasks
- WebSocket live updates

**How to use:**
1. Open http://localhost:3000 in your browser
2. Look for TaskManager component (usually in navigation)
3. Watch tasks appear in real-time as they're submitted
4. See progress bars update live

### 2. Flower (Celery Monitoring)

**URL:** http://localhost:5555

**Start Flower:**
```bash
docker compose -f docker-compose.backend.yml --profile monitoring up -d
```

**Features:**
- Real-time worker monitoring
- Task history and details
- Success/failure rates
- Worker resource usage
- Task execution time graphs

**Dashboard shows:**
- Active tasks
- Processed tasks
- Failed tasks
- Worker status
- Queue length

### 3. RabbitMQ Management UI

**URL:** http://localhost:15672  
**Credentials:** guest / guest

**Features:**
- Queue depth (how many tasks waiting)
- Message rates (tasks/second)
- Consumer details (workers)
- Connection status
- Memory usage

**Key metrics to watch:**
- **Queued messages:** Tasks waiting to be processed
- **Consumers:** Number of active workers
- **Message rate:** Tasks processed per second
- **Ready:** Tasks ready to be picked up

### 4. Backend Logs

**View Celery worker logs:**
```bash
docker logs philgeps-celeryworker -f
```

**What to look for:**
- Task received messages
- Task started messages
- Task succeeded/failed messages
- Any errors or warnings

**View backend API logs:**
```bash
docker logs philgeps-backend -f
```

### 5. Redis CLI (Check Results)

```bash
docker exec -it philgeps-redis redis-cli

# Check number of keys
DBSIZE

# List some keys
KEYS celery-task-meta-*

# Check a specific task result
GET celery-task-meta-<task-id>
```

---

## 🧪 Stress Test Scenarios

### Scenario 1: Light Load (Warmup)
```bash
NUM_TASKS=5 ./stress_test_simple.sh
```
**Expected:**
- All tasks complete quickly
- No queuing
- Workers handle immediately

### Scenario 2: Moderate Load
```bash
NUM_TASKS=10 ./stress_test_simple.sh
```
**Expected:**
- Some tasks queue up
- Workers process in batches of 4 (your worker count)
- All complete within reasonable time

### Scenario 3: Heavy Load
```bash
# Edit script to set NUM_TASKS=50
./stress_test_simple.sh
```
**Expected:**
- Significant queuing
- Tasks processed in waves
- Queue visible in RabbitMQ UI
- System remains stable

### Scenario 4: Concurrent Submissions
```bash
# Open 3 terminals, run simultaneously:
# Terminal 1:
./stress_test_simple.sh

# Terminal 2 (at same time):
./stress_test_simple.sh

# Terminal 3 (at same time):
./stress_test_simple.sh
```
**Expected:**
- 30 total tasks submitted
- All enter queue successfully
- Workers distribute load evenly
- All tasks complete eventually

---

## 📈 Performance Metrics

### What to Monitor

1. **Submission Rate**
   - How fast can you submit tasks?
   - Target: > 10 tasks/second

2. **Queue Time**
   - How long tasks wait before processing?
   - Check in RabbitMQ UI "Queued messages"

3. **Processing Time**
   - How long each task takes to complete?
   - Check in Flower dashboard

4. **Success Rate**
   - % of tasks that complete successfully
   - Target: > 99%

5. **System Resources**
   - CPU usage: `docker stats`
   - Memory usage: Check in Flower
   - Disk I/O: For export tasks

---

## 🔧 Tuning for Better Performance

### Increase Worker Concurrency

Edit `.env`:
```env
CELERY_WORKER_CONCURRENCY=8
```

Then restart:
```bash
docker compose -f docker-compose.backend.yml restart celeryworker
```

**When to increase:**
- Tasks are CPU-light (I/O-bound)
- Have more CPU cores available
- Want faster processing

**When NOT to increase:**
- Tasks are CPU-heavy
- Limited RAM
- Database connection limits

### Scale Workers Horizontally

Add more worker containers:
```bash
docker compose -f docker-compose.backend.yml up -d --scale celeryworker=3
```

This creates 3 worker containers, each with 4 workers = 12 total workers!

### Adjust Redis Memory

Edit `.env`:
```env
REDIS_MAX_MEMORY=1gb
```

Then restart:
```bash
docker compose -f docker-compose.backend.yml restart redis
```

---

## 🐛 Troubleshooting

### Tasks Not Starting

**Check 1:** Workers running?
```bash
docker ps --filter name=celeryworker
```

**Check 2:** RabbitMQ healthy?
```bash
docker logs philgeps-rabbitmq --tail=50
```

**Check 3:** Can workers connect to RabbitMQ?
```bash
docker logs philgeps-celeryworker --tail=50 | grep -i "connected"
```

### Tasks Failing

**Check logs:**
```bash
docker logs philgeps-celeryworker -f
```

**Common issues:**
- Out of memory
- Database connection issues
- Missing data files
- Incorrect task parameters

### Queue Not Draining

**Check 1:** Worker count
```bash
docker compose -f docker-compose.backend.yml ps celeryworker
```

**Check 2:** Worker CPU usage
```bash
docker stats philgeps-celeryworker
```

**Check 3:** Any stuck tasks?
- Open Flower: http://localhost:5555
- Check "Active Tasks"
- Look for tasks running > 5 minutes

### High Memory Usage

**Check Redis memory:**
```bash
docker exec philgeps-redis redis-cli INFO memory
```

**Clear old results:**
```bash
docker exec philgeps-redis redis-cli FLUSHDB
```

---

## 📊 Expected Results

### With 4 Workers (Default)

| Tasks | Queue Time | Total Time | Notes |
|-------|------------|------------|-------|
| 5 | ~0s | ~5-10s | No queuing |
| 10 | ~2s | ~15-20s | Minimal queuing |
| 20 | ~5-10s | ~30-40s | Significant queuing |
| 50 | ~20-30s | ~60-90s | Heavy queuing |

### With 8 Workers

| Tasks | Queue Time | Total Time | Notes |
|-------|------------|------------|-------|
| 10 | ~0s | ~10-15s | No queuing |
| 20 | ~2s | ~20-25s | Minimal queuing |
| 50 | ~5-10s | ~40-50s | Moderate queuing |

*Times are approximate and depend on task complexity and system resources*

---

## 💡 Best Practices

1. **Start Small**
   - Test with 5 tasks first
   - Gradually increase load
   - Monitor system resources

2. **Use Monitoring Tools**
   - Always have Flower open during stress tests
   - Watch RabbitMQ queue depth
   - Monitor worker logs

3. **Test Different Scenarios**
   - Single user, many tasks
   - Multiple users, few tasks each
   - Burst traffic
   - Sustained load

4. **Document Results**
   - Record peak performance
   - Note any failures
   - Track resource usage

5. **Plan for Growth**
   - Test 2-3x expected load
   - Know when to scale
   - Have scaling plan ready

---

## 🎯 Success Criteria

Your system is performing well if:

✅ Can accept > 10 task submissions per second  
✅ > 99% task success rate  
✅ All tasks complete (even if queued)  
✅ No worker crashes  
✅ System remains responsive  
✅ Memory usage stays stable  
✅ No task timeouts  

---

## 📞 Need Help?

Check these resources:
- **Backend logs:** `docker logs philgeps-backend -f`
- **Worker logs:** `docker logs philgeps-celeryworker -f`
- **Flower:** http://localhost:5555
- **RabbitMQ:** http://localhost:15672

---

**Happy Testing!** 🚀





