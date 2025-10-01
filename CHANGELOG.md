# Changelog

All notable changes to the PhilGEPS Awards Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.2] - 2025-01-02

### Added
- **Data Clarity**: Clear distinction between all records (15.5M) and awarded contracts (5.0M)
- **Financial Transparency**: Added ₱14.8T+ total value tracking for awarded contracts
- **Data Types Clarification**: Specified procurement notices, contract awards, and bidding information
- **CHANGELOG.md**: Comprehensive changelog for tracking all project changes
- **Enhanced Documentation**: Updated README.md with accurate data metrics and file structure

### Changed
- **README.md**: Updated data overview section with clear record type distinctions
- **Data Processing Pipeline**: Enhanced documentation with financial totals and record counts
- **File Structure**: Updated project structure with accurate file sizes and record counts
- **Version Number**: Updated to v3.0.2 to reflect data clarity improvements

### Fixed
- **Data Understanding**: Clarified scope of dataset to distinguish between all procurement data and awarded contracts
- **Financial Tracking**: Added proper financial value tracking for awarded contracts only

## [3.0.1] - 2025-01-01

### Added
- **📈 Trend Charts**: Interactive quarterly/yearly trend charts in drill-down modals
- **🔄 Complete Data Rebuild**: Consolidated 2013-2025 dataset with 15.5M+ records
- **📊 Enhanced Analytics**: Individual entity trend analysis with complete dataset processing
- **🛠️ Data Pipeline**: Comprehensive processing scripts with full documentation
- **📁 File Structure**: 225+ optimized parquet files for fast analytics
- **🔧 Maintenance**: Automated cleanup and optimization scripts
- **Data Pipeline Documentation**: Complete `scripts/DATA_PIPELINE.md` with visual diagrams
- **Scripts Documentation**: Updated `scripts/README.md` with quick start guide
- **Entity Drill-down Trends**: Added trend charts to entity drill-down modals
- **Complete Dataset Processing**: Trend charts now process entire filtered dataset, not just paginated results
- **Financial Value Tracking**: Proper numeric conversion for contract amounts in trend analysis

### Changed
- **Data Coverage**: Extended from 2013-2021 to 2013-2025 (13 years)
- **Performance**: Optimized search and analytics with DuckDB integration
- **User Experience**: Enhanced drill-down modals with embedded trend charts
- **Documentation**: Complete data pipeline documentation and maintenance guides
- **Code Quality**: Cleaned up scripts directory and improved code organization
- **Frontend Components**: Updated `QuarterlyTrendsChart` to limit year range to 2027
- **Analytics Controls**: Updated year range generation to include 2013-2027
- **Data Explorer**: Updated year options to include 2013-2027
- **Entity Drill-down Modal**: Added trend chart integration with complete data processing
- **Backend Services**: Updated `parquet_service.py` to handle singular entity types
- **Search Services**: Fixed DuckDB date casting issues in `parquet_search.py`

### Fixed
- **String Concatenation**: Fixed trend chart data processing to properly convert contract amounts to numbers
- **Pagination Issues**: Fixed trend chart to use all filtered contracts instead of just paginated results
- **Date Formatting**: Fixed Excel serial date conversion issues in 2013-2020 data
- **API Compatibility**: Fixed backend to handle both singular and plural entity types
- **DuckDB Errors**: Fixed date casting and extraction errors in search queries
- **Data Type Issues**: Fixed string to numeric conversion in trend analysis

### Removed
- **Debug Information**: Removed console logs and debug panels from production code
- **Temporary Files**: Cleaned up analysis scripts, test files, and old backup files
- **Legacy Scripts**: Archived unused scripts to `scripts/archive/` directory
- **Quarterly Raw Files**: Cleaned up redundant quarterly raw data files (1.2GB freed)

### Technical Details
- **Total Records**: 15,451,722 government procurement records
- **Awarded Contracts**: 4,993,608 contracts with financial values
- **Total Value**: ₱14,838,640,444,850 (₱14.8T+)
- **File Sizes**: 2.6GB consolidated dataset, 1.1GB clean awarded contracts
- **Aggregation Files**: 225+ parquet files for fast analytics
- **Data Sources**: PhilGEPS XLSX (2013-2020) + CSV (2021-2025) + Flood Control
- **Columns**: 50 columns in consolidated dataset (44 original + 6 new)

## [3.0.0] - 2024-12-31

### Added
- **Initial Release**: Basic PhilGEPS Dashboard functionality
- **Data Explorer**: Entity-first analysis by contractors, organizations, areas, business categories
- **Advanced Search**: Multi-dimensional search with keyword matching and date filtering
- **Analytics**: Contract analysis and performance metrics
- **Dark/Light Mode**: Theme toggle functionality
- **Responsive Design**: Mobile and desktop compatibility
- **Django Backend**: RESTful API with DuckDB integration
- **React Frontend**: Modern React 18 with TypeScript
- **Data Processing**: Initial XLSX to Parquet conversion pipeline
- **Documentation**: Basic project documentation and setup guides

### Technical Details
- **Data Coverage**: 2013-2021 (9 years)
- **Records**: ~8.9M records from XLSX files
- **Columns**: 44 columns from original XLSX structure
- **File Format**: Parquet files for efficient analytics
- **Search**: Basic full-text search functionality
- **API**: Django REST Framework endpoints
- **Frontend**: React with Styled Components

---

## Version History

- **v3.0.2** (2025-01-02): Data clarity and documentation improvements
- **v3.0.1** (2025-01-01): Enhanced analytics, complete data rebuild, trend charts
- **v3.0.0** (2024-12-31): Major release with comprehensive features

## Contributing

When adding new features or making changes, please update this changelog following the format above.

### Changelog Format
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

**Last Updated**: January 2, 2025  
**Maintainer**: PhilGEPS Dashboard Development Team
