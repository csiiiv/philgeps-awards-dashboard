# Presentation Deployment Guide

## Quick Start (Day of Presentation)

### 1. System Optimization (Run Once)
```bash
sudo ./optimize_system.sh
```

### 2. Start Services
```bash
./pre_presentation_setup.sh
```

This script will:
- ✅ Stop any existing containers
- ✅ Build with latest optimizations
- ✅ Start all services with RAM optimization
- ✅ Wait for health checks
- ✅ Warm up the cache
- ✅ Show service status

### 3. Monitor During Presentation
```bash
./monitor_performance.sh
```

Keep this running in a terminal during your presentation to track:
- Container resource usage (CPU, Memory, Network)
- Active connections per service
- Service health status
- Recent API requests

---

## What Has Been Optimized

### Priority 1 (System & Backend)
✅ **Gunicorn Workers**: Increased from default to 4 workers with gevent
✅ **Worker Connections**: 1000 connections per worker = 4000 total
✅ **Timeouts**: Reduced to 120s for faster failover
✅ **Keepalive**: Increased to 75s for connection reuse
✅ **System Limits**: File descriptors and network settings optimized

### Priority 2 (Caching & Network)
✅ **Redis Caching**: Added Redis with 256MB cache, 5-minute TTL
✅ **Connection Pooling**: Database connections persist for 10 minutes
✅ **Nginx Rate Limiting**: 
   - API: 30 requests/second with burst of 20
   - General: 100 requests/second with burst of 50
   - Per-IP limit: 20 concurrent connections
✅ **Gzip Compression**: Enabled for all text assets
✅ **Nginx Connection Pooling**: HTTP 1.1 with keep-alive
✅ **Django Throttling**: Increased to 1000 requests/hour

---

## Expected Capacity

| Configuration | Concurrent Users |
|--------------|------------------|
| Original Setup | ~10-15 users |
| With RAM Optimization | ~30-40 users |
| **With All Optimizations** | **50-60 users** |
| With External Load Balancer | 80-100+ users |

---

## Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3200/api/v1/
- **Admin Panel**: http://localhost:3200/admin/
- **If using Cloudflared**: Your configured tunnel URL

---

## Troubleshooting

### If services don't start:
```bash
# Check logs
docker compose -f docker-compose.cloudflared.ram.yml logs

# Restart specific service
docker compose -f docker-compose.cloudflared.ram.yml restart backend
docker compose -f docker-compose.cloudflared.ram.yml restart frontend
docker compose -f docker-compose.cloudflared.ram.yml restart redis
```

### If performance is slow:
1. Check if system optimizations were applied: `cat /proc/sys/net/core/somaxconn` (should be 4096)
2. Check Redis is running: `docker ps | grep redis`
3. Check RAM disk is mounted: `docker exec philgeps-backend-ram df -h | grep tmpfs`
4. Monitor resource usage: `./monitor_performance.sh`

### If Redis connection fails:
The system will fallback to local memory cache automatically. To fix:
```bash
docker compose -f docker-compose.cloudflared.ram.yml restart redis
docker compose -f docker-compose.cloudflared.ram.yml restart backend
```

---

## Pre-Presentation Checklist

- [ ] Run `sudo ./optimize_system.sh`
- [ ] Run `./pre_presentation_setup.sh`
- [ ] Verify all services are healthy (green checkmarks)
- [ ] Test frontend at http://localhost:3000
- [ ] Test API at http://localhost:3200/api/v1/
- [ ] Start `./monitor_performance.sh` in separate terminal
- [ ] Close unnecessary applications to free resources
- [ ] Have backup plan: Keep logs accessible for debugging

---

## Performance Tips

1. **Close unnecessary applications** before presentation
2. **Keep monitor_performance.sh visible** on second screen if available
3. **Pre-load common pages** before users arrive (done by setup script)
4. **Have fallback**: If issues occur, restart services quickly:
   ```bash
   docker compose -f docker-compose.cloudflared.ram.yml restart
   ```

---

## Files Modified

### Configuration Files:
- `docker-compose.cloudflared.ram.yml` - Added Redis, increased workers
- `backend/django/philgeps_data_explorer/settings.py` - Redis cache, connection pooling, throttling
- `frontend/nginx.conf` - Rate limiting, compression, connection optimization
- `backend/django/requirements.txt` - Added django-redis

### New Scripts:
- `optimize_system.sh` - System-level optimizations
- `pre_presentation_setup.sh` - Automated deployment
- `monitor_performance.sh` - Real-time monitoring

---

## Post-Presentation

To stop services:
```bash
docker compose -f docker-compose.cloudflared.ram.yml down
```

To preserve system optimizations for next time, they're already saved in `/etc/sysctl.conf`

---

**Good luck with your presentation! 🚀**
