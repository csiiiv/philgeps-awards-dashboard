# Quarterly Aggregations Directory

This directory contains quarterly aggregated data files optimized for time-based analytics and dashboard performance.

## 📁 Directory Structure

```
quarterly/
├── README.md                                    # This file - quarterly data documentation
├── year_2013_q1/                               # Q1 2013 data (5 files)
│   ├── agg_area.parquet
│   ├── agg_business_category.parquet
│   ├── agg_contractor.parquet
│   ├── agg_organization.parquet
│   └── facts_awards_year_2013_q1.parquet
├── year_2013_q2/                               # Q2 2013 data (5 files)
│   └── [same structure as Q1]
├── ...                                         # Additional quarters
└── year_2021_q2/                               # Q2 2021 data (5 files)
    └── [same structure as Q1]
```

## 🎯 Overview

### Total Files
- **Total Quarters**: 36 quarters (2013 Q1 - 2021 Q2)
- **Files per Quarter**: 5 files
- **Total Files**: 180 files
- **Coverage**: 2013-2021 (9 years, 36 quarters)

### File Types per Quarter
Each quarter contains 5 optimized files:

1. **`agg_area.parquet`** - Area aggregations for the quarter
2. **`agg_business_category.parquet`** - Business category aggregations for the quarter
3. **`agg_contractor.parquet`** - Contractor aggregations for the quarter
4. **`agg_organization.parquet`** - Organization aggregations for the quarter
5. **`facts_awards_year_YYYY_qN.parquet`** - Fact data for the quarter

## 📊 Data Structure

### Aggregation Files (4 per quarter)
Each aggregation file contains 9 columns with pre-computed metrics:

| Column | Description |
|--------|-------------|
| `entity` | Entity name (area, category, contractor, or organization) |
| `contract_count` | Total number of contracts |
| `category_count` | Number of business categories |
| `contractor_count` | Number of unique contractors |
| `organization_count` | Number of government organizations |
| `total_contract_value` | Sum of all contract values |
| `average_contract_value` | Average contract value |
| `first_contract_date` | Earliest contract date in the quarter |
| `last_contract_date` | Latest contract date in the quarter |

### Fact Files (1 per quarter)
Each fact file contains the complete contract data for the quarter:

- **Structure**: 44 columns (complete contract schema)
- **Purpose**: Detailed contract data for the specific quarter
- **Usage**: Detailed analysis, contract-level queries
- **Coverage**: All contracts awarded in the quarter

## 🚀 Performance Benefits

### Pre-computed Aggregations
- **Fast Queries**: Sub-second response times for quarterly analytics
- **Reduced Processing**: No need to calculate aggregations at query time
- **Efficient Storage**: Optimized Parquet format with compression
- **Scalable**: Handles large datasets efficiently

### Time-based Partitioning
- **Quarterly Granularity**: Detailed quarterly breakdowns
- **Efficient Filtering**: Fast time-based filtering
- **Trend Analysis**: Easy quarterly trend analysis
- **Comparative Analysis**: Quarter-over-quarter comparisons

## 🔍 Usage Examples

### API Endpoints
```bash
# Get quarterly data for Q1 2019
GET /api/v1/data-processing/entities/?time_range=quarterly&year=2019&quarter=1

# Get area analytics for Q2 2020
GET /api/v1/data-processing/entities/?entity_type=area&time_range=quarterly&year=2020&quarter=2

# Get contractor analytics for Q3 2018
GET /api/v1/data-processing/entities/?entity_type=contractor&time_range=quarterly&year=2018&quarter=3
```

### Direct File Access
```python
import pandas as pd
import duckdb

# Load quarterly aggregation data
df = pd.read_parquet('data/parquet/quarterly/year_2019_q1/agg_area.parquet')

# Query quarterly facts data
conn = duckdb.connect()
result = conn.execute("""
    SELECT 
        organization_name,
        COUNT(*) as contract_count,
        SUM(contract_amount) as total_value
    FROM read_parquet('data/parquet/quarterly/year_2019_q1/facts_awards_year_2019_q1.parquet')
    GROUP BY organization_name
    ORDER BY total_value DESC
    LIMIT 10
""").fetchdf()
```

### Quarterly Trend Analysis
```python
# Analyze quarterly trends
quarters = ['2019_q1', '2019_q2', '2019_q3', '2019_q4']
trend_data = []

for quarter in quarters:
    df = pd.read_parquet(f'data/parquet/quarterly/year_{quarter}/agg_area.parquet')
    total_value = df['total_contract_value'].sum()
    contract_count = df['contract_count'].sum()
    trend_data.append({
        'quarter': quarter,
        'total_value': total_value,
        'contract_count': contract_count
    })

trend_df = pd.DataFrame(trend_data)
```

## 📈 Data Coverage

### Time Period Coverage
- **2013 Q1 - 2021 Q2**: Complete quarterly coverage
- **Total Quarters**: 36 quarters
- **Missing Data**: 2021 Q3-Q4 and 2022-2025 quarters not generated
- **Data Source**: PhilGEPS Excel files (2013-2021)

### Geographic Coverage
- **Areas**: 520+ unique delivery areas per quarter
- **Regions**: All 17 regions of the Philippines
- **Provinces**: Comprehensive provincial coverage
- **Cities/Municipalities**: Detailed local government coverage

### Business Coverage
- **Categories**: 169+ business categories per quarter
- **Contractors**: 73,994+ unique contractor entities
- **Organizations**: 13,943+ government organizations
- **Contract Types**: Various procurement modes and types

## 🔧 Data Generation

### Source Files
- **Main Source**: `data/processed/all_contracts_consolidated.parquet`
- **Generation Script**: `scripts/core/generate_unified_parquet_data.py`
- **Processing**: Quarterly data extracted and aggregated

### Generation Process
1. **Data Extraction**: Extract quarterly data from main consolidated file
2. **Aggregation Generation**: Pre-compute aggregations by entity type
3. **Fact File Creation**: Create quarterly fact files
4. **Validation**: Verify data integrity and completeness
5. **Optimization**: Optimize files for performance

## 📊 Sample Data

### Area Aggregation Sample (Q1 2019)
```
entity                    contract_count  total_contract_value  average_contract_value
NCR                      1,234           45,678,900.00        37,017.42
CALABARZON              987              32,456,700.00        32,884.20
Central Luzon           876              28,901,200.00        32,992.69
Central Visayas         654              21,345,600.00        32,638.53
Davao Region            543              18,765,400.00        34,558.75
```

### Business Category Sample (Q1 2019)
```
entity                    contract_count  total_contract_value  average_contract_value
Infrastructure          2,345           89,456,700.00        38,147.42
Goods                   1,876            45,678,900.00        24,350.00
Services                1,543            32,456,700.00        21,045.00
Consulting              876               18,765,400.00        21,422.00
```

## 🧹 Maintenance

### File Management
- **Regular Updates**: Files regenerated when source data changes
- **Backup Strategy**: Original files backed up before regeneration
- **Cleanup**: Old files cleaned up automatically
- **Validation**: Data integrity checks performed during generation

### Performance Monitoring
- **Query Performance**: Sub-second response times maintained
- **File Sizes**: Optimized for storage efficiency
- **Memory Usage**: Efficient memory usage for large datasets
- **Cache Management**: Search caches managed automatically

## 🚨 Current Limitations

### Missing Quarters
- **Issue**: 2021 Q3-Q4 and 2022-2025 quarters not generated
- **Impact**: API endpoints cannot provide quarterly analytics for recent years
- **Reality**: Only 2013-2021 Q1-Q2 aggregations exist
- **Solution**: Run aggregation scripts to generate missing quarters

### Data Source Limitations
- **Source**: Only PhilGEPS Excel data (2013-2021)
- **Missing**: CSV data (2021-2025) not included in quarterly aggregations
- **Impact**: Incomplete coverage for recent years
- **Solution**: Update processing pipeline to include CSV data

## 🔗 Related Documentation

- **Main Data Directory**: `../../README.md`
- **Parquet Data**: `../README.md`
- **Processed Data**: `../../processed/README.md`
- **Raw Data**: `../../raw/README.md`
- **API Documentation**: `../../../backend/django/data_processing/`

---

**Last Updated**: January 1, 2025  
**Version**: v1.0.0 - Quarterly Aggregations Documentation

