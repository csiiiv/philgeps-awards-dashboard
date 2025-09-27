# Backend - PhilGEPS Dashboard

Django REST API backend providing data processing, analytics, and API endpoints for the PhilGEPS Dashboard frontend application.

## 🏗️ Architecture

The backend is built with Django 4.2 and Django REST Framework, providing a robust API for government procurement data exploration and analytics.

### Core Technologies

- **Django 4.2** - Web framework with built-in admin and ORM
- **Django REST Framework** - API framework with serialization and viewsets
- **DuckDB** - In-memory analytics database for fast data processing
- **Pandas** - Data manipulation and analysis library
- **Parquet** - Columnar storage format for optimal performance

## 📁 Directory Structure

### `/django/` - Django Application
Main Django project with apps and configuration.

#### Core Apps
- **`/contracts/`** - Contract data models, views, and API endpoints
- **`/data_processing/`** - Data processing utilities and services
- **`/philgeps_data_explorer/`** - Main Django project configuration

#### Configuration Files
- **`manage.py`** - Django management script
- **`requirements.txt`** - Python dependencies
- **`Dockerfile`** - Docker configuration for containerization
- **`env.example`** - Environment variables template

## 🚀 Development

### Prerequisites

- Python 3.8+
- pip package manager
- Virtual environment (venv-linux)

### Setup

```bash
cd backend/django
python -m venv venv-linux
source venv-linux/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
python manage.py runserver 0.0.0.0:3200
```

### API Documentation

- **Django Admin**: `http://localhost:3200/admin/`
- **API Root**: `http://localhost:3200/api/`
- **API Documentation**: See `/docs/ACTIVE_API_DOCUMENTATION.md`

## 🌐 Access Points

- **Local Backend**: `http://localhost:3200`
- **Production Backend**: `https://philgeps-api.simple-systems.dev`

## 📊 Key Features

- **Data Processing** - Efficient processing of large PhilGEPS datasets (2013-2025)
- **Analytics API** - Endpoints for data analytics and aggregation
- **Search API** - Advanced search functionality with filtering
- **Export API** - Data export capabilities
- **Admin Interface** - Django admin for data management

## 🔧 Active API Endpoints

### Core Endpoints (10 Active)
- **`/api/v1/data-processing/chip-aggregates/`** - Analytics data aggregation
- **`/api/v1/data-processing/chip-aggregates-paginated/`** - Paginated analytics
- **`/api/v1/data-processing/contract-search/`** - Contract search
- **`/api/v1/data-processing/entity-search/`** - Entity search
- **`/api/v1/data-processing/export-csv/`** - CSV export
- **`/api/v1/data-processing/filter-options/`** - Filter options
- **`/api/v1/data-processing/health/`** - Health check
- **`/api/v1/data-processing/stats/`** - Application statistics
- **`/api/v1/contracts/`** - Contract data endpoints
- **`/api/v1/contracts/analytics/`** - Contract analytics

## 📝 Configuration

### Environment Variables
- **`DEBUG`** - Debug mode (True/False)
- **`SECRET_KEY`** - Django secret key
- **`ALLOWED_HOSTS`** - Allowed host names
- **`CORS_ALLOWED_ORIGINS`** - CORS configuration

### Database Configuration
- **Development**: SQLite database
- **Production**: PostgreSQL (configurable)

## 🛠️ Data Processing

The backend includes sophisticated data processing capabilities:

- **Parquet Processing** - Efficient columnar data processing
- **DuckDB Integration** - Fast analytics queries
- **Data Aggregation** - Pre-computed aggregations for performance
- **Search Optimization** - Optimized search algorithms
- **Sumbong sa Pangulo Dataset** - Extended data coverage (2022-2025)

## 📊 Data Sources

### PhilGEPS Dataset (2013-2021)
- Government procurement contracts
- Contractor information
- Organization data
- Geographic information

### Sumbong sa Pangulo Dataset (2022-2025)
- Flood control projects
- Infrastructure data
- Extended coverage for recent years

## 🔒 Security

- **CORS Configuration** - Proper cross-origin setup
- **Input Validation** - Comprehensive input sanitization
- **Environment Variables** - Secure configuration management
- **HTTPS Ready** - Production-ready security headers

## 📈 Performance

- **DuckDB Integration** - High-performance analytics
- **Parquet Storage** - Optimized data storage
- **Caching** - Strategic data caching
- **Query Optimization** - Efficient database queries

---

**Last Updated**: January 28, 2025  
**Version**: v3.0.1 - Clean Backend Documentation