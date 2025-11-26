# 🚀 PhilGEPS Quick Start Guide

## For Different Deployment Scenarios

---

## 📦 Scenario 1: Backend Team (Separate Deployment)

**You're hosting backend on:** Cloud Service A (e.g., AWS, DigitalOcean)

```bash
# 1. Setup
git clone <repo>
cd philgeps-awards-dashboard
cp env.backend.example .env

# 2. Configure .env
nano .env
# Set: ALLOWED_HOSTS=philgeps-api.simple-systems.dev
# Set: CORS_ALLOWED_ORIGINS=https://philgeps.simple-systems.dev
# Set: SECRET_KEY=<generate-secure>
# Set: RABBITMQ_PASSWORD=<secure-password>

# 3. Deploy
docker compose -f docker-compose.backend.yml up -d

# 4. Verify
curl http://localhost:3200/api/v1/
```

**Services Running:**
- ✅ Backend API: Port 3200
- ✅ RabbitMQ: Port 5672, 15672
- ✅ Redis: Port 6379
- ✅ Celery Worker
- ✅ Celery Beat

---

## 🎨 Scenario 2: Frontend Team (Separate Deployment)

**You're hosting frontend on:** Cloud Service B (e.g., Vercel, Netlify, Cloudflare)

```bash
# 1. Setup
git clone <repo>
cd philgeps-awards-dashboard
cp env.frontend.example .env

# 2. Configure .env
nano .env
# Set: VITE_API_URL=https://philgeps-api.simple-systems.dev

# 3. Build & Deploy
docker compose -f docker-compose.frontend.yml build
docker compose -f docker-compose.frontend.yml up -d

# 4. Verify
curl http://localhost:3000
```

**Services Running:**
- ✅ Frontend: Port 3000 (or 80)

---

## 💻 Scenario 3: Local Development (Both Services)

**You're a developer** running everything locally:

```bash
# 1. Setup
git clone <repo>
cd philgeps-awards-dashboard
cp env.docker.example .env

# 2. (Optional) Customize .env
nano .env

# 3. Deploy everything
docker compose -f docker-compose.ram.yml up -d

# 4. Access
# Frontend: http://localhost:3000
# Backend:  http://localhost:3200
# Flower:   http://localhost:5555
# RabbitMQ: http://localhost:15672
```

**Services Running:**
- ✅ All backend services
- ✅ Frontend
- ✅ Full development environment

---

## 🔗 Connecting Frontend to Backend

### Backend Configuration (Required!)

Backend `.env` **must** include frontend domain in CORS:

```env
# Backend .env
CORS_ALLOWED_ORIGINS=https://philgeps.simple-systems.dev
CSRF_TRUSTED_ORIGINS=https://philgeps.simple-systems.dev
ALLOWED_HOSTS=philgeps-api.simple-systems.dev
```

### Frontend Configuration

Frontend `.env` **must** point to backend API:

```env
# Frontend .env
VITE_API_URL=https://philgeps-api.simple-systems.dev
```

---

## ✅ Pre-Deployment Checklist

### Backend Team

- [ ] Copy `env.backend.example` to `.env`
- [ ] Set `SECRET_KEY` (generate new one!)
- [ ] Set `DEBUG=False` for production
- [ ] Set `ALLOWED_HOSTS` with your backend domain
- [ ] Set `CORS_ALLOWED_ORIGINS` with frontend domain
- [ ] Change `RABBITMQ_PASSWORD` to secure value
- [ ] Update `CELERY_BROKER_URL` with new password
- [ ] Deploy: `docker compose -f docker-compose.backend.yml up -d`
- [ ] Test API: `curl http://localhost:3200/api/v1/`

### Frontend Team

- [ ] Copy `env.frontend.example` to `.env`
- [ ] Set `VITE_API_URL` to backend domain (https://)
- [ ] Set `FRONTEND_PORT` (80 for production, 3000 for dev)
- [ ] Build: `docker compose -f docker-compose.frontend.yml build`
- [ ] Deploy: `docker compose -f docker-compose.frontend.yml up -d`
- [ ] Test in browser: Check console for API connection

### Coordination

- [ ] Backend domain set up: `philgeps-api.simple-systems.dev`
- [ ] Frontend domain set up: `philgeps.simple-systems.dev`
- [ ] DNS records configured
- [ ] CORS configured correctly (backend allows frontend)
- [ ] Test cross-server communication

---

## 🎯 What Goes Where?

### Backend Server Gets:
```
✅ docker-compose.backend.yml
✅ env.backend.example
✅ backend/ directory
✅ .env (they create from example)
```

### Frontend Server Gets:
```
✅ docker-compose.frontend.yml
✅ env.frontend.example
✅ frontend/ directory
✅ .env (they create from example)
```

### Everyone Gets:
```
✅ README.md
✅ DEPLOYMENT_GUIDE.md
✅ DOCKER_COMPOSE_FILES.md
✅ QUICK_START.md (this file)
```

---

## 🔧 Troubleshooting

### Frontend can't connect to backend

**Check CORS in backend `.env`:**
```env
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**Restart backend:**
```bash
docker compose -f docker-compose.backend.yml restart backend
```

### Backend won't start

**Check logs:**
```bash
docker compose -f docker-compose.backend.yml logs backend
```

**Common issues:**
- Port 3200 already in use → Change `BACKEND_PORT` in `.env`
- Invalid SECRET_KEY → Generate a new one
- Missing .env file → Copy from example

### Frontend shows wrong API URL

**Rebuild frontend** (VITE_API_URL is baked at build time):
```bash
docker compose -f docker-compose.frontend.yml build --no-cache
docker compose -f docker-compose.frontend.yml up -d
```

---

## 📞 Quick Reference Commands

```bash
# Backend
docker compose -f docker-compose.backend.yml up -d        # Start
docker compose -f docker-compose.backend.yml down         # Stop
docker compose -f docker-compose.backend.yml logs -f      # Logs
docker compose -f docker-compose.backend.yml ps           # Status

# Frontend
docker compose -f docker-compose.frontend.yml up -d       # Start
docker compose -f docker-compose.frontend.yml down        # Stop
docker compose -f docker-compose.frontend.yml logs -f     # Logs
docker compose -f docker-compose.frontend.yml build       # Rebuild
```

---

**Need more help?** See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

**Last Updated:** 2025-11-26

