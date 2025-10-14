# PhilGEPS Data Pipeline Documentation

This document provides a comprehensive overview of the complete data pipeline, from raw data sources through all processing steps to final outputs and their usage in the codebase.

## 📊 **Data Pipeline Overview**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                RAW DATA SOURCES                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 2013-2020 XLSX Files          │ 2021-2025 CSV Files          │ Flood Control   │
│ data/raw/PHILGEPS 2013-2021/  │ data/raw/PHILGEPS -- 2021-2025/ │ data/raw/SSP/ │
│ ~8.9M records, 44 columns     │ ~2.2M records, 47 columns    │ Specialized     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATA PROCESSING SCRIPTS                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│ process_xlsx_to_parquet_duckdb_basic_only.py  │ rebuild_step_by_step.py        │
│ • Convert XLSX to Parquet                     │ • Complete data rebuild        │
│ • Standardize headers (row 3)                 │ • Process both XLSX + CSV      │
│ • Deduplication & cleaning                    │ • Combine datasets             │
│ • Generate unique reference IDs               │ • Add system fields            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              INTERMEDIATE FILES                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Quarterly Raw Files (data/processed/*_Q*_contracts.parquet)                    │
│ • 36 quarterly files, 44 columns each                                         │
│ • ~1.2GB total size                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CONSOLIDATED DATA                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ all_contracts_consolidated.parquet                                             │
│ • 6.5M records, 50 columns                                                    │
│ • 2.8GB file size                                                             │
│ • Complete 2013-2025 dataset                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATA QUALITY & CLEANING                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│ fix_date_formats.py                    │ generate_clean_awarded_contracts.py   │
│ • Fix Excel serial dates               │ • Filter awarded contracts only       │
│ • Convert to proper date format        │ • contract_amount > 0                │
│ • Handle multiple date columns         │ • 2.48M records                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AGGREGATION GENERATION                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ generate_unified_parquet_data.py       │ regenerate_optimized_files.py        │
│ • Generate all aggregations            │ • Regenerate optimized files          │
│ • All-time, yearly, quarterly          │ • facts_awards_all_time.parquet      │
│ • 225+ parquet files total             │ • facts_awards_title_optimized.parquet│
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FINAL PARQUET FILES                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│ data/parquet/                                                                  │
│ ├── agg_*.parquet (4 files)           │ ├── yearly/ (45 files)                │
│ ├── facts_awards_*.parquet (3 files)  │ └── quarterly/ (180 files)            │
│ └── global_totals.json (1 file)       │                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            API & DASHBOARD USAGE                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Django API (backend/)                  │ React Dashboard (frontend/)           │
│ ├── parquet_service.py                 │ ├── Analytics Components             │
│ ├── parquet_search.py                  │ ├── Search Components                │
│ └── views.py                          │ └── Data Services                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🗂️ **Raw Data Sources**

### **2013-2020 XLSX Files**
- **Location**: `data/raw/PHILGEPS 2013-2021/`
- **Format**: Excel (.xlsx) files
- **Structure**: Quarterly files with 44 columns
- **Volume**: ~8.9M records
- **Processing**: `process_xlsx_to_parquet_duckdb_basic_only.py`

### **2021-2025 CSV Files**
- **Location**: `data/raw/PHILGEPS -- 2021-2025 (CSV)/`
- **Format**: CSV files (one per year)
- **Structure**: 47 columns (3 additional columns)
- **Volume**: ~2.2M records
- **Processing**: `rebuild_step_by_step.py`

### **Flood Control Data**
- **Location**: `data/raw/SSP/`
- **Format**: Various formats
- **Purpose**: Specialized flood control contracts
- **Processing**: Integrated into main pipeline

## 🔄 **Data Processing Pipeline**

### **Stage 1: Initial Processing**

#### **Script**: `process_xlsx_to_parquet_duckdb_basic_only.py`
- **Purpose**: Convert XLSX files to standardized Parquet format
- **Input**: Raw XLSX files (2013-2020)
- **Output**: Quarterly Parquet files in `data/processed/`
- **Features**:
  - Header standardization (row 3)
  - Column mapping to 44 standard columns
  - Deduplication (exact duplicates only)
  - Data cleaning and validation
  - Unique reference ID generation

#### **Script**: `rebuild_step_by_step.py`
- **Purpose**: Complete data rebuild and consolidation
- **Input**: Raw XLSX files + CSV files
- **Output**: `all_contracts_consolidated.parquet`
- **Process**:
  1. **Step 1**: Process 2013-2020 XLSX data
  2. **Step 2**: Process 2021-2025 CSV data
  3. **Step 3**: Combine both datasets
  4. **Step 4**: Cleanup temporary files

### **Stage 2: Data Quality & Formatting**

#### **Script**: `fix_date_formats.py`
- **Purpose**: Fix Excel serial date formatting issues
- **Input**: `all_contracts_consolidated.parquet`
- **Output**: `all_contracts_consolidated.parquet` (fixed)
- **Features**:
  - Convert Excel serial dates to proper date format
  - Handle multiple date columns
  - Preserve data integrity

#### **Script**: `generate_clean_awarded_contracts.py`
- **Purpose**: Generate clean awarded contracts dataset
- **Input**: `all_contracts_consolidated.parquet`
- **Output**: `clean_awarded_contracts_complete.parquet`
- **Filter**: Only contracts with `contract_amount > 0`
- **Purpose**: Master file for aggregation generation

### **Stage 3: Aggregation Generation**

#### **Script**: `generate_unified_parquet_data.py`
- **Purpose**: Generate all aggregation and facts files
- **Input**: `clean_awarded_contracts_complete.parquet`
- **Output**: Complete parquet file structure
- **Generates**:
  - **All-time aggregations**: `agg_*.parquet` files
  - **Yearly aggregations**: `data/parquet/yearly/year_YYYY/`
  - **Quarterly aggregations**: `data/parquet/quarterly/year_YYYY_qN/`
  - **Facts files**: `facts_awards_*.parquet`

#### **Script**: `regenerate_optimized_files.py`
- **Purpose**: Regenerate optimized files for dashboard
- **Input**: `all_contracts_consolidated.parquet`
- **Output**: Optimized parquet files
- **Generates**:
  - `facts_awards_all_time.parquet`
  - `facts_awards_title_optimized.parquet`

### **Stage 4: Maintenance & Cleanup**

#### **Script**: `cleanup_quarterly_raw_files.py`
- **Purpose**: Clean up redundant quarterly raw files
- **Input**: Quarterly files in `data/processed/`
- **Output**: Archived files in backup directory
- **Purpose**: Free up disk space (1.2GB+)

## 📁 **File Structure & Outputs**

### **Consolidated Data Files**
```
data/processed/
├── all_contracts_consolidated.parquet          # Main consolidated file (6.5M records, 50 columns)
├── clean_awarded_contracts_complete.parquet    # Clean awarded contracts (2.48M records)
└── backup_quarterly_raw_*/                     # Archived quarterly files
```

### **Aggregation Files**
```
data/parquet/
├── agg_area.parquet                            # Area aggregations
├── agg_business_category.parquet               # Business category aggregations
├── agg_contractor.parquet                      # Contractor aggregations
├── agg_organization.parquet                    # Organization aggregations
├── facts_awards_all_time.parquet               # All-time facts
├── facts_awards_title_optimized.parquet        # Optimized for search
├── facts_awards_flood_control.parquet          # Flood control facts
├── yearly/                                     # Yearly aggregations (45 files)
│   └── year_YYYY/
│       ├── agg_*.parquet
│       └── facts_awards_year_YYYY.parquet
└── quarterly/                                  # Quarterly aggregations (180 files)
    └── year_YYYY_qN/
        ├── agg_*.parquet
        └── facts_awards_year_YYYY_qN.parquet
```

### **Generated Files**
```
data/generated/
└── global_totals.json                          # Global totals for percentages
```

## 🔗 **Codebase Usage**

### **Django API Usage**

#### **Parquet Service** (`backend/django/data_processing/parquet_service.py`)
- **Uses**: `agg_*.parquet` files, yearly/quarterly aggregations
- **Purpose**: Entity pagination and filtering
- **Endpoints**: `/api/analytics/entities/`

#### **Search Service** (`backend/django/contracts/parquet_search.py`)
- **Uses**: `facts_awards_title_optimized.parquet`, `facts_awards_all_time.parquet`
- **Purpose**: Full-text search functionality
- **Endpoints**: `/api/contracts/search/`

#### **Views** (`backend/django/philgeps_data_explorer/views.py`)
- **Uses**: All parquet files
- **Purpose**: Serve parquet files to frontend
- **Endpoints**: `/api/parquet/`

### **Frontend Usage**

#### **Analytics Components**
- **QuarterlyTrendsChart**: Uses aggregation data for trend visualization
- **AnalyticsControls**: Uses yearly/quarterly data for filtering
- **DataExplorer**: Uses all data for exploration interface

#### **Search Components**
- **AdvancedSearch**: Uses optimized facts files for search
- **EntityDrillDownModal**: Uses complete dataset for drill-down analysis

#### **Data Services**
- **AdvancedSearchService**: Calls Django API for search functionality
- **AnalyticsService**: Calls Django API for analytics data

## 🔄 **Complete Data Flow**

### **1. Raw Data Ingestion**
```
XLSX Files (2013-2020) → process_xlsx_to_parquet_duckdb_basic_only.py → Quarterly Parquet Files
CSV Files (2021-2025) → rebuild_step_by_step.py → Consolidated Data
```

### **2. Data Consolidation**
```
Quarterly Files + CSV Data → rebuild_step_by_step.py → all_contracts_consolidated.parquet
```

### **3. Data Quality & Cleaning**
```
Consolidated Data → fix_date_formats.py → Fixed Date Formats
Consolidated Data → generate_clean_awarded_contracts.py → Clean Awarded Contracts
```

### **4. Aggregation Generation**
```
Clean Data → generate_unified_parquet_data.py → All Aggregation Files
Clean Data → regenerate_optimized_files.py → Optimized Files
```

### **5. API & Dashboard Usage**
```
Aggregation Files → Django API → React Dashboard
Facts Files → Search API → Search Interface
```

## 🛠️ **Script Dependencies**

### **Core Dependencies**
- **DuckDB**: All data processing scripts
- **Pandas**: Data analysis and manipulation
- **Python 3.13**: Runtime environment

### **Script Execution Order**
1. `process_xlsx_to_parquet_duckdb_basic_only.py` (if processing XLSX)
2. `rebuild_step_by_step.py` (complete rebuild)
3. `fix_date_formats.py` (date formatting)
4. `generate_clean_awarded_contracts.py` (clean data)
5. `generate_unified_parquet_data.py` (aggregations)
6. `regenerate_optimized_files.py` (optimized files)
7. `cleanup_quarterly_raw_files.py` (cleanup)

## 📊 **Data Volume & Performance**

### **File Sizes**
- **Consolidated**: ~2.8GB (6.5M records, 50 columns)
- **Clean Awarded**: ~1.1GB (2.48M records)
- **Aggregations**: ~500MB total
- **Optimized Files**: ~200MB total

### **Processing Times**
- **XLSX Processing**: ~30-60 minutes
- **CSV Processing**: ~10-15 minutes
- **Aggregation Generation**: ~20-30 minutes
- **Optimization**: ~5-10 minutes

## 🔧 **Configuration**

### **Core Configuration** (`scripts/core/config.py`)
- **Years**: 2013-2025
- **Quarters**: 1-4
- **Chunk Size**: 200 records
- **File Paths**: Centralized configuration

### **Environment Variables**
- **Data Source**: `data/processed/clean_awarded_contracts_complete.parquet`
- **Output Directory**: `data/parquet/`
- **Log Directory**: `logs/`

## 🚀 **Usage Examples**

### **Complete Rebuild**
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

# 6. Cleanup (optional)
python scripts/cleanup_quarterly_raw_files.py --confirm
```

### **Maintenance Tasks**
```bash
# Regenerate aggregations only
python scripts/core/generate_unified_parquet_data.py

# Regenerate optimized files only
python scripts/regenerate_optimized_files.py

# Cleanup old files
python scripts/cleanup_quarterly_raw_files.py --confirm
```

## 📝 **Notes**

- **Data Integrity**: All scripts include backup creation before processing
- **Error Handling**: Comprehensive error handling and logging
- **Memory Management**: Chunked processing for large datasets
- **Validation**: Data quality checks at each stage
- **Documentation**: Each script includes comprehensive documentation

---

**Last Updated**: January 2, 2025  
**Version**: v1.0 - Complete Data Pipeline Documentation
