# Parquet Data Directory

This directory contains optimized Parquet files for high-performance analytics and search operations in the PhilGEPS Dashboard.

## 📁 Directory Structure

```
static_data/
├── README.md                                    # This file - parquet data documentation
├── agg_area.parquet                            # Area aggregations (9 columns, 525 rows)
├── agg_business_category.parquet               # Business category aggregations (9 columns, 171 rows)
├── agg_contractor.parquet                      # Contractor aggregations (9 columns, 127,049 rows)
├── agg_organization.parquet                    # Organization aggregations (9 columns, 24,658 rows)
├── facts_awards_all_time.parquet               # All-time facts (20 columns, 5.5M+ rows)
└── facts_awards_title_optimized.parquet        # Title optimized for search (14 columns, 5.5M+ rows)
```

**Note**: Quarterly and yearly aggregations have been removed in favor of dynamic filtering in the application layer.

## 🎯 File Types and Purposes

### Aggregation Files (4 files)
Pre-computed aggregations for fast analytics and dashboard performance.

#### `agg_area.parquet` - Geographic Area Analytics
- **Size**: 525 rows, 9 columns
- **Purpose**: Fast analytics by delivery area/geographic region
- **Source**: Generated from `all-awarded-frontend-compressed.parquet`
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
- **Size**: 171 rows, 9 columns
- **Purpose**: Fast analytics by business category/industry type
- **Source**: Generated from `all-awarded-frontend-compressed.parquet`
- **Columns**: Same structure as area aggregations
- **Categories**: Infrastructure, Goods, Services, Consulting, etc.
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=business_category`
#### `agg_contractor.parquet` - Contractor/Supplier Analytics
- **Size**: 127,049 rows, 9 columns
- **Purpose**: Fast analytics by contractor/supplier entities
- **Source**: Generated from `all-awarded-frontend-compressed.parquet`
- **Columns**: Same structure as area aggregations
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=contractor`
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=contractor`
#### `agg_organization.parquet` - Government Organization Analytics
- **Size**: 24,658 rows, 9 columns
- **Purpose**: Fast analytics by government agency/organization
- **Source**: Generated from `all-awarded-frontend-compressed.parquet`
- **Columns**: Same structure as area aggregations
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=organization`
- **API Usage**: `/api/v1/data-processing/entities/?entity_type=organization`

### Fact Tables (3 files)
#### `facts_awards_all_time.parquet` - Complete Contract Data
- **Size**: 5.5M+ rows, 20 columns
- **Purpose**: Complete contract lifecycle data for comprehensive analysis
- **Source**: Generated from `all-awarded-frontend-compressed.parquet`
- **Structure**: Core contract data with compatibility fields
- **Coverage**: 2001-2025+ (all available data from PhilGEPS)
- **Usage**: Data processing, comprehensive analysis, data export

#### `facts_awards_title_optimized.parquet` - Search-Optimized Data
- **Size**: 5.5M+ rows, 14 columns
- **Purpose**: Fast title-based search and basic analytics
- **Source**: Generated from `all-awarded-frontend-compressed.parquet`ized Data
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
### Removed Files

The following files have been removed in this version:
- **`facts_awards_flood_control.parquet`**: Flood control data is now integrated into the main dataset
- **Quarterly/Yearly subdirectories**: Time-based filtering is now handled dynamically in the application layer
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
### Source Files
- **Main Source**: `data/all-awarded-frontend-compressed.parquet` (398 MB, 5.5M+ records)
- **Generation Script**: `scripts/rebuild_static_data_from_compressed.py`
- **Column Mapping**:
  - `contract_no` → `contract_number`
  - `awardee_name` → contractor entity
  - `procuring_entity` → `organization_name`
  - All other core fields preserved
## 🔍 Usage Examples

### API Endpoints
```bash
# Get area analytics
GET /api/v1/data-processing/entities/?entity_type=area

### Time Periods
- **2001-2025+**: Complete coverage of PhilGEPS data
- **Total Coverage**: 24+ years of government procurement data

### Data Dimensions
- **Geographic Areas**: 525 unique delivery areas
- **Business Categories**: 171 different business categories
- **Contractors**: 127,049 unique contractor entities
- **Organizations**: 24,658 government organizations
- **Total Contracts**: 5.5M+ procurement contracts
- **Total Value**: ₱16.96 trillion in contract awards
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

---

**Last Updated**: November 13, 2025  
**Version**: v2.0.0 - Rebuilt from compressed source data  
**Data Source**: `all-awarded-frontend-compressed.parquet`