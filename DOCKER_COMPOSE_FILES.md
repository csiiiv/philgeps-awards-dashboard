# Docker Compose Files Guide

## 📁 Available Docker Compose Files

| File | Purpose | Use When |
|------|---------|----------|
| `docker-compose.yml` | **Full stack (basic)** | Local dev - both services |
| `docker-compose.ram.yml` | **Full stack (optimized)** | Local dev - with RAM disk |
| `docker-compose.backend.yml` | **Backend only** | ⭐ Backend cloud deployment |
| `docker-compose.frontend.yml` | **Frontend only** | ⭐ Frontend cloud deployment |
| `docker-compose.dev.yml` | **Development** | Local testing |
| `docker-compose.cloudflared.ram.yml` | **Cloudflare tunnel** | Behind Cloudflare |

---

## 🎯 Recommended for Your Use Case

Since you're **sharing the repo and hosting on separate cloud services**:

### **Backend Team** uses:
```bash
docker compose -f docker-compose.backend.yml up -d
```
**Includes:**
- ✅ Django Backend API
- ✅ RabbitMQ (message broker)
- ✅ Redis (cache & results)
- ✅ Celery Worker (background tasks)
- ✅ Celery Beat (scheduled tasks)
- ✅ Flower (monitoring - optional)

### **Frontend Team** uses:
```bash
docker compose -f docker-compose.frontend.yml up -d
```
**Includes:**
- ✅ React Frontend
- ✅ Nginx web server

---

## 📋 Setup Instructions

### For Backend Team

```bash
# 1. Clone repo
git clone <repo-url>
cd philgeps-awards-dashboard

# 2. Create backend config
cp env.backend.example .env

# 3. Edit with your settings
nano .env
# Set: ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, SECRET_KEY, etc.

# 4. Deploy
docker compose -f docker-compose.backend.yml up -d

# 5. Verify
docker compose -f docker-compose.backend.yml ps
curl http://localhost:3200/api/v1/
```

### For Frontend Team

```bash
# 1. Clone repo
git clone <repo-url>
cd philgeps-awards-dashboard

# 2. Create frontend config
cp env.frontend.example .env

# 3. Edit with backend URL
nano .env
# Set: VITE_API_URL=https://philgeps-api.simple-systems.dev

# 4. Build & Deploy
docker compose -f docker-compose.frontend.yml build
docker compose -f docker-compose.frontend.yml up -d

# 5. Verify
docker compose -f docker-compose.frontend.yml ps
curl http://localhost:3000
```

---

## 🔄 Local Development (Both Services)

If you want to run **both frontend and backend locally**:

### Option 1: All-in-One (Recommended for dev)
```bash
cp env.docker.example .env
docker compose -f docker-compose.ram.yml up -d
```

### Option 2: Separate Files
```bash
# Start backend
docker compose -f docker-compose.backend.yml up -d

# Start frontend (in another terminal)
docker compose -f docker-compose.frontend.yml up -d
```

### Option 3: Combined Command
```bash
docker compose \
  -f docker-compose.backend.yml \
  -f docker-compose.frontend.yml \
  up -d
```

---

## 📊 Service Ports

### Backend Services
| Service | Port | URL |
|---------|------|-----|
| Backend API | 3200 | http://localhost:3200 |
| RabbitMQ AMQP | 5672 | Internal |
| RabbitMQ Management | 15672 | http://localhost:15672 |
| Redis | 6379 | Internal |
| Flower | 5555 | http://localhost:5555 |

### Frontend
| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |

---

## 🎛️ Advanced Usage

### Scale Celery Workers
```bash
docker compose -f docker-compose.backend.yml up -d --scale celeryworker=4
```

### Start with Monitoring
```bash
docker compose -f docker-compose.backend.yml --profile monitoring up -d
```

### View Specific Service Logs
```bash
# Backend logs
docker compose -f docker-compose.backend.yml logs -f backend

# Celery worker logs
docker compose -f docker-compose.backend.yml logs -f celeryworker

# Frontend logs
docker compose -f docker-compose.frontend.yml logs -f
```

### Restart Single Service
```bash
# Restart backend API
docker compose -f docker-compose.backend.yml restart backend

# Restart frontend
docker compose -f docker-compose.frontend.yml restart frontend
```

---

## 🆘 Common Commands

### Backend Management
```bash
# Start
docker compose -f docker-compose.backend.yml up -d

# Stop
docker compose -f docker-compose.backend.yml down

# Rebuild
docker compose -f docker-compose.backend.yml build

# View status
docker compose -f docker-compose.backend.yml ps

# View logs (all services)
docker compose -f docker-compose.backend.yml logs -f

# Enter backend shell
docker compose -f docker-compose.backend.yml exec backend bash
```

### Frontend Management
```bash
# Start
docker compose -f docker-compose.frontend.yml up -d

# Stop
docker compose -f docker-compose.frontend.yml down

# Rebuild (required if VITE_API_URL changed!)
docker compose -f docker-compose.frontend.yml build --no-cache

# View status
docker compose -f docker-compose.frontend.yml ps

# View logs
docker compose -f docker-compose.frontend.yml logs -f
```

---

## 📝 Environment Files

| File | Use With | Purpose |
|------|----------|---------|
| `env.backend.example` | `docker-compose.backend.yml` | Backend config template |
| `env.frontend.example` | `docker-compose.frontend.yml` | Frontend config template |
| `env.docker.example` | `docker-compose.ram.yml` | Full stack dev template |
| `env.production.example` | Any | Production settings reference |

---

## ✅ Benefits of Separation

### For Your Use Case

1. **Independent Deployment**
   - Backend team deploys without touching frontend
   - Frontend team deploys without backend access
   - No dependency between deployments

2. **Different Cloud Providers**
   - Backend: AWS/GCP/DigitalOcean
   - Frontend: Vercel/Netlify/CloudFlare Pages
   - Each uses appropriate service

3. **Scaling**
   - Scale backend independently (more Celery workers)
   - Scale frontend independently (CDN, multiple instances)
   - Optimize costs per service

4. **Team Autonomy**
   - Backend team: Focus on API, queue, database
   - Frontend team: Focus on UI/UX
   - No stepping on each other's toes

5. **Cleaner Handoff**
   - Give backend team: `docker-compose.backend.yml` + `env.backend.example`
   - Give frontend team: `docker-compose.frontend.yml` + `env.frontend.example`
   - Each team has only what they need

---

## 🚀 Quick Start

### I'm the Backend Person
```bash
git clone <repo>
cp env.backend.example .env
nano .env  # Configure
docker compose -f docker-compose.backend.yml up -d
```

### I'm the Frontend Person
```bash
git clone <repo>
cp env.frontend.example .env
nano .env  # Set VITE_API_URL to backend
docker compose -f docker-compose.frontend.yml build
docker compose -f docker-compose.frontend.yml up -d
```

### I'm Developing Locally
```bash
git clone <repo>
cp env.docker.example .env
docker compose -f docker-compose.ram.yml up -d
# Everything runs on one machine
```

---

## 📚 See Also

- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `ENVIRONMENT_SETUP.md` - Environment variable documentation
- `env.backend.example` - Backend configuration template
- `env.frontend.example` - Frontend configuration template

---

**Last Updated:** 2025-11-26  
**Version:** 1.0

