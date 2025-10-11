# Data Directory

This directory contains all data files for the PhilGEPS Dashboard, including raw data, processed data, and optimized Parquet files for fast analytics.

## 📁 Directory Structure

```
data/
├── README.md                                    # This file - comprehensive data documentation
├── predefinedFilters.json                       # Predefined filter configurations for dashboard
├── dashboard parquet data.7z                    # Compressed archive of dashboard data
├── raw csv-xlsx data.7z                         # Compressed archive of raw CSV/Excel data
├── raw parquet data.7z                          # Compressed archive of raw parquet data
├── parquet/                                     # Optimized Parquet files for fast analytics
│   ├── README.md                               # Parquet files documentation
│   ├── agg_*.parquet                           # Pre-aggregated data files (4 files)
│   ├── facts_awards_*.parquet                  # Fact tables (3 files)
│   ├── quarterly/                              # Quarterly aggregations (180 files)
│   │   └── year_YYYY_qN/                      # Quarterly data by year and quarter
│   ├── yearly/                                 # Yearly aggregations (45 files)
│   │   └── year_YYYY/                         # Yearly data by year
│   └── data/                                   # Nested parquet directory (legacy)
│       └── parquet/                           # Empty nested directory
├── processed/                                   # Processed and consolidated data files
│   ├── README.md                              # Processed data documentation
│   ├── all_contracts_consolidated.parquet     # Main consolidated file (50 columns, 6.5M+ records)
│   ├── awarded_contracts_consolidated_*.parquet # Awarded contracts variants (3 files)
│   └── facts_awards_flood_control.parquet     # Flood control specific data
└── raw/                                        # Original source data files
    ├── README.md                              # Raw data documentation
    ├── PHILGEPS 2013-2021/                    # Excel files from 2013-2021 (34 files)
    │   └── README.md                          # Excel data documentation
    ├── PHILGEPS -- 2021-2025 (CSV)/           # CSV files from 2021-2025 (5 files)
    │   └── README.md                          # CSV data documentation
    └── SSP/                                   # Sumbong sa Pangulo flood control data
        ├── README.md                          # SSP data documentation
        └── flood-control-projects.csv         # Flood control projects data
```

### `/parquet/` - Optimized Data Files
High-performance Parquet files optimized for fast analytics and search operations.

#### Aggregation Files
- **`agg_area.parquet`** - Pre-aggregated data by delivery area (9 columns, 520 rows)
  - **Columns**: entity, contract_count, category_count, contractor_count, organization_count, total_contract_value, average_contract_value, first_contract_date, last_contract_date
  - **Purpose**: Fast analytics by geographic area

- **`agg_business_category.parquet`** - Pre-aggregated data by business category (9 columns, 169 rows)
  - **Columns**: entity, contract_count, contractor_count, total_contract_value, average_contract_value, first_contract_date, last_contract_date, organization_count, area_count
  - **Purpose**: Fast analytics by business category

- **`agg_contractor.parquet`** - Pre-aggregated data by contractor (9 columns, 73,994 rows)
  - **Columns**: entity, contract_count, category_count, total_contract_value, average_contract_value, first_contract_date, last_contract_date, organization_count, area_count
  - **Purpose**: Fast analytics by contractor/supplier

- **`agg_organization.parquet`** - Pre-aggregated data by organization (9 columns, 13,943 rows)
  - **Columns**: entity, contract_count, category_count, contractor_count, total_contract_value, average_contract_value, first_contract_date, last_contract_date, area_count
  - **Purpose**: Fast analytics by government organization

#### Fact Tables
- **`facts_awards_flood_control.parquet`** - Flood control related awards data (43 columns, 9,855 rows)
  - **Columns**: Complete 43-column structure with flood control specific data
  - **Purpose**: Specialized dataset for flood control infrastructure projects
  - **Source**: Sumbong sa Pangulo flood control projects (2022-2025)

- **`facts_awards_title_optimized.parquet`** - Optimized awards data with search columns (14 columns, 2.2M+ rows)
  - **Columns**: contract_number, award_date, contract_amount, award_title, notice_title, search_text, award_title_lower, notice_title_lower, title_combined_lower, title_words, awardee_name, organization_name, business_category, area_of_delivery
  - **Purpose**: Fast title-based search and analytics
  - **Optimization**: Pre-computed search text and word arrays for efficient searching

#### Time-based Aggregations
- **`/quarterly/`** - Quarterly aggregated data (180 files)
  - **Coverage**: 2013-2021 (36 quarters)
  - **Structure**: 5 files per quarter (4 aggregation + 1 facts file)
  - **Files per quarter**: `agg_area.parquet`, `agg_business_category.parquet`, `agg_contractor.parquet`, `agg_organization.parquet`, `facts_awards_year_YYYY_qN.parquet`
  - **Purpose**: Time-based analytics and quarterly breakdowns
  - **API Usage**: Used by Django API endpoints for quarterly analytics
- **`/yearly/`** - Yearly aggregated data (45 files)
  - **Coverage**: 2013-2021 (9 years)
  - **Structure**: 5 files per year (4 aggregation + 1 facts file)
  - **Files per year**: `agg_area.parquet`, `agg_business_category.parquet`, `agg_contractor.parquet`, `agg_organization.parquet`, `facts_awards_year_YYYY.parquet`
  - **Purpose**: Annual analytics and yearly trends
  - **API Usage**: Used by Django API endpoints for yearly analytics

#### Quarterly Data Comparison
| Aspect | Raw Data Files | Aggregated Files |
|--------|----------------|------------------|
| **Location** | `data/processed/` | `data/parquet/quarterly/` |
| **Count** | 36 files | 180 files |
| **Structure** | 44 columns (raw data) | 5 files per quarter (aggregated) |
| **Purpose** | Data processing & analysis | API endpoints & analytics |
| **Coverage** | 2013-2021 Q1-Q2 | 2013-2021 (all quarters) |
| **Usage** | Backend processing | Frontend dashboard |

#### Cache Files
- **`title_search_cache.json`** - Search index cache for title-based searches
  - **Status**: Not used in current codebase
  - **Purpose**: Originally intended for search performance optimization
  - **Note**: File is created by optimization scripts but never loaded by the application
  - **Reality**: Search services use optimized parquet files instead of JSON caching

### `/processed/` - Processed Data Files
Cleaned and processed data files ready for analysis (39 files total, 34 quarterly files can be cleaned up).

#### Data Processing
- Cleaned and standardized data formats
- Removed duplicates and invalid entries
- Normalized data structures
- Added computed fields and metrics

#### Processed File Structure
- **Quarterly Raw Files** (36 files): `2013_Q1_contracts.parquet` through `2021_Q2_contracts.parquet`
  - **Location**: `data/processed/` directory
  - **Columns**: Complete 44-column raw data structure
  - **Purpose**: Time-based analysis and processing
  - **Format**: One file per quarter containing all contracts for that period
  - **Coverage**: 2013-2021 Q1-Q2 (2021 Q3-Q4 and 2022-2025 data only in consolidated file)
  - **Note**: These are raw data files; aggregated versions are in `data/parquet/quarterly/`

- **Consolidated Files** (4 files):
  - **`all_contracts_consolidated.parquet`** - All contracts combined (50 columns, 6.5M+ records)
    - **Structure**: Enhanced with 6 new columns from 2021-2025 CSV data
    - **New Columns**: created_by, awardee_contact_person, list_of_bidders, unique_reference_id, data_source, processed_date, search_text
    - **Coverage**: Complete 2021-2025 data (replaces incomplete 2021 XLSX data)
  - **`all_contracts_consolidated_backup_20251001_223213.parquet`** - Backup of original file
  - **`clean_awarded_contracts_complete.parquet`** - Cleaned awarded contracts only
  - **`clean_awarded_contracts_complete_fixed.parquet`** - Fixed version with corrections

### `/raw/` - Original Data Files
Original PhilGEPS data files from 2013-2021 and new CSV datasets from 2021-2025.

#### PHILGEPS 2013-2021 Data
- **`/PHILGEPS 2013-2021/`** - Original Excel files (34 files)
  - Contains raw PhilGEPS awards data
  - Excel format (.xlsx) files
  - Covers 2013-2021 period
  - Includes contract details, contractor info, and financial data

#### PHILGEPS 2021-2025 Data (New CSV Datasets)
- **`/PHILGEPS -- 2021-2025 (CSV)/`** - New CSV files (5 files)
  - Contains processed PhilGEPS awards data in CSV format
  - Covers 2021-2025 period (6.5M+ records)
  - **Structure**: 43 columns (vs 44 in documented schema)
  - **Quality**: High data quality with minimal null values
  - **Coverage**: Complete year coverage for 2021-2024, partial for 2025 (Jan-Jun)
  - **Format**: CSV files optimized for data processing

## 📊 Data Sources

### PhilGEPS Dataset (2013-2021)
- **Source**: Philippines Government Electronic Procurement System
- **Coverage**: 2013-2021
- **Records**: 2M+ government contracts
- **Format**: Excel files (.xlsx)
- **Content**: Contract details, contractor information, financial data
- **Download**: [Google Drive Archive](https://drive.google.com/drive/u/0/folders/1kBxTNTOKLqjabYJz00qOz4tacha8Ot4P)

### PhilGEPS Dataset (2021-2025) - New CSV Datasets
- **Source**: Philippines Government Electronic Procurement System
- **Coverage**: 2021-2025
- **Records**: 6.5M+ government contracts
- **Format**: CSV files (.csv)
- **Content**: Processed contract details, contractor information, financial data
- **Quality**: High data quality with 99%+ completeness for key fields
- **Structure**: 43 columns (slight variation from documented 44-column schema)

## 📋 Data Schema

### Raw Data Column Structure (44 Columns)
The original PhilGEPS data contains 44 standardized columns representing the complete contract lifecycle. The consolidated parquet file has been enhanced to 50 columns with additional data from CSV sources.

### Current Consolidated File Structure (50 Columns)
The `all_contracts_consolidated.parquet` file contains 50 columns, combining the original 44 columns with 6 additional columns:

#### Original 44 Columns (from XLSX data 2013-2020)
1. reference_id
2. organization_name  
3. notice_title
4. awardee_name
5. award_title
6. classification
7. notice_type
8. business_category
9. funding_source
10. funding_instrument
11. procurement_mode
12. trade_agreement
13. area_of_delivery
14. contract_duration
15. calendar_type
16. notice_status
17. award_number
18. award_type
19. unspsc_code
20. unspsc_description
21. contract_number
22. reason_for_award
23. award_status
24. solicitation_number
25. item_name
26. item_description
27. unit_of_measurement
28. unique_reference_id
29. publish_date
30. prebid_date
31. closing_date
32. award_publish_date
33. award_date
34. notice_to_proceed_date
35. contract_effectivity_date
36. contract_end_date
37. approved_budget
38. contract_amount
39. item_budget
40. quantity
41. line_item_number
42. row_id
43. period
44. source_file

#### Additional 6 Columns (from CSV data 2021-2025 + system fields)
45. created_by (from CSV)
46. awardee_contact_person (from CSV)
47. list_of_bidders (from CSV)
48. data_source (system field)
49. processed_date (system field)
50. search_text (system field)

### Raw Data Structure Overview

#### XLSX Files Structure (40 Columns)
The original 2013-2021 XLSX files contain 40 columns in the following order:

| # | Column Name | Description |
|---|-------------|-------------|
| 1 | Organization Name | Government agency or organization name |
| 2 | Reference ID | Unique reference identifier for the contract |
| 3 | Solicitation No. | Solicitation reference number |
| 4 | Notice Title | Title of the procurement notice |
| 5 | Publish Date | Date when the notice was published |
| 6 | Classification | Contract classification (e.g., Infrastructure, Goods, Services) |
| 7 | Notice Type | Type of notice (e.g., Award Notice, Invitation to Bid) |
| 8 | Business Category | Business category classification |
| 9 | Funding Source | Source of funding for the contract |
| 10 | Funding Instrument | Type of funding instrument used |
| 11 | Procurement Mode | Method of procurement (e.g., Public Bidding, Negotiated) |
| 12 | Trade Agreement | Applicable trade agreement |
| 13 | Approved Budget of the Contract | Approved budget for the contract |
| 14 | Area of Delivery | Geographic area of delivery |
| 15 | Contract Duration | Duration of the contract |
| 16 | Calendar Type | Calendar type for duration calculation |
| 17 | Line Item No | Line item number in the contract |
| 18 | Item Name | Name of the item being procured |
| 19 | Item Desc | Detailed description of the item |
| 20 | Quantity | Quantity of items |
| 21 | Unit of Measurement | Unit of measurement for quantity |
| 22 | Item Budget | Budget allocated for the specific item |
| 23 | PreBid Date | Pre-bid conference date |
| 24 | Closing Date | Bid closing date |
| 25 | Notice Status | Current status of the notice |
| 26 | Award No. | Award reference number |
| 27 | Award Title | Title of the award |
| 28 | Award Type | Type of award (e.g., Contract, Purchase Order) |
| 29 | UNSPSC Code | UNSPSC classification code |
| 30 | UNSPSC Description | UNSPSC code description |
| 31 | Awardee Corporate Title | Name of the winning contractor/supplier |
| 32 | Contract Amount | Final contract amount |
| 33 | Contract No | Contract reference number |
| 34 | Publish Date(Award) | Award publication date |
| 35 | Award Date | Date when the award was made |
| 36 | Notice to Proceed Date | Notice to proceed date |
| 37 | Contract Efectivity Date | Contract effective date |
| 38 | Contract End Date | Contract end date |
| 39 | Reason for Award | Reason for awarding the contract |
| 40 | Award Status | Current status of the award |

#### CSV Files Structure (43 Columns)
The new 2021-2025 CSV files contain 43 columns in the following order:

| # | Column Name | Description |
|---|-------------|-------------|
| 1 | Procuring Entity | Government agency or organization name |
| 2 | Bid Reference No. | Unique reference identifier for the contract |
| 3 | Solicitation No. | Solicitation reference number |
| 4 | Notice Title | Title of the procurement notice |
| 5 | Notice Type | Type of notice (e.g., Award Notice, Invitation to Bid) |
| 6 | Classification | Contract classification (e.g., Infrastructure, Goods, Services) |
| 7 | Procurement Mode | Method of procurement (e.g., Public Bidding, Negotiated) |
| 8 | Business Category | Business category classification |
| 9 | Funding Source | Source of funding for the contract |
| 10 | Funding Instrument | Type of funding instrument used |
| 11 | Trade Agreement | Applicable trade agreement |
| 12 | Approved Budget of the Contract | Approved budget for the contract |
| 13 | Published Date | Date when the notice was published |
| 14 | Closing Date | Bid closing date |
| 15 | PreBid Date | Pre-bid conference date |
| 16 | Area of Delivery | Geographic area of delivery |
| 17 | Contract Duration | Duration of the contract |
| 18 | Calendar Type | Calendar type for duration calculation |
| 19 | Line Item No | Line item number in the contract |
| 20 | Item Name | Name of the item being procured |
| 21 | Item Description | Detailed description of the item |
| 22 | Quantity | Quantity of items |
| 23 | UOM | Unit of measurement for quantity |
| 24 | Item Budget | Budget allocated for the specific item |
| 25 | Notice Status | Current status of the notice |
| 26 | Created By | User who created the record |
| 27 | Award No. | Award reference number |
| 28 | Award Title | Title of the award |
| 29 | Award Type | Type of award (e.g., Contract, Purchase Order) |
| 30 | UNSPSC Code | UNSPSC classification code |
| 31 | UNSPSC Description | UNSPSC code description |
| 32 | Published Date(Award) | Award publication date |
| 33 | Award Date | Date when the award was made |
| 34 | Notice to Proceed Date | Notice to proceed date |
| 35 | Contract No | Contract reference number |
| 36 | Contract Amount | Final contract amount |
| 37 | Contract Efectivity Date | Contract effective date |
| 38 | Contract End Date | Contract end date |
| 39 | Award Status | Current status of the award |
| 40 | Reason for Award | Reason for awarding the contract |
| 41 | Awardee Organization Name | Name of the winning contractor/supplier |
| 42 | Awardee Contact Person | Contact person for the awardee |
| 43 | List of Bidder's | List of bidders for the contract |

### Structure Comparison Analysis

#### Key Differences Between XLSX and CSV Structures

| Aspect | XLSX (2013-2021) | CSV (2021-2025) | Notes |
|--------|-------------------|------------------|-------|
| **Total Columns** | 40 | 43 | CSV has 3 additional columns |
| **Column Order** | Different | Different | Reordered for better organization |
| **Column Names** | Slightly different | Slightly different | Some naming conventions changed |

#### Column Mapping (XLSX → CSV)

| # | XLSX Column | # | CSV Column | Status |
|---|-------------|---|------------|---------|
| 1 | Organization Name | 1 | Procuring Entity | ✅ Renamed |
| 2 | Reference ID | 2 | Bid Reference No. | ✅ Renamed |
| 3 | Solicitation No. | 3 | Solicitation No. | ✅ Same |
| 4 | Notice Title | 4 | Notice Title | ✅ Same |
| 5 | Publish Date | 13 | Published Date | ✅ Moved & Renamed |
| 6 | Classification | 6 | Classification | ✅ Same |
| 7 | Notice Type | 5 | Notice Type | ✅ Moved |
| 8 | Business Category | 8 | Business Category | ✅ Same |
| 9 | Funding Source | 9 | Funding Source | ✅ Same |
| 10 | Funding Instrument | 10 | Funding Instrument | ✅ Same |
| 11 | Procurement Mode | 7 | Procurement Mode | ✅ Moved |
| 12 | Trade Agreement | 11 | Trade Agreement | ✅ Same |
| 13 | Approved Budget of the Contract | 12 | Approved Budget of the Contract | ✅ Same |
| 14 | Area of Delivery | 16 | Area of Delivery | ✅ Moved |
| 15 | Contract Duration | 17 | Contract Duration | ✅ Moved |
| 16 | Calendar Type | 18 | Calendar Type | ✅ Moved |
| 17 | Line Item No | 19 | Line Item No | ✅ Moved |
| 18 | Item Name | 20 | Item Name | ✅ Moved |
| 19 | Item Desc | 21 | Item Description | ✅ Moved & Renamed |
| 20 | Quantity | 22 | Quantity | ✅ Moved |
| 21 | Unit of Measurement | 23 | UOM | ✅ Moved & Renamed |
| 22 | Item Budget | 24 | Item Budget | ✅ Moved |
| 23 | PreBid Date | 15 | PreBid Date | ✅ Moved |
| 24 | Closing Date | 14 | Closing Date | ✅ Moved |
| 25 | Notice Status | 25 | Notice Status | ✅ Same |
| 26 | Award No. | 27 | Award No. | ✅ Moved |
| 27 | Award Title | 28 | Award Title | ✅ Moved |
| 28 | Award Type | 29 | Award Type | ✅ Moved |
| 29 | UNSPSC Code | 30 | UNSPSC Code | ✅ Moved |
| 30 | UNSPSC Description | 31 | UNSPSC Description | ✅ Moved |
| 31 | Awardee Corporate Title | 41 | Awardee Organization Name | ✅ Moved & Renamed |
| 32 | Contract Amount | 36 | Contract Amount | ✅ Moved |
| 33 | Contract No | 35 | Contract No | ✅ Moved |
| 34 | Publish Date(Award) | 32 | Published Date(Award) | ✅ Moved & Renamed |
| 35 | Award Date | 33 | Award Date | ✅ Moved |
| 36 | Notice to Proceed Date | 34 | Notice to Proceed Date | ✅ Moved |
| 37 | Contract Efectivity Date | 37 | Contract Efectivity Date | ✅ Moved |
| 38 | Contract End Date | 38 | Contract End Date | ✅ Moved |
| 39 | Reason for Award | 40 | Reason for Award | ✅ Moved |
| 40 | Award Status | 39 | Award Status | ✅ Moved |

#### Additional CSV Columns (Not in XLSX)

| # | CSV Column | Description |
|---|------------|-------------|
| 26 | Created By | User who created the record |
| 42 | Awardee Contact Person | Contact person for the awardee |
| 43 | List of Bidder's | List of bidders for the contract |

**Note**: These 3 additional columns from the CSV data are included in the consolidated parquet file, bringing the total from 44 to 50 columns (44 original + 3 CSV + 3 system fields).

#### Schema Compatibility Summary
- **Core Data Fields**: 40/40 (100% compatibility with XLSX structure)
- **Column Reordering**: Yes, CSV has better logical grouping
- **Column Renaming**: Minor naming improvements (e.g., "Item Desc" → "Item Description")
- **Additional Fields**: 3 new fields in CSV for enhanced data tracking
- **Total Columns**: 50 columns in consolidated file (44 original + 3 CSV + 3 system fields)
- **Data Quality**: 99%+ completeness for key fields (Reference ID, Notice Title, Procuring Entity)

#### Column Mapping (Documented Schema → CSV)

**Core Data Fields (40 fields - 100% mapped):**

| # | Documented Schema | CSV Column | Status |
|---|------------------|------------|---------|
| 1 | reference_id | Bid Reference No. | ✅ Mapped |
| 2 | organization_name | Procuring Entity | ✅ Mapped |
| 3 | solicitation_number | Solicitation No. | ✅ Mapped |
| 4 | notice_title | Notice Title | ✅ Mapped |
| 5 | award_publish_date | Published Date(Award) | ✅ Mapped |
| 6 | classification | Classification | ✅ Mapped |
| 7 | notice_type | Notice Type | ✅ Mapped |
| 8 | business_category | Business Category | ✅ Mapped |
| 9 | funding_source | Funding Source | ✅ Mapped |
| 10 | funding_instrument | Funding Instrument | ✅ Mapped |
| 11 | procurement_mode | Procurement Mode | ✅ Mapped |
| 12 | trade_agreement | Trade Agreement | ✅ Mapped |
| 13 | approved_budget | Approved Budget of the Contract | ✅ Mapped |
| 14 | area_of_delivery | Area of Delivery | ✅ Mapped |
| 15 | contract_duration | Contract Duration | ✅ Mapped |
| 16 | calendar_type | Calendar Type | ✅ Mapped |
| 17 | line_item_number | Line Item No | ✅ Mapped |
| 18 | item_name | Item Name | ✅ Mapped |
| 19 | item_description | Item Description | ✅ Mapped |
| 20 | quantity | Quantity | ✅ Mapped |
| 21 | unit_of_measurement | UOM | ✅ Mapped |
| 22 | item_budget | Item Budget | ✅ Mapped |
| 23 | prebid_date | PreBid Date | ✅ Mapped |
| 24 | closing_date | Closing Date | ✅ Mapped |
| 25 | notice_status | Notice Status | ✅ Mapped |
| 26 | award_number | Award No. | ✅ Mapped |
| 27 | award_title | Award Title | ✅ Mapped |
| 28 | award_type | Award Type | ✅ Mapped |
| 29 | unspsc_code | UNSPSC Code | ✅ Mapped |
| 30 | unspsc_description | UNSPSC Description | ✅ Mapped |
| 31 | awardee_name | Awardee Organization Name | ✅ Mapped |
| 32 | contract_amount | Contract Amount | ✅ Mapped |
| 33 | contract_number | Contract No | ✅ Mapped |
| 34 | award_publish_date_award | Published Date(Award) | ✅ Mapped |
| 35 | award_date | Award Date | ✅ Mapped |
| 36 | notice_to_proceed_date | Notice to Proceed Date | ✅ Mapped |
| 37 | contract_effectivity_date | Contract Efectivity Date | ✅ Mapped |
| 38 | contract_end_date | Contract End Date | ✅ Mapped |
| 39 | reason_for_award | Reason for Award | ✅ Mapped |
| 40 | award_status | Award Status | ✅ Mapped |

**System Fields (3 fields - Added during processing):**

| # | System Field | Status |
|---|-------------|---------|
| 48 | data_source | ➕ Added during processing |
| 49 | processed_date | ➕ Added during processing |
| 50 | search_text | ➕ Added during processing |

**Note**: `unique_reference_id` was already present in the original 44-column structure, so only 3 new system fields were added.

**Additional CSV Fields (3 fields - Not in raw data):**

| # | CSV Field | Status |
|---|-----------|---------|
| 45 | Created By | ➕ Extra |
| 46 | Awardee Contact Person | ➕ Extra |
| 47 | List of Bidder's | ➕ Extra |

**Note**: `Published Date` is a renamed version of `publish_date` that already exists in the original structure, so only 3 truly new fields were added from the CSV data.

#### Data Coverage Analysis (2021-2025)
- **2021**: 1,319,624 records (Complete year)
- **2022**: 1,439,822 records (Complete year)
- **2023**: 1,463,221 records (Complete year)
- **2024**: 1,590,044 records (Complete year)
- **2025**: 711,054 records (Jan-Jun only)
- **Total**: 6,523,765 records

#### Data Quality Findings
- **Reference ID**: 100% completeness across all years
- **Notice Title**: 99.9%+ completeness (minimal nulls)
- **Procuring Entity**: 100% completeness across all years
- **Award No.**: 60-73% completeness (varies by year)
- **Date Fields**: Proper datetime formatting with consistent ranges
- **Data Consistency**: High consistency across all CSV files

### Original Raw Data Column Structure (44 Columns)
The original PhilGEPS data contains 44 standardized columns representing the complete contract lifecycle:

#### Basic Contract Information
1. **reference_id** - Unique reference identifier for the contract
2. **organization_name** - Government agency or organization name
3. **solicitation_number** - Solicitation reference number
4. **notice_title** - Title of the procurement notice
5. **award_publish_date** - Date when the award was published
6. **classification** - Contract classification (e.g., Infrastructure, Goods, Services)
7. **notice_type** - Type of notice (e.g., Award Notice, Invitation to Bid)
8. **business_category** - Business category classification
9. **funding_source** - Source of funding for the contract
10. **funding_instrument** - Type of funding instrument used

#### Procurement Details
11. **procurement_mode** - Method of procurement (e.g., Public Bidding, Negotiated)
12. **trade_agreement** - Applicable trade agreement
13. **approved_budget** - Approved budget for the contract
14. **area_of_delivery** - Geographic area of delivery
15. **contract_duration** - Duration of the contract
16. **calendar_type** - Calendar type for duration calculation
17. **line_item_number** - Line item number in the contract
18. **item_name** - Name of the item being procured
19. **item_description** - Detailed description of the item
20. **quantity** - Quantity of items
21. **unit_of_measurement** - Unit of measurement for quantity
22. **item_budget** - Budget allocated for the specific item

#### Timeline Information
23. **prebid_date** - Pre-bid conference date
24. **closing_date** - Bid closing date
25. **notice_status** - Current status of the notice
26. **award_number** - Award reference number
27. **award_title** - Title of the award
28. **award_type** - Type of award (e.g., Contract, Purchase Order)
29. **unspsc_code** - UNSPSC classification code
30. **unspsc_description** - UNSPSC code description

#### Award Information
31. **awardee_name** - Name of the winning contractor/supplier
32. **contract_amount** - Final contract amount
33. **contract_number** - Contract reference number
34. **award_publish_date_award** - Award publication date
35. **award_date** - Date when the award was made
36. **notice_to_proceed_date** - Notice to proceed date
37. **contract_effectivity_date** - Contract effective date
38. **contract_end_date** - Contract end date
39. **reason_for_award** - Reason for awarding the contract
40. **award_status** - Current status of the award

#### System Fields (Added During Processing)
41. **data_source** - Source of the data (e.g., PHILGEPS, SSP_Flood_Control)
42. **processed_date** - Date when the data was processed
43. **search_text** - Combined searchable text for full-text search
44. **unique_reference_id** - System-generated unique identifier

### Sample Data Examples

#### Flood Control Contracts Sample
```
organization_name: DPWH - Palawan 3rd District Engineering Office
reference_id: 24EG0058
notice_title: Construction of Flood Mitigation Structure
classification: Infrastructure
notice_type: Award Notice
business_category: Flood Control Structures
procurement_mode: Public Bidding
approved_budget: 17961569.07
area_of_delivery: PALAWAN
awardee_name: AZARRAGA CONSTRUCTION
contract_amount: 17961569.07
contract_number: 24EG0058
award_date: 2024-02-15
award_status: Awarded
```

#### General Contracts Sample
```
organization_name: UNIVERSITY OF SOUTHERN MINDANAO
award_title: CCTV Repair
notice_title: RFQ 16963A CCTV Repair
business_category: Services
area_of_delivery: Cotabato
awardee_name: MARIO & ANN ANN ELECTRONICS PARTS & SUPPLIES
contract_amount: 92902
contract_number: Reso # 104 - PO # 154
award_date: 2023-08-18
```

## 📁 Parquet File Types

### Raw Data Files (44 Columns)
- **Purpose**: Complete contract lifecycle data
- **Use Case**: Detailed analysis, data exploration, full contract information
- **Files**: All files in `/processed/` directory
- **Structure**: Complete 44-column schema as described above

### Optimized Search Files (14 Columns)
- **Purpose**: Fast title-based search and analytics
- **Use Case**: Search functionality, title-based filtering, quick analytics
- **Files**: `facts_awards_title_optimized.parquet`
- **Structure**: Streamlined columns focused on search and basic contract info

### Aggregation Files (9 Columns)
- **Purpose**: Pre-computed aggregations for fast analytics
- **Use Case**: Dashboard analytics, summary statistics, performance optimization
- **Files**: `agg_*.parquet` files
- **Structure**: Entity-based aggregations with counts, totals, and averages

### Specialized Files (43 Columns)
- **Purpose**: Domain-specific datasets
- **Use Case**: Specialized analysis (e.g., flood control projects)
- **Files**: `facts_awards_flood_control.parquet`
- **Structure**: Complete schema with specialized data and additional fields

### Sumbong sa Pangulo Dataset (2022-2025)
- **Source**: Sumbong sa Pangulo flood control projects
- **Coverage**: 2022-2025
- **Records**: Additional flood control contracts
- **Format**: Integrated with main dataset
- **Content**: Infrastructure and flood management projects
- **Download**: [Google Drive Archive](https://drive.google.com/drive/u/0/folders/1kBxTNTOKLqjabYJz00qOz4tacha8Ot4P)

## 🔧 Data Processing

### Optimization Pipeline
1. **Raw Data Ingestion** - Load Excel files into processing pipeline
2. **Data Cleaning** - Remove duplicates, standardize formats
3. **Data Transformation** - Convert to Parquet format for performance
4. **Aggregation** - Pre-compute aggregations by various dimensions
5. **Indexing** - Create search indices for fast queries
6. **Caching** - Generate cache files for frequently accessed data

### Performance Optimizations
- **Parquet Format** - Columnar storage for fast analytics
- **Pre-aggregation** - Pre-computed aggregations for common queries
- **Search Optimization** - Optimized search columns and indices
- **Time-based Partitioning** - Quarterly and yearly data partitions
- **Caching** - Search cache for improved performance

## 📈 Data Coverage

### Time Period
- **2013-2021**: PhilGEPS Excel dataset (2M+ records)
  - **Raw Data**: Quarterly files in `data/processed/` (36 files)
  - **Aggregations**: Quarterly/yearly files in `data/parquet/` (225 files)
- **2021-2025**: PhilGEPS CSV dataset (6.5M+ records)
  - **Raw Data**: Consolidated in `all_contracts_consolidated.parquet`
  - **Aggregations**: Only 2021 data has quarterly/yearly aggregations
- **2022-2025**: Sumbong sa Pangulo dataset (flood control projects)
- **Total Coverage**: 13 years (2013-2025)
- **Overlap Period**: 2021 (both Excel and CSV datasets available)
- **Missing Aggregations**: 2022-2025 quarterly/yearly aggregations not generated

### Data Dimensions
- **Contractors** - Business entities and suppliers
- **Organizations** - Government agencies and departments
- **Areas** - Geographic regions and provinces
- **Business Categories** - Industry classifications
- **Time Periods** - Quarterly and yearly breakdowns

### Key Metrics
- **Total Contracts** - Number of procurement contracts
- **Total Value** - Financial value of contracts
- **Average Value** - Average contract value
- **Contract Count** - Number of contracts per entity
- **Value Distribution** - Value distribution across entities

## 🛠️ Data Management

### File Organization
- **Raw Data** - Original source files preserved
- **Processed Data** - Cleaned and standardized data
- **Optimized Data** - Performance-optimized Parquet files
- **Cache Files** - Search and performance caches

### Data Quality
- **Validation** - Data quality checks and validation
- **Cleaning** - Duplicate removal and standardization
- **Normalization** - Consistent data formats and structures
- **Verification** - Data accuracy verification

### Performance
- **Fast Queries** - Optimized for sub-second query performance
- **Efficient Storage** - Compressed Parquet format
- **Scalable** - Handles large datasets efficiently
- **Cached** - Frequently accessed data cached

## 🔍 Data Analysis Findings

### Schema Consistency Analysis
- **Perfect Compatibility**: 100% column mapping between raw data schema and new CSV datasets
- **System Fields**: 4 fields (data_source, processed_date, search_text, unique_reference_id) are added during data processing, not part of raw data
- **Additional Fields**: 4 new fields (Published Date, Created By, Awardee Contact Person, List of Bidder's) in CSV datasets
- **Data Quality**: Excellent quality with 99%+ completeness for key fields

### Data Consistency Validation (2021 Q1-Q2)
- **Record Count**: CSV has 4.62% more records than XLSX source (593,394 vs 567,205)
- **Reference ID Overlap**: 100% overlap between datasets
- **Notice Title Overlap**: 99.31% overlap between datasets
- **Organization Name Overlap**: 99.84% overlap between datasets
- **Award Number Format**: Different formatting (numeric vs decimal) but same data

### Recommendations
1. **Use CSV Data**: New CSV datasets are more complete and reliable for 2021-2025 analysis
2. **Schema Compatibility**: CSV datasets have 100% compatibility with raw data schema (40/40 core fields mapped)
3. **Data Pipeline**: Current processing pipeline works well with high data consistency
4. **System Fields**: System fields are correctly added during processing, not expected in raw data
5. **Quality Monitoring**: Continue monitoring data quality, especially Award No. completeness

## 🔒 Data Security

- **Access Control** - Restricted access to sensitive data
- **Data Privacy** - No personal information exposed
- **Secure Storage** - Data stored securely
- **Backup** - Regular data backups

## 📥 Data Download

### Getting the Data
The data files are too large for GitHub and are stored in a Google Drive archive:

**[📁 Download Data Archive](https://drive.google.com/drive/u/0/folders/1kBxTNTOKLqjabYJz00qOz4tacha8Ot4P)**

### Setup Instructions
1. Download the data archive from Google Drive
2. Extract the contents to the `data/` directory
3. Ensure the following structure:
   ```
   data/
   ├── raw/
   │   └── PHILGEPS 2013-2021/
   │       └── [Excel files]
   ├── processed/
   │   └── [Processed files]
   └── parquet/
       ├── [Parquet files]
       ├── quarterly/
       └── yearly/
   ```

### Data Requirements
- **Storage**: ~2GB for complete dataset
- **Format**: Excel files (.xlsx) for raw data
- **Processing**: Python scripts in `/scripts/` directory

## 📝 Usage

### For Developers
- Use Parquet files for analytics and reporting
- Access processed data for application development
- Refer to raw data for data source verification

### For Data Analysis
- Use aggregated files for fast analytics
- Access quarterly/yearly data for trend analysis
- Use optimized parquet files for search operations

## 🔗 Dataset Usage in Codebase

### Main Consolidated File
**File**: `data/processed/all_contracts_consolidated.parquet` (50 columns, 6.5M+ records)

**Used in:**
- `rebuild_parquet_with_new_data.py` - Main data rebuild script
- `test_parquet_rebuild.py` - Testing and validation
- `analyze_*.py` scripts - Data analysis and comparison
- `final_2021_consistency_analysis.py` - Data consistency validation
- `analyze_2021_consistency_improved.py` - Improved consistency analysis
- `analyze_2021_consistency_overlap.py` - Data overlap analysis
- `analyze_dates_duckdb_pandas.py` - Date analysis scripts

**API Usage**: Not directly used in API endpoints (processed data is used instead)

### Aggregation Files
**Files**: `agg_area.parquet`, `agg_business_category.parquet`, `agg_contractor.parquet`, `agg_organization.parquet`

**Used in:**
- `backend/django/data_processing/parquet_service.py` - Main API service for entity analytics
- `backend/django/data_processing/views.py` - API endpoints for entity queries
- `scripts/core/generate_unified_parquet_data.py` - Data generation and aggregation
- `scripts/core/create_global_totals.py` - Global totals generation
- `scripts/cleanup_old_parquet_files.py` - File management

**API Endpoints:**
- `/api/v1/data-processing/entities/` - Entity analytics (contractors, areas, organizations, categories)
- `/api/v1/data-processing/related-entities/` - Related entity queries
- `/api/v1/data-processing/contracts-by-entity/` - Contracts by entity

### Title Optimized Facts
**File**: `data/parquet/facts_awards_title_optimized.parquet` (14 columns, 2.2M+ records)

**Used in:**
- `backend/django/contracts/parquet_search.py` - Main search service
- `backend/django/contracts/parquet_search_optimized.py` - Optimized search service
- `backend/django/contracts/parquet_search_fast.py` - Fast search service
- `scripts/optimize_title_search.py` - Search optimization
- `scripts/optimize_analytics_performance.py` - Analytics optimization
- `scripts/implement_performance_optimizations.py` - Performance optimization
- `scripts/advanced_optimizations.py` - Advanced optimization strategies

**API Endpoints:**
- `/api/v1/contracts/search/` - Contract search functionality
- `/api/v1/contracts/contracts-by-entity/` - Contracts by entity search

### Flood Control Facts
**File**: `data/parquet/facts_awards_flood_control.parquet` (43 columns, 9,855 records)

**Used in:**
- `backend/django/data_processing/parquet_service.py` - API service for flood control data
- `backend/django/contracts/parquet_search.py` - Search service for flood control projects
- `scripts/cleanup_old_parquet_files.py` - File management

**API Endpoints:**
- `/api/v1/data-processing/entities/` - When `include_flood_control=true`
- `/api/v1/contracts/search/` - When `include_flood_control=true`

### Quarterly Raw Data Files
**Files**: `data/processed/YYYY_QN_contracts.parquet` (34 files, 44 columns each)

**Used in:**
- **Direct usage**: Limited direct usage in current codebase
- **Indirect usage**: Data is consolidated into main file
- **Processing**: Used by data processing scripts for time-based analysis

**Status**: ⚠️ **CANDIDATE FOR CLEANUP**
- **Size**: 1.2 GB total (34 files)
- **Reason**: Data has been consolidated into `all_contracts_consolidated.parquet`
- **Impact**: No impact on functionality (quarterly aggregations are used instead)
- **Cleanup Script**: `scripts/cleanup_quarterly_raw_files.py`

**Note**: These files are not actively used in API endpoints; quarterly aggregations are used instead

### Quarterly Aggregation Files
**Files**: `data/parquet/quarterly/year_YYYY_qN/` (180 files total, 5 files per quarter)

**Used in:**
- `backend/django/data_processing/parquet_service.py` - API service for quarterly analytics
- `scripts/core/generate_unified_parquet_data.py` - Data generation

**API Endpoints:**
- `/api/v1/data-processing/entities/` - When `time_range=quarterly`
- Quarterly analytics and time-based filtering

### Yearly Aggregation Files
**Files**: `data/parquet/yearly/year_YYYY/` (45 files total, 5 files per year)

**Used in:**
- `backend/django/data_processing/parquet_service.py` - API service for yearly analytics
- `scripts/core/generate_unified_parquet_data.py` - Data generation

**API Endpoints:**
- `/api/v1/data-processing/entities/` - When `time_range=yearly`
- Yearly analytics and annual trend analysis

### Raw Data Files
**Files**: `data/raw/PHILGEPS 2013-2021/` (34 XLSX files) and `data/raw/PHILGEPS -- 2021-2025 (CSV)/` (5 CSV files)

**Used in:**
- `rebuild_parquet_with_new_data.py` - Data processing and consolidation
- `compare_*.py` scripts - Data comparison and validation
- `analyze_*.py` scripts - Data analysis and quality assessment

**Note**: Raw data files are used for data processing and analysis, not directly in API endpoints

## 🔄 Data Flow Architecture

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
- **Raw Data**: CSV/XLSX files in `data/raw/`
- **Processing**: `rebuild_parquet_with_new_data.py`
- **Consolidated**: `all_contracts_consolidated.parquet`
- **Aggregation**: `scripts/core/generate_unified_parquet_data.py`
- **Output**: Aggregation files in `data/parquet/`

## 🧹 Cleanup Opportunities

### 1. **Quarterly Raw Data Files Cleanup**
- **Files**: 34 files in `data/processed/` (1.2 GB total)
- **Status**: Safe to remove
- **Reason**: Data consolidated into `all_contracts_consolidated.parquet`
- **Impact**: No functional impact (quarterly aggregations used instead)
- **Script**: `scripts/cleanup_quarterly_raw_files.py`
- **Space Savings**: 1.2 GB (108.9% of main file size)

### 2. **Unused Search Cache**
- **File**: `title_search_cache.json` (if it exists)
- **Status**: Safe to remove
- **Reason**: Not used by application (optimized parquet files used instead)
- **Impact**: No functional impact
- **Space Savings**: Minimal (1KB)

### 3. **Backup Files**
- **Files**: Various backup files in `data/processed/`
- **Status**: Review and clean up old backups
- **Reason**: Keep only recent backups
- **Impact**: No functional impact
- **Space Savings**: Variable

## 🚨 Current Issues and Limitations

### 1. **Missing 2022-2025 Aggregations**
- **Issue**: No quarterly/yearly aggregations for 2022-2025 data
- **Impact**: API endpoints cannot provide time-based analytics for recent years
- **Reality**: Only 2013-2021 aggregations exist (225 files total)
- **Solution**: Run aggregation scripts to generate missing files

### 2. **Unused Search Cache**
- **Issue**: `title_search_cache.json` file is created but never used
- **Impact**: No impact on search performance (optimized parquet files are used instead)
- **Reality**: File is generated by optimization scripts but never loaded by the application
- **Solution**: No action needed - current search implementation is more efficient

### 3. **Two Different Quarterly File Types**
- **Issue**: Confusion between raw data files and aggregated files
- **Reality**: 
  - Raw data: 36 files in `data/processed/` (44 columns)
  - Aggregations: 180 files in `data/parquet/quarterly/` (5 files per quarter)
- **Impact**: Users may not understand which files to use for different purposes
- **Solution**: Clear documentation of file purposes (now provided)

### 4. **Data Coverage Gaps**
- **Issue**: 2021 Q3-Q4 data only in consolidated file, not in quarterly raw files
- **Impact**: Inconsistent data access patterns
- **Reality**: Raw quarterly files only go to 2021 Q2
- **Solution**: Generate missing quarterly raw files or update processing pipeline

## ✅ Recent Updates

### **January 1, 2025 - Data Structure Analysis**
- ✅ **Corrected Documentation**: Updated file counts and locations
- ✅ **Discovered Missing Files**: Found 225 aggregation files that were thought to be missing
- ✅ **Enhanced Main File**: Added 6 new columns from 2021-2025 CSV data
- ✅ **Clarified Structure**: Distinguished between raw data and aggregated files
- ✅ **Updated Coverage**: Accurate data coverage information

---

**Last Updated**: January 1, 2025  
**Version**: v3.1.0 - Corrected Data Structure Documentation