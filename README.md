# PhilGEPS Dashboard

[![Version](https://img.shields.io/badge/version-3.3.0-blue.svg)](https://github.com/csiiiv/philgeps-awards-dashboard)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Data](https://img.shields.io/badge/data-5M%20contracts-orange.svg)](data/)
[![Coverage](https://img.shields.io/badge/coverage-2013--2025-brightgreen.svg)](data/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-compliant-brightgreen.svg)](docs/ACTIVE_API_DOCUMENTATION.md)

A comprehensive government procurement analytics dashboard for the Philippines Government Electronic Procurement System (PhilGEPS). This application provides detailed insights into government contracts, spending patterns, and procurement analytics.

## 📊 **Data Overview**

- **💰 Awarded Contracts**: 5M+ contracts with financial values (₱14.8T+ total value)
- **👥 Contractors**: 119K+ registered contractors and suppliers
- **🏢 Organizations**: 23K+ government agencies and contracting entities
- **🌍 Areas**: 542+ delivery areas across the Philippines
- **📋 Data Types**: Contract awards, contractor information, and procurement analytics
- **📅 Time Coverage**: 2013-2025 (13 years of data)
- **🏢 Data Sources**: PhilGEPS XLSX (2013-2020) + CSV (2021-2025) + Flood Control Projects from "Sumbong sa Pangulo" dataset
- **📁 File Size**: 2.6GB consolidated dataset with 50 columns
- **🔍 Search Capability**: Full-text search across all contract details
- **📊 Analytics**: Real-time aggregations and trend analysis

## ✨ Recent Updates

### **v3.3.0 - Docker Support & Production Readiness (October 2025)**
- **🐳 Docker Containerization**: Complete Docker Compose setup for local development with backend + frontend services
- **🏗️ Multi-Stage Builds**: Optimized frontend build (Node.js → Nginx) with production-ready static serving
- **📊 Data Handling**: Flexible Parquet data management - bake into image or mount at runtime with configurable `PARQUET_DIR`
- **🏥 Health Monitoring**: Container health endpoints for orchestration and monitoring
- **☁️ Cloud Deployment**: Comprehensive guides for Azure (Container Apps, AKS) and AWS (ECS, S3+CloudFront)

### **v3.2.1 - Enhanced CSV Export System (October 2025)**
- **📤 Unified Export System**: Memory-efficient streaming export with real-time progress tracking and cancellation
- **⚡ Performance Optimization**: 50,000 records per batch with reduced memory usage (fixes 1.7GB+ issues)
- **🔄 Consistent Interface**: Unified export across Data Explorer, Analytics, and Entity Drill-down components
- **🎯 Filter Accuracy**: Proper filter and dimension parameter handling in all export scenarios
- **🔒 Security**: Enhanced data protection, security headers, and production-ready configuration
- **📚 Documentation**: New Docker Deployment Guide with cloud best practices and environment setup
- **🧹 Workflow Cleanup**: Migrated from script-based to Docker-first development approach

## ✨ Recent Updates

### **v3.3.1 - Unified Export System & Performance (October 2025)**
- **🚀 Export Performance**: 3-5x faster export speeds with optimized streaming and batch processing
- **💾 Memory Efficiency**: Streaming exports eliminate 1.7GB+ memory issues for large datasets
- **🔄 Unified System**: Consistent export interface across Data Explorer, Analytics, and Entity Drill-down
- **📊 Real-time Progress**: Accurate progress tracking with Content-Length header support
- **⚡ Stream Processing**: Memory-efficient streaming with 50,000 record batches
- **🛠️ Export Tools**: New testing utilities and comprehensive export configuration system

### **v3.3.0 - Docker Support & Production Ready (October 2025)**
- **🐳 Complete Docker Support**: Docker Compose setup with backend (Django + Gunicorn) and frontend (React + Nginx)
- **📦 Container Optimization**: Multi-stage builds, health checks, and production deployment guides
- **🗄️ Data Handling**: Flexible Parquet data management with baking and mounting strategies
- **☁️ Cloud Deployment**: Comprehensive guides for Azure Container Apps, AWS ECS, and production best practices
- **🔧 Environment Config**: Streamlined setup with PARQUET_DIR and standardized environment variables
- **📚 Documentation**: Complete Docker deployment guide and container security best practices

### **v3.2.0 - Value Range Filter & Enhanced UX (October 2025)**
- **💰 Value Range Filter**: New contract amount filtering with KMBT format support (1K, 1M, 1B, 1T)
- **🔍 Enhanced Search**: Min/Max value inputs with real-time range display and smart validation
- **📄 Improved Pagination**: Custom page input field for direct navigation to any page
- **🎨 Better Layout**: Redesigned filter interface with horizontal Time Range and Value Range layout
- **🔧 Backend Integration**: Complete API support for value range filtering across all endpoints
- **💾 Filter Persistence**: Value range settings now saved and restored with other filters
- **⚡ Performance**: Optimized database queries with proper type casting for contract amounts

### **v3.1.0 - OpenAPI Migration Complete (October 2025)**
- **📚 OpenAPI 3.0 Compliance**: Complete API documentation with Swagger UI and ReDoc
- **📊 Enhanced Export**: Individual contracts and aggregated data export with accurate estimates
- **🗺️ Treemap Visualization**: Interactive hierarchical data visualization with drill-down
- **📱 Mobile Optimization**: Fixed mobile data loading and responsive design
- **🔧 Production Ready**: Complete deployment configuration and environment setup
- **📈 Accurate Statistics**: Updated all documentation with correct data counts
- **🛠️ Developer Experience**: Comprehensive API documentation and testing tools

### **Key Improvements**
- **Export Performance**: 3-5x faster exports with unified streaming system and memory efficiency
- **Docker Support**: Complete containerization with Docker Compose and production deployment guides
- **Container Health**: Built-in health checks and monitoring for container orchestration
- **API Documentation**: Complete OpenAPI 3.0 specification with interactive testing
- **Export Functionality**: Enhanced CSV export with streaming, progress tracking, and unified interface
- **Production Ready**: Docker-first deployment with Azure/AWS guidance and security best practices
- **Data Handling**: Flexible Parquet data strategies (bake vs mount) with proper container integration
- **Developer Experience**: Streamlined setup with single-command deployment and comprehensive documentation

## 🚀 Features

### 📊 Data Explorer
- **Entity-First Analysis**: Explore data by contractors, organizations, areas, or business categories
- **Interactive Filters**: Dynamic filtering based on selected dimension
- **Real-time Search**: Search and filter entities with autocomplete
- **Summary Statistics**: Quick overview of total contracts, values, and averages
- **Export Capabilities**: Export individual contracts or aggregated data as CSV

### 🔍 Advanced Search
- **Comprehensive Filtering**: Multi-dimensional search across all data fields
- **Keyword Search**: AND logic for precise keyword matching
- **Date Range Filtering**: Flexible time period selection (2013-2025)
- **Export Capabilities**: CSV export with rank range selection
- **Filter Presets**: Save, load, and manage custom filter configurations

### 🗺️ Treemap Visualization
- **Interactive Charts**: Hierarchical data visualization with drill-down capabilities
- **Visual Representation**: Rectangles sized by contract value with color coding
- **Multi-dimensional**: View data by contractors, organizations, areas, or categories
- **Filtering Support**: Apply filters to focus on specific data subsets

### 📈 Analytics
- **Contract Analysis**: Detailed breakdown by various dimensions
- **Trend Analysis**: Quarterly and yearly trend visualization with interactive charts
- **Drill-down Capabilities**: Nested modals with embedded trend charts for granular data exploration
- **Performance Metrics**: Contract value, count, and efficiency analysis
- **Entity Trends**: Individual contractor/organization trend analysis with complete dataset processing

### 📚 API Documentation
- **OpenAPI 3.0**: Complete API specification with interactive testing
- **Swagger UI**: Interactive API explorer for testing endpoints
- **ReDoc**: Beautiful API documentation with examples
- **Live Testing**: Test API endpoints directly from the documentation

### 🎨 User Experience
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: Lazy loading and efficient rendering


## 🔧 Configuration

### Environment Variables

All configuration is now managed via Docker and `.env` files. See `backend/django/env.example` and `frontend/env.example` for required variables. For local development, copy these to `.env` files as needed.

#### 3. Environment Variables
- See `backend/django/env.example` and `frontend/env.example` for required variables.
- For local dev, copy these to `.env` files as needed.

#### 4. Legacy Scripts
- Old setup and run scripts are now archived in `scripts/archive/` and are not maintained.

#### 5. Cloud Deployment
- See `docs/DOCKER_DEPLOYMENT_GUIDE.md` and `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` for cloud deployment instructions.

## 🔧 Configuration

### Environment Setup Script

The `setup_env.sh` script automatically creates the necessary `.env` files:

#### Configuration Options
Edit the configuration section at the top of `setup_env.sh`:

```bash
# Development Settings
DEV_SECRET_KEY="django-insecure-dev-key-change-in-production"
DEV_DEBUG="True"
DEV_FRONTEND_DOMAIN="https://philgeps.simple-systems.dev"
DEV_API_DOMAIN="philgeps-api.simple-systems.dev"

# Production Settings
PROD_SECRET_KEY="CHANGE-THIS-TO-A-SECURE-SECRET-KEY-IN-PRODUCTION"
PROD_DEBUG="False"
PROD_FRONTEND_DOMAIN="philgeps.simple-systems.dev"
PROD_API_DOMAIN="philgeps-api.simple-systems.dev"

# API Source Selection (1-3)
API_SOURCE_OPTION=1  # 1=Public API, 2=Local, 3=Custom

# Port Configuration
BACKEND_PORT="3200"
FRONTEND_PORT="3000"
```

#### Generated Files

**Backend (.env)**
```
# Django Settings - DEVELOPMENT/PRODUCTION
SECRET_KEY=your-configured-secret-key
DEBUG=True/False
ALLOWED_HOSTS=configured-domains
CORS_ALLOWED_ORIGINS=configured-frontend-domains
```

**Frontend (.env)**
```
# Frontend Environment Variables
VITE_API_URL=http://localhost:3200  # or configured API URL
```

### Manual Configuration (Alternative)

If you prefer manual setup, create `.env` files manually:

**Backend (.env)**
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3200/api
VITE_APP_TITLE=PhilGEPS Dashboard
```

## 📊 Data Sources

### PhilGEPS Dataset (2013-2025)
- **2013-2020**: XLSX files with 44 columns (~8.9M records)
- **2021-2025**: CSV files with 47 columns (~2.2M records)
- **Contract Records**: Government procurement contracts and notices
- **Contractor Information**: Business entity details and contact information
- **Organization Data**: Government agencies and departments
- **Geographic Data**: Regional and provincial information
- **Enhanced Fields**: Additional columns for contact persons, bidders, and reference IDs

### Sumbong sa Pangulo Dataset
- **Flood Control Projects**: Infrastructure and flood management contracts
- **Specialized Analytics**: Dedicated metrics for flood control projects
- **Integrated Processing**: Seamlessly integrated with main dataset

### Data Processing Pipeline
- **Consolidated Dataset**: 15.5M+ records in unified format (all procurement data)
- **Clean Awarded Contracts**: 5.0M+ contracts with financial values (₱14.8T+ total)
- **Real-time Aggregations**: 225+ parquet files for fast analytics
- **Optimized Search**: Full-text search across all contract details

## 🔄 Data Pipeline

The application includes a comprehensive data processing pipeline:

### **Processing Scripts** (`scripts/`)
- **`rebuild_step_by_step.py`**: Complete data rebuild from raw sources
- **`fix_date_formats.py`**: Fix Excel serial date formatting issues
- **`generate_clean_awarded_contracts.py`**: Generate clean awarded contracts dataset
- **`generate_unified_parquet_data.py`**: Generate all aggregation files
- **`regenerate_optimized_files.py`**: Regenerate optimized files for dashboard

### **Data Flow**
```
Raw Data (XLSX/CSV) → Processing Scripts → Consolidated Data → Aggregations → API/Dashboard
```

### **File Structure**
- **Consolidated**: `all_contracts_consolidated.parquet` (2.6GB, 50 columns, 15.5M records)
- **Clean Awarded**: `clean_awarded_contracts_complete.parquet` (1.1GB, 5.0M records, ₱14.8T+ value)
- **Aggregations**: `data/parquet/` with yearly/quarterly breakdowns
- **Documentation**: Complete pipeline documentation in `scripts/DATA_PIPELINE.md`


## 🛠️ Development

### Docker Workflow

All development and deployment should use Docker Compose.

Data handling in Docker:
- Recommended: mount host `./data` into the backend container at `/data` and set `PARQUET_DIR=/data/parquet` (no image rebuild to refresh data).
- Alternative: bake `data/parquet/` into the backend image (larger image; simpler runtime). Dockerfile already copies `data/parquet/` and sets `PARQUET_DIR=/data/parquet` when building from repo root.
- Avoid: copying Parquet files into Django `static/` — they’ll be publicly exposed and slow collectstatic.

Verification:
- Backend health: GET `http://localhost:3200/api/v1/data-processing/health/`
- Data presence: GET `http://localhost:3200/api/v1/data-processing/available-time-ranges/` should return `{"all_time": true, ...}` when `/data/parquet` is present.

For code style, follow:
- **Python**: PEP 8 compliance
- **TypeScript**: ESLint + Prettier
- **React**: Functional components with hooks
- **Styling**: Styled Components with theme system

## 📈 Performance

### Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Efficient Queries**: Optimized database queries
- **Caching**: Strategic data caching
- **Bundle Splitting**: Code splitting for faster loads

### Monitoring
- **Performance Tracking**: Built-in performance monitoring
- **Error Boundaries**: Graceful error handling

## 🔒 Security

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin setup
- **Environment Variables**: Secure configuration management
- **HTTPS Ready**: Production-ready security headers

## 📚 Documentation

- [Dashboard Documentation](docs/DASHBOARD_DOCUMENTATION.md) - Comprehensive user guide
- [API Documentation](docs/ACTIVE_API_DOCUMENTATION.md) - Complete OpenAPI 3.0 reference
- [OpenAPI Migration Guide](docs/OPENAPI_MIGRATION_GUIDE.md) - Migration to OpenAPI 3.0
- [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT_GUIDE.md) - Production setup
- [Data Pipeline](scripts/DATA_PIPELINE.md) - Complete data processing pipeline documentation
- [Data Structure](data/README.md) - Data format and organization
- [Component Documentation](frontend/src/components/README.md) - Frontend components
- [Scripts Documentation](scripts/README.md) - Data processing scripts guide
- [Changelog](CHANGELOG.md) - Complete version history and changes
- [GitHub Setup Guide](GITHUB_SETUP.md) - Repository setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PhilGEPS**: For providing the procurement data
- **Django Community**: For the excellent web framework
- **React Team**: For the powerful frontend library
- **Open Source Contributors**: For the amazing tools and libraries


## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder
- For setup and deployment help, see the Docker deployment guide and Quickstart above.

---

**Built with ❤️ for transparent government procurement**