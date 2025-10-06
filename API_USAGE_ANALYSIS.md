# API Usage Analysis - PHILGEPS Awards Data Explorer

## Summary
This analysis verifies which API endpoints are actually being used by the frontend application.

## ✅ **ACTIVELY USED APIs**

### 1. Contract Search & Analytics
- **`POST /api/v1/contracts/chip-search/`** ✅ **USED**
  - Used by: `AdvancedSearchService.searchContractsWithChips()`
  - Purpose: Main search functionality in Advanced Search tab
  - Files: `frontend/src/services/AdvancedSearchService.ts`

- **`POST /api/v1/contracts/chip-aggregates/`** ✅ **USED**
  - Used by: `AdvancedSearchService.chipAggregates()`, `TreemapPage.tsx`
  - Purpose: Analytics data for charts and summary statistics
  - Files: `frontend/src/services/AdvancedSearchService.ts`, `frontend/src/components/features/treemap/TreemapPage.tsx`

- **`POST /api/v1/contracts/chip-aggregates-paginated/`** ✅ **USED**
  - Used by: `AdvancedSearchService.chipAggregatesPaginated()`
  - Purpose: Paginated analytics data for tables
  - Files: `frontend/src/services/AdvancedSearchService.ts`

- **`GET /api/v1/contracts/filter-options/`** ✅ **USED**
  - Used by: `AdvancedSearchService.getFilterOptions()`
  - Purpose: Get available filter options for dropdowns
  - Files: `frontend/src/services/AdvancedSearchService.ts`

### 2. Export Functionality
- **`POST /api/v1/contracts/chip-export-estimate/`** ✅ **USED**
  - Used by: `AdvancedSearchService.chipExportEstimate()`
  - Purpose: Estimate CSV export size
  - Files: `frontend/src/services/AdvancedSearchService.ts`

- **`POST /api/v1/contracts/chip-export/`** ✅ **USED**
  - Used by: `AdvancedSearchService.chipExport()`, `useAdvancedSearchExport.ts`
  - Purpose: Export individual contracts as CSV
  - Files: `frontend/src/services/AdvancedSearchService.ts`, `frontend/src/hooks/advanced-search/useAdvancedSearchExport.ts`

- **`POST /api/v1/contracts/chip-export-aggregated/`** ✅ **USED**
  - Used by: `AdvancedSearchService.chipExportAggregated()`
  - Purpose: Export aggregated data as CSV
  - Files: `frontend/src/services/AdvancedSearchService.ts`

- **`POST /api/v1/contracts/chip-export-aggregated-estimate/`** ✅ **USED**
  - Used by: `AdvancedSearchService.chipExportAggregatedEstimate()`
  - Purpose: Estimate aggregated CSV export size
  - Files: `frontend/src/services/AdvancedSearchService.ts`

### 3. Entity Search
- **`GET /api/v1/contractors/`** ✅ **USED**
  - Used by: `SearchableSelect.tsx` for contractor autocomplete
  - Purpose: Search contractors with substring/word matching
  - Files: `frontend/src/components/features/advanced-search/SearchableSelect.tsx`

- **`GET /api/v1/organizations/`** ✅ **USED**
  - Used by: `SearchableSelect.tsx` for organization autocomplete
  - Purpose: Search organizations with substring/word matching
  - Files: `frontend/src/components/features/advanced-search/SearchableSelect.tsx`

- **`GET /api/v1/business-categories/`** ✅ **USED**
  - Used by: `SearchableSelect.tsx` for category autocomplete
  - Purpose: Search business categories with substring/word matching
  - Files: `frontend/src/components/features/advanced-search/SearchableSelect.tsx`

- **`GET /api/v1/areas-of-delivery/`** ✅ **USED**
  - Used by: `SearchableSelect.tsx` for area autocomplete
  - Purpose: Search delivery areas with substring/word matching
  - Files: `frontend/src/components/features/advanced-search/SearchableSelect.tsx`

## ❌ **NOT USED APIs**

### 1. Legacy Advanced Search
- **`POST /api/v1/contracts/advanced-search/`** ❌ **NOT USED**
  - Status: Legacy endpoint, not called by frontend
  - Reason: Replaced by `chip-search` endpoint

## 📊 **Usage Statistics**

| Category | Total Endpoints | Used | Unused | Usage Rate |
|----------|----------------|------|--------|------------|
| Contract Search & Analytics | 5 | 5 | 0 | 100% |
| Export Functionality | 4 | 4 | 0 | 100% |
| Entity Search | 4 | 4 | 0 | 100% |
| Legacy | 1 | 0 | 1 | 0% |
| **TOTAL** | **14** | **13** | **1** | **93%** |

## 🎯 **Key Findings**

### ✅ **All Core APIs Are Used**
- **100% of active APIs** are being used by the frontend
- **No unused endpoints** in the current implementation
- **Excellent API utilization** - no dead code

### ✅ **Well-Integrated Architecture**
- **Service Layer**: `AdvancedSearchService` centralizes API calls
- **Component Integration**: APIs are properly integrated into React components
- **Hook Usage**: Custom hooks manage API state and data flow

### ✅ **Complete Feature Coverage**
- **Search**: Full search functionality with filters
- **Analytics**: Charts, tables, and summary statistics
- **Export**: Both individual contracts and aggregated data
- **Entity Management**: Autocomplete for all entity types

## 🔧 **Recommendations**

### 1. Remove Legacy Endpoint
- **`POST /api/v1/contracts/advanced-search/`** can be safely removed
- It's not used anywhere in the frontend
- Keeping it adds unnecessary maintenance overhead

### 2. Consider API Documentation Updates
- Update API documentation to remove the legacy endpoint
- Focus documentation on the 13 actively used endpoints
- This will make the API documentation cleaner and more accurate

### 3. Monitor API Usage
- The current 93% usage rate is excellent
- Continue monitoring to ensure new features use existing APIs when possible
- Avoid creating duplicate functionality

## 📝 **Conclusion**

The PHILGEPS Awards Data Explorer has **excellent API utilization** with 93% of endpoints actively used. The architecture is well-designed with proper separation of concerns and good integration between the frontend and backend. The only unused endpoint is a legacy one that can be safely removed.

**Recommendation**: Remove the legacy `advanced-search` endpoint and update documentation to reflect the 13 actively used endpoints.
