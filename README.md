# Open PhilGEPS by BetterGov.ph

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/csiiiv/philgeps-awards-dashboard)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Data](https://img.shields.io/badge/data-5M%20contracts-orange.svg)](data/)
[![Coverage](https://img.shields.io/badge/coverage-2013--2025-brightgreen.svg)](data/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-compliant-brightgreen.svg)](docs/ACTIVE_API_DOCUMENTATION.md)

A comprehensive, open-source government procurement analytics dashboard for the Philippines Government Electronic Procurement System (PhilGEPS). Built by [BetterGov.ph](https://bettergov.ph), this application provides detailed insights into government contracts, spending patterns, and procurement analytics with modern microservices architecture and complete dark mode support.

---

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/csiiiv/philgeps-awards-dashboard.git
cd philgeps-awards-dashboard
```

### 2. Run Locally (Development)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 3. Access Services
- **Backend API**: http://localhost:3200
- **Frontend Dashboard**: http://localhost:3000

---

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
- **Value Range Filtering**: Contract amount filtering with KMBT format support
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
- **Complete Dark Mode**: Seamless dark/light theme toggle across all components
  - Theme-aware header with proper styling
  - Dark mode modals and drill-down panels
  - Pagination and table components with theme support
  - CSS variable-based theming system
- **URL-Based Routing**: React Router with deep linking support
  - Direct navigation to any page via URL
  - Browser back/forward button support
  - Bookmarkable pages and shareable links
- **Modern UI Components**: shadcn/ui integration for enhanced patterns
- **Responsive Design**: Works flawlessly on desktop and mobile devices
- **Performance Optimized**: Lazy loading and efficient rendering
- **Accessibility**: WCAG compliant with keyboard navigation

---

## 📊 Data Overview

 **�️ Storage**: Large Parquet data files are now stored in `data/parquet/` as static data. Do not use git-lfs for these files; see [data/README.md](data/README.md) for details and migration instructions.

### Data Processing Pipeline

---

## 🐳 Docker Deployment

### Local Development (Multi-File Compose)
```bash
# Development with live code/data mounting
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Production-like Testing (Base Only)
```bash
# Production-like setup without mounts
docker compose up --build
```

### Cloudflare Tunnel (Optional)
```bash
# Expose local services securely to the internet
docker compose -f docker-compose.cloudflared.yml up --build
```

### Cloud Production (Separate Services)
Deploy backend and frontend as independent services to your cloud platform:

```bash
# Backend API Service
docker build -t yourrepo/philgeps-backend:latest backend/django
docker push yourrepo/philgeps-backend:latest

# Frontend Service
docker build -t yourrepo/philgeps-frontend:latest --build-arg VITE_API_URL=https://your-api.example.com frontend
docker push yourrepo/philgeps-frontend:latest
```

### Docker Commands with Environment Variables

#### Running with Direct Environment Variable Injection
```bash
# Backend container with custom environment variables
docker run -d \
  --name philgeps-backend \
  -p 3200:8000 \
  -e SECRET_KEY="your-production-secret-key" \
  -e DEBUG="False" \
  -e ALLOWED_HOSTS="api.yourdomain.com,localhost" \
  -e CORS_ALLOWED_ORIGINS="https://yourdomain.com" \
  -e CSRF_TRUSTED_ORIGINS="https://yourdomain.com" \
  philgeps-backend:latest

# Frontend container with custom API URL
docker run -d \
  --name philgeps-frontend \
  -p 3000:80 \
  philgeps-frontend:latest
```

#### Docker Compose with Environment Variable Override
```bash
# Override environment variables directly in command line
SECRET_KEY="prod-secret" DEBUG="False" ALLOWED_HOSTS="api.prod.com" \
docker compose up --build

# Or set multiple variables at once
env SECRET_KEY="prod-secret" DEBUG="False" CORS_ALLOWED_ORIGINS="https://prod.com" \
docker compose -f docker-compose.yml up --build
```

#### Building with Build Arguments
```bash
# Backend with custom build args (if needed for build-time config)
docker build \
  --build-arg SECRET_KEY="build-time-secret" \
  -t philgeps-backend:custom \
  backend/django

# Frontend with custom API URL
docker build \
  --build-arg VITE_API_URL="https://api.production.com" \
  -t philgeps-frontend:production \
  frontend
```

#### Docker Compose with Environment File Override
```bash
# Use custom environment file
docker compose --env-file .env.production up --build

# Combine multiple compose files with environment override
VITE_API_URL="https://api.staging.com" \
docker compose -f docker-compose.yml -f docker-compose.staging.yml up --build
```

#### Production Example with All Variables
```bash
# Complete production setup with environment variables
docker run -d \
  --name philgeps-backend-prod \
  --restart unless-stopped \
  -p 8000:8000 \
  -e SECRET_KEY="$(openssl rand -base64 32)" \
  -e DEBUG="False" \
  -e ALLOWED_HOSTS="api.philgeps-analytics.com" \
  -e CORS_ALLOWED_ORIGINS="https://philgeps-analytics.com" \
  -e CSRF_TRUSTED_ORIGINS="https://philgeps-analytics.com" \
  -e PARQUET_DIR="/data/parquet" \
  -v /host/data:/data \
  philgeps-backend:latest

docker run -d \
  --name philgeps-frontend-prod \
  --restart unless-stopped \
  -p 80:80 \
  --link philgeps-backend-prod:backend \
  philgeps-frontend:latest
```

---

## ⚙️ Configuration

### Required Environment Variables

#### Backend (Django API)
| Variable | Example | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `django-insecure-dev-key` | Django secret key (secure in production) |
| `DEBUG` | `False` | Enable debug mode (False for production) |
| `ALLOWED_HOSTS` | `api.example.com,localhost` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | `https://app.example.com` | Frontend domain for CORS |
| `CSRF_TRUSTED_ORIGINS` | `https://app.example.com` | Trusted domains for CSRF |
| `PARQUET_DIR` | `/data/parquet` | Path to data files (if mounting) |

#### Frontend (React/Vite)
| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://api.example.com` | Backend API base URL |

### Environment Files
- Copy `backend/django/env.example` to `backend/django/.env`
- Copy `frontend/env.example` to `frontend/.env`
- Or use `setup_env.sh` for automated setup

### Direct Docker `run` environment injection (example)

If you need to run a single container and inject environment variables directly, you can use `docker run -e` flags. This is useful for short-lived testing or debugging but is not recommended for long-term production because environment variables will be visible in process lists and container inspection.

```bash
# Run the backend API container with explicit env injection
docker run -d \
	-p 3200:3200 \
	-e SECRET_KEY='django-insecure-dev-key' \
	-e DEBUG=False \
	-e ALLOWED_HOSTS='api.example.com' \
	-e PARQUET_DIR='/data/parquet' \
	--name philgeps-backend \
	yourrepo/philgeps-backend:latest
```

Security note: avoid storing sensitive secrets directly in shell history or Docker command lines. Prefer using `--env-file` or an orchestration secret manager for production deployments (see examples below).

Alternative (env file):

```bash
# Use an env file instead of passing secrets on the command line
docker run --env-file backend/django/.env -d -p 3200:3200 --name philgeps-backend yourrepo/philgeps-backend:latest
```

---

## 📋 Recent Updates

### v4.0.0 - Open PhilGEPS by BetterGov.ph (October 2025)
- **🎨 Complete Rebrand**: Now "Open PhilGEPS by BetterGov.ph"
  - New BetterGov.ph logo with circular white background (128×128px) and black border
  - Updated site title and subtitle throughout the application
  - Inter font family for modern, accessible typography
  - Public domain license integration in footer
- **🌙 Complete Dark Mode**: Full theme support across the entire application
  - Header component with proper dark mode styling
  - All modals and drill-down panels respond to theme changes
  - Pagination components with theme-aware backgrounds and button colors
  - Advanced Search components migrated to CSS variable theming
  - Fixed all runtime theme errors and undefined token access
- **🎨 CSS Variable Theming**: Migrated to centralized theme system
  - New `getThemeVars()` and `themeVar()` helpers for CSS variable-based theming
  - Replaced direct color references with CSS variable tokens
  - Centralized theme management through `ThemeProvider`
  - Proper `data-theme` attribute and `dark` class toggling
- **🧩 shadcn/ui Integration**: Modern UI component library
  - shadcn/ui initialized with proper configuration
  - Import alias `@/*` → `src/*` for shadcn components
  - Enhanced component patterns and accessibility
- **🔄 Service Worker Improvements**: Force client refresh mechanism
  - Self-unregistering service worker for deployments
  - Clears all caches on activation
  - Ensures users always get fresh bundles after updates
- **🐳 Docker Improvements**: Enhanced container reliability
  - Healthcheck fix using IPv4 loopback (127.0.0.1) instead of localhost
  - Prevents healthcheck failures due to IPv6 resolution issues

### v3.3.0 - Pure API & Docker Support (October 2025)
- **🔄 Microservices Architecture**: Converted to pure API backend with separate frontend service
- **🐳 Docker Containerization**: Complete multi-file Docker Compose setup
- **☁️ Cloud Ready**: Production deployment guides for AWS, Azure, and other platforms
- **🏗️ Multi-Stage Builds**: Optimized frontend builds (Node.js → Nginx)
- **🔒 Enhanced Security**: Proper CORS, CSRF, and environment variable management

### v3.2.1 - Enhanced Export System (October 2025)
- **📤 Streaming Exports**: Memory-efficient CSV export with progress tracking
- **⚡ Performance**: 50,000 records per batch, reduced memory usage
- **🎯 Filter Accuracy**: Consistent export across all components
- **📚 Documentation**: Comprehensive Docker deployment guides

### v3.2.0 - Value Range Filtering (October 2025)
- **💰 Contract Value Filters**: Min/Max amount filtering with KMBT format
- **🔍 Enhanced Search**: Real-time range validation and display
- **📄 Improved UX**: Better pagination with direct page navigation
- **💾 Filter Persistence**: Save and restore value range settings

### v3.1.0 - OpenAPI Migration Complete (October 2025)
- **📚 OpenAPI 3.0 Compliance**: Complete API documentation with Swagger UI and ReDoc
- **📊 Enhanced Export**: Individual contracts and aggregated data export with accurate estimates
- **🗺️ Treemap Visualization**: Interactive hierarchical data visualization with drill-down
- **📱 Mobile Optimization**: Fixed mobile data loading and responsive design

---

## 🛠️ Development

### Architecture
- **Backend**: Django REST Framework with DuckDB analytics
- **Frontend**: React 19 + Vite with TypeScript
- **Routing**: React Router for client-side navigation
- **Theming**: CSS variable-based theme system with dark/light mode support
- **UI Components**: shadcn/ui for modern, accessible components
- **Data**: Parquet files with optimized aggregations
- **Containerization**: Docker with multi-stage builds
- **Deployment**: Microservices pattern for cloud platforms

### Development Workflow
1. **Local Development**: Use Docker Compose with dev overrides
2. **Code Mounting**: Live editing with volume mounts
3. **Data Handling**: Flexible parquet data strategies
4. **Health Monitoring**: Built-in health endpoints
5. **API Testing**: Swagger UI and ReDoc documentation

### Performance Optimizations
- **Memoization**: React.memo for expensive components
- **Bundle Splitting**: Code splitting for faster loads
- **Efficient Queries**: Optimized database operations
- **Caching**: Strategic data caching patterns

---

## 📚 Documentation

### Core Documentation
- [📊 Dashboard Documentation](docs/DASHBOARD_DOCUMENTATION.md) - Complete user guide
- [🔌 API Documentation](docs/ACTIVE_API_DOCUMENTATION.md) - OpenAPI 3.0 reference
- [🚀 Production Deployment](docs/PRODUCTION_DEPLOYMENT_GUIDE.md) - Cloud deployment
- [🐳 Docker Deployment](docs/DOCKER_DEPLOYMENT_GUIDE.md) - Container setup

### Technical References  
- [📊 Data Pipeline](scripts/DATA_PIPELINE.md) - Processing pipeline
- [📁 Data Structure](data/README.md) - Data organization
- [🧩 Components](frontend/src/components/README.md) - Frontend components
- [📜 Scripts](scripts/README.md) - Data processing scripts

### Project Information
- [📝 Changelog](CHANGELOG.md) - Version history
- [ OpenAPI Migration](docs/OPENAPI_MIGRATION_GUIDE.md) - API migration

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript/ESLint standards
- Use functional React components with hooks
- Write comprehensive tests
- Update documentation for new features

---

## 🔒 Security

- **Input Validation**: Comprehensive sanitization
- **CORS Configuration**: Proper cross-origin setup
- **Environment Variables**: Secure configuration management
- **HTTPS Ready**: Production security headers
- **API Security**: Rate limiting and authentication ready

---

## 💬 Support

- **Issues**: [Create a GitHub issue](https://github.com/csiiiv/philgeps-awards-dashboard/issues)
- **Documentation**: Check the `docs/` folder
- **Setup Help**: See Docker deployment guides above
- **Contact**: Reach out to the development team

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **BetterGov.ph**: For supporting open data and government transparency initiatives
- **PhilGEPS**: For providing procurement data transparency
- **Django Community**: For the excellent web framework
- **React Team**: For the powerful frontend library
- **shadcn/ui**: For the beautiful, accessible component library
- **Open Source Contributors**: For amazing tools and libraries

---

**Built with ❤️ by BetterGov.ph for transparent government procurement**
