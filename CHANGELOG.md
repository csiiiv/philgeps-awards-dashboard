# Changelog

All notable changes to the PHILGEPS Awards Data Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-10-12

### Changed
- **Documentation Update**: Comprehensive audit and update of all documentation files
  - Updated `docs/DASHBOARD_DOCUMENTATION.md` from v3.2.0 to v3.3.0 with current features
  - Updated Django version from 4.2 to 5.2.6 to match requirements.txt
  - Updated API documentation dates from January to October 2025
  - Fixed version inconsistencies in API documentation (1.0.0 → 1.1.0)
  - Added Docker containerization and unified export system documentation
  - Fixed changelog duplicate entries and version inconsistencies
  - Ensured all documentation reflects current codebase state

## [3.3.0] - 2025-10-12

### Added
- **Complete Docker Support**: Full containerization with Docker Compose
  - Multi-service setup with backend (Django + Gunicorn) and frontend (React + Nginx)
  - Docker Compose configuration with proper port mapping (3200:8000, 3000:80)
  - Multi-stage frontend build (Node build → Nginx serve) with SPA fallback
  - Backend containerization with Gunicorn WSGI server and health endpoints
- **Data Handling Strategy**: Flexible Parquet data management in containers
  - Support for baking Parquet data into backend image at `/data/parquet`
  - Configurable `PARQUET_DIR` environment variable for flexible data paths
  - Health endpoints for container probes (`/api/v1/data-processing/health/`)
  - Data verification endpoint (`/api/v1/data-processing/available-time-ranges/`)
- **Comprehensive Documentation**: Production-ready deployment guidance
  - New Docker Deployment Guide with cloud deployment best practices
  - Azure/AWS deployment guidance and networking setup
  - Environment variable documentation and security configuration
  - Data handling strategies (bake vs mount, security considerations)

### Changed
- **Development Workflow**: Migrated from scripts to Docker-first approach
  - Archived legacy setup scripts (`setup_env.*`, `run_local.*`) to `scripts/archive/`
  - Updated README with Docker-first quickstart and verification steps
  - Enforced Docker-only workflow for consistency across environments
- **Django Configuration**: Standardized environment variable handling
  - Removed custom `API_DOMAINS`/`FRONTEND_DOMAINS` logic from settings
  - Standardized to use `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` only
  - Added proper security headers and HTTPS redirect configuration
- **Build Optimization**: Improved Docker build context and efficiency
  - Added comprehensive `.dockerignore` files to reduce build context
  - Set build context to repo root for `data/parquet` access
  - Optimized Nginx configuration for SPA routing and static file serving

### Security
- **Data Protection**: Secure Parquet data handling
  - Keep Parquet data out of Django static folder (avoid WhiteNoise exposure)
  - Configure proper CORS origins and allowed hosts
  - Implement proper container health checks and logging
- **Production Readiness**: Security headers and HTTPS configuration
  - Added security headers and HTTPS redirect configuration
  - Proper proxy SSL header handling for cloud deployment
  - Container-based secrets management guidance

## [3.2.1] - 2025-10-11 to 2025-10-12

### Added
- **Unified CSV Export System**: Comprehensive export system with streaming support
  - New `useUnifiedExport` hook with real-time progress tracking and cancellation
  - Pre-configured export setups via `useUnifiedExportConfigs` for different components
  - Memory-efficient streaming for large datasets (fixes 1.7GB+ memory issues)
  - Consistent export interface across all components (Data Explorer, Analytics, Entity Drilldown)
- **Export Performance Optimization**: Significantly improved export speeds
  - Increased backend aggregated export page size to 50,000 records per batch
  - Batch-yield CSV processing for larger chunks and fewer database calls
  - Added `X-Accel-Buffering: no` header hint to reduce proxy buffering
- **Export Testing Utilities**: 
  - `UnifiedExportTester` component for testing export functionality
  - Comprehensive export analysis documentation (`COMPONENT_EXPORT_ANALYSIS.md`)
  - Component-specific export requirements and configuration examples

### Changed
- **Data Explorer Export**: Migrated from blob-based to streaming export
  - Now respects selected dimension and applied filters properly
  - Real-time progress tracking with Content-Length header support
  - Memory usage reduced from 1.7GB+ to streaming chunks
- **Analytics Explorer Export**: Unified with streaming export system
  - Consistent progress tracking and cancellation support
  - Improved performance for large analytics datasets
- **Entity Drill-down Export**: Enhanced with streaming capabilities
  - Better handling of filtered entity data exports
  - Consistent user experience across all export scenarios
- **Export Modal Interface**: Enhanced `ExportCSVModal` component
  - Support for estimated size display and progress tracking
  - Unified props interface (`estimatedSize`, `showProgress`, `showFileSize`)
  - Simplified UI by removing actual size calculation (estimated size only)

### Fixed
- **Export Progress Accuracy**: Fixed progress percentage calculations
  - Real-time progress updates during streaming export
  - Proper Content-Length header handling for accurate percentages
- **Memory Issues**: Resolved high memory usage during large exports
  - Streaming approach eliminates need to load entire dataset in memory
  - Prevents browser crashes with large datasets (1.7GB+)
- **Filter Handling**: Fixed export filter parameter passing
  - Data Explorer exports now properly apply selected dimension filters
  - Consistent filter handling across all export types
- **Export Cancellation**: Improved cancellation functionality
  - Proper AbortController implementation across all export types
  - Clean cleanup when exports are cancelled mid-stream

### Performance
- **Export Speed**: 3-5x faster export times for large datasets
  - Larger batch sizes (50,000 records vs previous smaller batches)
  - Reduced database query overhead with batch processing
  - Optimized CSV generation and streaming
- **Memory Efficiency**: Dramatic reduction in memory usage
  - Streaming approach uses constant memory regardless of dataset size
  - Eliminated memory spikes that previously caused browser issues
- **Backend Optimization**: Enhanced server-side export processing
  - Batch processing with larger page sizes
  - Reduced I/O operations with efficient data pagination

### Technical Improvements
- **Hook Architecture**: Reusable export hooks with configuration system
- **Error Handling**: Comprehensive error handling for network and processing issues
- **Type Safety**: Enhanced TypeScript interfaces for export configurations
- **Documentation**: Detailed component export analysis and usage guides
- **Testing**: Export testing utilities for development and debugging

## [3.2.0] - 2025-10-10

### Added
- **Value Range Filter**: New contract value range filtering capability in Advanced Search
  - Min/Max value input fields with KMBT format support (1K, 1M, 1B, 1T)
  - Horizontal layout with real-time range display
  - Smart input parsing and validation
  - Default value range (0 to 1T) when no range is specified
- **Enhanced Pagination**: Custom page input field for direct page navigation
  - Always-visible page input field in pagination component
  - Direct page number entry for faster navigation
  - Improved user experience for large datasets
- **Backend Value Range Support**: Complete API integration for value range filtering
  - Added `value_range` parameter to all search, aggregates, and export endpoints
  - Contract amount filtering with proper type casting in DuckDB queries
  - Support for min/max value constraints in database queries

### Changed
- **Advanced Search Interface**: Redesigned filter layout for better space utilization
  - Time Range and Value Range filters now share a horizontal row
  - Consistent card styling for filter sections
  - Improved visual hierarchy and spacing
- **API Service Layer**: Enhanced with default value range handling
  - Automatic fallback to min 0, max 1T when value range is undefined
  - Consistent API calls across all endpoints
  - Better error prevention and data consistency
- **Filter Persistence**: Value range now included in saved filters
  - Value range settings persist across page reloads
  - Saved filters include value range configuration
  - Active filter count includes value range status

### Fixed
- **Data Explorer Compatibility**: Fixed 400 Bad Request errors
  - Added value range parameter to Data Explorer API calls
  - Default value range initialization for consistent behavior
  - Resolved paginated aggregates failure issues
- **Filter State Management**: Improved value range state handling
  - Fixed value range not persisting in frontend state
  - Corrected max value input validation constraints
  - Enhanced filter summary display with value range information
- **Backend Query Optimization**: Improved contract amount filtering
  - Fixed VARCHAR vs INTEGER comparison errors in DuckDB
  - Proper type casting for contract amount comparisons
  - Enhanced query performance for value range filters

### Technical Improvements
- **Type Safety**: Enhanced TypeScript interfaces for value range filtering
- **Component Architecture**: New reusable ValueRangeFilter component
- **API Consistency**: Standardized value range parameter across all endpoints
- **Error Handling**: Improved error messages and validation for value inputs
- **Performance**: Optimized database queries with proper type casting

## [3.1.0] - 2025-10-07

### Added
- **OpenAPI 3.0 Compliance**: Complete migration to OpenAPI 3.0.3 specification
- **Interactive API Documentation**: Swagger UI and ReDoc integration
- **Enhanced Export Functionality**: 
  - Individual contract export with accurate file size estimation
  - Aggregated data export from Data Explorer
  - Progress tracking for large export operations
  - Filtered search results export (not all contracts)
- **New API Endpoints**:
  - `POST /api/v1/contracts/chip-export-aggregated/` - Export aggregated data
  - `POST /api/v1/contracts/chip-export-aggregated-estimate/` - Estimate aggregated export size
- **PowerShell Setup Script**: `setup_simple.ps1` for external PowerShell compatibility
- **Latest Updates Section**: New section in About page documenting v3.1.0 features

### Changed
- **API Documentation**: Complete rewrite to OpenAPI 3.0 compliant format
- **Export Size Estimation**: Dynamic calculation based on data type and filters
- **Frontend Export Logic**: Data Explorer now uses aggregated export instead of individual contracts
- **Help Page**: Updated version to v3.1.0 with OpenAPI compliance mention
- **About Page**: Added comprehensive "Latest Updates" section
- **Dashboard Documentation**: Updated to reflect OpenAPI migration and new features
- **API Version**: Bumped to 1.1.0

### Fixed
- **Mobile Data Loading**: Resolved issues with mobile device data loading
- **PowerShell Script Issues**: Fixed emoji characters and syntax errors in external PowerShell
- **API URL Configuration**: Fixed frontend using correct API URL (philgeps-api.simple-systems.dev)
- **Export Field Mapping**: Fixed `contract_number` to `reference_id` and `contract_no` mapping
- **Export Hanging Issue**: Fixed Data Explorer export hanging near completion
- **File Size Estimation**: Fixed significantly inaccurate export size estimates
- **CORS Configuration**: Optimized for both local and production environments
- **X-Frame-Options**: Fixed iframe embedding issues for API documentation

### Technical Improvements
- **Rate Limiting**: Implemented 240 requests per hour per IP address
- **Error Handling**: Enhanced error messages and recovery mechanisms
- **Input Validation**: Comprehensive validation and sanitization
- **Security Headers**: Proper security configuration
- **Performance Optimization**: Faster data processing and response times
- **Code Quality**: Improved code organization and documentation
- **File Cleanup**: Removed obsolete test files, duplicate OpenAPI schemas, and outdated documentation

### Documentation
- **API Documentation**: Complete OpenAPI 3.0 compliant documentation
- **Code Examples**: JavaScript and cURL examples for all endpoints
- **Interactive Testing**: Live API testing capabilities in Swagger UI
- **User Guides**: Updated help and about pages with latest features
- **Technical Docs**: Updated architecture and methodology documentation
- **Changelog**: Added comprehensive CHANGELOG.md following industry standards

## [3.0.1] - 2025-10-02

### Added
- **Data Explorer**: Primary analytics interface with entity-based analysis
- **Advanced Search**: Multi-criteria contract search with chip-based filters
- **Analytics Dashboard**: Interactive charts and trend analysis
- **Drill-down Analysis**: Multi-level data exploration capabilities
- **Filter Presets**: Save and load custom filter configurations
- **Export Functionality**: CSV export with basic estimation
- **API Documentation Tab**: Basic API reference
- **Help System**: Comprehensive user guide and support information
- **About Page**: Technical details and data sources

### Features
- **Dark/Light Mode**: Seamless theme switching
- **Responsive Design**: Mobile-friendly interface
- **Real-time Search**: Fast, interactive search capabilities
- **Service Worker**: Offline capability and update notifications
- **Data Coverage**: Philippine government procurement data from 2013-2025
- **Dataset Statistics**: 2.2M+ contracts, 14K+ organizations, 74K+ contractors

### Technical
- **Frontend**: React 18 with TypeScript and Vite
- **Backend**: Django 4.2 with REST Framework
- **Database**: DuckDB for fast data processing
- **Storage**: Parquet files for columnar storage
- **API**: RESTful endpoints with comprehensive error handling

## [3.0.0] - 2025-10-01

### Added
- **Initial Release**: PHILGEPS Awards Data Explorer
- **Core Functionality**: Basic search and analytics capabilities
- **Data Processing Pipeline**: Automated data cleaning and validation
- **User Interface**: Tabbed interface with search and analytics
- **Export System**: Basic CSV export functionality

### Data Sources
- **PHILGEPS**: Primary data source from Philippine Government Electronic Procurement System
- **Sumbong sa Pangulo**: Optional dataset for 2022-2025 flood control projects
- **Time Coverage**: 2013-2025 government procurement data
- **Data Quality**: Automated cleaning, validation, and deduplication

---

## Version History Summary

| Version | Date | Major Changes |
|---------|------|---------------|
| 3.3.1 | 2025-10-12 | Unified CSV Export System, Performance Optimization, Memory Efficiency |
| 3.3.0 | 2025-10-12 | Docker Support, Container Health Checks, Production Deployment Guide |
| 3.2.0 | 2025-10-10 | Value Range Filter, Enhanced Pagination, Backend API Integration |
| 3.1.0 | 2025-10-07 | OpenAPI 3.0 migration, enhanced exports, production readiness |
| 3.0.1 | 2025-10-02 | Data Explorer, Advanced Search, Analytics Dashboard |
| 3.0.0 | 2025-10-01 | Initial release with core functionality |

## Migration Guide

### From v3.1.0 to v3.2.0

#### New Features
- **Value Range Filter**: Available in Advanced Search for filtering contracts by amount
- **Enhanced Pagination**: Custom page input field for direct navigation
- **Improved Filter Layout**: Time Range and Value Range filters share horizontal space

#### API Changes
- **New Parameter**: All endpoints now support `value_range` parameter
- **Default Behavior**: Empty value ranges default to min 0, max 1T
- **Enhanced Filtering**: Contract amount filtering with proper type casting

#### Frontend Changes
- **New Component**: `ValueRangeFilter` component for value range input
- **Updated Services**: `AdvancedSearchService` includes default value range handling
- **Enhanced Hooks**: Value range persistence in `useAdvancedSearchFilters`

### From v3.0.1 to v3.1.0

#### API Changes
- **New Endpoints**: Added aggregated export endpoints
- **Enhanced Documentation**: All endpoints now have OpenAPI 3.0 compliant documentation
- **Rate Limiting**: 240 requests per hour per IP address implemented

#### Frontend Changes
- **Export Logic**: Data Explorer now uses aggregated export by default
- **File Size Estimation**: More accurate estimation based on data type
- **API Documentation**: Enhanced with Swagger UI and ReDoc links

#### Configuration Changes
- **Environment Variables**: Updated for production deployment
- **CORS Settings**: Optimized for both local and production environments
- **PowerShell Scripts**: New `setup_simple.ps1` for better compatibility

## Support

For questions about specific versions or migration issues, please refer to:
- **Help Tab**: Comprehensive user guide in the application
- **About Tab**: Technical details and data sources
- **API Docs Tab**: Complete API documentation with examples
- **GitHub Issues**: Report bugs or request features

## Contributing

When contributing to this project, please update this changelog with your changes following the format above.

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for version numbers.