# PHILGEPS Awards Data Explorer - Active API Documentation

## Overview

This documentation covers **ONLY** the API endpoints that are actively used by the PHILGEPS Awards Data Explorer frontend. The API provides comprehensive search, analytics, and export functionality for Philippine government contract data from 2013-2025.

**Base URL**: `https://philgeps-api.simple-systems.dev/api/v1/`  
**Local Development**: `http://localhost:3200/api/v1/`

## Table of Contents

1. [Contract Search & Analytics](#contract-search--analytics)
2. [Entity Search](#entity-search)
3. [Export Functionality](#export-functionality)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Contract Search & Analytics

### 1. Search Contracts with Filter Chips
**POST** `/contracts/chip-search/`

Main search endpoint used by the Advanced Search functionality. Supports multiple values per filter type with AND/OR logic.

**Request Body:**
```json
{
  "contractors": ["ABC Construction", "XYZ Corp"],
  "areas": ["NCR - NATIONAL CAPITAL REGION", "Region IV-A - CALABARZON"],
  "organizations": ["DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS"],
  "business_categories": ["CONSTRUCTION", "CONSULTING SERVICES"],
  "keywords": ["road", "bridge"],
  "time_ranges": [
    {
      "type": "yearly",
      "year": 2023
    },
    {
      "type": "custom",
      "startDate": "2023-01-01",
      "endDate": "2023-12-31"
    }
  ],
  "page": 1,
  "page_size": 20,
  "sortBy": "award_date",
  "sortDirection": "desc",
  "include_flood_control": false
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "reference_id": "REF-2023-001",
      "notice_title": "Construction of Road",
      "award_title": "Road Construction Project",
      "organization_name": "DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS",
      "awardee_name": "ABC Construction Corporation",
      "business_category": "CONSTRUCTION",
      "area_of_delivery": "NCR - NATIONAL CAPITAL REGION",
      "contract_amount": 1000000.00,
      "award_date": "2023-01-15",
      "award_status": "Awarded",
      "contract_no": "CON-2023-001",
      "created_at": "2023-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 1500,
    "total_pages": 75,
    "has_next": true,
    "has_previous": false
  }
}
```

### 2. Get Analytics Aggregates
**POST** `/contracts/chip-aggregates/`

Get aggregated data for charts and analytics using the same filter criteria as search.

**Request Body:** Same as chip-search

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": [
      {
        "count": 1000,
        "total_value": 50000000.00,
        "avg_value": 50000.00
      }
    ],
    "by_year": [
      {
        "year": 2023,
        "total_value": 50000000.00,
        "count": 1000
      }
    ],
    "by_month": [
      {
        "month": "2023-01",
        "total_value": 5000000.00,
        "count": 100
      }
    ],
    "by_contractor": [
      {
        "label": "ABC Construction Corporation",
        "total_value": 10000000.00,
        "count": 200
      }
    ],
    "by_organization": [
      {
        "label": "DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS",
        "total_value": 30000000.00,
        "count": 600
      }
    ],
    "by_area": [
      {
        "label": "NCR - NATIONAL CAPITAL REGION",
        "total_value": 20000000.00,
        "count": 400
      }
    ],
    "by_category": [
      {
        "label": "CONSTRUCTION",
        "total_value": 40000000.00,
        "count": 800
      }
    ]
  }
}
```

### 3. Get Paginated Analytics
**POST** `/contracts/chip-aggregates-paginated/`

Get paginated aggregated data for analytics tables with sorting and filtering.

**Request Body:**
```json
{
  "contractors": ["ABC Construction"],
  "areas": ["NCR - NATIONAL CAPITAL REGION"],
  "organizations": ["DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS"],
  "business_categories": ["CONSTRUCTION"],
  "keywords": ["road"],
  "time_ranges": [
    {
      "type": "yearly",
      "year": 2023
    }
  ],
  "page": 1,
  "page_size": 20,
  "dimension": "by_contractor",
  "sort_by": "total_value",
  "sort_direction": "desc",
  "include_flood_control": false
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "label": "ABC Construction Corporation",
      "total_value": 10000000.00,
      "count": 200,
      "avg_value": 50000.00
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 20,
    "total_count": 1000,
    "total_pages": 50,
    "has_next": true,
    "has_previous": false
  }
}
```

### 4. Get Filter Options
**GET** `/contracts/filter-options/`

Get all available filter options for dropdowns and autocomplete.

**Response:**
```json
{
  "success": true,
  "data": {
    "contractors": [
      "ABC Construction Corporation",
      "XYZ Construction Inc"
    ],
    "areas": [
      "NCR - NATIONAL CAPITAL REGION",
      "Region IV-A - CALABARZON"
    ],
    "organizations": [
      "DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS",
      "DEPARTMENT OF TRANSPORTATION"
    ],
    "business_categories": [
      "CONSTRUCTION",
      "CONSULTING SERVICES"
    ],
    "years": [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
  }
}
```

---

## Entity Search

### 1. Search Contractors
**GET** `/contractors/`

Search contractors with substring or exact word matching.

**Query Parameters:**
- `search` (string): Substring search (e.g., "petron" matches "PETRON CORPORATION")
- `word` (string): Exact word search (e.g., "deo" won't match "montevideo")
- `page_size` (int): Results per page (default: 20)

**Examples:**
```bash
# Substring search
GET /contractors/?search=petron&page_size=10

# Exact word search
GET /contractors/?word=deo&page_size=10
```

**Response:**
```json
{
  "count": 74250,
  "next": "https://api.example.com/contractors/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "ABC Construction Corporation",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Search Organizations
**GET** `/organizations/`

Search organizations with substring or exact word matching.

**Query Parameters:** Same as contractors

**Response:** Same format as contractors

### 3. Search Business Categories
**GET** `/business-categories/`

Search business categories with substring or exact word matching.

**Query Parameters:** Same as contractors

**Response:** Same format as contractors

### 4. Search Areas of Delivery
**GET** `/areas-of-delivery/`

Search delivery areas with substring or exact word matching.

**Query Parameters:** Same as contractors

**Response:** Same format as contractors

---

## Export Functionality

### 1. Estimate Export Size
**POST** `/contracts/chip-export-estimate/`

Estimate the size of CSV export for current filters.

**Request Body:**
```json
{
  "contractors": ["ABC Construction"],
  "areas": ["NCR - NATIONAL CAPITAL REGION"],
  "organizations": ["DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS"],
  "business_categories": ["CONSTRUCTION"],
  "keywords": ["road"],
  "time_ranges": [
    {
      "type": "yearly",
      "year": 2023
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "total_count": 1000,
  "estimated_csv_bytes": 2048000
}
```

### 2. Export CSV
**POST** `/contracts/chip-export/`

Stream full CSV export for current filters.

**Request Body:** Same as export estimate

**Response:** CSV file stream with headers:
- reference_id
- contract_no
- award_title
- notice_title
- awardee_name
- organization_name
- area_of_delivery
- business_category
- contract_amount
- award_date
- award_status

---

## Data Models

### Contract Model
```json
{
  "id": "integer",
  "reference_id": "string",
  "notice_title": "string",
  "award_title": "string",
  "organization_name": "string",
  "awardee_name": "string",
  "business_category": "string",
  "area_of_delivery": "string",
  "contract_amount": "decimal",
  "award_date": "date",
  "award_status": "string",
  "contract_no": "string",
  "created_at": "datetime"
}
```

### Entity Model
```json
{
  "id": "integer",
  "name": "string",
  "created_at": "datetime"
}
```

### Aggregation Model
```json
{
  "label": "string",
  "total_value": "decimal",
  "count": "integer",
  "avg_value": "decimal"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "message": "Human-readable error description"
}
```

### Common HTTP Status Codes
- **200 OK**: Request successful
- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Examples

### cURL Examples

#### Search Contractors
```bash
# Substring search
curl "https://philgeps-api.simple-systems.dev/api/v1/contractors/?search=petron&page_size=10"

# Exact word search
curl "https://philgeps-api.simple-systems.dev/api/v1/contractors/?word=deo&page_size=10"
```

#### Search Contracts
```bash
curl -X POST "https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-search/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": ["PETRON CORPORATION"],
    "areas": ["NCR - NATIONAL CAPITAL REGION"],
    "organizations": [],
    "business_categories": [],
    "keywords": ["fuel"],
    "time_ranges": [
      {
        "type": "yearly",
        "year": 2023
      }
    ],
    "page": 1,
    "page_size": 10,
    "sortBy": "award_date",
    "sortDirection": "desc"
  }'
```

#### Get Analytics
```bash
curl -X POST "https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-aggregates/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": ["PETRON CORPORATION"],
    "areas": ["NCR - NATIONAL CAPITAL REGION"],
    "organizations": [],
    "business_categories": [],
    "keywords": ["fuel"],
    "time_ranges": [
      {
        "type": "yearly",
        "year": 2023
      }
    ],
    "topN": 20
  }'
```

#### Export Data
```bash
# Estimate export size
curl -X POST "https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-export-estimate/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": [],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": ["road"],
    "time_ranges": []
  }'

# Download CSV
curl -X POST "https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-export/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": [],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": ["road"],
    "time_ranges": []
  }' \
  --output contracts_export.csv
```

### JavaScript Examples

```javascript
// Search contractors
const response = await fetch('https://philgeps-api.simple-systems.dev/api/v1/contractors/?search=petron&page_size=10');
const data = await response.json();
console.log(data.results);

// Search contracts
const searchResponse = await fetch('https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-search/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contractors: ['PETRON CORPORATION'],
    areas: ['NCR - NATIONAL CAPITAL REGION'],
    organizations: [],
    business_categories: [],
    keywords: ['fuel'],
    time_ranges: [{
      type: 'yearly',
      year: 2023
    }],
    page: 1,
    page_size: 10,
    sortBy: 'award_date',
    sortDirection: 'desc'
  })
});
const searchData = await searchResponse.json();
console.log(searchData.data);

// Get analytics
const analyticsResponse = await fetch('https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-aggregates/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contractors: ['PETRON CORPORATION'],
    areas: ['NCR - NATIONAL CAPITAL REGION'],
    organizations: [],
    business_categories: [],
    keywords: ['fuel'],
    time_ranges: [{
      type: 'yearly',
      year: 2023
    }],
    topN: 20
  })
});
const analyticsData = await analyticsResponse.json();
console.log(analyticsData.data);
```

---

## Key Features

### Search Capabilities
- **Filter Chips**: Multiple values per filter type with AND/OR logic
- **Keyword Search**: Full-text search with AND logic support (`&&`)
- **Whole-word Matching**: Precise matching (e.g., 'deo' won't match 'montevideo')
- **Time Range Filtering**: Yearly, quarterly, custom date ranges
- **Sumbong sa Pangulo Dataset**: Optional inclusion of extended 2022-2025 data

### Analytics Features
- **Chart Data**: Aggregated data for visualizations
- **Table Data**: Paginated aggregated data for analytics tables
- **Multiple Dimensions**: By contractor, organization, area, category
- **Time-based Analysis**: Yearly and monthly aggregations
- **Summary Statistics**: Total counts, values, and averages

### Export Features
- **Size Estimation**: Preview export size before downloading
- **CSV Export**: Full dataset export with streaming
- **Filtered Export**: Export only filtered results
- **Progress Tracking**: Real-time export progress

---

*This documentation covers all actively used API endpoints as of January 27, 2025. Only endpoints that are actually called by the frontend application are included.*
