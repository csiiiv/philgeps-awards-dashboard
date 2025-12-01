# Value Range Filter Fix - Snake_case vs CamelCase

**Date**: November 27, 2025  
**Priority**: CRITICAL  
**Status**: FIXED ✅

## Problem Summary

The value range filter was **not being applied** in analytics and drill-down views, despite working correctly in the main advanced search results.

### User-Reported Symptoms

```
Advanced Search Results:
- Keywords: "concreting"
- Area: "cagayan"
- Value Range: 4M to 6M
- Results: 192 contracts ✅ CORRECT

Analytics Modal (Show Analytics button):
- Same filters applied
- Results: 2,188 contracts ❌ WRONG (same as no value range)
```

## Root Cause

**Field naming inconsistency** between frontend and backend:

| Component | Expected Field Name | What We Had |
|-----------|-------------------|-------------|
| **Backend API** | `value_range` (snake_case) | - |
| **Frontend Interface** | `value_range` (snake_case) | ❌ `valueRange` (camelCase) |
| **Frontend Parameters** | `value_range` (snake_case) | ❌ `valueRange` (camelCase) |

The backend was silently **ignoring** the `valueRange` parameter because it expected `value_range`.

## Technical Explanation

### Backend Expected (Python/Django)

```python
# backend/django/contracts/openapi_serializers.py
value_range = serializers.DictField(
    required=False,
    default=None,
    help_text="Contract value range filter with min and max values"
)
```

### Frontend Was Sending (TypeScript)

```typescript
// ❌ WRONG - Backend doesn't recognize this field
{
  valueRange: { min: 4000000, max: 6000000 }
}
```

### Frontend Should Send (TypeScript)

```typescript
// ✅ CORRECT - Backend recognizes this field
{
  value_range: { min: 4000000, max: 6000000 }
}
```

## Files Changed

### 1. TypeScript Interface Definition
**File**: `frontend/src/services/AdvancedSearchService.ts`

```diff
export interface ChipSearchParams {
  // ... other fields ...
- valueRange?: {  // ❌ Wrong
+ value_range?: {  // ✅ Correct - Backend expects snake_case
    min?: number
    max?: number
  }
}
```

### 2. Advanced Search Component
**File**: `frontend/src/components/features/advanced-search/AdvancedSearch.tsx`

```diff
return {
  contractors: filtersHook.filters.contractors,
  // ... other fields ...
- valueRange: filtersHook.valueRange,  // ❌ Wrong
+ value_range: filtersHook.valueRange,  // ✅ Correct
}
```

### 3. Unified Analytics Hook
**File**: `frontend/src/hooks/useUnifiedAnalytics.ts`

```diff
// Analytics mode
return {
  // ... other fields ...
- valueRange: currentFilters.valueRange  // ❌ Wrong
+ value_range: currentFilters.value_range  // ✅ Correct
}

// Explorer mode
return {
  // ... other fields ...
- valueRange: { min: 0, max: 1000000000000 }  // ❌ Wrong
+ value_range: { min: 0, max: 1000000000000 }  // ✅ Correct
}
```

### 4. Data Explorer Component
**File**: `frontend/src/components/features/data-explorer/DataExplorer.tsx`

```diff
// For analytics
- valueRange: { min: 0, max: 1000000000000 }  // ❌ Wrong
+ value_range: { min: 0, max: 1000000000000 }  // ✅ Correct

// For exports
- valueRange: { min: 0, max: 1000000000000 }  // ❌ Wrong
+ value_range: { min: 0, max: 1000000000000 }  // ✅ Correct
```

### 5. Entity Filters Hook
**File**: `frontend/src/hooks/useEntityFilters.ts`

```diff
const response = await advancedSearchService.chipAggregates({
  // ... other fields ...
- valueRange: undefined  // ❌ Wrong
+ value_range: undefined  // ✅ Correct
})
```

### 6. Export Tester Utility
**File**: `frontend/archive/UnifiedExportTester.tsx` (archived utility)

```diff
filters: {
  // ... other fields ...
- valueRange: null  // ❌ Wrong
+ value_range: null  // ✅ Correct
}
```

### 7. **Advanced Search Service** (THE CRITICAL FIX)
**File**: `frontend/src/services/AdvancedSearchService.ts`

This was the actual root cause discovered in Round 2:

```diff
// In searchContractsWithChips, chipAggregates, chipAggregatesPaginated, 
// exportEstimate, exportData, exportAggregatedData, exportAggregatedDataEstimate:

- value_range: this.getDefaultValueRange(params.valueRange)  // ❌ Wrong - undefined!
+ value_range: this.getDefaultValueRange(params.value_range)  // ✅ Correct
```

**Why This Mattered:**

The service had a helper method that applied defaults:

```typescript
private getDefaultValueRange(valueRange?: {...}): {...} {
  if (!valueRange || (valueRange.min === undefined && valueRange.max === undefined)) {
    return { min: 0, max: 1000000000000 } // Default to 0-1T
  }
  return valueRange
}
```

When we changed the interface to `value_range`, `params.valueRange` became `undefined`. The helper then **replaced the undefined with defaults**, completely overriding the user's actual filter!

**Result**: User's 4M-6M filter → Undefined → Defaults (0-1T) → Backend returned ALL contracts

## Why This Happened

### Convention Mismatch

- **Python/Django Backend**: Uses `snake_case` for field names (PEP 8 convention)
- **TypeScript/React Frontend**: Often uses `camelCase` for JavaScript variables

### Silent Failure

The backend **did not throw an error** when receiving `valueRange` - it simply ignored it because:
1. The field is **optional** (`required=False`)
2. Django serializers silently skip unknown fields
3. No validation error was raised

This caused the filter to be **silently dropped**, making it appear that all contracts (not just those within the value range) were being returned.

## Impact

### Before Fix ❌

1. **Advanced Search Results**: Value range worked (192 results)
2. **Analytics Modal**: Value range ignored (2,188 results)
3. **Drill-Down Views**: Value range ignored
4. **Data Explorer**: Value range ignored
5. **Export Functions**: Value range ignored

### After Fix ✅

1. **Advanced Search Results**: Value range works (192 results)
2. **Analytics Modal**: Value range works (192 results)
3. **Drill-Down Views**: Value range works
4. **Data Explorer**: Value range works
5. **Export Functions**: Value range works

## Testing

### Manual Test Scenario

```
1. Go to http://localhost:3000/advanced-search
2. Set filters:
   - Keywords: "concreting"
   - Area: "cagayan"
   - Value Range: 4M to 6M
3. Click "Search"
   ✅ EXPECTED: ~192 results
4. Click "Show Analytics"
   ✅ EXPECTED: Total contracts should also be ~192, not 2,188
5. Click any contractor in the chart
   ✅ EXPECTED: All contracts should be between 4M-6M
```

### Automated Verification

```bash
# Start the services
docker compose -f docker-compose.ram.yml up -d

# Test advanced search with value range
curl -X POST 'http://localhost:3200/api/v1/contracts/search/chips/' \
  -H 'Content-Type: application/json' \
  -d '{
    "keywords": ["concreting"],
    "areas": ["cagayan"],
    "value_range": {"min": 4000000, "max": 6000000}
  }'

# Test analytics with value range
curl -X POST 'http://localhost:3200/api/v1/contracts/aggregates/chips/' \
  -H 'Content-Type: application/json' \
  -d '{
    "keywords": ["concreting"],
    "areas": ["cagayan"],
    "value_range": {"min": 4000000, "max": 6000000}
  }'

# Both should return similar counts
```

## Lessons Learned

### 1. API Contract Consistency

- Always verify field naming conventions between frontend and backend
- Document expected field names in API specifications
- Use OpenAPI/Swagger schemas to catch mismatches early

### 2. Validation & Error Handling

- Consider making the backend **strict** about unknown fields
- Add logging when optional parameters are missing
- Validate that critical filters are being applied

### 3. Type Safety

- Use TypeScript interfaces that **exactly match** backend schemas
- Consider auto-generating TypeScript types from backend serializers
- Use tools like `openapi-typescript` to generate types from OpenAPI specs

### 4. Testing

- Test all filter combinations, not just happy paths
- Verify that filters work across all views (search, analytics, drill-downs)
- Add automated tests for filter parameter serialization

## Recommendations

### Short Term ✅ DONE

- [x] Fix all `valueRange` → `value_range` occurrences
- [x] Rebuild frontend with correct field names
- [x] Verify analytics now respects value range
- [x] Document the fix

### Medium Term 🔄 RECOMMENDED

- [ ] Add backend logging for applied filters (see what's being used)
- [ ] Add frontend logging for API request parameters (debug view)
- [ ] Create integration tests for all filter combinations
- [ ] Add TypeScript linting rules to catch snake_case in API params

### Long Term 🎯 FUTURE

- [ ] Auto-generate TypeScript types from Django serializers
- [ ] Implement OpenAPI schema validation in CI/CD
- [ ] Create a naming convention guide for the project
- [ ] Add automated API contract testing (backend↔️frontend)

## Status

✅ **FULLY FIXED** - Both interface naming and service layer parameter access corrected.

### Fix History

**Round 1** (Initial Fix):
- Changed TypeScript interfaces from `valueRange` → `value_range`
- Updated 6 components/hooks
- Result: Interfaces matched backend, but service layer still broken

**Round 2** (Complete Fix):
- Fixed `AdvancedSearchService.ts` to use `params.value_range` instead of `params.valueRange`
- Updated 7 method calls in the service layer
- Result: Value range now correctly passed to backend API

### The Critical Missing Piece

The service layer had this pattern in 7 methods:

```typescript
// ❌ WRONG - params.valueRange was undefined after interface change
value_range: this.getDefaultValueRange(params.valueRange)

// ✅ CORRECT - now accesses the right property
value_range: this.getDefaultValueRange(params.value_range)
```

When `params.valueRange` was undefined, `getDefaultValueRange()` returned default values (0 to 1 trillion), completely replacing the user's actual filter!

## Related Issues

- **Previous Fix**: NULL value handling in area/organization filters ([docs/FILTERING_ISSUE_ANALYSIS.md](./FILTERING_ISSUE_ANALYSIS.md))
- **Previous Fix**: Value range not passed to drill-down modals (fixed in EntityDrillDownModal.tsx)

## References

- Backend Serializer: `backend/django/contracts/openapi_serializers.py` (line 142)
- Frontend Interface: `frontend/src/services/AdvancedSearchService.ts` (line 44)
- Django REST Framework Serializers: https://www.django-rest-framework.org/api-guide/serializers/
- Python PEP 8 Naming Conventions: https://peps.python.org/pep-0008/#naming-conventions

