# Scripts Directory

This directory contains Python scripts for data processing, optimization, performance testing, and utility functions for the PhilGEPS Dashboard.

## 📁 Directory Structure

### Core Scripts
- **`advanced_optimizations.py`** - Advanced performance optimization scripts
- **`cleanup_old_parquet_files.py`** - Cleanup script for old Parquet files
- **`generate_sample_data.py`** - Script to generate sample data for testing
- **`implement_performance_optimizations.py`** - Performance optimization implementation
- **`optimize_analytics_performance.py`** - Analytics performance optimization
- **`optimize_search_performance.py`** - Search performance optimization
- **`optimize_title_search.py`** - Title search optimization
- **`performance_comparison.py`** - Performance comparison and benchmarking
- **`rebuild_parquet_with_search_column.py`** - Rebuild Parquet files with search columns
- **`test_analytics_api.py`** - Analytics API testing script
- **`test_search_performance.py`** - Search performance testing

### Subdirectories

#### `/core/` - Core Utility Scripts
Essential utility scripts for data processing and system operations.

**Files:**
- **`config.py`** - Configuration management and settings
- **`create_global_totals.py`** - Create global totals and aggregations
- **`generate_unified_parquet_data.py`** - Generate unified Parquet data files
- **`process_xlsx_to_parquet_duckdb_basic_only.py`** - Process Excel to Parquet conversion

## 🎯 Script Categories

### Data Processing Scripts
Scripts for processing, cleaning, and transforming data.

#### Key Scripts
- **`advanced_optimizations.py`** - Comprehensive data optimization
- **`rebuild_parquet_with_search_column.py`** - Rebuild data with search optimization
- **`cleanup_old_parquet_files.py`** - Cleanup and maintenance
- **`generate_unified_parquet_data.py`** - Generate unified data files

#### Features
- Data cleaning and validation
- Format standardization
- Duplicate removal
- Data transformation
- Quality assurance

### Performance Optimization Scripts
Scripts for optimizing system performance and data access.

#### Key Scripts
- **`optimize_analytics_performance.py`** - Analytics performance tuning
- **`optimize_search_performance.py`** - Search performance optimization
- **`optimize_title_search.py`** - Title search specific optimization
- **`implement_performance_optimizations.py`** - General performance improvements

#### Features
- Query optimization
- Index creation
- Caching strategies
- Memory optimization
- Database tuning

### Testing and Validation Scripts
Scripts for testing functionality and validating data integrity.

#### Key Scripts
- **`test_analytics_api.py`** - Analytics API testing
- **`test_search_performance.py`** - Search performance testing
- **`performance_comparison.py`** - Performance benchmarking

#### Features
- API endpoint testing
- Performance benchmarking
- Data validation
- Error detection
- Regression testing

### Utility Scripts
General-purpose utility scripts for common operations.

#### Key Scripts
- **`generate_sample_data.py`** - Sample data generation
- **`create_global_totals.py`** - Create global data totals
- **`process_xlsx_to_parquet_duckdb_basic_only.py`** - Excel to Parquet conversion

#### Features
- File operations
- Data conversion
- Configuration management
- Logging utilities
- System maintenance

## 🔧 Usage

### Running Scripts
```bash
# Navigate to scripts directory
cd scripts

# Run a specific script
python script_name.py

# Run with specific parameters
python script_name.py --parameter value

# Run in background
nohup python script_name.py > output.log 2>&1 &
```

### Common Script Patterns
```bash
# Data processing
python advanced_optimizations.py --input data/raw --output data/processed

# Performance testing
python test_search_performance.py --iterations 100

# Cleanup operations
python cleanup_old_parquet_files.py --older-than 30

# Generate sample data
python generate_sample_data.py --count 1000 --output data/sample
```

## 📊 Performance Scripts

### Analytics Performance
- **`optimize_analytics_performance.py`** - Optimize analytics queries and aggregations
- **`test_analytics_api.py`** - Test analytics API performance

### Search Performance
- **`optimize_search_performance.py`** - Optimize search functionality
- **`optimize_title_search.py`** - Optimize title-based search
- **`test_search_performance.py`** - Test search performance

### General Performance
- **`performance_comparison.py`** - Compare performance before/after optimizations
- **`implement_performance_optimizations.py`** - Apply performance improvements

## 🛠️ Development Guidelines

### Script Structure
- **Documentation** - Comprehensive docstrings and comments
- **Error Handling** - Proper error handling and logging
- **Configuration** - Configurable parameters and options
- **Logging** - Detailed logging for debugging and monitoring

### Best Practices
- **Modularity** - Break complex operations into smaller functions
- **Reusability** - Design scripts for reuse across different scenarios
- **Testing** - Include test cases and validation
- **Documentation** - Document usage and parameters

### Performance Considerations
- **Memory Usage** - Optimize memory usage for large datasets
- **Processing Time** - Minimize processing time where possible
- **Resource Management** - Proper resource cleanup and management
- **Monitoring** - Include performance monitoring and metrics

## 📝 Script Documentation

Each script includes:
- **Purpose** - Clear description of what the script does
- **Parameters** - Command-line parameters and options
- **Usage Examples** - Examples of how to use the script
- **Dependencies** - Required dependencies and packages
- **Output** - Description of output files and results
- **Error Handling** - Error conditions and handling

## 🔒 Security Considerations

- **Data Privacy** - No sensitive data exposed in scripts
- **Access Control** - Scripts run with appropriate permissions
- **Input Validation** - All inputs validated and sanitized
- **Error Handling** - Secure error handling without information leakage

---

**Last Updated**: January 28, 2025  
**Version**: v3.0.1 - Clean Scripts Documentation