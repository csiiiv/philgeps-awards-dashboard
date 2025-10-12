# PHILGEPS Awards Data Explorer - OpenAPI 3.0 Compliant API Documentation

## Overview

This documentation provides a comprehensive reference for the PHILGEPS Awards Data Explorer API, built with full OpenAPI 3.0 compliance. The API provides search, analytics, and export functionality for Philippine government procurement data from 2013-2025.

**API Version**: 1.1.0  
**OpenAPI Version**: 3.0.3  
**Base URL**: `https://philgeps-api.simple-systems.dev/api/v1/`  
**Local Development**: `http://localhost:3200/api/v1/`  
**Documentation**: `https://philgeps-api.simple-systems.dev/api/docs/`  
**ReDoc**: `https://philgeps-api.simple-systems.dev/api/redoc/`  
**Last Updated**: October 12, 2025

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Contract Search & Analytics](#contract-search--analytics)
4. [Entity Search](#entity-search)
5. [Export Functionality](#export-functionality)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Examples](#examples)
9. [OpenAPI Schema](#openapi-schema)

---

## Authentication

**Current Status**: No authentication required  
**Access Level**: Public  
**Rate Limiting**: 240 requests per hour per IP address

All endpoints are publicly accessible without authentication. Rate limiting is applied per IP address to ensure fair usage.

---

## Rate Limiting

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| All Endpoints | 240 requests | 1 hour |
| Filter Options | Cached (no limit) | N/A |

**Headers**:
- `X-RateLimit-Limit`: 240
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Contract Search & Analytics

### 1. Advanced Search (Legacy)
**POST** `/contracts/advanced-search/`

Legacy advanced search endpoint with single-value filters. Use `chip-search` for new implementations.

**Request Body**:
```json
{
  "contractor": "ABC Construction",
  "area": "NCR - NATIONAL CAPITAL REGION",
  "organization": "DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS",
  "business_category": "CONSTRUCTION",
  "keywords": "road bridge",
  "time_range": {
    "type": "yearly",
    "year": 2023
  },
  "page": 1,
  "page_size": 20,
  "sortBy": "award_date",
  "sortDirection": "desc"
}
```

**Response**: Same format as `chip-search`

### 2. Search Contracts with Filter Chips
**POST** `/contracts/chip-search/`

Main search endpoint supporting multiple values per filter type with AND/OR logic.

**Request Body**:
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

**Response**:
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

**Status Codes**:
- `200 OK`: Search successful
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error during search

### 3. Get Analytics Aggregates
**POST** `/contracts/chip-aggregates/`

Get aggregated data for charts and analytics using the same filter criteria as search.

**Request Body**: Same as `chip-search`

**Response**:
```json
{
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

**Status Codes**:
- `200 OK`: Aggregates retrieved successfully
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error during aggregation

### 4. Get Paginated Analytics
**POST** `/contracts/chip-aggregates-paginated/`

Get paginated aggregated data for analytics tables with sorting and filtering.

**Request Body**:
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

**Response**:
```json
{
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

**Status Codes**:
- `200 OK`: Paginated data retrieved successfully
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error during pagination

### 5. Get Filter Options
**GET** `/contracts/filter-options/`

Get all available filter options for dropdowns and autocomplete.

**Response**:
```json
{
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
```

**Status Codes**:
- `200 OK`: Filter options retrieved successfully
- `500 Internal Server Error`: Server error retrieving filter options

---

## Entity Search

### 1. Search Contractors
**GET** `/contractors/`

Search contractors with substring or exact word matching.

**Query Parameters**:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Substring search | `petron` matches "PETRON CORPORATION" |
| `word` | string | Exact word search | `deo` won't match "montevideo" |
| `page_size` | integer | Results per page (default: 20) | `10` |

**Example Requests**:
```bash
# Substring search
GET /contractors/?search=petron&page_size=10

# Exact word search
GET /contractors/?word=deo&page_size=10
```

**Response**:
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

**Status Codes**:
- `200 OK`: Search successful
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error during search

### 2. Search Organizations
**GET** `/organizations/`

Search organizations with substring or exact word matching.

**Query Parameters**: Same as contractors

**Response**: Same format as contractors

### 3. Search Business Categories
**GET** `/business-categories/`

Search business categories with substring or exact word matching.

**Query Parameters**: Same as contractors

**Response**: Same format as contractors

### 4. Search Areas of Delivery
**GET** `/areas-of-delivery/`

Search delivery areas with substring or exact word matching.

**Query Parameters**: Same as contractors

**Response**: Same format as contractors

---

## Export Functionality

### 1. Estimate Individual Contracts Export Size
**POST** `/contracts/chip-export-estimate/`

Estimate the size of CSV export for individual contracts matching current filters.

**Request Body**:
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
  "include_flood_control": false
}
```

**Response**:
```json
{
  "total_count": 1000,
  "estimated_csv_bytes": 350000
}
```

**Status Codes**:
- `200 OK`: Estimate successful
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error during estimation

### 2. Export Individual Contracts CSV
**POST** `/contracts/chip-export/`

Stream full CSV export for individual contracts matching current filters.

**Request Body**: Same as export estimate

**Response**: CSV file stream with headers:
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

**Status Codes**:
- `200 OK`: CSV export successful
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error during export

### 3. Estimate Aggregated Export Size
**POST** `/contracts/chip-export-aggregated-estimate/`

Estimate the size of aggregated CSV export for analytics data (contractors, organizations, etc.).

**Request Body**:
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
  "dimension": "by_contractor",
  "include_flood_control": false
}
```

**Response**:
```json
{
  "total_count": 120,
  "estimated_csv_bytes": 14400
}
```

**Status Codes**:
- `200 OK`: Estimate successful
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error during estimation

### 4. Export Aggregated CSV
**POST** `/contracts/chip-export-aggregated/`

Stream aggregated CSV export for analytics data (contractors, organizations, areas, categories).

**Request Body**: Same as aggregated export estimate

**Response**: CSV file stream with headers:
- label (contractor/organization/area/category name)
- total_value (sum of contract amounts)
- count (number of contracts)
- avg_value (average contract amount)

**Status Codes**:
- `200 OK`: CSV export successful
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error during export

---

## Data Models

### Request Schemas

#### ChipSearchRequest
```json
{
  "contractors": ["string"],
  "areas": ["string"],
  "organizations": ["string"],
  "business_categories": ["string"],
  "keywords": ["string"],
  "time_ranges": [
    {
      "type": "yearly|quarterly|custom",
      "year": "integer",
      "quarter": "integer",
      "startDate": "string (YYYY-MM-DD)",
      "endDate": "string (YYYY-MM-DD)"
    }
  ],
  "page": "integer (default: 1)",
  "page_size": "integer (default: 20, max: 5000000)",
  "sortBy": "string (default: award_date)",
  "sortDirection": "string (asc|desc, default: desc)",
  "include_flood_control": "boolean (default: false)"
}
```

#### TimeRange Object
```json
{
  "type": "yearly|quarterly|custom",
  "year": "integer (required for yearly/quarterly)",
  "quarter": "integer (required for quarterly, 1-4)",
  "startDate": "string (required for custom, YYYY-MM-DD)",
  "endDate": "string (required for custom, YYYY-MM-DD)"
}
```

#### AggregatedExportRequest
```json
{
  "contractors": ["string"],
  "areas": ["string"],
  "organizations": ["string"],
  "business_categories": ["string"],
  "keywords": ["string"],
  "time_ranges": ["TimeRange Object"],
  "dimension": "by_contractor|by_organization|by_area|by_category",
  "include_flood_control": "boolean (default: false)"
}
```

### Response Schemas

#### Contract Model
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
  "award_date": "date (YYYY-MM-DD)",
  "award_status": "string",
  "contract_no": "string",
  "created_at": "datetime (ISO 8601)"
}
```

#### Entity Model
```json
{
  "id": "integer",
  "name": "string",
  "created_at": "datetime (ISO 8601)"
}
```

#### Aggregation Model
```json
{
  "label": "string",
  "total_value": "decimal",
  "count": "integer",
  "avg_value": "decimal"
}
```

#### Pagination Model
```json
{
  "page": "integer",
  "page_size": "integer",
  "total_count": "integer",
  "total_pages": "integer",
  "has_next": "boolean",
  "has_previous": "boolean"
}
```

#### Standard Response Wrapper
```json
{
  "success": "boolean",
  "data": "object|array",
  "pagination": "PaginationModel (optional)",
  "error": "string (only when success: false)",
  "message": "string (only when success: false)"
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

### HTTP Status Codes

#### Success Responses
- **200 OK**: Request successful
- **201 Created**: Resource created successfully

#### Client Error Responses
- **400 Bad Request**: Invalid request parameters or malformed JSON
- **404 Not Found**: Resource not found
- **405 Method Not Allowed**: HTTP method not allowed for this endpoint
- **415 Unsupported Media Type**: Content-Type not supported
- **429 Too Many Requests**: Rate limit exceeded

#### Server Error Responses
- **500 Internal Server Error**: Server error during processing
- **502 Bad Gateway**: Upstream service error
- **503 Service Unavailable**: Service temporarily unavailable

### Common Error Examples

#### Validation Error (400)
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "message": "Page size must be between 1 and 5000000"
}
```

#### Search Error (500)
```json
{
  "success": false,
  "error": "Search failed",
  "message": "An error occurred during search"
}
```

#### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later."
}
```

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
    ]
  }'
```

#### Export Data
```bash
# Estimate individual contracts export size
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

# Download individual contracts CSV
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

# Estimate aggregated export size
curl -X POST "https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-export-aggregated-estimate/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": [],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": ["road"],
    "time_ranges": [],
    "dimension": "by_contractor"
  }'

# Download aggregated CSV
curl -X POST "https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-export-aggregated/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": [],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": ["road"],
    "time_ranges": [],
    "dimension": "by_contractor"
  }' \
  --output contractors_export.csv
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
    }]
  })
});
const analyticsData = await analyticsResponse.json();
console.log(analyticsData.data);

// Export individual contracts
const exportResponse = await fetch('https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-export/', {
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
    }]
  })
});
const exportBlob = await exportResponse.blob();
const url = window.URL.createObjectURL(exportBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'contracts_export.csv';
a.click();

// Export aggregated data
const aggregatedExportResponse = await fetch('https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-export-aggregated/', {
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
    dimension: 'by_contractor'
  })
});
const aggregatedBlob = await aggregatedExportResponse.blob();
const aggregatedUrl = window.URL.createObjectURL(aggregatedBlob);
const aggregatedA = document.createElement('a');
aggregatedA.href = aggregatedUrl;
aggregatedA.download = 'contractors_export.csv';
aggregatedA.click();
```

---

## OpenAPI Schema

### Interactive Documentation
- **Swagger UI**: `https://philgeps-api.simple-systems.dev/api/docs/`
- **ReDoc**: `https://philgeps-api.simple-systems.dev/api/redoc/`
- **OpenAPI Schema**: `https://philgeps-api.simple-systems.dev/api/schema/`

### Schema Information
- **OpenAPI Version**: 3.0.3
- **API Version**: 1.1.0
- **Schema Size**: ~75KB
- **Total Endpoints**: 12
- **Compliance**: 100% OpenAPI 3.0 compliant

### Key Features
- **Interactive Testing**: Test endpoints directly from browser
- **Request/Response Examples**: Complete examples for all endpoints
- **Schema Definitions**: Detailed data models
- **Error Documentation**: Comprehensive error code documentation
- **Rate Limiting**: Documented rate limits and headers

---

## Performance & Data Sources

### Performance Considerations
- **Search Performance**: All search operations use optimized Parquet files with DuckDB for fast querying
- **Pagination**: Default page size is 20, maximum is 5,000,000
- **Caching**: Filter options are cached for improved performance
- **Streaming**: Large CSV exports use streaming to handle memory efficiently

### Data Sources
- **Primary Data**: PHILGEPS contract data (2013-2025)
- **Total Contracts**: ~5 million contract records
- **Total Value**: ~₱15 trillion in contract amounts
- **Extended Data**: Sumbong sa Pangulo dataset (2022-2025) - optional via `include_flood_control` parameter
- **Data Format**: Optimized Parquet files for fast querying
- **Update Frequency**: Data updated periodically as new contracts are processed

### Dataset Statistics
- **Contractors**: 120,000+ unique contractors
- **Organizations**: 14,000+ government agencies
- **Areas**: 520 delivery areas
- **Categories**: 169 business categories
- **Time Period**: 2013-2025 (13+ years)

---

## Key Features

### Search Capabilities
- **Filter Chips**: Multiple values per filter type with AND/OR logic
- **Keyword Search**: Full-text search with AND logic support (`&&`)
- **Whole-word Matching**: Precise matching (e.g., 'deo' won't match 'montevideo')
- **Time Range Filtering**: Yearly, quarterly, custom date ranges
- **Extended Dataset**: Optional inclusion of extended 2022-2025 data

### Analytics Features
- **Chart Data**: Aggregated data for visualizations
- **Table Data**: Paginated aggregated data for analytics tables
- **Multiple Dimensions**: By contractor, organization, area, category
- **Time-based Analysis**: Yearly and monthly aggregations
- **Summary Statistics**: Total counts, values, and averages

### Export Features
- **Size Estimation**: Preview export size before downloading
- **Individual Contracts Export**: Full dataset export with streaming
- **Aggregated Data Export**: Export analytics data (contractors, organizations, etc.)
- **Filtered Export**: Export only filtered results
- **Progress Tracking**: Real-time export progress
- **Multiple Export Types**: Both individual contracts and aggregated analytics data

---

*This documentation is fully compliant with OpenAPI 3.0 specifications and covers all actively used API endpoints as of October 12, 2025. The API provides comprehensive search, analytics, and export functionality for Philippine government procurement data.*