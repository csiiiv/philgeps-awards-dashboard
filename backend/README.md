# Backend - PhilGEPS Dashboard

Django REST API backend providing data processing, analytics, and API endpoints for the PhilGEPS Dashboard frontend application.

## 🏗️ Architecture

The backend is built with Django 4.2 and Django REST Framework, providing a robust API for government procurement data exploration and analytics.

### Core Technologies

- **Django 4.2** - Web framework with built-in admin and ORM
- **Django REST Framework** - API framework with serialization and viewsets
- **OpenAPI 3.0** - Complete API documentation with drf-spectacular
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

### Core Endpoints (14 Active)
- **`/api/v1/contracts/chip-aggregates/`** - Analytics data aggregation
- **`/api/v1/contracts/chip-aggregates-paginated/`** - Paginated analytics
- **`/api/v1/contracts/chip-search/`** - Advanced contract search
- **`/api/v1/contracts/chip-export/`** - Individual contracts CSV export
- **`/api/v1/contracts/chip-export-aggregated/`** - Aggregated data CSV export
- **`/api/v1/contracts/chip-export-estimate/`** - Export size estimation
- **`/api/v1/contracts/chip-export-aggregated-estimate/`** - Aggregated export estimation
- **`/api/v1/contracts/filter-options/`** - Filter options
- **`/api/v1/contracts/health/`** - Health check
- **`/api/v1/contracts/stats/`** - Application statistics
- **`/api/v1/contracts/`** - Contract data endpoints
- **`/api/v1/contracts/analytics/`** - Contract analytics
- **`/api/docs/`** - Swagger UI documentation
- **`/api/redoc/`** - ReDoc documentation

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

### PhilGEPS Dataset (2013-2025)
- **5M+ Awarded Contracts** with financial values (₱14.8T+ total value)
- **119K+ Contractors** and suppliers
- **23K+ Organizations** (government agencies and contracting entities)
- **542+ Areas** across the Philippines
- Government procurement contracts and notices
- Contractor information and business details
- Organization data and geographic information

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

**Last Updated**: October 7, 2025  
**Version**: v3.1.0 - OpenAPI Migration Complete