# Production Deployment Guide

## Overview
This guide covers deploying the PHILGEPS Awards Dashboard to a production environment using traditional deployment methods (non-containerized). For Docker-based deployment, see the [Docker Deployment Guide](DOCKER_DEPLOYMENT_GUIDE.md).

## Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (recommended) or SQLite
- Nginx (recommended) or Apache
- SSL certificate

**Note**: This project is designed with a Docker-first development approach. For local development, use `docker compose` as documented in the main [README.md](../README.md).

## Current Authentication Status
**Note**: The API currently has **no authentication system** implemented. All endpoints are publicly accessible with rate limiting of 240 requests per hour per IP address. If authentication is needed, JWT authentication can be implemented using the `djangorestframework-simplejwt` package that's already included in requirements.txt.

## Backend Deployment

### 1. Environment Setup
```bash
# Create production environment
python -m venv venv_prod
source venv_prod/bin/activate  # Linux/Mac
# or
venv_prod\Scripts\activate  # Windows

# Install dependencies
pip install -r backend/django/requirements.txt
```

### 2. Django Settings
Create `backend/django/philgeps_data_explorer/settings_production.py`:

```python
from .settings import *
import os

# Security settings
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'philgeps_prod'),
        'USER': os.environ.get('DB_USER', 'philgeps_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Static files
STATIC_ROOT = '/var/www/philgeps/static/'
MEDIA_ROOT = '/var/www/philgeps/media/'

# Security
SECRET_KEY = os.environ.get('SECRET_KEY')
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/philgeps/django.log',
        },
    },
    'root': {
        'handlers': ['file'],
    },
}
```

### 3. Database Migration
```bash
python backend/django/manage.py migrate --settings=philgeps_data_explorer.settings_production
python backend/django/manage.py collectstatic --settings=philgeps_data_explorer.settings_production
```

### 4. WSGI Server
Install and configure Gunicorn:
```bash
pip install gunicorn
```

Create `backend/django/gunicorn.conf.py`:
```python
bind = "127.0.0.1:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

## Frontend Deployment

### 1. Build for Production
```bash
cd frontend
npm install
npm run build
```

### 2. Serve Static Files
Copy the `dist` folder to your web server directory:
```bash
cp -r frontend/dist/* /var/www/philgeps/
```

## Nginx Configuration

Create `/etc/nginx/sites-available/philgeps`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend
    location / {
        root /var/www/philgeps;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /var/www/philgeps/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Systemd Service

Create `/etc/systemd/system/philgeps.service`:

```ini
[Unit]
Description=PHILGEPS Awards Dashboard
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/philgeps-awards-dashboard/backend/django
Environment=DJANGO_SETTINGS_MODULE=philgeps_data_explorer.settings_production
ExecStart=/path/to/venv_prod/bin/gunicorn --config gunicorn.conf.py philgeps_data_explorer.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always

[Install]
WantedBy=multi-user.target
```

## Environment Variables

Create `.env` file:
```bash
SECRET_KEY=your-secret-key-here
DB_NAME=philgeps_prod
DB_USER=philgeps_user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
```

## Monitoring

### 1. Log Monitoring
```bash
# View Django logs
tail -f /var/log/philgeps/django.log

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. Health Checks
```bash
# API health check
curl -f http://localhost:8000/api/schema/ || exit 1

# Frontend health check
curl -f http://localhost/ || exit 1
```

## Security Checklist

- [ ] SSL certificate installed and configured
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] CSRF trusted origins configured (frontend origin)
- [ ] Database credentials secured
- [ ] Secret key is secure and unique
- [ ] Debug mode disabled
- [ ] Static files served securely
- [ ] Log monitoring in place
- [ ] Regular backups configured
- [ ] Firewall rules configured

## Performance Optimization

### 1. Database Optimization
- Enable connection pooling
- Configure appropriate indexes
- Regular VACUUM and ANALYZE

### 2. Caching
- Enable Redis for session storage
- Configure CDN for static files
- Implement API response caching

### 3. Monitoring
- Set up application performance monitoring
- Configure alerting for errors
- Monitor resource usage

## Backup Strategy

### 1. Database Backups
```bash
# Daily database backup
pg_dump philgeps_prod > /backups/philgeps_$(date +%Y%m%d).sql
```

### 2. File Backups
```bash
# Backup static files and media
tar -czf /backups/philgeps_files_$(date +%Y%m%d).tar.gz /var/www/philgeps/
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Check if Gunicorn is running
2. **Static files not loading**: Check Nginx configuration and file permissions
3. **Database connection errors**: Verify database credentials and connectivity
4. **CORS errors**: Check CORS_ALLOWED_ORIGINS setting
5. **CSRF origin checking failed**: Ensure CSRF_TRUSTED_ORIGINS includes your frontend origin with scheme (e.g., `https://frontend.example.com`)

### Split-Origin Setup (Frontend + API on different domains)

1. Frontend `.env`:
```
VITE_API_URL=https://your-api-domain.example.com
```
Note: Do not include `/api` or `/api/v1` here; the app appends `/api/v1`.

2. Backend `.env`:
```
ALLOWED_HOSTS=your-api-domain.example.com
CORS_ALLOWED_ORIGINS="https://your-frontend-domain.example.com"
CSRF_TRUSTED_ORIGINS="https://your-frontend-domain.example.com"
SECURE_SSL_REDIRECT=True
```

3. Quick tests
```
# From frontend container
curl -i https://your-api-domain.example.com/api/v1/

# From backend container (python shell)
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE','philgeps_data_explorer.settings'); import django; django.setup(); from django.conf import settings; print(settings.CSRF_TRUSTED_ORIGINS)"
```

### Debug Commands
```bash
# Check service status
systemctl status philgeps

# Check Nginx configuration
nginx -t

# Check Django configuration
python manage.py check --settings=philgeps_data_explorer.settings_production
```

## Maintenance

### Regular Tasks
- Monitor logs for errors
- Update dependencies regularly
- Backup database and files
- Monitor disk space and performance
- Review security logs

### Updates
1. Test updates in staging environment
2. Backup production data
3. Deploy updates during maintenance window
4. Verify functionality after update
5. Monitor for issues

## Support

For issues and questions:
- Check logs first
- Review this documentation
- Contact system administrator
- Create issue in project repository
