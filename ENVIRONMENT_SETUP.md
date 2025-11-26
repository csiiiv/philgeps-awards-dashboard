# Environment Configuration Guide

## 🎯 Quick Setup

### 1. Create your `.env` file

```bash
# Copy the example file
cp env.docker.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

### 2. Configure for your environment

**For Development (localhost):**
```env
# .env file
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**For Production (philgeps.simple-systems.dev):**
```env
# .env file
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=philgeps.simple-systems.dev,philgeps-api.simple-systems.dev
CORS_ALLOWED_ORIGINS=https://philgeps.simple-systems.dev
CSRF_TRUSTED_ORIGINS=https://philgeps.simple-systems.dev
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your-secure-password
```

### 3. Start services

```bash
# Docker Compose will automatically use .env
docker compose -f docker-compose.ram.yml up -d
```

---

## 📋 All Available Variables

See `env.docker.example` for the complete list of configurable variables.

**Key Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-dev-key` |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `CSRF_TRUSTED_ORIGINS` | CSRF trusted origins | `http://localhost:3000` |
| `CELERY_BROKER_URL` | RabbitMQ URL | `amqp://guest:guest@rabbitmq:5672//` |
| `RABBITMQ_USER` | RabbitMQ username | `guest` |
| `RABBITMQ_PASSWORD` | RabbitMQ password | `guest` |

---

## 🔒 Security Best Practices

### Generate Secure Secret Key

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### Production Checklist

- [ ] Change `SECRET_KEY` to a secure random value
- [ ] Set `DEBUG=False`
- [ ] Change `RABBITMQ_PASSWORD`
- [ ] Use HTTPS URLs in CORS/CSRF settings
- [ ] Set `SECURE_SSL_REDIRECT=True`
- [ ] Use strong passwords for all services

---

## 🧪 Testing Configuration

### Check if variables are loaded:

```bash
# Check backend environment
docker exec philgeps-backend-ram env | grep ALLOWED_HOSTS

# Check RabbitMQ credentials
docker exec philgeps-rabbitmq env | grep RABBITMQ_DEFAULT_USER
```

### Verify CORS configuration:

```bash
# From your frontend, check browser console
fetch('http://localhost:3200/api/v1/')
  .then(r => r.json())
  .then(d => console.log('✅ CORS working:', d))
  .catch(e => console.error('❌ CORS error:', e));
```

---

## 🔄 Applying Changes

After modifying `.env`:

```bash
# Restart services
docker compose -f docker-compose.ram.yml restart

# Or rebuild and restart
docker compose -f docker-compose.ram.yml down
docker compose -f docker-compose.ram.yml up -d
```

---

## 🌍 Multiple Environments

You can maintain different `.env` files:

```bash
# Development
cp .env.dev .env
docker compose -f docker-compose.ram.yml up -d

# Production
cp .env.prod .env
docker compose -f docker-compose.ram.yml up -d
```

---

## ❓ Troubleshooting

### Variables not being picked up?

1. **Check file location**: `.env` must be in the same directory as `docker-compose.yml`
2. **Check file name**: Must be exactly `.env` (not `env` or `.env.example`)
3. **Restart services**: `docker compose restart`
4. **Check syntax**: No spaces around `=`, e.g., `DEBUG=True` not `DEBUG = True`

### CORS still not working?

```bash
# Verify the environment variable is loaded
docker exec philgeps-backend-ram python manage.py shell <<EOF
from django.conf import settings
print("ALLOWED_HOSTS:", settings.ALLOWED_HOSTS)
print("CORS_ALLOW_ALL_ORIGINS:", settings.CORS_ALLOW_ALL_ORIGINS)
EOF
```

---

## 📚 More Information

- See `env.docker.example` for all variables
- See `docs/IMPLEMENTATION_COMPLETE.md` for full system documentation
- See Docker Compose documentation for advanced `.env` usage

---

**Last Updated:** 2025-11-26  
**Version:** 1.0

