# API Endpoints Analysis & Examples

**Version:** 1.0.0  
**Date:** November 8, 2025  
**Base URL:** `/api/v1/`

---

## Table of Contents

1. [Contract Endpoints](#contract-endpoints)
2. [Entity Endpoints](#entity-endpoints)
3. [Data Processing Endpoints](#data-processing-endpoints)
4. [Data Import Endpoints](#data-import-endpoints)
5. [Common Response Structures](#common-response-structures)

---

## Contract Endpoints

### 1. List Contracts (GET /api/v1/contracts/)

**Description:** Retrieve a list of contracts with optional filtering and pagination.

**Query Parameters:**
- `search` (string): Search term
- `ordering` (string): Field to order by
- `contractor` (string): Filter by contractor name
- `organization` (string): Filter by organization name
- `business_category` (string): Filter by category
- `area_of_delivery` (string): Filter by area
- `min_amount` (number): Minimum contract amount
- `max_amount` (number): Maximum contract amount
- `award_date_from` (date): Start date filter
- `award_date_to` (date): End date filter
- `is_awarded` (boolean): Filter awarded contracts
- `notice_status` (string): Notice status filter
- `award_status` (string): Award status filter

**Example Request:**
```http
GET /api/v1/contracts/?contractor=ABC+Corp&min_amount=100000&ordering=-award_date
```

**Example Response:**
```json
[
  {
    "id": 123,
    "reference_id": "ABC-2024-001",
    "notice_title": "Construction of School Building",
    "award_title": "Award for School Building Construction",
    "organization_name": "Department of Education",
    "contractor_name": "ABC Construction Corp",
    "business_category_name": "Construction",
    "area_of_delivery_name": "Metro Manila",
    "total_contract_amount": "5000000.00",
    "award_date": "2024-01-15",
    "award_status": "Awarded",
    "contract_no": "CN-2024-001",
    "created_at": "2024-01-10T08:30:00Z"
  }
]
```

---

### 2. Get Contract Details (GET /api/v1/contracts/{id}/)

**Description:** Retrieve detailed information about a specific contract.

**Path Parameters:**
- `id` (integer): Contract ID

**Example Request:**
```http
GET /api/v1/contracts/123/
```

**Example Response:**
```json
{
  "id": 123,
  "reference_id": "ABC-2024-001",
  "notice_title": "Construction of School Building",
  "award_title": "Award for School Building Construction",
  "publish_date": "2024-01-01",
  "award_date": "2024-01-15",
  "award_publish_date": "2024-01-20",
  "notice_to_proceed_date": "2024-02-01",
  "contract_effectivity_date": "2024-02-01",
  "contract_end_date": "2024-12-31",
  "classification": "Civil Works",
  "notice_type": "Public Bidding",
  "award_type": "Contract Award",
  "total_contract_amount": "5000000.00",
  "average_line_item_amount": "250000.00",
  "min_line_item_amount": "50000.00",
  "max_line_item_amount": "1000000.00",
  "line_item_count": 20,
  "notice_status": "Awarded",
  "award_status": "Contract Signed",
  "award_no": "AWD-2024-001",
  "contract_no": "CN-2024-001",
  "funding_source": "Government Appropriations",
  "procurement_mode": "Public Bidding",
  "contract_duration": "12 months",
  "calendar_type": "Calendar Days",
  "organization": {
    "id": 5,
    "name": "Department of Education",
    "contract_count": "1250",
    "total_contract_value": "12500000000.00",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  },
  "contractor": {
    "id": 42,
    "name": "ABC Construction Corp",
    "contract_count": "85",
    "total_contract_value": "425000000.00",
    "business_categories_count": "3",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-15T14:20:00Z"
  },
  "business_category": {
    "id": 12,
    "name": "Construction",
    "contract_count": "3450",
    "total_contract_value": "87500000000.00",
    "contractor_count": "850",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  },
  "area_of_delivery": {
    "id": 8,
    "name": "Metro Manila",
    "contract_count": "5620",
    "total_contract_value": "125000000000.00",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  },
  "is_awarded": "true",
  "contract_value_formatted": "₱5,000,000.00",
  "created_at": "2024-01-10T08:30:00Z",
  "updated_at": "2024-01-20T10:30:00Z"
}
```

---

### 3. Advanced Search (POST /api/v1/contracts/chip-search/)

**Description:** Search contracts with multiple filter chips using AND/OR logic.

**Request Body:**
```json
{
  "contractors": ["ABC Construction Corp", "XYZ Builders Inc"],
  "areas": ["Metro Manila", "Cebu"],
  "organizations": ["Department of Education", "DPWH"],
  "business_categories": ["Construction", "Goods"],
  "keywords": ["school", "building"],
  "time_ranges": [
    {
      "type": "yearly",
      "year": 2024
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

**Example Response:**
```json
{
  "data": [
    {
      "id": 1234567890,
      "reference_id": "ABC-2024-001",
      "notice_title": "Construction of School Building",
      "award_title": "Award for School Building Construction",
      "organization_name": "Department of Education",
      "awardee_name": "ABC Construction Corp",
      "business_category": "Construction",
      "area_of_delivery": "Metro Manila",
      "contract_amount": "5000000.00",
      "award_date": "2024-01-15",
      "award_status": "Contract Signed",
      "contract_no": "CN-2024-001",
      "created_at": "2024-01-10T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 150,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  }
}
```

---

### 4. Get Analytics Aggregates (POST /api/v1/contracts/chip-aggregates/)

**Description:** Get aggregated analytics data using the same filter criteria as search.

**Request Body:** (Same as chip-search)
```json
{
  "contractors": ["ABC Construction Corp"],
  "areas": ["Metro Manila"],
  "time_ranges": [
    {
      "type": "yearly",
      "year": 2024
    }
  ],
  "include_flood_control": false
}
```

**Example Response:**
```json
{
  "summary": [
    {
      "count": 150,
      "total_value": "750000000.00",
      "avg_value": "5000000.00"
    }
  ],
  "by_year": [
    {
      "year": 2024,
      "total_value": "750000000.00",
      "count": 150
    },
    {
      "year": 2023,
      "total_value": "625000000.00",
      "count": 125
    }
  ],
  "by_month": [
    {
      "month": "2024-01",
      "total_value": "125000000.00",
      "count": 25
    },
    {
      "month": "2024-02",
      "total_value": "150000000.00",
      "count": 30
    }
  ],
  "by_contractor": [
    {
      "label": "ABC Construction Corp",
      "total_value": "425000000.00",
      "count": 85,
      "avg_value": "5000000.00"
    },
    {
      "label": "XYZ Builders Inc",
      "total_value": "325000000.00",
      "count": 65,
      "avg_value": "5000000.00"
    }
  ],
  "by_organization": [
    {
      "label": "Department of Education",
      "total_value": "500000000.00",
      "count": 100
    },
    {
      "label": "DPWH",
      "total_value": "250000000.00",
      "count": 50
    }
  ],
  "by_area": [
    {
      "label": "Metro Manila",
      "total_value": "450000000.00",
      "count": 90
    },
    {
      "label": "Cebu",
      "total_value": "300000000.00",
      "count": 60
    }
  ],
  "by_category": [
    {
      "label": "Construction",
      "total_value": "600000000.00",
      "count": 120
    },
    {
      "label": "Goods",
      "total_value": "150000000.00",
      "count": 30
    }
  ]
}
```

---

### 5. Get Filter Options (GET /api/v1/contracts/filter-options/)

**Description:** Get available filter options for dropdowns (from parquet data).

**Example Request:**
```http
GET /api/v1/contracts/filter-options/
```

**Example Response:**
```json
{
  "contractors": [
    "ABC Construction Corp",
    "XYZ Builders Inc",
    "DEF Engineering Co"
  ],
  "organizations": [
    "Department of Education",
    "DPWH",
    "Department of Health"
  ],
  "business_categories": [
    "Construction",
    "Goods",
    "Consulting Services",
    "Infrastructure Projects"
  ],
  "areas": [
    "Metro Manila",
    "Cebu",
    "Davao",
    "Iloilo"
  ],
  "years": [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  "notice_statuses": [
    "Awarded",
    "Pending",
    "Cancelled"
  ],
  "award_statuses": [
    "Contract Signed",
    "Contract Approved",
    "Pending Approval"
  ]
}
```

---

### 6. Export Estimate (POST /api/v1/contracts/chip-export-estimate/)

**Description:** Estimate the number of records for export based on filters.

**Request Body:** (Same as chip-search)
```json
{
  "contractors": ["ABC Construction Corp"],
  "areas": ["Metro Manila"]
}
```

**Example Response:**
```json
{
  "estimated_count": 150,
  "estimated_size_mb": 2.5,
  "estimated_time_seconds": 5,
  "max_export_limit": 10000,
  "can_export": true,
  "warning": null
}
```

---

### 7. Export Data (POST /api/v1/contracts/chip-export/)

**Description:** Export filtered contract data to CSV/Excel.

**Request Body:** (Same as chip-search + format)
```json
{
  "contractors": ["ABC Construction Corp"],
  "areas": ["Metro Manila"],
  "format": "csv"
}
```

**Example Response:**
```json
{
  "download_url": "/api/v1/downloads/export-2024-11-08-123456.csv",
  "filename": "philgeps-export-2024-11-08.csv",
  "record_count": 150,
  "file_size_mb": 2.5,
  "expires_at": "2024-11-08T23:59:59Z"
}
```

---

## Entity Endpoints

### 1. List Contractors (GET /api/v1/contractors/)

**Description:** Get list of contractors with statistics.

**Query Parameters:**
- `search` (string): Search by name
- `ordering` (string): Order by field

**Example Request:**
```http
GET /api/v1/contractors/?search=construction&ordering=-total_contract_value
```

**Example Response:**
```json
[
  {
    "id": 42,
    "name": "ABC Construction Corp",
    "contract_count": "85",
    "total_contract_value": "425000000.00",
    "business_categories_count": "3",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-15T14:20:00Z"
  },
  {
    "id": 78,
    "name": "XYZ Construction Inc",
    "contract_count": "62",
    "total_contract_value": "310000000.00",
    "business_categories_count": "2",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-10T09:15:00Z"
  }
]
```

---

### 2. Get Contractor Details (GET /api/v1/contractors/{id}/)

**Description:** Get detailed information about a specific contractor.

**Example Request:**
```http
GET /api/v1/contractors/42/
```

**Example Response:**
```json
{
  "id": 42,
  "name": "ABC Construction Corp",
  "contract_count": "85",
  "total_contract_value": "425000000.00",
  "business_categories_count": "3",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2024-01-15T14:20:00Z"
}
```

---

### 3. List Organizations (GET /api/v1/organizations/)

**Description:** Get list of procuring organizations.

**Example Request:**
```http
GET /api/v1/organizations/?search=education&ordering=-contract_count
```

**Example Response:**
```json
[
  {
    "id": 5,
    "name": "Department of Education",
    "contract_count": "1250",
    "total_contract_value": "12500000000.00",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  }
]
```

---

### 4. List Business Categories (GET /api/v1/business-categories/)

**Description:** Get list of business categories.

**Example Request:**
```http
GET /api/v1/business-categories/?ordering=-total_contract_value
```

**Example Response:**
```json
[
  {
    "id": 12,
    "name": "Construction",
    "contract_count": "3450",
    "total_contract_value": "87500000000.00",
    "contractor_count": "850",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  }
]
```

---

### 5. List Areas of Delivery (GET /api/v1/areas-of-delivery/)

**Description:** Get list of delivery areas.

**Example Request:**
```http
GET /api/v1/areas-of-delivery/?search=manila
```

**Example Response:**
```json
[
  {
    "id": 8,
    "name": "Metro Manila",
    "contract_count": "5620",
    "total_contract_value": "125000000000.00",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  }
]
```

---

## Data Processing Endpoints

### 1. Query Entities (GET /api/v1/data-processing/query-entities/)

**Description:** Query entities (contractors, areas, organizations, categories) with pagination from Parquet data.

**Query Parameters:**
- `entity_type` (string): Type of entity (`contractors`, `areas`, `organizations`, `categories`)
- `page_index` (integer): Page index (0-based)
- `page_size` (integer): Number of items per page
- `time_range` (string): Time range (`all_time`, `yearly`, `quarterly`, `custom`)
- `year` (integer): Year filter (for yearly/quarterly)
- `quarter` (integer): Quarter filter (1-4)
- `start_date` (string): Start date for custom range (YYYY-MM-DD)
- `end_date` (string): End date for custom range (YYYY-MM-DD)
- `search` (string): Search query
- `sort_by` (string): Sort field (default: `total_contract_value`)
- `sort_dir` (string): Sort direction (`ASC`, `DESC`)
- `include_flood_control` (boolean): Include flood control data

**Example Request:**
```http
GET /api/v1/data-processing/query-entities/?entity_type=contractors&page_index=0&page_size=10&time_range=yearly&year=2024&sort_by=total_contract_value&sort_dir=DESC
```

**Example Response:**
```json
{
  "rows": [
    {
      "entity": "ABC Construction Corp",
      "contract_count": 85,
      "total_contract_value": 425000000.00,
      "average_contract_value": 5000000.00,
      "first_contract_date": "2024-01-15",
      "last_contract_date": "2024-12-20"
    },
    {
      "entity": "XYZ Builders Inc",
      "contract_count": 62,
      "total_contract_value": 310000000.00,
      "average_contract_value": 5000000.00,
      "first_contract_date": "2024-02-01",
      "last_contract_date": "2024-11-30"
    }
  ],
  "totalCount": 450,
  "pageIndex": 0,
  "pageSize": 10,
  "totalPages": 45
}
```

---

### 2. Query Related Entities (GET /api/v1/data-processing/query-related-entities/)

**Description:** Query related entities for drill-down functionality (e.g., find all organizations that worked with a specific contractor).

**Query Parameters:**
- `source_dim` (string): Source dimension (`contractor`, `area`, `organization`, `category`)
- `source_value` (string): Source entity value
- `target_dim` (string): Target dimension
- `limit` (integer): Number of results (default: 10)
- `time_range` (string): Time range filter
- `year` (integer): Year filter
- `quarter` (integer): Quarter filter

**Example Request:**
```http
GET /api/v1/data-processing/query-related-entities/?source_dim=contractor&source_value=ABC+Construction+Corp&target_dim=organization&limit=10&time_range=all_time
```

**Example Response:**
```json
[
  {
    "entity": "Department of Education",
    "contract_count": 35,
    "total_contract_value": 175000000.00,
    "average_contract_value": 5000000.00,
    "first_contract_date": "2024-01-15",
    "last_contract_date": "2024-12-20"
  },
  {
    "entity": "DPWH",
    "contract_count": 28,
    "total_contract_value": 140000000.00,
    "average_contract_value": 5000000.00,
    "first_contract_date": "2024-02-01",
    "last_contract_date": "2024-11-15"
  }
]
```

---

### 3. Query Contracts by Entity (POST /api/v1/data-processing/query-contracts-by-entity/)

**Description:** Query contracts filtered by specific entity dimensions.

**Request Body:**
```json
{
  "filters": [
    {
      "dim": "contractor",
      "value": "ABC Construction Corp"
    },
    {
      "dim": "area",
      "value": "Metro Manila"
    }
  ],
  "page_index": 0,
  "page_size": 20,
  "order_by": "award_date DESC",
  "time_range": "yearly",
  "year": 2024
}
```

**Example Response:**
```json
{
  "rows": [
    {
      "award_date": "2024-12-20",
      "contractor_name": "ABC Construction Corp",
      "business_category": "Construction",
      "organization_name": "Department of Education",
      "area_of_delivery": "Metro Manila",
      "contract_value": "5000000.00",
      "award_title": "School Building Construction",
      "notice_title": "Construction of Elementary School",
      "contract_no": "CN-2024-150"
    }
  ],
  "totalCount": 85,
  "pageIndex": 0,
  "pageSize": 20,
  "totalPages": 5
}
```

---

### 4. Get Available Time Ranges (GET /api/v1/data-processing/available-time-ranges/)

**Description:** Get available time ranges, years, and quarters from the data.

**Example Request:**
```http
GET /api/v1/data-processing/available-time-ranges/
```

**Example Response:**
```json
{
  "all_time": true,
  "yearly": true,
  "quarterly": true,
  "years": [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  "quarters": [
    "year_2013_q1", "year_2013_q2", "year_2013_q3", "year_2013_q4",
    "year_2014_q1", "year_2014_q2", "year_2014_q3", "year_2014_q4"
  ]
}
```

---

## Data Import Endpoints

### 1. List Data Imports (GET /api/v1/data-imports/)

**Description:** Get list of data import jobs.

**Query Parameters:**
- `ordering` (string): Order by field

**Example Request:**
```http
GET /api/v1/data-imports/?ordering=-created_at
```

**Example Response:**
```json
[
  {
    "id": 15,
    "filename": "contracts_2024_q1.xlsx",
    "file_path": "/uploads/contracts_2024_q1.xlsx",
    "import_type": "xlsx",
    "status": "completed",
    "total_records": 5000,
    "processed_records": 5000,
    "failed_records": 0,
    "progress_percentage": "100.00",
    "error_message": null,
    "error_details": null,
    "started_at": "2024-11-08T10:00:00Z",
    "completed_at": "2024-11-08T10:15:00Z",
    "duration": "15 minutes",
    "created_by": 1
  }
]
```

---

### 2. Create Data Import (POST /api/v1/data-imports/)

**Description:** Create a new data import job.

**Request Body:**
```json
{
  "filename": "contracts_2024_q2.xlsx",
  "file_path": "/uploads/contracts_2024_q2.xlsx",
  "import_type": "xlsx",
  "status": "pending",
  "total_records": 6000,
  "created_by": 1
}
```

**Example Response:**
```json
{
  "id": 16,
  "filename": "contracts_2024_q2.xlsx",
  "file_path": "/uploads/contracts_2024_q2.xlsx",
  "import_type": "xlsx",
  "status": "pending",
  "total_records": 6000,
  "processed_records": 0,
  "failed_records": 0,
  "progress_percentage": "0.00",
  "error_message": null,
  "error_details": null,
  "started_at": "2024-11-08T11:00:00Z",
  "completed_at": null,
  "duration": "0 seconds",
  "created_by": 1
}
```

---

### 3. Get Import Status (GET /api/v1/data-imports/{id}/)

**Description:** Get detailed status of a specific import job.

**Example Request:**
```http
GET /api/v1/data-imports/16/
```

**Example Response:**
```json
{
  "id": 16,
  "filename": "contracts_2024_q2.xlsx",
  "file_path": "/uploads/contracts_2024_q2.xlsx",
  "import_type": "xlsx",
  "status": "processing",
  "total_records": 6000,
  "processed_records": 3500,
  "failed_records": 25,
  "progress_percentage": "58.33",
  "error_message": null,
  "error_details": null,
  "started_at": "2024-11-08T11:00:00Z",
  "completed_at": null,
  "duration": "5 minutes 30 seconds",
  "created_by": 1
}
```

---

## Common Response Structures

### Error Response

**Structure:**
```json
{
  "error": "Error message here",
  "details": "Additional error details (optional)"
}
```

**Example:**
```json
{
  "error": "Invalid time range",
  "details": "Year must be between 2013 and 2025"
}
```

---

### Pagination Metadata

**Structure:**
```json
{
  "page": 1,
  "page_size": 20,
  "total_count": 150,
  "total_pages": 8,
  "has_next": true,
  "has_previous": false
}
```

---

### Time Range Filter Object

**Structure:**
```json
{
  "type": "yearly|quarterly|custom",
  "year": 2024,
  "quarter": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Examples:**

**Yearly:**
```json
{
  "type": "yearly",
  "year": 2024
}
```

**Quarterly:**
```json
{
  "type": "quarterly",
  "year": 2024,
  "quarter": 1
}
```

**Custom Range:**
```json
{
  "type": "custom",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```

---

## Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (for POST requests) |
| 204 | No Content (for DELETE requests) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Authentication

Most endpoints support multiple authentication methods:

1. **Cookie Authentication** (for web browser sessions)
2. **Basic Authentication** (username:password)
3. **Public Access** (no authentication required for read-only endpoints)

**Example with Basic Auth:**
```http
GET /api/v1/contracts/
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

---

## Rate Limiting

- Default rate limit: 1000 requests per hour per IP
- Export endpoints: 10 exports per hour per user
- Large data queries: May be throttled during peak hours

---

## Data Types Reference

| Type | Format | Example |
|------|--------|---------|
| date | YYYY-MM-DD | "2024-01-15" |
| datetime | ISO 8601 | "2024-01-15T08:30:00Z" |
| decimal | String with 2 decimals | "5000000.00" |
| integer | Number | 123 |
| boolean | true/false | true |
| string | Text | "ABC Construction Corp" |

---

## Common Filter Patterns

### 1. Search by Keyword
```
?search=construction
```

### 2. Date Range
```
?award_date_from=2024-01-01&award_date_to=2024-12-31
```

### 3. Amount Range
```
?min_amount=100000&max_amount=5000000
```

### 4. Sorting
```
?ordering=-award_date  (descending)
?ordering=contract_amount  (ascending)
```

### 5. Multiple Filters
```
?contractor=ABC+Corp&area_of_delivery=Metro+Manila&min_amount=100000&ordering=-award_date
```

---

## Best Practices

1. **Use pagination** for large datasets to improve performance
2. **Cache filter options** from `/filter-options/` endpoint
3. **Estimate exports** before requesting large data exports
4. **Use time range filters** to reduce query scope
5. **Implement client-side debouncing** for search inputs
6. **Handle errors gracefully** with proper error messages
7. **Use proper date formats** (YYYY-MM-DD for dates, ISO 8601 for datetimes)

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2024-11-08 | 1.0.0 | Initial API documentation with examples |

---

**For more information:**
- OpenAPI Schema: `/backend/django/openapi-schema.yaml`
- API Documentation UI: Available at `/api/docs/` (when server is running)
- Active API Documentation: `docs/ACTIVE_API_DOCUMENTATION.md`
