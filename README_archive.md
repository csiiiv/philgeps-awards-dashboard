
# PhilGEPS Dashboard

[![Version](https://img.shields.io/badge/version-3.3.0-blue.svg)](https://github.com/csiiiv/philgeps-awards-dashboard)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Data](https://img.shields.io/badge/data-5M%20contracts-orange.svg)](data/)
[![Coverage](https://img.shields.io/badge/coverage-2013--2025-brightgreen.svg)](data/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-compliant-brightgreen.svg)](docs/ACTIVE_API_DOCUMENTATION.md)

A comprehensive government procurement analytics dashboard for the Philippines Government Electronic Procurement System (PhilGEPS). This application provides detailed insights into government contracts, spending patterns, and procurement analytics.

---

## 🚀 Features

- Entity-First Analysis, Interactive Filters, Real-time Search
- Export Capabilities, Advanced Search, Treemap Visualization
- Analytics, API Documentation, Responsive Design
- Dark/Light Mode, Performance Optimized

---

## 📊 Data Overview & Sources

- 5M+ contracts, ₱14.8T+ value, 119K+ contractors, 23K+ organizations
- Data from PhilGEPS XLSX/CSV, Flood Control Projects
- 2013-2025 coverage, 2.6GB dataset, 50 columns

---

## ⚡ Quickstart (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/csiiiv/philgeps-awards-dashboard.git
cd philgeps-awards-dashboard
```

### 2. Run with Docker Compose (Dev)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 3. Access
- Backend: http://localhost:3200
- Frontend: http://localhost:3000

---

## 🏢 Production Deployment (Cloud)

### Separate Service Deployment
- Build and push backend and frontend images independently
- Deploy each to your cloud platform (ECS, Azure, S3, Vercel, etc.)
- Set environment variables per service

See below for full instructions and sample commands.

---

## 🔧 Configuration

### Environment Variables
- Backend: SECRET_KEY, DEBUG, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, CSRF_TRUSTED_ORIGINS, PARQUET_DIR
- Frontend: VITE_API_URL

See `backend/django/env.example` and `frontend/env.example` for details.

### Setup Script
- Use `setup_env.sh` for auto-generating .env files

---

## 📁 Data Pipeline & File Structure

- Data processing scripts in `scripts/`
- Parquet files in `backend/django/static_data`
- See `scripts/DATA_PIPELINE.md` for details

---

## 🛠️ Development Workflow

- Use Docker Compose for local dev
- Mount code/data for live editing
- Use multi-file compose pattern for modularity

---

## 📚 API & Documentation

- [Dashboard Documentation](docs/DASHBOARD_DOCUMENTATION.md)
- [API Documentation](docs/ACTIVE_API_DOCUMENTATION.md)
- [OpenAPI Migration Guide](docs/OPENAPI_MIGRATION_GUIDE.md)
- [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Data Pipeline](scripts/DATA_PIPELINE.md)
- [Data Structure](data/README.md)
- [Component Documentation](frontend/src/components/README.md)
- [Scripts Documentation](scripts/README.md)
- [Changelog](CHANGELOG.md)
- [GitHub Setup Guide](GITHUB_SETUP.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **PhilGEPS**: For providing the procurement data
- **Django Community**: For the excellent web framework
- **React Team**: For the powerful frontend library
- **Open Source Contributors**: For the amazing tools and libraries

---

## 💬 Support

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder
- For setup and deployment help, see the Docker deployment guide and Quickstart above.

---

## 🐳 Running with Docker & Compose

### Cloudflare Tunnel Setup

You can expose your local backend and frontend services securely to the internet using Cloudflare Tunnel. This is useful for remote access, demos, or development behind NAT/firewall.

#### 1. Prerequisites
- Get your Cloudflare Tunnel token from the Cloudflare dashboard.

#### 2. Run with Docker Compose
```bash
docker compose -f docker-compose.cloudflare.yml up --build
```

#### 3. Environment Variables
- Set `TUNNEL_TOKEN` in the `cloudflared` service (in the compose file or via your environment).

#### 4. How it works
- The `cloudflared` service creates a secure tunnel to Cloudflare and exposes your backend (port 3200) and frontend (port 3000) to the public internet via your Cloudflare domain.
- You can configure additional routes and subdomains in your Cloudflare dashboard.

---

## 🐳 Running with Docker & Compose

### Local Development (Multi-File Compose)
```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Production-like (Base Compose)
```bash
docker compose up --build
```

### Backend volume mount in dev
```yaml
services:
	backend:
		volumes:
			- ./backend/django:/app
			- ./backend/django/static_data:/data/parquet
		environment:
			DEBUG: "True"
			PARQUET_DIR: "/data/parquet"
```

---

## 🚀 Separate Service Deployment (Cloud Production)

### Backend (API Service)
```bash
docker build -t yourrepo/philgeps-backend:latest backend/django
docker push yourrepo/philgeps-backend:latest
```
Set environment variables in your cloud service:
- SECRET_KEY, DEBUG, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, CSRF_TRUSTED_ORIGINS, PARQUET_DIR

### Frontend (Static Site)
```bash
docker build -t yourrepo/philgeps-frontend:latest --build-arg VITE_API_URL=https://your-backend.example.com frontend
docker push yourrepo/philgeps-frontend:latest
```
Set VITE_API_URL at build time to point to your backend’s public URL.

---

## 📝 Required Environment Variables (Backend)

| Variable                | Example Value                        | Description                                 |
|-------------------------|--------------------------------------|---------------------------------------------|
| SECRET_KEY              | django-insecure-dev-key              | Django secret key (change in production)    |
| DEBUG                   | True                                 | Set to False in production                  |
| ALLOWED_HOSTS           | localhost,127.0.0.1                  | Comma-separated list of allowed hosts       |
| CORS_ALLOWED_ORIGINS    | http://localhost:3000                | Comma-separated frontend origins            |
| CSRF_TRUSTED_ORIGINS    | http://localhost:3000                | Comma-separated trusted origins for CSRF    |
| PARQUET_DIR             | /data/parquet                        | Path to static_data (if mounting volume)    |

See `backend/django/env.example` for more options.

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
- Recommended: mount host `./data` into the backend container at `/data` and set `PARQUET_DIR=/data/parquet` (no image rebuild to refresh data).
- Alternative: bake `data/parquet/` into the backend image (larger image; simpler runtime). Dockerfile already copies `data/parquet/` and sets `PARQUET_DIR=/data/parquet` when building from repo root.
- Avoid: copying Parquet files into Django `static/` — they’ll be publicly exposed and slow collectstatic.

- Backend health: GET `http://localhost:3200/api/v1/data-processing/health/`
- Data presence: GET `http://localhost:3200/api/v1/data-processing/available-time-ranges/` should return `{"all_time": true, ...}` when `/data/parquet` is present.

For code style, follow:
- **TypeScript**: ESLint + Prettier
- **React**: Functional components with hooks
- **Styling**: Styled Components with theme system

## 📈 Performance

### Optimizations
- **Memoization**: React.memo for expensive components
- **Efficient Queries**: Optimized database queries
- **Caching**: Strategic data caching
- **Bundle Splitting**: Code splitting for faster loads

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






## � Separate Service Deployment (Cloud Production)

For production, deploy backend and frontend as independent services on your chosen cloud platforms. Compose is for local dev only.

### Backend (API Service)

1. **Build and push the image:**
	```powershell
	docker build -t yourrepo/philgeps-backend:latest backend/django
	docker push yourrepo/philgeps-backend:latest
	```
2. **Deploy to your cloud platform:**
	- Use AWS ECS, Azure Container Apps, DigitalOcean App Platform, etc.
	- Set these environment variables in your cloud service:
	  - `SECRET_KEY`: your secure Django secret key
	  - `DEBUG`: `False`
	  - `ALLOWED_HOSTS`: your backend domain (e.g., `api.example.com`)
	  - `CORS_ALLOWED_ORIGINS`: your frontend domain (e.g., `https://app.example.com`)
	  - `CSRF_TRUSTED_ORIGINS`: your frontend domain
	  - `PARQUET_DIR`: path to data (mount volume or use cloud storage)

### Frontend (Static Site)

1. **Build and push the image:**
	```powershell
	docker build -t yourrepo/philgeps-frontend:latest --build-arg VITE_API_URL=https://your-backend.example.com frontend
	docker push yourrepo/philgeps-frontend:latest
	```
2. **Deploy to your cloud platform:**
	- Use AWS S3 + CloudFront, Azure Static Web Apps, Vercel, Netlify, or a containerized Nginx.
	- If using a container, set `VITE_API_URL` at build time to point to your backend’s public URL.

### Notes
- No code or data mounts in production—images should be built and pushed ahead of time.
- Set all environment variables explicitly in your cloud service’s config.
- Compose is for local dev only; use your cloud provider’s deployment tools for production.


This project uses multiple Docker Compose files for modular, environment-specific setups:

- `docker-compose.yml`: Base configuration (production-like, no mounts, explicit env vars)
- `docker-compose.dev.yml`: Development overrides (mounts code/data, sets dev env vars)

### Production-like (base only)

```powershell
docker compose up --build
```

### Development (base + dev override)

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

The dev override mounts your local code and data for live editing and sets development environment variables. The base file is suitable for CI/CD and cloud deployment.

### Example: Backend volume mount in dev

```yaml
services:
	backend:
		volumes:
			- ./backend/django:/app
					- ./backend/django/static_data:/data/parquet
				environment:
					DEBUG: "True"
					PARQUET_DIR: "/data/parquet"
```

## � Running with Docker

You can run the backend and frontend containers without creating .env files by injecting environment variables directly. This is recommended for cloud deployments and CI/CD.

### Backend Example (docker run)

```bash
docker run -d --name philgeps-backend -p 3200:8000 \
	-e SECRET_KEY="django-insecure-dev-key" \
	-e DEBUG="True" \
	-e ALLOWED_HOSTS="localhost,127.0.0.1" \
	-e CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000" \
	-e CSRF_TRUSTED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000" \
	philgeps-backend:latest
```

### Backend Example (docker compose)

```yaml
services:
	backend:
		image: philgeps-backend:latest
		ports:
			- "3200:8000"
		environment:
			SECRET_KEY: "django-insecure-dev-key"
			DEBUG: "True"
			ALLOWED_HOSTS: "localhost,127.0.0.1"
			CORS_ALLOWED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000"
			CSRF_TRUSTED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000"
			# PARQUET_DIR: "/data/parquet" # Uncomment if mounting data volume
```

### Frontend Example (docker run)

```bash
docker run -d --name philgeps-frontend -p 3000:80 philgeps-frontend:latest
```

### Frontend Example (docker compose)

```yaml
services:
	frontend:
		image: philgeps-frontend:latest
		ports:
			- "3000:80"
```

### Required Environment Variables (Backend)

| Variable                | Example Value                        | Description                                 |
|-------------------------|--------------------------------------|---------------------------------------------|
| SECRET_KEY              | django-insecure-dev-key              | Django secret key (change in production)    |
| DEBUG                   | True                                 | Set to False in production                  |
| ALLOWED_HOSTS           | localhost,127.0.0.1                  | Comma-separated list of allowed hosts       |
| CORS_ALLOWED_ORIGINS    | http://localhost:3000                | Comma-separated frontend origins            |
| CSRF_TRUSTED_ORIGINS    | http://localhost:3000                | Comma-separated trusted origins for CSRF    |
| PARQUET_DIR             | /data/parquet                        | Path to static_data (if mounting volume)    |

See `backend/django/env.example` for more options.


For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder
- For setup and deployment help, see the Docker deployment guide and Quickstart above.

---

**Built with ❤️ for transparent government procurement**