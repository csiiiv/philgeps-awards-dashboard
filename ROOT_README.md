# Project Root Directory

This is the root directory of the PhilGEPS Awards Dashboard project - a comprehensive government procurement analytics platform.

## 📁 Directory Structure

```
philgeps-awards-dashboard/
├── .github/                    # GitHub workflows and configurations
├── backend/                    # Django REST API backend
├── data/                       # Data files and parquet storage
├── docs/                       # Project documentation
├── frontend/                   # React/Vite frontend application
├── scripts/                    # Data processing and utility scripts
├── CHANGELOG.md               # Version history and release notes
├── docker-compose.yml         # Base Docker Compose configuration
├── docker-compose.dev.yml     # Development overrides
├── docker-compose.cloudflared.yml # Cloudflare tunnel configuration
├── LICENSE                    # MIT License
├── README.md                  # Main project documentation (this file)
└── README_archive.md          # Archived README versions
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Development Setup
```bash
# Clone the repository
git clone https://github.com/csiiiv/philgeps-awards-dashboard.git
cd philgeps-awards-dashboard

# Run with Docker Compose
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Access Points
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3200
- **API Documentation**: http://localhost:3200/api/docs/

## 🏗️ Architecture

### Microservices Design
- **Backend**: Django REST API with DuckDB analytics engine
- **Frontend**: React + TypeScript SPA served via Nginx
- **Data Layer**: Parquet files with optimized aggregations
- **Containerization**: Docker with multi-stage builds

### Technology Stack
- **Backend**: Django 5.2, DRF, DuckDB, Gunicorn
- **Frontend**: React 19, TypeScript 5.8, Vite 4.5
- **Data**: Apache Parquet, Pandas, PyArrow
- **Container**: Docker, Docker Compose, Nginx

## 📊 Data Overview
- **Contract Value**: ₱14.8T+ across 5M+ awarded contracts
- **Entities**: 119K+ contractors, 23K+ government organizations
- **Coverage**: 542+ delivery areas across the Philippines
- **Timeline**: 2013-2025 (13 years of procurement data)

## 🛠️ Development

### Key Directories
- **[`backend/`](backend/README.md)** - Django REST API server
- **[`frontend/`](frontend/README.md)** - React frontend application
- **[`data/`](data/README.md)** - Data files and structures
- **[`docs/`](docs/README.md)** - Complete project documentation
- **[`scripts/`](scripts/README.md)** - Data processing utilities

### Version Information
- **Current Version**: v3.3.0 (Docker Support & Unified Export System)
- **API Version**: 1.1.0 (OpenAPI 3.0 compliant)
- **Last Updated**: October 12, 2025

## 📚 Documentation

### Core Documentation
- **[Dashboard Documentation](docs/DASHBOARD_DOCUMENTATION.md)** - Complete user guide
- **[API Documentation](docs/ACTIVE_API_DOCUMENTATION.md)** - OpenAPI 3.0 reference
- **[Production Deployment](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Cloud deployment
- **[Docker Deployment](docs/DOCKER_DEPLOYMENT_GUIDE.md)** - Container setup

### Version History
- **[Changelog](CHANGELOG.md)** - Detailed version history
- **[OpenAPI Migration](docs/OPENAPI_MIGRATION_GUIDE.md)** - API migration guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for transparent government procurement**