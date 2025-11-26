# PhilGEPS Deployment Guide - Separated Frontend & Backend

## 🎯 Overview

This guide is for deploying **frontend and backend on separate cloud services**.

**Architecture:**
```
┌─────────────────────┐         ┌─────────────────────────────┐
│  Frontend Server    │         │  Backend Server             │
│  (Cloud Service A)  │────────►│  (Cloud Service B)          │
│                     │  HTTP   │                             │
│  - Nginx            │  API    │  - Django API               │
│  - Static Files     │         │  - RabbitMQ                 │
│  - Port 3000/80     │         │  - Redis                    │
└─────────────────────┘         │  - Celery Worker            │
                                │  - Celery Beat              │
                                │  - Port 3200                │
                                └─────────────────────────────┘
```

---

## 📦 Repository Structure

```
your-repo/
├── docker-compose.backend.yml      # Backend services
├── docker-compose.frontend.yml     # Frontend service
├── env.backend.example             # Backend config template
├── env.frontend.example            # Frontend config template
├── backend/                        # Backend code
└── frontend/                       # Frontend code
```

---

## 🚀 Deployment Steps

### **Backend Deployment** (Cloud Service B)

#### 1. Clone Repository
```bash
git clone <your-repo-url>
cd philgeps-awards-dashboard
```

#### 2. Configure Backend
```bash
# Copy backend environment template
cp env.backend.example .env

# Edit configuration
nano .env
```

**Required `.env` changes:**
```env
# Generate secure secret key
SECRET_KEY=<generate-with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'>

# Production mode
DEBUG=False

# Your backend domain
ALLOWED_HOSTS=philgeps-api.simple-systems.dev

# Your frontend domain (for CORS)
CORS_ALLOWED_ORIGINS=https://philgeps.simple-systems.dev
CSRF_TRUSTED_ORIGINS=https://philgeps.simple-systems.dev

# Secure RabbitMQ password
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=<secure-password>
CELERY_BROKER_URL=amqp://admin:<secure-password>@rabbitmq:5672//
```

#### 3. Deploy Backend Services
```bash
# Deploy all backend services
docker compose -f docker-compose.backend.yml up -d

# Check status
docker compose -f docker-compose.backend.yml ps

# View logs
docker compose -f docker-compose.backend.yml logs -f backend
```

#### 4. Verify Backend
```bash
# Test API
curl http://localhost:3200/api/v1/

# Test health
curl http://localhost:3200/api/v1/contracts/health/

# Access RabbitMQ Management (if needed)
# http://your-backend-server:15672
```

---

### **Frontend Deployment** (Cloud Service A)

#### 1. Clone Repository
```bash
git clone <your-repo-url>
cd philgeps-awards-dashboard
```

#### 2. Configure Frontend
```bash
# Copy frontend environment template
cp env.frontend.example .env

# Edit configuration
nano .env
```

**Required `.env` changes:**
```env
# Port (80 for production, 3000 for dev)
FRONTEND_PORT=80

# Backend API URL (MUST be accessible from user's browser!)
VITE_API_URL=https://philgeps-api.simple-systems.dev
```

#### 3. Build & Deploy Frontend
```bash
# Build with production API URL
docker compose -f docker-compose.frontend.yml build

# Deploy frontend
docker compose -f docker-compose.frontend.yml up -d

# Check status
docker compose -f docker-compose.frontend.yml ps
```

#### 4. Verify Frontend
```bash
# Access frontend
# http://your-frontend-server:3000 (or :80)

# Check if it can reach backend
# Open browser console, should see API requests to your backend
```

---

## 🔧 Configuration Matrix

### Development (Both on Same Machine)

**Backend `.env`:**
```env
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
BACKEND_PORT=3200
```

**Frontend `.env`:**
```env
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:3200
```

**Deploy:**
```bash
# Terminal 1 - Backend
docker compose -f docker-compose.backend.yml up -d

# Terminal 2 - Frontend
docker compose -f docker-compose.frontend.yml up -d
```

---

### Production (Separate Servers)

**Backend Server `.env`:**
```env
DEBUG=False
ALLOWED_HOSTS=philgeps-api.simple-systems.dev
CORS_ALLOWED_ORIGINS=https://philgeps.simple-systems.dev
CSRF_TRUSTED_ORIGINS=https://philgeps.simple-systems.dev
BACKEND_PORT=3200
SECRET_KEY=<secure-key>
RABBITMQ_PASSWORD=<secure-password>
```

**Frontend Server `.env`:**
```env
FRONTEND_PORT=80
VITE_API_URL=https://philgeps-api.simple-systems.dev
```

**Deploy Backend:**
```bash
ssh user@backend-server
cd philgeps-awards-dashboard
docker compose -f docker-compose.backend.yml up -d
```

**Deploy Frontend:**
```bash
ssh user@frontend-server
cd philgeps-awards-dashboard
docker compose -f docker-compose.frontend.yml up -d
```

---

## 🌐 DNS & Networking

### Required DNS Records

```
# Frontend
philgeps.simple-systems.dev     A/CNAME → Frontend Server IP

# Backend (API)
philgeps-api.simple-systems.dev A/CNAME → Backend Server IP
```

### Firewall Rules

**Backend Server:**
```
Allow: 3200 (API)
Allow: 15672 (RabbitMQ Management - optional, can be internal only)
Allow: 5555 (Flower - optional, can be internal only)
```

**Frontend Server:**
```
Allow: 80 (HTTP)
Allow: 443 (HTTPS - if using SSL)
```

---

## 🔒 SSL/HTTPS Setup

### Backend (Recommended: Use Nginx/Caddy Reverse Proxy)

```bash
# Install Caddy on backend server
sudo apt install caddy

# Caddyfile
philgeps-api.simple-systems.dev {
    reverse_proxy localhost:3200
}

sudo systemctl restart caddy
```

### Frontend (Already using Nginx, add Let's Encrypt)

Or use Cloudflare, AWS CloudFront, etc. for SSL termination.

---

## 📊 Monitoring & Maintenance

### Backend

```bash
# View all services
docker compose -f docker-compose.backend.yml ps

# View logs
docker compose -f docker-compose.backend.yml logs -f

# Restart services
docker compose -f docker-compose.backend.yml restart backend

# Scale Celery workers
docker compose -f docker-compose.backend.yml up -d --scale celeryworker=4

# Access Flower monitoring (optional)
docker compose -f docker-compose.backend.yml --profile monitoring up -d
# Then access: http://backend-server:5555
```

### Frontend

```bash
# View status
docker compose -f docker-compose.frontend.yml ps

# View logs
docker compose -f docker-compose.frontend.yml logs -f

# Restart
docker compose -f docker-compose.frontend.yml restart
```

---

## 🔄 Updates & Redeployment

### Update Backend

```bash
cd philgeps-awards-dashboard
git pull
docker compose -f docker-compose.backend.yml build
docker compose -f docker-compose.backend.yml up -d
```

### Update Frontend

```bash
cd philgeps-awards-dashboard
git pull
docker compose -f docker-compose.frontend.yml build --no-cache
docker compose -f docker-compose.frontend.yml up -d
```

**Note:** Frontend requires `--no-cache` if VITE_API_URL changed!

---

## 🆘 Troubleshooting

### Frontend Can't Reach Backend

**Check 1: CORS Configuration**
```bash
# On backend server, verify CORS includes frontend domain
docker exec philgeps-backend env | grep CORS_ALLOWED_ORIGINS
# Should show: https://philgeps.simple-systems.dev
```

**Check 2: Network Connectivity**
```bash
# From frontend server, test backend
curl https://philgeps-api.simple-systems.dev/api/v1/

# From your browser, check console for CORS errors
```

**Check 3: Backend .env**
```bash
# Backend must allow frontend domain
CORS_ALLOWED_ORIGINS=https://philgeps.simple-systems.dev
```

### Backend Services Not Starting

```bash
# Check logs
docker compose -f docker-compose.backend.yml logs

# Check individual service
docker logs philgeps-backend
docker logs philgeps-rabbitmq
docker logs philgeps-celeryworker
```

### Port Conflicts

```bash
# If port 3200 is in use, change in .env:
BACKEND_PORT=8080

# Then redeploy
docker compose -f docker-compose.backend.yml down
docker compose -f docker-compose.backend.yml up -d
```

---

## 📋 Checklist for Handoff

### Backend Team

- [ ] Clone repository
- [ ] Copy `env.backend.example` to `.env`
- [ ] Configure `.env` with backend domain
- [ ] Configure `.env` with frontend domain (CORS)
- [ ] Generate secure `SECRET_KEY`
- [ ] Set secure `RABBITMQ_PASSWORD`
- [ ] Set `DEBUG=False` for production
- [ ] Deploy: `docker compose -f docker-compose.backend.yml up -d`
- [ ] Verify API accessible: `curl http://localhost:3200/api/v1/`
- [ ] Configure DNS: `philgeps-api.simple-systems.dev` → Backend Server
- [ ] (Optional) Set up SSL/HTTPS reverse proxy

### Frontend Team

- [ ] Clone repository
- [ ] Copy `env.frontend.example` to `.env`
- [ ] Set `VITE_API_URL` to backend domain
- [ ] Set `FRONTEND_PORT` (80 for production)
- [ ] Build: `docker compose -f docker-compose.frontend.yml build`
- [ ] Deploy: `docker compose -f docker-compose.frontend.yml up -d`
- [ ] Verify frontend loads in browser
- [ ] Verify frontend can reach backend (check browser console)
- [ ] Configure DNS: `philgeps.simple-systems.dev` → Frontend Server
- [ ] (Optional) Set up SSL/HTTPS

### Both Teams

- [ ] Coordinate on domain names
- [ ] Ensure CORS is properly configured
- [ ] Test cross-server communication
- [ ] Document any custom configurations
- [ ] Set up monitoring/alerts

---

## 🎓 Quick Reference

```bash
# Backend
docker compose -f docker-compose.backend.yml up -d
docker compose -f docker-compose.backend.yml logs -f
docker compose -f docker-compose.backend.yml down

# Frontend
docker compose -f docker-compose.frontend.yml up -d
docker compose -f docker-compose.frontend.yml logs -f
docker compose -f docker-compose.frontend.yml down

# Both (if on same server for dev)
docker compose -f docker-compose.backend.yml -f docker-compose.frontend.yml up -d
```

---

**Last Updated:** 2025-11-26  
**Version:** 1.0

