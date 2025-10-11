# Parquet Data Directory

This directory contains optimized Parquet files for high-performance analytics and search operations in the PhilGEPS Dashboard.

## 📁 Directory Structure

```
parquet/
├── README.md                                    # This file - parquet data documentation
├── agg_area.parquet                            # Area aggregations (9 columns, 520 rows)
├── agg_business_category.parquet               # Business category aggregations (9 columns, 169 rows)
├── agg_contractor.parquet                      # Contractor aggregations (9 columns, 73,994 rows)
├── agg_organization.parquet                    # Organization aggregations (9 columns, 13,943 rows)
├── facts_awards_all_time.parquet               # All-time facts (44 columns, 2.2M+ rows)
├── facts_awards_flood_control.parquet          # Flood control facts (43 columns, 9,855 rows)
├── facts_awards_title_optimized.parquet        # Title optimized for search (14 columns, 2.2M+ rows)
├── quarterly/                                  # Quarterly aggregations (180 files)
│   └── year_YYYY_qN/                          # Quarterly data by year and quarter
└── yearly/                                     # Yearly aggregations (45 files)
    └── year_YYYY/                             # Yearly data by year
```

## 🎯 File Types and Purposes

### Aggregation Files (4 files)
Pre-computed aggregations for fast analytics and dashboard performance.

#### `agg_area.parquet` - Geographic Area Analytics
- **Size**: 520 rows, 9 columns
- **Purpose**: Fast analytics by delivery area/geographic region
- **Columns**: 
  - `entity` - Area name (e.g., "NCR", "CALABARZON", "Central Luzon")
  - `contract_count` - Total number of contracts
  - `category_count` - Number of business categories
  - `contractor_count` - Number of unique contractors
  - `organization_count` - Number of government organizations
  - `total_contract_value` - Sum of all contract values
  - `average_contract_value` - Average contract value
  - `first_contract_date` - Earliest contract date
  - `last_contract_date` - Latest contract date
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=area`

#### `agg_business_category.parquet` - Business Category Analytics
- **Size**: 169 rows, 9 columns
- **Purpose**: Fast analytics by business category/industry type
- **Columns**: Same structure as area aggregations
- **Categories**: Infrastructure, Goods, Services, Consulting, etc.
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=business_category`

#### `agg_contractor.parquet` - Contractor/Supplier Analytics
- **Size**: 73,994 rows, 9 columns
- **Purpose**: Fast analytics by contractor/supplier entities
- **Columns**: Same structure as area aggregations
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=contractor`

#### `agg_organization.parquet` - Government Organization Analytics
- **Size**: 13,943 rows, 9 columns
- **Purpose**: Fast analytics by government agency/organization
- **Columns**: Same structure as area aggregations
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=organization`

### Fact Tables (3 files)
Detailed contract data optimized for different use cases.

#### `facts_awards_all_time.parquet` - Complete Contract Data
- **Size**: 2.2M+ rows, 44 columns
- **Purpose**: Complete contract lifecycle data for comprehensive analysis
- **Structure**: Full 44-column schema with all contract details
- **Coverage**: 2013-2025 (all available data)
- **Usage**: Data processing, comprehensive analysis, data export

#### `facts_awards_title_optimized.parquet` - Search-Optimized Data
- **Size**: 2.2M+ rows, 14 columns
- **Purpose**: Fast title-based search and basic analytics
- **Columns**:
  - `contract_number` - Contract reference number
  - `award_date` - Date of award
  - `contract_amount` - Contract value
  - `award_title` - Award title
  - `notice_title` - Notice title
  - `search_text` - Combined searchable text
  - `award_title_lower` - Lowercase award title
  - `notice_title_lower` - Lowercase notice title
  - `title_combined_lower` - Combined lowercase titles
  - `title_words` - Array of searchable words
  - `awardee_name` - Contractor/supplier name
  - `organization_name` - Government organization
  - `business_category` - Business category
  - `area_of_delivery` - Delivery area
- **Optimizations**: Pre-computed search text, word arrays, lowercase variants
- **API Usage**: `/api/v1/contracts/search/`

#### `facts_awards_flood_control.parquet` - Flood Control Projects
- **Size**: 9,855 rows, 43 columns
- **Purpose**: Specialized dataset for flood control infrastructure projects
- **Source**: Sumbong sa Pangulo flood control projects (2022-2025)
- **Structure**: Complete 43-column schema with flood control specific data
- **Usage**: Flood control project analysis, specialized reporting

### Time-Based Aggregations

#### Quarterly Aggregations (`/quarterly/`)
- **Total Files**: 180 files (5 files per quarter × 36 quarters)
- **Coverage**: 2013-2021 (all quarters)
- **Structure**: Each quarter has 5 files:
  - `agg_area.parquet` - Area aggregations for the quarter
  - `agg_business_category.parquet` - Category aggregations for the quarter
  - `agg_contractor.parquet` - Contractor aggregations for the quarter
  - `agg_organization.parquet` - Organization aggregations for the quarter
  - `facts_awards_year_YYYY_qN.parquet` - Fact data for the quarter
- **API Usage**: `/api/v1/data-processing/entities/?time_range=quarterly&year=YYYY&quarter=N`

#### Yearly Aggregations (`/yearly/`)
- **Total Files**: 45 files (5 files per year × 9 years)
- **Coverage**: 2013-2021 (all years)
- **Structure**: Each year has 5 files:
  - `agg_area.parquet` - Area aggregations for the year
  - `agg_business_category.parquet` - Category aggregations for the year
  - `agg_contractor.parquet` - Contractor aggregations for the year
  - `agg_organization.parquet` - Organization aggregations for the year
  - `facts_awards_year_YYYY.parquet` - Fact data for the year
- **API Usage**: `/api/v1/data-processing/entities/?time_range=yearly&year=YYYY`

## 🚀 Performance Optimizations

### Parquet Format Benefits
- **Columnar Storage**: Efficient compression and fast column-based queries
- **Schema Evolution**: Support for schema changes over time
- **Cross-Platform**: Compatible with multiple data processing tools
- **Compression**: Significant storage space savings

### Search Optimizations
- **Pre-computed Search Text**: Combined searchable text for fast full-text search
- **Word Arrays**: Tokenized words for efficient word-based searching
- **Lowercase Variants**: Pre-computed lowercase versions for case-insensitive search
- **Indexed Columns**: Optimized column selection for search operations

### Aggregation Benefits
- **Pre-computed Metrics**: Counts, totals, averages calculated in advance
- **Fast Queries**: Sub-second response times for dashboard analytics
- **Reduced Processing**: No need to calculate aggregations at query time
- **Scalable**: Handles large datasets efficiently

## 🔧 Data Generation

### Source Files
- **Main Source**: `data/processed/all_contracts_consolidated.parquet`
- **Generation Script**: `scripts/core/generate_unified_parquet_data.py`
- **Optimization Scripts**: Various optimization scripts in `scripts/archive/`

### Generation Process
1. **Data Consolidation**: Raw data consolidated into main file
2. **Aggregation Generation**: Pre-compute aggregations by entity type
3. **Time-based Partitioning**: Generate quarterly and yearly aggregations
4. **Search Optimization**: Create search-optimized fact tables
5. **Validation**: Verify data integrity and completeness

## 📊 Data Coverage

### Time Periods
- **2013-2021**: Complete coverage with quarterly and yearly aggregations
- **2022-2025**: Data available but missing quarterly/yearly aggregations
- **Total Coverage**: 13 years of government procurement data

### Data Dimensions
- **Geographic Areas**: 520 unique delivery areas
- **Business Categories**: 169 different business categories
- **Contractors**: 73,994 unique contractor entities
- **Organizations**: 13,943 government organizations
- **Total Contracts**: 2.2M+ procurement contracts

## 🔍 Usage Examples

### API Endpoints
```bash
# Get area analytics
GET /api/v1/data-processing/entities/?entity_type=area

# Get contractor analytics for 2020
GET /api/v1/data-processing/entities/?entity_type=contractor&time_range=yearly&year=2020

# Search contracts by title
GET /api/v1/contracts/search/?q=construction&include_flood_control=true

# Get quarterly data for Q1 2019
GET /api/v1/data-processing/entities/?time_range=quarterly&year=2019&quarter=1
```

### Direct File Access
```python
import pandas as pd
import duckdb

# Load aggregation data
df = pd.read_parquet('data/parquet/agg_area.parquet')

# Query with DuckDB
conn = duckdb.connect()
result = conn.execute("""
    SELECT * FROM read_parquet('data/parquet/facts_awards_title_optimized.parquet')
    WHERE search_text LIKE '%construction%'
    LIMIT 100
""").fetchdf()
```

## 🧹 Maintenance

### File Management
- **Regular Updates**: Files regenerated when source data changes
- **Backup Strategy**: Original files backed up before regeneration
- **Cleanup**: Old optimization files cleaned up automatically
- **Validation**: Data integrity checks performed during generation

### Performance Monitoring
- **Query Performance**: Sub-second response times maintained
- **File Sizes**: Optimized for storage efficiency
- **Memory Usage**: Efficient memory usage for large datasets
- **Cache Management**: Search caches managed automatically

## 🔗 Related Documentation

- **Main Data Directory**: `../README.md`
- **Processed Data**: `../processed/README.md`
- **Raw Data**: `../raw/README.md`
- **API Documentation**: `../../backend/django/data_processing/`
- **Search Documentation**: `../../backend/django/contracts/`

---

**Last Updated**: January 1, 2025  
**Version**: v1.0.0 - Parquet Data Documentation

