# Scripts Directory

This directory contains Python scripts for data processing, maintenance, and utility functions for the PhilGEPS Dashboard.

## 📚 **Documentation**

- **[DATA_PIPELINE.md](./DATA_PIPELINE.md)** - Complete data pipeline documentation from raw sources to final outputs
- **[README.md](./README.md)** - This file - Script directory overview and usage

## 🚀 **Quick Start**

### **Complete Data Rebuild**
```bash
# 1. Rebuild complete dataset
python scripts/rebuild_step_by_step.py

# 2. Fix date formats
python scripts/fix_date_formats.py

# 3. Generate clean awarded contracts
python scripts/generate_clean_awarded_contracts.py

# 4. Generate all aggregations
python scripts/core/generate_unified_parquet_data.py

# 5. Regenerate optimized files
python scripts/regenerate_optimized_files.py
```

### **Maintenance Tasks**
```bash
# Regenerate aggregations only
python scripts/core/generate_unified_parquet_data.py

# Cleanup old files
python scripts/cleanup_quarterly_raw_files.py --confirm
```

## 📁 Directory Structure

### Active Core Scripts
- **`cleanup_quarterly_raw_files.py`** - Clean up redundant quarterly raw data files
- **`fix_date_formats.py`** - Fix Excel serial date formatting issues
- **`generate_clean_awarded_contracts.py`** - Generate clean awarded contracts dataset
- **`rebuild_step_by_step.py`** - Robust step-by-step data rebuild process
- **`regenerate_optimized_files.py`** - Regenerate optimized parquet files

### Subdirectories

#### `/core/` - Core Utility Scripts
Essential utility scripts for data processing and system operations.

**Files:**
- **`config.py`** - Configuration management and settings
- **`create_global_totals.py`** - Create global totals and aggregations
- **`generate_unified_parquet_data.py`** - Generate unified Parquet data files
- **`process_xlsx_to_parquet_duckdb_basic_only.py`** - Process Excel to Parquet conversion

#### `/archive/` - Legacy Scripts
Old scripts that are no longer actively used but preserved for reference.

**Note:** These scripts were used during development and optimization phases but have been superseded by more efficient implementations. They are kept for historical reference and potential future use.

## 🎯 Script Categories

### Data Processing Scripts
Scripts for processing, cleaning, and transforming data.

#### Key Scripts
- **`rebuild_step_by_step.py`** - Complete data rebuild process
- **`generate_clean_awarded_contracts.py`** - Generate clean awarded contracts
- **`fix_date_formats.py`** - Fix Excel serial date issues
- **`generate_unified_parquet_data.py`** - Generate unified data files

#### Features
- Data cleaning and validation
- Format standardization
- Duplicate removal
- Data transformation
- Quality assurance

### Maintenance Scripts
Scripts for system maintenance and cleanup.

#### Key Scripts
- **`cleanup_quarterly_raw_files.py`** - Clean up redundant quarterly files
- **`regenerate_optimized_files.py`** - Regenerate optimized parquet files

#### Features
- File cleanup and organization
- Space optimization
- Data regeneration
- System maintenance

### Utility Scripts
General-purpose utility scripts for common operations.

#### Key Scripts
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