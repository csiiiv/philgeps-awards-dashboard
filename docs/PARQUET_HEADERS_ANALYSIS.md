# Parquet Headers Analysis for Data Restructuring

**Date:** November 7, 2025  
**Branch:** feature/data-restructuring  
**Purpose:** Document all required headers/columns for the 2000-2025 data reprocessing and quarterly breakdown implementation

---

## Executive Summary

This analysis identifies all column headers used by `parquet_service.py` and the current state of parquet files in `static_data/`. The goal is to ensure proper schema alignment when reprocessing raw data from 2000-2025 and implementing quarterly parquet breakdowns.

---

## Current File Structure

### Static Data Files (backend/django/static_data/)
Current parquet files in static_data:
- `agg_area.parquet`
- `agg_business_category.parquet`
- `agg_contractor.parquet`
- `agg_organization.parquet`
- `facts_awards_all_time.parquet`
- `facts_awards_flood_control.parquet`
- `facts_awards_title_optimized.parquet`

### Expected File Structure (data/parquet/)
Based on `parquet_service.py`, the expected directory structure is:
```
data/parquet/
├── agg_area.parquet
├── agg_business_category.parquet
├── agg_contractor.parquet
├── agg_organization.parquet
├── facts_awards_all_time.parquet
├── facts_awards_flood_control.parquet (optional)
├── facts_awards_title_optimized.parquet (optional)
├── yearly/
│   ├── year_2000/
│   │   ├── agg_area.parquet
│   │   ├── agg_business_category.parquet
│   │   ├── agg_contractor.parquet
│   │   ├── agg_organization.parquet
│   │   └── facts_awards_year_2000.parquet
│   ├── year_2001/
│   │   └── ...
│   └── ...
└── quarterly/
    ├── year_2000_q1/
    │   ├── agg_area.parquet
    │   ├── agg_business_category.parquet
    │   ├── agg_contractor.parquet
    │   ├── agg_organization.parquet
    │   └── facts_awards_year_2000_q1.parquet
    ├── year_2000_q2/
    │   └── ...
    └── ...
```

---

## Required Column Headers by File Type

### 1. Aggregation Files (agg_*.parquet)

These files aggregate data by entity type (contractor, area, organization, business_category).

#### **Required Columns (Standard Set):**
```python
[
    'entity',                   # STRING - The entity name (contractor, area, org, or category)
    'contract_count',          # INTEGER - Number of contracts
    'total_contract_value',    # DOUBLE - Sum of all contract amounts
    'average_contract_value',  # DOUBLE - Average contract amount
    'first_contract_date',     # DATE - Earliest contract date
    'last_contract_date'       # DATE - Latest contract date
]
```

#### **Entity-Specific Additional Columns:**

**agg_area.parquet:**
```python
[
    'entity',
    'contract_count',
    'category_count',          # INTEGER - Number of unique business categories
    'contractor_count',        # INTEGER - Number of unique contractors
    'organization_count',      # INTEGER - Number of unique organizations
    'total_contract_value',
    'average_contract_value',
    'first_contract_date',
    'last_contract_date'
]
```

**agg_business_category.parquet:**
```python
[
    'entity',
    'contract_count',
    'contractor_count',        # INTEGER - Number of unique contractors
    'total_contract_value',
    'average_contract_value',
    'first_contract_date',
    'last_contract_date',
    'organization_count',      # INTEGER - Number of unique organizations
    'area_count'              # INTEGER - Number of unique areas
]
```

**agg_contractor.parquet:**
```python
[
    'entity',
    'contract_count',
    'category_count',          # INTEGER - Number of unique business categories
    'total_contract_value',
    'average_contract_value',
    'first_contract_date',
    'last_contract_date',
    'organization_count',      # INTEGER - Number of unique organizations
    'area_count'              # INTEGER - Number of unique areas
]
```

**agg_organization.parquet:**
```python
[
    'entity',
    'contract_count',
    'category_count',          # INTEGER - Number of unique business categories
    'contractor_count',        # INTEGER - Number of unique contractors
    'total_contract_value',
    'average_contract_value',
    'first_contract_date',
    'last_contract_date',
    'area_count'              # INTEGER - Number of unique areas
]
```

---

### 2. Facts Files (facts_awards_*.parquet)

These files contain the raw contract award data.

#### **Required Columns (Core Set):**
```python
[
    'award_date',              # DATE - Date of contract award
    'awardee_name',           # STRING - Contractor/awardee name
    'business_category',      # STRING - Business category
    'organization_name',      # STRING - Procuring organization
    'area_of_delivery',       # STRING - Area of delivery
    'contract_amount',        # DOUBLE - Contract amount (must support CAST to DOUBLE)
    'award_title',            # STRING - Title of the award
    'notice_title',           # STRING - Notice title
    'contract_number',        # STRING - Unique contract identifier
    'search_text'             # STRING - Combined searchable text
]
```

#### **facts_awards_title_optimized.parquet (Additional Columns):**
```python
[
    'contract_number',
    'award_date',
    'contract_amount',
    'award_title',
    'notice_title',
    'search_text',
    'award_title_lower',       # STRING - Lowercase award title for search
    'notice_title_lower',      # STRING - Lowercase notice title for search
    'title_combined_lower',    # STRING - Combined lowercase titles
    'title_words',             # STRING/ARRAY - Tokenized title words
    'awardee_name',
    'organization_name',
    'business_category',
    'area_of_delivery'
]
```

---

## Column Mappings Used in parquet_service.py

### Entity Type to File Name Mapping
```python
entity_mapping = {
    'contractors': 'contractor',
    'contractor': 'contractor',
    'areas': 'area',
    'area': 'area',
    'organizations': 'organization',
    'organization': 'organization',
    'categories': 'business_category',
    'business_category': 'business_category'
}
```

### Dimension to Column Name Mapping
```python
dim_mapping = {
    'contractor': 'awardee_name',
    'area': 'area_of_delivery',
    'organization': 'organization_name',
    'category': 'business_category',
    'contractor_name': 'awardee_name',
    'area_of_delivery': 'area_of_delivery',
    'organization_name': 'organization_name',
    'business_category': 'business_category'
}
```

---

## SQL Queries and Column Usage

### 1. query_entities_paged()
**Used in:** Entity listings, search, and pagination

**Columns queried from agg_*.parquet:**
```sql
SELECT 
    entity,
    contract_count,
    total_contract_value,
    average_contract_value,
    first_contract_date,
    last_contract_date
FROM read_parquet('{parquet_file}')
WHERE contract_count > 0
  AND lower(entity) LIKE '%{search}%'
ORDER BY {sort_by} {sort_dir}
```

**Columns queried for custom time range (from facts_*.parquet):**
```sql
SELECT 
    {entity_col} as entity,
    COUNT(*) as contract_count,
    SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
    AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
    MIN(award_date) as first_contract_date,
    MAX(award_date) as last_contract_date
FROM read_parquet('{facts_file}')
WHERE award_date >= '{start_date}'
  AND award_date <= '{end_date}'
  AND {entity_col} IS NOT NULL
  AND {entity_col} != 'NULL'
  AND contract_amount IS NOT NULL
  AND contract_amount != 'NULL'
GROUP BY {entity_col}
```

### 2. query_related_entities()
**Used in:** Drill-down functionality

**Columns queried:**
```sql
SELECT
    {tgt_col} AS entity,
    COUNT(*) AS contract_count,
    SUM(CAST(contract_amount AS DOUBLE)) AS total_contract_value,
    AVG(CAST(contract_amount AS DOUBLE)) AS average_contract_value,
    MIN(award_date) AS first_contract_date,
    MAX(award_date) AS last_contract_date
FROM read_parquet('{facts_file}')
WHERE {src_col} = '{source_value}'
  AND {tgt_col} IS NOT NULL
  AND contract_amount IS NOT NULL
  AND contract_amount != 'NULL'
GROUP BY 1
```

### 3. query_contracts_by_entity()
**Used in:** Contract listings filtered by entity

**Columns queried:**
```sql
SELECT 
    award_date,
    awardee_name as contractor_name,
    business_category,
    organization_name,
    area_of_delivery,
    contract_amount AS contract_value,
    award_title,
    notice_title,
    contract_number as contract_no
FROM read_parquet('{facts_file}')
WHERE {filter_conditions}
ORDER BY {order_by}
```

---

## Critical Data Type Requirements

### 1. contract_amount
- **Must support:** `CAST(contract_amount AS DOUBLE)`
- **Reason:** Used in SUM() and AVG() aggregations
- **Requirement:** Store as DOUBLE or STRING that can be cast to DOUBLE
- **NULL handling:** Filter out NULL and 'NULL' string values

### 2. award_date
- **Type:** DATE or STRING in date format (YYYY-MM-DD)
- **Used in:** MIN(), MAX(), date range filtering
- **Requirement:** Must support date comparisons

### 3. entity
- **Type:** STRING
- **Used in:** WHERE, GROUP BY, LIKE searches
- **Requirement:** Case-insensitive search support

### 4. Counts (contract_count, contractor_count, etc.)
- **Type:** INTEGER
- **Used in:** Sorting, filtering (WHERE contract_count > 0)
- **Requirement:** Must be numeric

---

## Special Features and Considerations

### 1. Flood Control Data Support
- Optional file: `facts_awards_flood_control.parquet`
- When `include_flood_control=true`, data is combined using UNION ALL
- Must have identical schema to main facts file
- Aggregations combine both datasets

### 2. Title Optimization
- File: `facts_awards_title_optimized.parquet`
- Contains additional search-optimized columns
- Used for advanced title-based searches
- Includes lowercase and tokenized versions of titles

### 3. Search Text Column
- Present in facts files
- Used for full-text search across multiple fields
- Should contain concatenated searchable content

---

## Recommendations for Data Reprocessing

### 1. **Standardize Column Names**
All parquet files should use consistent naming:
- Use snake_case
- Use descriptive names matching the column mapping
- Avoid variations (e.g., always use `awardee_name`, not `contractor_name` in raw data)

### 2. **Implement Unified Schema per File Type**

**For all agg_*.parquet files, use this base schema:**
```python
{
    'entity': 'string',
    'contract_count': 'int64',
    'total_contract_value': 'float64',
    'average_contract_value': 'float64',
    'first_contract_date': 'date32',
    'last_contract_date': 'date32'
}
```

**For all facts_awards_*.parquet files, use this schema:**
```python
{
    'award_date': 'date32',
    'awardee_name': 'string',
    'business_category': 'string',
    'organization_name': 'string',
    'area_of_delivery': 'string',
    'contract_amount': 'float64',  # Changed from string to float64
    'award_title': 'string',
    'notice_title': 'string',
    'contract_number': 'string',
    'search_text': 'string'
}
```

### 3. **Quarterly Breakdown Structure**
Implement the following structure for quarterly data:

```
data/parquet/quarterly/
├── year_2000_q1/
│   ├── agg_area.parquet
│   ├── agg_business_category.parquet
│   ├── agg_contractor.parquet
│   ├── agg_organization.parquet
│   └── facts_awards_year_2000_q1.parquet
├── year_2000_q2/
│   └── ... (same structure)
├── ...
└── year_2025_q4/
    └── ... (same structure)
```

**Naming convention:**
- Quarterly facts: `facts_awards_year_{year}_q{quarter}.parquet`
- Quarterly aggs: `agg_{entity_type}.parquet` (inside year_YYYY_qQ folders)

### 4. **Data Quality Requirements**

**All files must:**
- Have no missing required columns
- Use consistent data types
- Handle NULL values appropriately:
  - Numeric fields: Use actual NULL or 0 (not string 'NULL')
  - String fields: Use empty string '' or NULL (not string 'NULL')
  - Date fields: Use NULL for missing dates (not string 'NULL')

**Specific requirements:**
- `contract_amount`: Must be numeric (float64), not string
- `award_date`: Must be proper date type or YYYY-MM-DD format
- `entity`: Must not be NULL in aggregation files
- All count fields: Must be non-negative integers

### 5. **Search Text Generation**
The `search_text` column should combine:
- `award_title`
- `notice_title`
- `awardee_name`
- `business_category`
- `organization_name`
- `area_of_delivery`

**Example:**
```python
search_text = ' '.join([
    str(award_title or ''),
    str(notice_title or ''),
    str(awardee_name or ''),
    str(business_category or ''),
    str(organization_name or ''),
    str(area_of_delivery or '')
]).lower().strip()
```

### 6. **Additional Counts for Aggregation Files**
Each entity type's aggregation file needs specific count columns:

- **agg_area.parquet:** Add `category_count`, `contractor_count`, `organization_count`
- **agg_business_category.parquet:** Add `contractor_count`, `organization_count`, `area_count`
- **agg_contractor.parquet:** Add `category_count`, `organization_count`, `area_count`
- **agg_organization.parquet:** Add `category_count`, `contractor_count`, `area_count`

These counts represent the number of unique entities in related dimensions.

---

## Data Processing Scripts to Update

Based on this analysis, the following scripts need to be updated:

1. **scripts/core/generate_unified_parquet_data.py**
   - Update to generate quarterly breakdowns
   - Ensure unified schema across all time periods
   - Add proper data type casting

2. **scripts/generate_clean_awarded_contracts.py**
   - Update column names to match schema
   - Ensure contract_amount is float64, not string
   - Generate proper search_text column

3. **scripts/core/create_global_totals.py**
   - Update to work with new quarterly structure
   - Ensure aggregations include all required count columns

4. **Any ETL scripts in scripts/core/**
   - Verify they output the correct schema
   - Add validation to check for required columns

---

## Validation Checklist

Before deploying reprocessed data, validate:

- [ ] All required columns are present in each file type
- [ ] Data types match the schema requirements
- [ ] No 'NULL' strings in numeric/date columns
- [ ] `contract_amount` can be cast to DOUBLE without errors
- [ ] Date fields are in proper format
- [ ] Quarterly files follow naming convention: `year_YYYY_qQ`
- [ ] All aggregation files have correct count columns for their entity type
- [ ] search_text is generated for all facts files
- [ ] Flood control file (if present) has identical schema to main facts file
- [ ] File paths match expected structure in `parquet_service.py`
- [ ] Test queries from `parquet_service.py` work on new data

---

## Next Steps

1. **Update data processing scripts** to generate unified schema
2. **Create validation script** to verify parquet schemas
3. **Reprocess raw data** from 2000-2025 with new schema
4. **Generate quarterly breakdowns** according to structure
5. **Update documentation** with new data structure
6. **Test all API endpoints** with new data structure
7. **Migrate static_data to data/parquet** directory structure

---

## Related Files

- `backend/django/data_processing/parquet_service.py` - Main service using these schemas
- `backend/django/data_processing/views.py` - API endpoints using the service
- `scripts/core/generate_unified_parquet_data.py` - Data generation script
- `scripts/README.md` - Data pipeline documentation
- `scripts/DATA_PIPELINE.md` - Detailed pipeline documentation

---

**Last Updated:** November 7, 2025  
**Branch:** feature/data-restructuring  
**Status:** Ready for implementation
