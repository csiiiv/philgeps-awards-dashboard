# Deployment Handoff Guide

**For:** Backend Team (Azure) & Frontend Team (Separate Service)  
**Date:** 2025-12-01  
**Purpose:** Professional deployment guide for independent service deployment

---

## 📋 Overview

This codebase is designed for **independent deployment** of backend and frontend services. Each team can deploy their service without requiring access to the other.

---

## 🎯 Quick Start

### Backend Team (Azure)

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd philgeps-awards-dashboard
   ```

2. **Configure environment**
   ```bash
   cp env.backend.example .env
   nano .env  # Edit with your Azure-specific settings
   ```

3. **Deploy**
   ```bash
   docker compose -f docker-compose.backend.yml up -d
   ```

### Frontend Team

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd philgeps-awards-dashboard
   ```

2. **Configure environment**
   ```bash
   cp env.frontend.example .env
   nano .env  # Set VITE_API_URL to backend URL
   ```

3. **Build & Deploy**
   ```bash
   docker compose -f docker-compose.frontend.yml build
   docker compose -f docker-compose.frontend.yml up -d
   ```

---

## 📁 File Organization (Best Practices)

### ✅ Recommended Structure

```
philgeps-awards-dashboard/
├── docker-compose.backend.yml      # ⭐ Backend team uses this
├── docker-compose.frontend.yml     # ⭐ Frontend team uses this
├── env.backend.example              # ⭐ Backend config template
├── env.frontend.example             # ⭐ Frontend config template
├── backend/                         # Backend code
├── frontend/                        # Frontend code
├── DEPLOYMENT_HANDOFF.md            # This file
├── DEPLOYMENT_GUIDE.md              # Detailed deployment guide
└── DOCKER_COMPOSE_FILES.md          # Compose file reference
```

**Why root-level compose files?**
- ✅ Industry standard (most projects do this)
- ✅ Easier to find (`docker-compose.*.yml` in root)
- ✅ Clear separation (backend vs frontend)
- ✅ Works with all deployment platforms

---

## 🔧 Environment Configuration

### Backend Environment Variables

**File:** `env.backend.example` → copy to `.env`

**Critical Variables:**
```bash
# Django Security
SECRET_KEY=<generate-secure-key>  # REQUIRED: Use Azure Key Vault
DEBUG=False                        # REQUIRED: False for production

# Network Configuration
ALLOWED_HOSTS=your-backend-api.azurewebsites.net
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com

# Queue System (if using managed services, see Azure section)
CELERY_BROKER_URL=amqp://user:pass@rabbitmq:5672//
CELERY_RESULT_BACKEND=redis://redis:6379/0
REDIS_URL=redis://redis:6379/0
```

### Frontend Environment Variables

**File:** `env.frontend.example` → copy to `.env`

**Critical Variables:**
```bash
# Backend API URL (MUST be accessible from user's browser)
VITE_API_URL=https://your-backend-api.azurewebsites.net

# Port (usually 80 for production)
FRONTEND_PORT=80
```

**⚠️ IMPORTANT:** `VITE_API_URL` is **baked into the build** at build time. You must rebuild if it changes:
```bash
docker compose -f docker-compose.frontend.yml build --no-cache
```

---

## ☁️ Azure-Specific Considerations

### Option 1: Azure Container Instances (ACI) / App Service

**Use Docker Compose as-is:**
- Deploy using `docker-compose.backend.yml`
- Azure App Service supports Docker Compose
- All services (Redis, RabbitMQ) run in containers

**Pros:**
- ✅ Simple, works out of the box
- ✅ No additional Azure services needed

**Cons:**
- ⚠️ Redis/RabbitMQ not managed (you manage updates)
- ⚠️ Data persistence requires Azure File Shares

### Option 2: Azure Managed Services (Recommended for Production)

**Replace containerized services with Azure managed services:**

#### Use Azure Redis Cache
```bash
# In .env, replace:
REDIS_URL=redis://your-redis.redis.cache.windows.net:6380
CELERY_RESULT_BACKEND=redis://your-redis.redis.cache.windows.net:6380

# Update docker-compose.backend.yml to remove redis service
# Update CELERY_RESULT_BACKEND to use Azure Redis connection string
```

#### Use Azure Service Bus (Alternative to RabbitMQ)
```bash
# Install: pip install azure-servicebus
# Update Celery broker URL to use Azure Service Bus
CELERY_BROKER_URL=azure-servicebus://connection-string
```

**Pros:**
- ✅ Managed, auto-scaling, high availability
- ✅ Built-in backups and monitoring
- ✅ No container management needed

**Cons:**
- ⚠️ Additional Azure service costs
- ⚠️ Requires code changes for Service Bus

### Option 3: Hybrid Approach

- **Backend API + Celery Workers:** Azure Container Instances
- **Redis:** Azure Redis Cache (managed)
- **RabbitMQ:** Keep in container OR use Azure Service Bus
- **Data Storage:** Azure Blob Storage for parquet files

---

## 🔒 Security Best Practices

### 1. Secrets Management

**❌ DON'T:**
- Commit `.env` files to git
- Hardcode secrets in compose files
- Share secrets via email/chat

**✅ DO:**
- Use Azure Key Vault for secrets
- Use environment variables in Azure App Service
- Use Docker secrets for sensitive data
- Rotate secrets regularly

### 2. Network Security

**Backend:**
- Configure Azure Network Security Groups
- Restrict Redis/RabbitMQ to internal network only
- Use Azure Private Endpoints for managed services

**Frontend:**
- Ensure HTTPS only (TLS 1.2+)
- Configure CORS properly on backend
- Use Content Security Policy headers

### 3. Environment Variables

**Backend `.env` example:**
```bash
# Generate secure keys
SECRET_KEY=$(openssl rand -base64 32)
RABBITMQ_PASSWORD=$(openssl rand -base64 24)

# Use Azure Key Vault references in production
# SECRET_KEY=@Microsoft.KeyVault(SecretUri=https://vault.vault.azure.net/secrets/secret-key/)
```

---

## 📊 Deployment Checklist

### Backend Team Checklist

- [ ] Clone repository
- [ ] Copy `env.backend.example` to `.env`
- [ ] Generate secure `SECRET_KEY`
- [ ] Set `ALLOWED_HOSTS` to Azure domain
- [ ] Set `CORS_ALLOWED_ORIGINS` to frontend domain
- [ ] Configure Redis (container OR Azure Redis Cache)
- [ ] Configure RabbitMQ (container OR Azure Service Bus)
- [ ] Set `DEBUG=False` for production
- [ ] Deploy with `docker-compose.backend.yml`
- [ ] Verify API responds: `curl https://your-api.azurewebsites.net/api/v1/`
- [ ] Test CORS: Frontend can make API requests
- [ ] Configure Azure monitoring/logging
- [ ] Set up backups for Redis/RabbitMQ data

### Frontend Team Checklist

- [ ] Clone repository
- [ ] Copy `env.frontend.example` to `.env`
- [ ] Set `VITE_API_URL` to backend API URL
- [ ] Build: `docker compose -f docker-compose.frontend.yml build`
- [ ] Deploy to hosting service
- [ ] Verify frontend loads
- [ ] Test API connectivity (check browser console)
- [ ] Verify CORS works (no CORS errors)
- [ ] Test all features end-to-end
- [ ] Configure CDN/caching if applicable

---

## 🔗 Communication Between Services

### Backend → Frontend Communication

**None required.** Backend is passive (responds to API requests).

### Frontend → Backend Communication

**Frontend makes HTTP requests to backend:**
- API calls: `https://backend-api.azurewebsites.net/api/v1/...`
- WebSocket (if used): `wss://backend-api.azurewebsites.net/ws/...`

**Requirements:**
1. Backend must be publicly accessible (or via VPN)
2. Backend CORS must allow frontend domain
3. Backend must have valid SSL certificate (HTTPS)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Frontend can't reach backend API
- ✅ Check `CORS_ALLOWED_ORIGINS` includes frontend domain
- ✅ Check `ALLOWED_HOSTS` includes backend domain
- ✅ Verify backend is publicly accessible
- ✅ Check Azure Network Security Groups

**Problem:** Celery tasks not processing
- ✅ Check RabbitMQ is running and accessible
- ✅ Check Redis is running and accessible
- ✅ Check worker logs: `docker logs philgeps-celeryworker`

### Frontend Issues

**Problem:** API calls fail with CORS error
- ✅ Backend `CORS_ALLOWED_ORIGINS` must include frontend domain
- ✅ Verify `VITE_API_URL` is correct
- ✅ Rebuild frontend if `VITE_API_URL` changed

**Problem:** API calls go to wrong URL
- ✅ `VITE_API_URL` is baked into build
- ✅ Must rebuild: `docker compose -f docker-compose.frontend.yml build --no-cache`

---

## 📚 Additional Resources

- **Detailed Deployment:** See `DEPLOYMENT_GUIDE.md`
- **Docker Compose Reference:** See `DOCKER_COMPOSE_FILES.md`
- **Environment Setup:** See `ENVIRONMENT_SETUP.md`
- **Quick Start:** See `QUICK_START.md`

---

## 💬 Support

**For Backend Issues:**
- Check backend logs: `docker compose -f docker-compose.backend.yml logs -f`
- Review `DEPLOYMENT_GUIDE.md` Azure section
- Check Azure App Service logs

**For Frontend Issues:**
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Test backend API directly: `curl https://backend-api/api/v1/`

---

**Last Updated:** 2025-12-01  
**Version:** 1.0

