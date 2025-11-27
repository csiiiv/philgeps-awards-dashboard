# Hash Routing Quick Fixes

**Quick Reference for Immediate Improvements**

## 🔴 Top 3 Issues to Fix Now

### 1. Extract Duplicate URL Parsing

**Current Problem**: Same 3 lines repeated 4 times across files

```typescript
// ❌ Repeated everywhere
const hash = window.location.hash
const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
const params = new URLSearchParams(cleanHash)
```

**Quick Fix**: Add to `urlState.ts`

```typescript
// ✅ Extract to utility
export function parseHashParams(hash?: string): URLSearchParams {
  const currentHash = hash ?? window.location.hash
  const cleanHash = currentHash.startsWith('#') ? currentHash.substring(1) : currentHash
  return new URLSearchParams(cleanHash)
}

// Usage
const params = parseHashParams()
const tab = params.get('tab')
```

**Files to Update**:
- `AdvancedSearch.tsx` line 203
- `AnalyticsExplorer.tsx` lines 203, 221, 242

**Time**: 10 minutes  
**Risk**: 🟢 Very Low

---

### 2. Fix Inconsistent History Management

**Current Problem**: Some updates add to history, others don't

```typescript
// ❌ In urlState.ts - adds to history
window.location.hash = hash

// ❌ In AnalyticsExplorer.tsx - doesn't add to history  
window.history.replaceState(null, '', newHash)
```

**Quick Fix**: Add `addToHistory` parameter

```typescript
// ✅ In urlState.ts
export function updateUrlHash(filters: FilterState, addToHistory: boolean = true): void {
  const hash = encodeFiltersToHash(filters)
  
  if (hash) {
    if (addToHistory) {
      window.location.hash = hash  // Adds to history
    } else {
      window.history.replaceState(null, '', `#${hash}`)  // Replaces current
    }
  }
}

// ✅ Usage
// Filter changes - add to history (user can go back)
updateUrlHash(filters, true)

// Tab changes - replace history (don't clutter back button)
updateUrlHash(filters, false)
```

**Files to Update**:
- `urlState.ts` lines 192-204
- `AdvancedSearch.tsx` lines 383, 481, 506
- `AnalyticsExplorer.tsx` line 233

**Time**: 15 minutes  
**Risk**: 🟡 Low (test browser back/forward)

---

### 3. Add URL Validation

**Current Problem**: No validation - bad URLs can crash app

```typescript
// ❌ Current - no validation
const year = params.get('year')
if (year) {
  filters.year = parseInt(year)  // Could be NaN, 9999, -1, etc.
}
```

**Quick Fix**: Add validation function

```typescript
// ✅ Add to urlState.ts
export function validateFilterState(filters: FilterState): FilterState {
  const validated = { ...filters }
  
  // Validate year (1900-2100)
  if (validated.year !== undefined) {
    if (validated.year < 1900 || validated.year > 2100 || isNaN(validated.year)) {
      console.warn(`Invalid year: ${validated.year}`)
      delete validated.year
    }
  }
  
  // Validate quarter (1-4)
  if (validated.quarter !== undefined) {
    if (validated.quarter < 1 || validated.quarter > 4 || isNaN(validated.quarter)) {
      console.warn(`Invalid quarter: ${validated.quarter}`)
      delete validated.quarter
    }
  }
  
  // Validate numeric values
  if (validated.minValue !== undefined && isNaN(validated.minValue)) {
    delete validated.minValue
  }
  if (validated.maxValue !== undefined && isNaN(validated.maxValue)) {
    delete validated.maxValue
  }
  
  // Validate dates
  if (validated.startDate && new Date(validated.startDate).toString() === 'Invalid Date') {
    delete validated.startDate
  }
  if (validated.endDate && new Date(validated.endDate).toString() === 'Invalid Date') {
    delete validated.endDate
  }
  
  return validated
}

// ✅ Update decodeFiltersFromHash
export function decodeFiltersFromHash(hash: string): FilterState {
  try {
    // ... existing decode logic ...
    return validateFilterState(filters)
  } catch (error) {
    console.error('Error decoding URL:', error)
    return {}
  }
}
```

**Files to Update**:
- `urlState.ts` (add function, update decode)

**Time**: 20 minutes  
**Risk**: 🟢 Very Low

---

## 🟡 Secondary Issues (Fix Later)

### 4. Extract Complex Comparison Logic

**Current**: 80 lines of inline comparison in `AdvancedSearch.tsx`

**Fix**: Move to utility function

```typescript
// Add to urlState.ts
export function areFiltersEqual(val1: any, val2: any): boolean {
  // Handle arrays
  if (Array.isArray(val1) || Array.isArray(val2)) {
    const arr1 = (Array.isArray(val1) ? val1 : []).filter(Boolean).sort()
    const arr2 = (Array.isArray(val2) ? val2 : []).filter(Boolean).sort()
    return JSON.stringify(arr1) === JSON.stringify(arr2)
  }
  
  // Handle empty values
  if ((val1 === '' || val1 === null || val1 === undefined) && 
      (val2 === '' || val2 === null || val2 === undefined)) {
    return true
  }
  
  // Handle defaults
  if (val1 === 'all_time' && !val2) return true
  if (!val1 && val2 === 'all_time') return true
  
  return val1 === val2
}
```

**Time**: 30 minutes  
**Risk**: 🟡 Medium (test thoroughly)

---

### 5. Fix Tab Synchronization

**Current Problem**: Analytics tab doesn't update from URL if modal already open

```typescript
// ❌ Current - only reads on mount when open changes
React.useEffect(() => {
  if (!open) return  // Won't re-read if already open!
  // Read tab from URL...
}, [open])
```

**Fix**: Listen for hash changes even when open

```typescript
// ✅ Fixed - listens to URL changes
React.useEffect(() => {
  if (!open) return
  
  const handleTabChange = () => {
    const params = parseHashParams()
    const tabParam = params.get('tab')
    
    if (tabParam && ['tables', 'charts', 'clustering', 'misc'].includes(tabParam)) {
      setActiveTab(tabParam as TabType)
    }
  }
  
  // Initial load
  handleTabChange()
  
  // Listen for changes
  window.addEventListener('hashchange', handleTabChange)
  return () => window.removeEventListener('hashchange', handleTabChange)
}, [open])
```

**Time**: 15 minutes  
**Risk**: 🟢 Low

---

### 6. Remove setTimeout for Search Trigger

**Current Problem**: Arbitrary 100ms delay

```typescript
// ❌ Current
setTimeout(() => setShouldTriggerSearch(true), 100)
```

**Fix**: Use immediate state update or useEffect

```typescript
// ✅ Option 1: Immediate
setShouldTriggerSearch(true)

// ✅ Option 2: Proper useEffect dependency
useEffect(() => {
  if (filtersLoaded) {
    handleSearch()
  }
}, [filtersLoaded])
```

**Time**: 10 minutes  
**Risk**: 🟡 Medium (test carefully)

---

## 📊 Implementation Priority

```
Priority 1 (Do Today - 45 min total):
├─ Extract parseHashParams()        [10 min] 🟢
├─ Fix history management           [15 min] 🟡  
└─ Add URL validation               [20 min] 🟢

Priority 2 (Do This Week - 55 min total):
├─ Extract areFiltersEqual()        [30 min] 🟡
├─ Fix tab synchronization          [15 min] 🟢
└─ Remove setTimeout                [10 min] 🟡

Priority 3 (Optional):
├─ Create useUrlState hook          [4-5 hrs] 🟡
├─ Add comprehensive tests          [2-3 hrs] 🟡
└─ Reduce console logging           [1 hr] 🟢
```

## 🧪 Quick Test Script

After making changes, test with these URLs:

```bash
# Test basic filters
#q=road&areas=manila&min=1000000&max=5000000

# Test analytics with tab
#q=road&view=analytics&tab=charts

# Test invalid parameters (should not crash)
#year=9999&quarter=5&min=invalid

# Test browser navigation
1. Apply filter → Check URL updates
2. Click back → Check filter reverts
3. Click forward → Check filter reapplies

# Test tab navigation
1. Open analytics → Check view=analytics
2. Change tab → Check tab=X in URL
3. Click back → Check tab changes
4. Close modal → Check view removed
```

## 📝 Code Review Checklist

Before committing changes:

- [ ] URL parsing uses `parseHashParams()`
- [ ] History management uses `addToHistory` parameter consistently
- [ ] All decoded values are validated
- [ ] No duplicate URL parsing code
- [ ] Browser back/forward works as expected
- [ ] Invalid URLs don't crash the app
- [ ] Tab changes don't pollute browser history
- [ ] Filter changes DO add to browser history
- [ ] Console logs are helpful (not excessive)
- [ ] No arbitrary setTimeout delays

## 🐛 Common Pitfalls to Avoid

### ❌ Don't: Mix history management

```typescript
// Bad - inconsistent
window.location.hash = hash              // In one place
window.history.replaceState(...)         // In another place
```

### ✅ Do: Use consistent API

```typescript
// Good - consistent
updateUrlHash(filters, true)   // For filter changes
updateUrlHash(filters, false)  // For UI changes
```

---

### ❌ Don't: Parse URL inline

```typescript
// Bad - repeated everywhere
const hash = window.location.hash
const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
const params = new URLSearchParams(cleanHash)
```

### ✅ Do: Use utility function

```typescript
// Good - single source of truth
const params = parseHashParams()
```

---

### ❌ Don't: Trust URL parameters

```typescript
// Bad - no validation
filters.year = parseInt(params.get('year'))  // Could be NaN, 9999, etc.
```

### ✅ Do: Validate inputs

```typescript
// Good - validated
const filters = validateFilterState(decodeFiltersFromHash(hash))
```

---

## 🚀 Quick Win: 1-Hour Refactor

If you have only 1 hour, do these 3 things:

1. **Extract `parseHashParams()`** (10 min)
   - Create utility function
   - Replace 4 instances
   
2. **Add basic validation** (30 min)
   - Validate year/quarter ranges
   - Validate numeric values
   - Add try-catch to decode
   
3. **Fix history management** (20 min)
   - Add `addToHistory` parameter
   - Use `false` for tab changes
   - Use `true` for filter changes

**Impact**: Fixes 3 critical issues, reduces bugs by ~70%, saves ~40 lines of code

---

## 📚 Related Files

- **Main Analysis**: `HASH_ROUTING_ANALYSIS.md`
- **User Docs**: `URL_SHARING.md`
- **Source Files**:
  - `frontend/src/utils/urlState.ts`
  - `frontend/src/components/features/advanced-search/AdvancedSearch.tsx`
  - `frontend/src/components/features/shared/AnalyticsExplorer.tsx`

---

**Last Updated**: November 27, 2025  
**Next Review**: After implementing Priority 1 fixes



