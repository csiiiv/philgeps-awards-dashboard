import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = config('SECRET_KEY', default='django-insecure-temp-key-for-testing')
DEBUG = config('DEBUG', default=False, cast=bool)

# Environment-based ALLOWED_HOSTS
# Always include localhost for development and testing
ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1',
    '0.0.0.0',  # For Docker
]

allowed_hosts_env = config('ALLOWED_HOSTS', default='')
if allowed_hosts_env:
    host_list = [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]
    ALLOWED_HOSTS.extend(host_list)

# During local/testing with DEBUG true, allow any host to prevent 400 errors when accessed via LAN/IP
if DEBUG:
    ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'contracts',
    'data_processing',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'philgeps_data_explorer.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'philgeps_data_explorer.wsgi.application'

# Database configuration with connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        'OPTIONS': {
            'timeout': 20,
        },
        'CONN_MAX_AGE': config('DB_CONN_MAX_AGE', default=600, cast=int),  # Persistent connections for 10 minutes
    }
}

# Caching configuration with Redis
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CACHES = {
    'default': {
        # Use django-redis backend (not Django's built-in RedisCache which doesn't support CLIENT_CLASS)
        'BACKEND': config('CACHE_BACKEND', default='django_redis.cache.RedisCache'),
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            },
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
        },
        'KEY_PREFIX': 'philgeps',
        'TIMEOUT': config('CACHE_TIMEOUT', default=300, cast=int),  # 5 minutes default
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',  # Backend static files only (admin, etc.)
]

# REST Framework with optimized throttling for concurrent users
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10000/hour',  # Increased for load testing (1000 -> 10000)
        'burst': '300/minute',  # Handle burst traffic during load tests
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Spectacular Settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'PHILGEPS Awards Data Explorer API',
    'DESCRIPTION': 'API for Philippine government contract data exploration and analytics',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
    'TAGS': [
        {'name': 'contracts', 'description': 'Contract search and analytics'},
        {'name': 'entities', 'description': 'Entity search (contractors, organizations, etc.)'},
        {'name': 'export', 'description': 'Data export functionality'},
        {'name': 'data-processing', 'description': 'Data processing and parquet service endpoints'},
    ],
}

# CORS configuration
# Always include localhost origins for development and testing
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:3200",
    "http://127.0.0.1:3200",
]

cors_env = config('CORS_ALLOWED_ORIGINS', default='')
if cors_env:
    cors_list = [origin.strip() for origin in cors_env.split(',') if origin.strip()]
    CORS_ALLOWED_ORIGINS.extend(cors_list)

# Additional CORS settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # Security: only allow specific origins

# CSRF trusted origins (for forms and API requests with CSRF protection)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:3200",
    "http://127.0.0.1:3200",
]

csrf_env = config('CSRF_TRUSTED_ORIGINS', default='')
if csrf_env:
    csrf_list = [origin.strip() for origin in csrf_env.split(',') if origin.strip()]
    CSRF_TRUSTED_ORIGINS.extend(csrf_list)

# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'SAMEORIGIN'

# HTTPS settings (for production)
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False').lower() == 'true'
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Static files settings for production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'