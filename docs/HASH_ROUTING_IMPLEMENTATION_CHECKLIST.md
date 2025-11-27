# Hash Routing Implementation Checklist

Step-by-step guide for implementing the recommended improvements.

---

## 🎯 Phase 1: Quick Wins (45 minutes)

### Step 1: Extract `parseHashParams()` Utility (10 min)

- [ ] Open `frontend/src/utils/urlState.ts`

- [ ] Add the utility function at the top (after imports, before other functions):

```typescript
/**
 * Parse URL hash into URLSearchParams
 * Centralized to avoid duplication across components
 */
export function parseHashParams(hash?: string): URLSearchParams {
  const currentHash = hash ?? window.location.hash
  const cleanHash = currentHash.startsWith('#') 
    ? currentHash.substring(1) 
    : currentHash
  return new URLSearchParams(cleanHash)
}
```

- [ ] **File: `AdvancedSearch.tsx`** - Replace line 203-206:

```typescript
// ❌ REMOVE:
const hash = window.location.hash
const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
const params = new URLSearchParams(cleanHash)
const tabParam = params.get('tab')

// ✅ REPLACE WITH:
const params = parseHashParams()
const tabParam = params.get('tab')
```

- [ ] **File: `AnalyticsExplorer.tsx`** - Replace line 203-206:

```typescript
// ❌ REMOVE:
const hash = window.location.hash
const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
const params = new URLSearchParams(cleanHash)

// ✅ REPLACE WITH:
const params = parseHashParams()
```

- [ ] **File: `AnalyticsExplorer.tsx`** - Replace line 220-222:

```typescript
// ❌ REMOVE:
const hash = window.location.hash
const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
const params = new URLSearchParams(cleanHash)

// ✅ REPLACE WITH:
const params = parseHashParams()
```

- [ ] **File: `AnalyticsExplorer.tsx`** - Replace line 241-243:

```typescript
// ❌ REMOVE:
const hash = window.location.hash
const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
const params = new URLSearchParams(cleanHash)

// ✅ REPLACE WITH:
const params = parseHashParams()
```

- [ ] Add import at top of both files:

```typescript
import { 
  getFiltersFromUrl, 
  updateUrlHash, 
  hasUrlFilters,
  parseHashParams  // ← Add this
} from '../../../utils/urlState'
```

- [ ] **Test**: Run the app, verify filters and tabs still work

---

### Step 2: Add URL Validation (20 min)

- [ ] Open `frontend/src/utils/urlState.ts`

- [ ] Add validation function before `decodeFiltersFromHash`:

```typescript
/**
 * Validate and sanitize filter state parameters
 * Prevents invalid values from crashing the app
 */
export function validateFilterState(filters: FilterState): FilterState {
  const validated: FilterState = { ...filters }
  
  // Validate year (1900-2100)
  if (validated.year !== undefined) {
    const year = validated.year
    if (year < 1900 || year > 2100 || isNaN(year)) {
      console.warn(`[URL Validation] Invalid year: ${year}. Ignoring.`)
      delete validated.year
    }
  }
  
  // Validate quarter (1-4)
  if (validated.quarter !== undefined) {
    const quarter = validated.quarter
    if (quarter < 1 || quarter > 4 || isNaN(quarter)) {
      console.warn(`[URL Validation] Invalid quarter: ${quarter}. Ignoring.`)
      delete validated.quarter
    }
  }
  
  // Validate min value
  if (validated.minValue !== undefined && isNaN(validated.minValue)) {
    console.warn(`[URL Validation] Invalid minValue: ${validated.minValue}. Ignoring.`)
    delete validated.minValue
  }
  
  // Validate max value
  if (validated.maxValue !== undefined && isNaN(validated.maxValue)) {
    console.warn(`[URL Validation] Invalid maxValue: ${validated.maxValue}. Ignoring.`)
    delete validated.maxValue
  }
  
  // Validate start date
  if (validated.startDate) {
    const date = new Date(validated.startDate)
    if (date.toString() === 'Invalid Date') {
      console.warn(`[URL Validation] Invalid startDate: ${validated.startDate}. Ignoring.`)
      delete validated.startDate
    }
  }
  
  // Validate end date
  if (validated.endDate) {
    const date = new Date(validated.endDate)
    if (date.toString() === 'Invalid Date') {
      console.warn(`[URL Validation] Invalid endDate: ${validated.endDate}. Ignoring.`)
      delete validated.endDate
    }
  }
  
  return validated
}
```

- [ ] Update `decodeFiltersFromHash` to use validation:

```typescript
export function decodeFiltersFromHash(hash: string): FilterState {
  try {
    // Remove leading # if present
    const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
    const params = new URLSearchParams(cleanHash)

    const filters: FilterState = {}

    // ... existing decode logic (all the params.get() calls) ...

    // ADD THIS AT THE END before return:
    return validateFilterState(filters)
    
  } catch (error) {
    console.error('[URL Decode] Error decoding URL hash:', error)
    return {}
  }
}
```

- [ ] **Test**: Try these URLs to verify validation works:
  - `#year=9999` (should be ignored)
  - `#quarter=5` (should be ignored)
  - `#min=invalid` (should be ignored)
  - `#startDate=not-a-date` (should be ignored)

---

### Step 3: Standardize History Management (15 min)

- [ ] Open `frontend/src/utils/urlState.ts`

- [ ] Update `updateUrlHash` function signature and implementation:

```typescript
/**
 * Update URL hash with current filter state
 * @param filters - Filter state to encode
 * @param addToHistory - Whether to add to browser history (default: true)
 *                       Use true for filter changes (user can go back)
 *                       Use false for UI changes like tabs (don't clutter history)
 */
export function updateUrlHash(filters: FilterState, addToHistory: boolean = true): void {
  console.log('🔗 updateUrlHash called with filters:', filters)
  const hash = encodeFiltersToHash(filters)
  console.log('🔗 Encoded hash:', hash)
  
  if (hash) {
    const newUrl = `#${hash}`
    
    if (addToHistory) {
      // Add to history - allows browser back/forward
      window.location.hash = hash
      console.log('🔗 URL updated (added to history):', window.location.href)
    } else {
      // Replace current history entry - doesn't add to stack
      window.history.replaceState(null, '', newUrl)
      console.log('🔗 URL updated (replaced history):', window.location.href)
    }
  } else {
    // Clear hash if no filters
    history.pushState('', document.title, window.location.pathname + window.location.search)
    console.log('🔗 URL hash cleared')
  }
}
```

- [ ] **File: `AdvancedSearch.tsx`** - Update calls to `updateUrlHash`:

Find all calls (lines 383, 481, 506) and ensure they use `true` (default):

```typescript
// For filter changes - add to history
updateUrlHash(urlState)  // or updateUrlHash(urlState, true)
```

- [ ] **File: `AnalyticsExplorer.tsx`** - Replace manual history update (line 233):

```typescript
// ❌ REMOVE:
window.history.replaceState(null, '', newHash)

// ✅ REPLACE WITH:
// First, get current filters from URL
const currentParams = parseHashParams()
const currentFilters = getFiltersFromUrl()

// Update with new tab
updateUrlHash(
  { ...currentFilters, tab },
  false  // Don't add to history for tab changes
)
```

- [ ] **Test Browser Navigation**:
  - [ ] Apply a filter → Click back → Should return to no filter
  - [ ] Open analytics → Click back → Should close analytics
  - [ ] Change tab → Click back → Should NOT go to previous tab
  - [ ] Change tab multiple times → Click back → Should skip tab changes

---

## ✅ Phase 1 Verification

After completing all steps above, verify:

### Functional Tests

- [ ] **URL Parsing**: 
  - [ ] Apply filter → URL updates correctly
  - [ ] Reload page → Filter restored
  - [ ] Share URL → Works in incognito

- [ ] **URL Validation**:
  - [ ] Try `#year=9999` → Ignored (console warning)
  - [ ] Try `#quarter=5` → Ignored (console warning)
  - [ ] Try `#min=abc` → Ignored (console warning)
  - [ ] App doesn't crash with bad URLs

- [ ] **History Management**:
  - [ ] Filter changes add to history (can go back)
  - [ ] Tab changes don't add to history (cleaner navigation)
  - [ ] Back button behaves predictably

### Code Quality

- [ ] No duplicate URL parsing code
- [ ] No console errors
- [ ] All imports working
- [ ] TypeScript compiles without errors

### Performance

- [ ] No noticeable slowdown
- [ ] URL updates are instant
- [ ] No infinite loops

---

## 🟡 Phase 2: Advanced Improvements (Optional, 1-2 hours)

### Step 4: Extract Comparison Logic (30 min)

- [ ] Open `frontend/src/utils/urlState.ts`

- [ ] Add comparison utilities:

```typescript
/**
 * Deep equality comparison for filter values
 * Handles arrays, undefined/null/empty string equivalence, and defaults
 */
export function areFiltersEqual(val1: any, val2: any): boolean {
  // Handle arrays (sort and compare)
  if (Array.isArray(val1) || Array.isArray(val2)) {
    const arr1 = (Array.isArray(val1) ? val1 : []).filter(Boolean).sort()
    const arr2 = (Array.isArray(val2) ? val2 : []).filter(Boolean).sort()
    return JSON.stringify(arr1) === JSON.stringify(arr2)
  }
  
  // Handle dates/strings (empty string equals undefined/null)
  if ((val1 === '' || val1 === null || val1 === undefined) && 
      (val2 === '' || val2 === null || val2 === undefined)) {
    return true
  }
  
  // Handle Date Range Type default (state 'all_time' vs url undefined)
  if (val1 === 'all_time' && !val2) return true
  if (!val1 && val2 === 'all_time') return true
  
  return val1 === val2
}

/**
 * Compare complete filter states
 * Returns which parts changed: filters, view, or tab
 */
export function compareFilterStates(
  state: FilterState, 
  urlFilters: FilterState
): { filtersMatch: boolean; viewMatch: boolean; tabMatch: boolean } {
  const filtersMatch = 
    areFiltersEqual(state.keywords, urlFilters.keywords) &&
    areFiltersEqual(state.contractors, urlFilters.contractors) &&
    areFiltersEqual(state.areas, urlFilters.areas) &&
    areFiltersEqual(state.organizations, urlFilters.organizations) &&
    areFiltersEqual(state.business_categories, urlFilters.business_categories) &&
    areFiltersEqual(state.minValue, urlFilters.minValue) &&
    areFiltersEqual(state.maxValue, urlFilters.maxValue) &&
    areFiltersEqual(state.includeFloodControl ?? false, urlFilters.includeFloodControl ?? false) &&
    areFiltersEqual(state.dateRangeType, urlFilters.dateRangeType) &&
    areFiltersEqual(state.year, urlFilters.year) &&
    areFiltersEqual(state.quarter, urlFilters.quarter) &&
    areFiltersEqual(state.startDate, urlFilters.startDate) &&
    areFiltersEqual(state.endDate, urlFilters.endDate)
    
  const viewMatch = areFiltersEqual(state.view, urlFilters.view)
  const tabMatch = areFiltersEqual(state.tab, urlFilters.tab)
  
  return { filtersMatch, viewMatch, tabMatch }
}
```

- [ ] **File: `AdvancedSearch.tsx`** - Refactor `handleHashChange`:

Replace the inline `isEqual` function and all comparisons (lines 199-247) with:

```typescript
const handleHashChange = () => {
  console.log('🔗 Hash changed detected')
  
  if (!hasUrlFilters()) {
    return
  }

  // Get current URL filters
  const urlFilters = getFiltersFromUrl()
  console.log('🔗 Current URL filters:', urlFilters)
  
  // Build current state for comparison
  const currentState: FilterState = {
    keywords: filtersHook.filters.keywords,
    contractors: filtersHook.filters.contractors,
    areas: filtersHook.filters.areas,
    organizations: filtersHook.filters.organizations,
    business_categories: filtersHook.filters.business_categories,
    minValue: filtersHook.valueRange?.min,
    maxValue: filtersHook.valueRange?.max,
    includeFloodControl: filtersHook.includeFloodControl,
    dateRangeType: filtersHook.dateRange.type,
    year: filtersHook.dateRange.year,
    quarter: filtersHook.dateRange.quarter,
    startDate: filtersHook.dateRange.startDate,
    endDate: filtersHook.dateRange.endDate
  }
  
  // Use utility for comparison
  const { filtersMatch, viewMatch, tabMatch } = compareFilterStates(currentState, urlFilters)

  // If filters are the same, only update view/tab state (don't reload filters)
  if (filtersMatch) {
    console.log('🔗 Filters unchanged, only view/tab changed')
    
    // Update analytics modal state based on view parameter
    if (urlFilters.view === 'analytics' && !analyticsOpen) {
      console.log('🔗 Opening analytics modal from URL')
      setAnalyticsOpen(true)
    } else if ((urlFilters.view === 'search' || !urlFilters.view) && analyticsOpen) {
      console.log('🔗 Closing analytics modal from URL')
      setAnalyticsOpen(false)
    }
    
    // Store tab for AnalyticsExplorer to pick up
    urlFiltersRef.current = { ...urlFiltersRef.current, tab: urlFilters.tab }
  } else {
    // Filters changed, reload everything
    console.log('🔗 Filters changed, reloading from URL')
    loadFiltersFromUrl(true)
  }
}
```

- [ ] Add import in `AdvancedSearch.tsx`:

```typescript
import { 
  getFiltersFromUrl, 
  updateUrlHash, 
  hasUrlFilters,
  parseHashParams,
  compareFilterStates  // ← Add this
} from '../../../utils/urlState'
```

- [ ] **Test**: Verify filter comparison still works correctly

---

### Step 5: Fix Tab Synchronization (15 min)

- [ ] **File: `AnalyticsExplorer.tsx`** - Update tab loading effect:

Replace the effect at line 200-213:

```typescript
// ❌ REMOVE:
React.useEffect(() => {
  if (!open) return
  
  const hash = window.location.hash
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
  const params = new URLSearchParams(cleanHash)
  const tabParam = params.get('tab')
  
  if (tabParam && ['tables', 'charts', 'clustering', 'misc'].includes(tabParam)) {
    setActiveTab(tabParam as 'tables' | 'charts' | 'clustering' | 'misc')
    console.log('[AnalyticsExplorer] Loaded tab from URL:', tabParam)
  }
}, [open])

// ✅ REPLACE WITH:
React.useEffect(() => {
  if (!open) return
  
  const loadTabFromUrl = () => {
    const params = parseHashParams()
    const tabParam = params.get('tab')
    
    if (tabParam && ['tables', 'charts', 'clustering', 'misc'].includes(tabParam)) {
      setActiveTab(tabParam as 'tables' | 'charts' | 'clustering' | 'misc')
      console.log('[AnalyticsExplorer] Tab changed from URL:', tabParam)
    }
  }
  
  // Load initially
  loadTabFromUrl()
  
  // Listen for URL changes
  window.addEventListener('hashchange', loadTabFromUrl)
  return () => window.removeEventListener('hashchange', loadTabFromUrl)
}, [open])
```

- [ ] **Test**: 
  - [ ] Open analytics with tab in URL → Tab loads correctly
  - [ ] Change URL tab parameter → Tab updates (even if modal already open)
  - [ ] Browser back/forward → Tab follows URL

---

### Step 6: Remove setTimeout (15 min)

- [ ] **File: `AdvancedSearch.tsx`** - Replace setTimeout with proper state management:

Find line 169:

```typescript
// ❌ REMOVE:
setTimeout(() => setShouldTriggerSearch(true), 100)

// ✅ REPLACE WITH:
// Option 1: Immediate (simpler)
setShouldTriggerSearch(true)

// Option 2: Next tick (if needed for state settling)
Promise.resolve().then(() => setShouldTriggerSearch(true))
```

- [ ] **Test**: Verify search still triggers correctly after loading from URL

---

## ✅ Phase 2 Verification

- [ ] Code is cleaner and more maintainable
- [ ] No inline comparison logic
- [ ] Tab synchronization works in all cases
- [ ] No arbitrary delays
- [ ] All tests still pass

---

## 🎯 Phase 3: Custom Hook (Optional, 4-5 hours)

See `HASH_ROUTING_ANALYSIS.md` section "Phase 2: Create Custom Hook" for detailed implementation.

---

## 📝 Final Checklist

### Before Committing

- [ ] All tests pass
- [ ] No console errors
- [ ] TypeScript compiles
- [ ] Code is formatted (run prettier)
- [ ] No debug console.logs added
- [ ] Browser back/forward works correctly

### Documentation

- [ ] Update CHANGELOG.md with changes
- [ ] Update URL_SHARING.md if behavior changed
- [ ] Add comments to new functions

### Testing

- [ ] Manual testing complete (see test URLs below)
- [ ] Edge cases tested
- [ ] Browser navigation tested
- [ ] Invalid URLs tested

---

## 🧪 Test URLs

Copy these into your browser to test:

```bash
# Valid URLs
http://localhost:3000/advanced-search#q=road&areas=manila
http://localhost:3000/advanced-search#min=1000000&max=5000000
http://localhost:3000/advanced-search#q=road&view=analytics&tab=charts
http://localhost:3000/advanced-search#dateType=yearly&year=2023

# Invalid URLs (should not crash)
http://localhost:3000/advanced-search#year=9999&quarter=5
http://localhost:3000/advanced-search#min=abc&max=xyz
http://localhost:3000/advanced-search#startDate=not-a-date

# Complex URLs
http://localhost:3000/advanced-search#q=road,bridge&areas=manila,quezon&min=1000000&max=5000000&dateType=yearly&year=2023&view=analytics&tab=clustering
```

---

## 🐛 Troubleshooting

### Issue: TypeScript errors after adding utilities

**Solution**: Make sure to export the new functions and import them in components

### Issue: Tests failing

**Solution**: Update test files to mock the new utilities

### Issue: History management not working

**Solution**: Check that you're passing `addToHistory` parameter correctly:
- `true` for filter changes
- `false` for UI changes (tabs, modals)

### Issue: Validation too strict

**Solution**: Adjust validation ranges in `validateFilterState()`

---

## ⏱️ Time Tracking

Use this to track your progress:

- [ ] Step 1: Extract parseHashParams - **Estimated: 10 min** - Actual: _____
- [ ] Step 2: Add validation - **Estimated: 20 min** - Actual: _____
- [ ] Step 3: Fix history mgmt - **Estimated: 15 min** - Actual: _____
- [ ] Phase 1 Total - **Estimated: 45 min** - Actual: _____

---

## ✨ Success Criteria

You'll know you're done when:

1. ✅ No duplicate URL parsing code exists
2. ✅ Invalid URLs are handled gracefully (logged, not crashed)
3. ✅ Browser back button works predictably
4. ✅ Tab changes don't clutter history
5. ✅ All existing functionality still works
6. ✅ Code is cleaner and more maintainable

---

## 📞 Need Help?

- Refer to `HASH_ROUTING_QUICK_FIXES.md` for copy-paste solutions
- Check `HASH_ROUTING_ANALYSIS.md` for detailed explanations
- Review `HASH_ROUTING_FLOW_DIAGRAMS.md` for visual guides

---

**Good luck! 🚀**

Start with Phase 1 and take your time. Each step is independent, so you can do them one at a time.



