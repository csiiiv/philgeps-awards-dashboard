import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = config('SECRET_KEY', default='django-insecure-temp-key-for-testing')
DEBUG = config('DEBUG', default=False, cast=bool)

# Environment-based ALLOWED_HOSTS
if DEBUG:
    # Development: localhost + any custom API domains
    ALLOWED_HOSTS = [
        'localhost', 
        '127.0.0.1',
        '0.0.0.0',  # For Docker
    ]
    
    # Add custom API domains for development (tunnels, custom domains, etc.)
    api_domains = config('API_DOMAINS', default='')
    if api_domains:
        api_domain_list = [domain.strip() for domain in api_domains.split(',') if domain.strip()]
        ALLOWED_HOSTS.extend(api_domain_list)
else:
    # Production: API domains from environment variables
    ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

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

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR.parent.parent / 'frontend' / 'dist',
    BASE_DIR.parent.parent / 'frontend' / 'public',  # For global_totals.json
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
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
if DEBUG:
    # Development: local frontend origins + custom frontend domains
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
    
    # Add custom frontend domains from environment (for tunnels, custom domains, etc.)
    frontend_domains = config('FRONTEND_DOMAINS', default='')
    if frontend_domains:
        frontend_domain_list = [domain.strip() for domain in frontend_domains.split(',') if domain.strip()]
        CORS_ALLOWED_ORIGINS.extend(frontend_domain_list)
else:
    # Production: frontend domains from environment
    CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='').split(',')
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS if origin.strip()]

# Additional CORS settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # Security: only allow specific origins

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'SAMEORIGIN'

# Rate limiting (basic)
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '240/hour',  # 240 requests per hour for all users (no authentication system)
    }
}

# HTTPS settings (for production)
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False').lower() == 'true'
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Static files settings for production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'