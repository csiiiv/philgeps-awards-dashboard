# Changelog

All notable changes to the PHILGEPS Awards Data Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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