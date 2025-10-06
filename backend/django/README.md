# Django Application

Main Django project containing the PHILGEPS Awards Data Explorer backend API with data processing, analytics, and management capabilities.

## 📁 Directory Structure

### Core Django Apps

#### `/contracts/` - Contract Data Management
Django app for managing contract data, search functionality, and API endpoints.

**Files:**
- **`models.py`** - Django models for contract data structure
- **`views.py`** - API views and viewset definitions
- **`serializers.py`** - DRF serializers for API data transformation
- **`urls.py`** - URL routing for contract endpoints
- **`admin.py`** - Django admin configuration
- **`filters.py`** - API filtering and search functionality
- **`parquet_search.py`** - Basic Parquet file search implementation
- **`parquet_search_optimized.py`** - Optimized Parquet search with performance improvements
- **`parquet_search_fast.py`** - Fast Parquet search implementation
- **`tests.py`** - Unit tests for contract functionality
- **`apps.py`** - Django app configuration
- **`/migrations/`** - Database migration files

#### `/data_processing/` - Data Processing Services
Django app for data processing, analytics, and utility services.

**Files:**
- **`models.py`** - Data processing models
- **`views.py`** - Data processing API views
- **`urls.py`** - URL routing for data processing endpoints
- **`parquet_service.py`** - Parquet file processing service
- **`admin.py`** - Django admin configuration
- **`apps.py`** - Django app configuration
- **`tests.py`** - Unit tests for data processing
- **`/migrations/`** - Database migration files
- **`/management/`** - Django management commands

#### `/philgeps_data_explorer/` - Main Project Configuration
Main Django project settings and configuration.

**Files:**
- **`settings.py`** - Django settings configuration
- **`urls.py`** - Main URL routing configuration
- **`wsgi.py`** - WSGI application entry point
- **`asgi.py`** - ASGI application entry point
- **`views.py`** - Main project views
- **`__init__.py`** - Python package initialization

### Configuration Files

#### Core Files
- **`manage.py`** - Django management script for running commands
- **`requirements.txt`** - Python package dependencies
- **`Dockerfile`** - Docker container configuration
- **`db.sqlite3`** - SQLite database file (development)

#### Environment Configuration
- **`env.example`** - Environment variables example file
- **`env.template`** - Environment configuration template

### Data and Static Files

#### `/data/` - Data Storage
- **`/parquet/`** - Parquet data files for fast analytics

#### `/staticfiles/` - Static Files
- **`/admin/`** - Django admin static files
- **`/rest_framework/`** - Django REST Framework static files
- **`/assets/`** - Application static assets

#### `/logs/` - Application Logs
- **`django.log`** - Django application logs

## 🚀 Development Setup

### Prerequisites
- Python 3.9+
- pip package manager
- Virtual environment

### Installation
```bash
# Create virtual environment
python -m venv venv-linux
source venv-linux/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver 0.0.0.0:3200
```

## 🔧 API Endpoints

### Contract Endpoints
- **`/api/v1/contracts/`** - Contract data CRUD operations
- **`/api/v1/contracts/chip-search/`** - Advanced search functionality
- **`/api/v1/contracts/chip-aggregates/`** - Analytics data aggregation
- **`/api/v1/contracts/chip-aggregates-paginated/`** - Paginated analytics
- **`/api/v1/contracts/chip-export/`** - Individual contracts CSV export
- **`/api/v1/contracts/chip-export-aggregated/`** - Aggregated data CSV export
- **`/api/v1/contracts/filter-options/`** - Filter options
- **`/api/v1/contracts/health/`** - Health check endpoint
- **`/api/v1/contracts/stats/`** - Application statistics

### API Documentation
- **`/api/docs/`** - Swagger UI interactive documentation
- **`/api/redoc/`** - ReDoc API documentation
- **`/api/schema/`** - OpenAPI 3.0 schema

### Admin Interface
- **`/admin/`** - Django admin interface for data management

## 📊 Key Features

### Data Processing
- **Parquet Integration** - Efficient columnar data processing
- **DuckDB Analytics** - Fast in-memory analytics
- **Search Optimization** - Optimized search algorithms
- **Data Aggregation** - Pre-computed aggregations for performance

### API Features
- **RESTful API** - Standard REST API endpoints
- **OpenAPI 3.0** - Complete API documentation with drf-spectacular
- **Filtering & Search** - Advanced filtering and search capabilities
- **Pagination** - Efficient pagination for large datasets
- **Serialization** - JSON serialization with DRF
- **Export APIs** - Individual contracts and aggregated data export
- **CORS Support** - Cross-origin resource sharing configuration

### Admin Features
- **Data Management** - Admin interface for data management
- **User Management** - User and permission management
- **Logging** - Application logging and monitoring

## 🛠️ Configuration

### Settings Configuration
The `settings.py` file contains:
- Database configuration
- Static files configuration
- CORS settings
- Logging configuration
- Security settings
- API configuration

### Environment Variables
- **`DEBUG`** - Debug mode setting
- **`SECRET_KEY`** - Django secret key
- **`ALLOWED_HOSTS`** - Allowed host names
- **`CORS_ALLOWED_ORIGINS`** - CORS configuration
- **`DATABASE_URL`** - Database connection string

## 📝 Development Guidelines

### Code Organization
- Follow Django best practices
- Use proper model relationships
- Implement proper error handling
- Write comprehensive tests
- Document API endpoints

### Performance Considerations
- Use database indexing
- Implement query optimization
- Use caching where appropriate
- Monitor performance metrics

### Security
- Implement proper authentication
- Use CSRF protection
- Validate input data
- Follow security best practices
