# Documentation Directory

This directory contains the current and essential documentation for the PhilGEPS Dashboard project.

## 📁 Current Documentation

### Main Documentation Files

- **`README.md`** - This file, documentation overview
- **`DASHBOARD_DOCUMENTATION.md`** - Complete dashboard features and functionality
- **`ACTIVE_API_DOCUMENTATION.md`** - Complete OpenAPI 3.0 API reference
- **`DOCKER_DEPLOYMENT_GUIDE.md`** - Container deployment and cloud setup
- **`PRODUCTION_DEPLOYMENT_GUIDE.md`** - Production deployment guide

## 🎯 Documentation Overview

### Dashboard Documentation
**File**: `DASHBOARD_DOCUMENTATION.md`

Comprehensive documentation of the dashboard features including:
- Data Explorer (entity-first analytics)
- Advanced Search (multi-dimensional filtering)
- Treemap Visualization (hierarchical data visualization)
- Analytics (drill-down capabilities)
- API Documentation (OpenAPI 3.0 integration)
- User interface and navigation
- Data sources and coverage (5M+ contracts, 119K+ contractors, 23K+ organizations)
- Performance optimizations

### API Documentation
**File**: `ACTIVE_API_DOCUMENTATION.md`

Complete OpenAPI 3.0 compliant API reference covering:
- All active endpoints (14 core endpoints)
- Request/response examples with cURL and JavaScript
- Authentication and CORS
- Error handling and status codes
- Data models and schemas
- Export functionality (individual and aggregated)
- Interactive testing capabilities

### Migration Guide
**Status**: Archived (migration completed)

The migration to OpenAPI 3.0 has been successfully completed. Migration documentation has been archived to `docs/archive/` for historical reference.

### Docker Deployment
**File**: `DOCKER_DEPLOYMENT_GUIDE.md`

Complete containerization and deployment guide including:
- Docker Compose setup for local development
- Multi-stage builds and production optimization
- Cloud deployment strategies (Azure, AWS)
- Environment variable configuration
- Health monitoring and scaling

### Production Deployment
**File**: `PRODUCTION_DEPLOYMENT_GUIDE.md`

Comprehensive production deployment guide including:
- Non-containerized deployment options
- Environment configuration and security
- Performance optimization and monitoring
- Backup strategies and maintenance

## 🚀 Quick Start

1. **For Users**: Start with `DASHBOARD_DOCUMENTATION.md`
2. **For Developers**: Review `ACTIVE_API_DOCUMENTATION.md`
3. **For Deployment**: Check `DOCKER_DEPLOYMENT_GUIDE.md` or `PRODUCTION_DEPLOYMENT_GUIDE.md`
4. **For Setup**: See the main project `README.md` in the root directory

## 📝 Documentation Standards

- **Current Only**: Only active, up-to-date documentation is maintained
- **Comprehensive**: Complete coverage of all features and APIs (67% directory coverage)
- **User-Focused**: Clear, practical guidance for users and developers
- **Regular Updates**: Documentation is kept current with code changes
- **Recursive Coverage**: Component-level documentation throughout the codebase

## 🏗️ Extended Documentation Structure

Beyond this docs/ folder, the project maintains comprehensive README files throughout:

### **Frontend Documentation**
- **Component Architecture**: 14 README files covering all major component directories
- **Feature Documentation**: Detailed guides for Data Explorer, Advanced Search, Treemap, Analytics
- **Infrastructure Docs**: Type definitions, contexts, constants, styling, and performance optimization
- **Development Guides**: Testing strategies, lazy loading, and development patterns

### **Backend Documentation**  
- **Django Apps**: Backend and Django-specific documentation
- **Data Processing**: Parquet data structure and processing pipeline documentation
- **API Integration**: Complete OpenAPI 3.0 compliant documentation with interactive testing

### **Project Documentation**
- **Root Documentation**: Project overview and quick start guides
- **Data Structure**: Comprehensive data organization and pipeline documentation
- **Scripts Documentation**: Data processing utilities and automation scripts

## 🔧 Maintenance

- Documentation is updated with each major feature release
- Outdated documentation is removed, not archived
- Focus on clarity and practical usage
- Regular review and cleanup
- Comprehensive codebase coverage maintained through recursive documentation approach

---

**Last Updated**: October 12, 2025  
**Version**: v4.0.0 - Open PhilGEPS by BetterGov.ph  
**Documentation Coverage**: 29 README files across 67% of project directories