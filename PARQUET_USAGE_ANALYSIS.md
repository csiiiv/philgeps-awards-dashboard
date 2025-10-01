# Parquet File Usage Analysis
**Date**: January 1, 2025  
**Purpose**: Analyze how parquet files are used throughout the codebase

## 📊 Executive Summary

This analysis examines how parquet files are used across the entire codebase, identifying which files are actively used, which are referenced but missing, and where the data flows through the application.

## 🔍 Key Findings

### ✅ **Actively Used Files**
- **Main consolidated file**: `all_contracts_consolidated.parquet` (50 columns)
- **Aggregation files**: All 4 aggregation files are actively used
- **Title optimized facts**: `facts_awards_title_optimized.parquet` (primary search file)
- **Flood control facts**: `facts_awards_flood_control.parquet` (specialized data)

### ❌ **Missing/Unused Files**
- **Quarterly/yearly aggregations**: Directories exist but are empty
- **Title search cache**: `title_search_cache.json` is missing
- **Some optimized files**: Referenced but may not exist

## 📁 File Usage by Category

### 1. Main Consolidated File

#### **`all_contracts_consolidated.parquet`** ✅ **HEAVILY USED**
- **Location**: `data/processed/all_contracts_consolidated.parquet`
- **Usage**: Primary data source for analysis and processing
- **Columns**: 50 (enhanced with 6 new columns)
- **Records**: 6,523,765

**Used in:**
- `rebuild_parquet_with_new_data.py` - Main rebuild script
- `test_parquet_rebuild.py` - Testing scripts
- `analyze_*.py` scripts - Data analysis scripts
- Various analysis and comparison scripts

**API Usage**: Not directly used in API endpoints (processed data is used instead)

### 2. Aggregation Files

#### **`agg_area.parquet`** ✅ **ACTIVELY USED**
- **Location**: `data/parquet/agg_area.parquet`
- **Usage**: Area-based analytics and dashboard
- **Records**: 520
- **Columns**: 9

**Used in:**
- `backend/django/data_processing/parquet_service.py` - Main API service
- `scripts/core/generate_unified_parquet_data.py` - Data generation
- `scripts/core/create_global_totals.py` - Global totals generation

#### **`agg_business_category.parquet`** ✅ **ACTIVELY USED**
- **Location**: `data/parquet/agg_business_category.parquet`
- **Usage**: Business category analytics
- **Records**: 169
- **Columns**: 9

**Used in:**
- `backend/django/data_processing/parquet_service.py` - Main API service
- `scripts/core/generate_unified_parquet_data.py` - Data generation
- `scripts/core/create_global_totals.py` - Global totals generation

#### **`agg_contractor.parquet`** ✅ **ACTIVELY USED**
- **Location**: `data/parquet/agg_contractor.parquet`
- **Usage**: Contractor analytics and dashboard
- **Records**: 73,994
- **Columns**: 9

**Used in:**
- `backend/django/data_processing/parquet_service.py` - Main API service
- `scripts/core/generate_unified_parquet_data.py` - Data generation
- `scripts/core/create_global_totals.py` - Global totals generation

#### **`agg_organization.parquet`** ✅ **ACTIVELY USED**
- **Location**: `data/parquet/agg_organization.parquet`
- **Usage**: Organization analytics and dashboard
- **Records**: 13,943
- **Columns**: 9

**Used in:**
- `backend/django/data_processing/parquet_service.py` - Main API service
- `scripts/core/generate_unified_parquet_data.py` - Data generation
- `scripts/core/create_global_totals.py` - Global totals generation

### 3. Fact Tables

#### **`facts_awards_title_optimized.parquet`** ✅ **PRIMARY SEARCH FILE**
- **Location**: `data/parquet/facts_awards_title_optimized.parquet`
- **Usage**: Primary file for search operations
- **Records**: 2,208,185
- **Columns**: 14 (optimized for search)

**Used in:**
- `backend/django/contracts/parquet_search.py` - Main search service
- `backend/django/contracts/parquet_search_optimized.py` - Optimized search
- `scripts/optimize_title_search.py` - Search optimization
- `scripts/optimize_analytics_performance.py` - Analytics optimization
- `scripts/implement_performance_optimizations.py` - Performance optimization

#### **`facts_awards_flood_control.parquet`** ✅ **SPECIALIZED DATA**
- **Location**: `data/parquet/facts_awards_flood_control.parquet`
- **Usage**: Flood control specific data
- **Records**: 9,855
- **Columns**: 43

**Used in:**
- `backend/django/data_processing/parquet_service.py` - API service
- `backend/django/contracts/parquet_search.py` - Search service
- `scripts/cleanup_old_parquet_files.py` - File management

### 4. Quarterly Files

#### **Quarterly Files** ⚠️ **PARTIALLY USED**
- **Location**: `data/processed/` (36 files)
- **Usage**: Time-based analysis
- **Records**: Varies by quarter
- **Columns**: 44 (original structure)

**Used in:**
- **Direct usage**: Limited direct usage in current codebase
- **Indirect usage**: Data is consolidated into main file
- **Note**: Files exist but are not actively used in API endpoints

### 5. Missing/Unused Files

#### **Quarterly Aggregations** ❌ **MISSING**
- **Expected Location**: `data/parquet/quarterly/`
- **Status**: Directory exists but empty
- **Expected Files**: 180 files
- **Actual Files**: 0

#### **Yearly Aggregations** ❌ **MISSING**
- **Expected Location**: `data/parquet/yearly/`
- **Status**: Directory exists but empty
- **Expected Files**: 45 files
- **Actual Files**: 0

#### **Title Search Cache** ❌ **MISSING**
- **Expected Location**: `data/parquet/title_search_cache.json`
- **Status**: File not found
- **Purpose**: Search performance optimization

## 🔄 Data Flow Analysis

### 1. **API Data Flow**
```
Frontend Request → Django API → ParquetDataService → Aggregation Files → Response
```

**Key Components:**
- **Entry Point**: `backend/django/data_processing/views.py`
- **Service Layer**: `backend/django/data_processing/parquet_service.py`
- **Data Source**: Aggregation files (`agg_*.parquet`)
- **Response**: Paginated entity data

### 2. **Search Data Flow**
```
Frontend Search → Django API → ParquetSearchService → Title Optimized File → Response
```

**Key Components:**
- **Entry Point**: `backend/django/contracts/views.py`
- **Service Layer**: `backend/django/contracts/parquet_search.py`
- **Data Source**: `facts_awards_title_optimized.parquet`
- **Response**: Search results with pagination

### 3. **Data Processing Flow**
```
Raw Data → Processing Scripts → Consolidated File → Aggregation Scripts → Aggregation Files
```

**Key Components:**
- **Raw Data**: CSV/XLSX files
- **Processing**: `rebuild_parquet_with_new_data.py`
- **Consolidated**: `all_contracts_consolidated.parquet`
- **Aggregation**: `scripts/core/generate_unified_parquet_data.py`
- **Output**: Aggregation files

## 📊 Usage Statistics

### **File Usage by Frequency**
| File Type | Usage Count | Status | Primary Use |
|-----------|-------------|---------|-------------|
| `agg_*.parquet` | 15+ references | ✅ Active | API endpoints |
| `facts_awards_title_optimized.parquet` | 25+ references | ✅ Active | Search operations |
| `facts_awards_flood_control.parquet` | 5+ references | ✅ Active | Specialized data |
| `all_contracts_consolidated.parquet` | 10+ references | ✅ Active | Data processing |
| Quarterly files | 0 references | ⚠️ Unused | Time analysis |
| Yearly files | 0 references | ❌ Missing | Long-term trends |
| Cache files | 0 references | ❌ Missing | Performance |

### **API Endpoint Usage**
| Endpoint | Data Source | File Type | Status |
|----------|-------------|-----------|---------|
| `/api/v1/data-processing/entities/` | Aggregation files | `agg_*.parquet` | ✅ Active |
| `/api/v1/contracts/search/` | Title optimized | `facts_awards_title_optimized.parquet` | ✅ Active |
| `/api/v1/contracts/contracts-by-entity/` | Title optimized | `facts_awards_title_optimized.parquet` | ✅ Active |
| `/parquet/<path>` | Static serving | All parquet files | ✅ Active |

## 🚨 Issues and Recommendations

### **Critical Issues**
1. **Missing Quarterly/Yearly Aggregations**: API expects these files but they don't exist
2. **Missing Search Cache**: Performance optimization file is missing
3. **Unused Quarterly Files**: 36 quarterly files exist but aren't used in API

### **Performance Issues**
1. **Search Performance**: Missing cache file may impact search speed
2. **Time-based Queries**: No quarterly/yearly aggregations for time-based analytics
3. **Data Redundancy**: Quarterly files duplicate data in consolidated file

### **Data Consistency Issues**
1. **Column Mismatch**: Quarterly files (44 columns) vs consolidated file (50 columns)
2. **Directory Structure**: Quarterly files in wrong location
3. **File Naming**: Inconsistent naming conventions

## ✅ Recommendations

### **Immediate Actions**
1. **Generate Missing Files**: Create quarterly and yearly aggregations
2. **Generate Search Cache**: Create `title_search_cache.json`
3. **Update API**: Modify API to use quarterly files for time-based queries
4. **Reorganize Files**: Move quarterly files to correct directory

### **Performance Improvements**
1. **Implement Caching**: Use search cache for better performance
2. **Optimize Queries**: Use appropriate files for different query types
3. **Reduce Redundancy**: Consider removing unused quarterly files

### **Data Management**
1. **Standardize Structure**: Ensure all files have consistent column structure
2. **Update Documentation**: Keep README in sync with actual usage
3. **Monitor Usage**: Track which files are actually used in production

## 📋 Summary

The parquet file usage analysis reveals a well-structured system with clear data flows, but several files are missing or unused. The core functionality works with aggregation files and title-optimized facts, but time-based analytics are limited due to missing quarterly/yearly aggregations.

**Key Takeaways:**
- **4 aggregation files** are actively used in API endpoints
- **1 title-optimized file** is the primary search data source
- **1 flood control file** provides specialized data
- **36 quarterly files** exist but are unused in API
- **0 yearly files** exist (missing)
- **0 cache files** exist (missing)

The system is functional but could be significantly improved by generating the missing files and optimizing the data flow.

---

**Analysis Completed**: January 1, 2025  
**Files Analyzed**: 50+ code files  
**Parquet Files**: 7 main files + 36 quarterly files  
**API Endpoints**: 4 main endpoints  
**Issues Found**: 3 critical issues


