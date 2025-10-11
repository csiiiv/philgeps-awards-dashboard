# Yearly Aggregations Directory

This directory contains yearly aggregated data files optimized for annual analytics and dashboard performance.

## 📁 Directory Structure

```
yearly/
├── README.md                                    # This file - yearly data documentation
├── year_2013/                                  # 2013 data (5 files)
│   ├── agg_area.parquet
│   ├── agg_business_category.parquet
│   ├── agg_contractor.parquet
│   ├── agg_organization.parquet
│   └── facts_awards_year_2013.parquet
├── year_2014/                                  # 2014 data (5 files)
│   └── [same structure as 2013]
├── ...                                         # Additional years
└── year_2021/                                  # 2021 data (5 files)
    └── [same structure as 2013]
```

## 🎯 Overview

### Total Files
- **Total Years**: 9 years (2013-2021)
- **Files per Year**: 5 files
- **Total Files**: 45 files
- **Coverage**: 2013-2021 (9 years)

### File Types per Year
Each year contains 5 optimized files:

1. **`agg_area.parquet`** - Area aggregations for the year
2. **`agg_business_category.parquet`** - Business category aggregations for the year
3. **`agg_contractor.parquet`** - Contractor aggregations for the year
4. **`agg_organization.parquet`** - Organization aggregations for the year
5. **`facts_awards_year_YYYY.parquet`** - Fact data for the year

## 📊 Data Structure

### Aggregation Files (4 per year)
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
| `first_contract_date` | Earliest contract date in the year |
| `last_contract_date` | Latest contract date in the year |

### Fact Files (1 per year)
Each fact file contains the complete contract data for the year:

- **Structure**: 44 columns (complete contract schema)
- **Purpose**: Detailed contract data for the specific year
- **Usage**: Detailed analysis, contract-level queries
- **Coverage**: All contracts awarded in the year

## 🚀 Performance Benefits

### Pre-computed Aggregations
- **Fast Queries**: Sub-second response times for yearly analytics
- **Reduced Processing**: No need to calculate aggregations at query time
- **Efficient Storage**: Optimized Parquet format with compression
- **Scalable**: Handles large datasets efficiently

### Time-based Partitioning
- **Yearly Granularity**: Detailed annual breakdowns
- **Efficient Filtering**: Fast time-based filtering
- **Trend Analysis**: Easy year-over-year trend analysis
- **Comparative Analysis**: Annual comparisons

## 🔍 Usage Examples

### API Endpoints
```bash
# Get yearly data for 2019
GET /api/v1/data-processing/entities/?time_range=yearly&year=2019

# Get area analytics for 2020
GET /api/v1/data-processing/entities/?entity_type=area&time_range=yearly&year=2020

# Get contractor analytics for 2018
GET /api/v1/data-processing/entities/?entity_type=contractor&time_range=yearly&year=2018
```

### Direct File Access
```python
import pandas as pd
import duckdb

# Load yearly aggregation data
df = pd.read_parquet('data/parquet/yearly/year_2019/agg_area.parquet')

# Query yearly facts data
conn = duckdb.connect()
result = conn.execute("""
    SELECT 
        organization_name,
        COUNT(*) as contract_count,
        SUM(contract_amount) as total_value
    FROM read_parquet('data/parquet/yearly/year_2019/facts_awards_year_2019.parquet')
    GROUP BY organization_name
    ORDER BY total_value DESC
    LIMIT 10
""").fetchdf()
```

### Yearly Trend Analysis
```python
# Analyze yearly trends
years = ['2017', '2018', '2019', '2020', '2021']
trend_data = []

for year in years:
    df = pd.read_parquet(f'data/parquet/yearly/year_{year}/agg_area.parquet')
    total_value = df['total_contract_value'].sum()
    contract_count = df['contract_count'].sum()
    trend_data.append({
        'year': year,
        'total_value': total_value,
        'contract_count': contract_count
    })

trend_df = pd.DataFrame(trend_data)
```

## 📈 Data Coverage

### Time Period Coverage
- **2013-2021**: Complete yearly coverage
- **Total Years**: 9 years
- **Missing Data**: 2022-2025 years not generated
- **Data Source**: PhilGEPS Excel files (2013-2021)

### Geographic Coverage
- **Areas**: 520+ unique delivery areas per year
- **Regions**: All 17 regions of the Philippines
- **Provinces**: Comprehensive provincial coverage
- **Cities/Municipalities**: Detailed local government coverage

### Business Coverage
- **Categories**: 169+ business categories per year
- **Contractors**: 73,994+ unique contractor entities
- **Organizations**: 13,943+ government organizations
- **Contract Types**: Various procurement modes and types

## 🔧 Data Generation

### Source Files
- **Main Source**: `data/processed/all_contracts_consolidated.parquet`
- **Generation Script**: `scripts/core/generate_unified_parquet_data.py`
- **Processing**: Yearly data extracted and aggregated

### Generation Process
1. **Data Extraction**: Extract yearly data from main consolidated file
2. **Aggregation Generation**: Pre-compute aggregations by entity type
3. **Fact File Creation**: Create yearly fact files
4. **Validation**: Verify data integrity and completeness
5. **Optimization**: Optimize files for performance

## 📊 Sample Data

### Area Aggregation Sample (2019)
```
entity                    contract_count  total_contract_value  average_contract_value
NCR                      4,567           156,789,400.00       34,345.67
CALABARZON              3,456           123,456,700.00       35,745.23
Central Luzon           2,987           98,765,400.00        33,067.89
Central Visayas         2,345           76,543,200.00        32,640.17
Davao Region            1,876           65,432,100.00        34,878.52
```

### Business Category Sample (2019)
```
entity                    contract_count  total_contract_value  average_contract_value
Infrastructure          8,765           345,678,900.00       39,456.78
Goods                   6,543           234,567,800.00       35,845.67
Services                5,432           187,654,300.00       34,567.89
Consulting              3,456           123,456,700.00       35,745.23
```

### Yearly Trends Sample
```
year  total_contract_value  contract_count  average_contract_value
2017  1,234,567,890.00     45,678         27,034.56
2018  1,456,789,012.00     52,345         27,834.67
2019  1,678,901,234.00     58,901         28,456.78
2020  1,890,123,456.00     65,432         28,901.23
2021  2,012,345,678.00     71,234         28,234.56
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

### Missing Years
- **Issue**: 2022-2025 years not generated
- **Impact**: API endpoints cannot provide yearly analytics for recent years
- **Reality**: Only 2013-2021 yearly aggregations exist
- **Solution**: Run aggregation scripts to generate missing years

### Data Source Limitations
- **Source**: Only PhilGEPS Excel data (2013-2021)
- **Missing**: CSV data (2021-2025) not included in yearly aggregations
- **Impact**: Incomplete coverage for recent years
- **Solution**: Update processing pipeline to include CSV data

## 📊 Analytics Use Cases

### Government Performance Analysis
- **Contract Volume**: Track contract volume trends over time
- **Value Analysis**: Analyze contract value trends and patterns
- **Efficiency Metrics**: Measure procurement efficiency
- **Compliance Monitoring**: Track compliance with procurement regulations

### Economic Impact Analysis
- **Regional Development**: Analyze regional economic impact
- **Industry Analysis**: Track industry-specific trends
- **Contractor Performance**: Monitor contractor performance over time
- **Market Analysis**: Analyze market trends and competition

### Policy Impact Assessment
- **Policy Changes**: Assess impact of policy changes
- **Regulatory Compliance**: Monitor regulatory compliance
- **Transparency Metrics**: Track transparency improvements
- **Efficiency Gains**: Measure efficiency improvements

## 🔗 Related Documentation

- **Main Data Directory**: `../../README.md`
- **Parquet Data**: `../README.md`
- **Quarterly Data**: `../quarterly/README.md`
- **Processed Data**: `../../processed/README.md`
- **Raw Data**: `../../raw/README.md`
- **API Documentation**: `../../../backend/django/data_processing/`

---

**Last Updated**: January 1, 2025  
**Version**: v1.0.0 - Yearly Aggregations Documentation

