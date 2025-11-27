# Hash Routing - URL Parameter Merge Fix

**Date**: November 27, 2025  
**Issue**: Editing URL parameters manually caused other parameters to be removed  
**Status**: ✅ Fixed  

---

## 🐛 The Problem

When manually editing the URL while the page was already open, other filter parameters would be removed.

### Example of the Bug

**Steps to Reproduce**:
1. Open page with URL: `#q=road&areas=manila`
2. Manually edit URL to add: `#q=road&areas=manila&contractors=ABC`
3. Change analytics tab or trigger any URL update
4. **Bug**: URL becomes `#q=road&areas=manila&tab=charts` (contractors lost!)

**Root Cause**: When components updated the URL, they were rebuilding it entirely from their local state, which didn't know about the manual `contractors` edit.

---

## ✅ The Solution

Modified `updateUrlHash()` to **merge** new parameters with existing URL parameters by default, instead of replacing the entire URL.

### How It Works Now

```typescript
// Old behavior (Phase 1 & 2):
updateUrlHash({ view: 'analytics' })
// Would replace entire URL with just view parameter

// New behavior (Phase 2.1):
updateUrlHash({ view: 'analytics' })
// Merges with existing URL: keeps all params, adds/updates view
```

---

## 🔧 Technical Changes

### 1. Enhanced `updateUrlHash()` Function

**File**: `frontend/src/utils/urlState.ts`

**New Signature**:
```typescript
function updateUrlHash(
  filters: FilterState,
  optionsOrAddToHistory?: boolean | { addToHistory?: boolean; replace?: boolean },
  replace?: boolean
): void
```

**Key Features**:

✅ **Backward Compatible**: Old calls still work
```typescript
updateUrlHash(filters)           // ✅ Works (merges)
updateUrlHash(filters, false)    // ✅ Works (merges, no history)
```

✅ **New Options Object**: More flexible
```typescript
updateUrlHash(filters, { addToHistory: true, replace: true })
// Completely replace URL (for explicit searches)

updateUrlHash(filters, { addToHistory: false, replace: false })
// Merge and don't add to history (for UI updates)
```

✅ **Smart Defaults**:
- `addToHistory`: `true` (create history entry)
- `replace`: `false` (merge with existing params)

---

### 2. Merge Behavior

**How Merging Works**:

```typescript
// Current URL: #q=road&areas=manila&contractors=ABC
// Component calls: updateUrlHash({ view: 'analytics' })

// Step 1: Get current URL parameters
const currentFilters = getFiltersFromUrl()
// { q: ['road'], areas: ['manila'], contractors: ['ABC'] }

// Step 2: Merge with new parameters
const finalFilters = { ...currentFilters, ...filters }
// { q: ['road'], areas: ['manila'], contractors: ['ABC'], view: 'analytics' }

// Step 3: Encode and update URL
// Result: #q=road&areas=manila&contractors=ABC&view=analytics
```

**Result**: Manual URL edits are preserved! ✅

---

### 3. When to Use `replace: true`

Some operations should **replace** the entire URL, not merge:

**Use `replace: true` for**:
- ✅ Explicit search submissions (user filled out form)
- ✅ Loading filters from URL (initial mount)
- ✅ Clearing all filters

**Example in AdvancedSearch**:
```typescript
// After user clicks "Search" button
updateUrlHash(urlState, { addToHistory: true, replace: true })
// Sets exact state from form, ignoring any manual URL edits
```

**Use `replace: false` (default) for**:
- ✅ Tab changes
- ✅ Opening/closing modals
- ✅ Minor UI updates

**Example**:
```typescript
// User changes tab
updateUrlHash({ tab: 'charts' }, false)
// Merges with existing URL, preserves all other params
```

---

## 📝 Code Changes

### 1. urlState.ts

**Before**:
```typescript
export function updateUrlHash(filters: FilterState, addToHistory: boolean = true): void {
  const hash = encodeFiltersToHash(filters)
  // ... updates URL with only these filters
}
```

**After**:
```typescript
export function updateUrlHash(
  filters: FilterState,
  optionsOrAddToHistory?: boolean | { addToHistory?: boolean; replace?: boolean },
  replace?: boolean
): void {
  // Handle backward compatibility
  let shouldReplace = false
  
  if (!shouldReplace) {
    // Merge with current URL
    const currentFilters = getFiltersFromUrl()
    finalFilters = { ...currentFilters, ...filters }
  }
  
  const hash = encodeFiltersToHash(finalFilters)
  // ... updates URL with merged filters
}
```

---

### 2. AdvancedSearch.tsx

**Simplified handleShowAnalytics**:

**Before** (30+ lines):
```typescript
const handleShowAnalytics = useCallback(() => {
  setAnalyticsOpen(true)
  
  // Had to manually build complete state
  const urlState = {
    keywords: filtersHook.filters.keywords,
    contractors: filtersHook.filters.contractors,
    areas: filtersHook.filters.areas,
    // ... 15 more fields
    view: 'analytics'
  }
  updateUrlHash(urlState)
}, [filtersHook])
```

**After** (3 lines):
```typescript
const handleShowAnalytics = useCallback(() => {
  setAnalyticsOpen(true)
  updateUrlHash({ view: 'analytics' })  // Merges automatically!
}, [filtersHook])
```

**For Search** (uses replace):
```typescript
const handleSearch = useCallback(async () => {
  // ... search logic
  
  const urlState = { /* complete filter state from form */ }
  // Replace URL with exact form state
  updateUrlHash(urlState, { addToHistory: true, replace: true })
}, [])
```

---

### 3. AnalyticsExplorer.tsx

**Simplified handleTabChange**:

**Before**:
```typescript
const handleTabChange = React.useCallback((tab) => {
  setActiveTab(tab)
  
  // Had to manually get and merge current filters
  const currentFilters = getFiltersFromUrl()
  updateUrlHash({ ...currentFilters, tab }, false)
}, [])
```

**After**:
```typescript
const handleTabChange = React.useCallback((tab) => {
  setActiveTab(tab)
  updateUrlHash({ tab }, false)  // Merges automatically!
}, [])
```

---

## 🧪 Testing the Fix

### Test Case 1: Manual URL Edit Preserved

**Steps**:
1. Open: `#q=road&areas=manila`
2. Manually edit to: `#q=road&areas=manila&contractors=ABC`
3. Change analytics tab
4. **Expected**: URL keeps all three parameters + tab
5. **Result**: ✅ `#q=road&areas=manila&contractors=ABC&tab=charts`

---

### Test Case 2: Search Replaces URL

**Steps**:
1. Open: `#q=road&areas=manila&contractors=ABC`
2. Clear form and search for just `q=bridge`
3. **Expected**: URL has only what was in form
4. **Result**: ✅ `#q=bridge` (contractors removed as intended)

---

### Test Case 3: Tab Change Preserves All

**Steps**:
1. Open: `#q=road&areas=manila&min=1000000`
2. Change tab to "charts"
3. **Expected**: All filters preserved, tab added
4. **Result**: ✅ `#q=road&areas=manila&min=1000000&tab=charts`

---

### Test Case 4: Opening Analytics Preserves Manual Edits

**Steps**:
1. Open: `#q=road`
2. Manually add: `#q=road&categories=construction`
3. Click "Show Analytics"
4. **Expected**: Both parameters preserved, view added
5. **Result**: ✅ `#q=road&categories=construction&view=analytics`

---

## 📊 Benefits

### Before the Fix

❌ Manual URL edits would be lost  
❌ Required rebuilding entire URL state  
❌ 30+ lines of code per update  
❌ Easy to forget a parameter  
❌ Hard to maintain  

### After the Fix

✅ Manual URL edits preserved automatically  
✅ Only specify what you're changing  
✅ 1-3 lines of code per update  
✅ Impossible to lose parameters  
✅ Easy to maintain  
✅ More predictable behavior  

---

## 🎯 Usage Guide

### For Component Developers

**Updating a Single Parameter**:
```typescript
// Just specify what you want to change
updateUrlHash({ view: 'analytics' })
updateUrlHash({ tab: 'charts' }, false)

// Everything else is preserved automatically!
```

**Replacing Entire URL** (rare):
```typescript
// When you want to set exact state (e.g., form submission)
updateUrlHash(completeState, { replace: true })
```

**History Control**:
```typescript
// Add to history (default) - user can go back
updateUrlHash({ view: 'analytics' })

// Replace history - don't clutter back button
updateUrlHash({ tab: 'charts' }, false)
updateUrlHash({ tab: 'charts' }, { addToHistory: false })
```

---

## 🔄 Backward Compatibility

All existing code continues to work:

```typescript
// Old signature ✅
updateUrlHash(filters)
updateUrlHash(filters, false)
updateUrlHash(filters, true)

// New signature ✅
updateUrlHash(filters, { addToHistory: false })
updateUrlHash(filters, { replace: true })
updateUrlHash(filters, { addToHistory: true, replace: true })
```

No breaking changes!

---

## 📚 Related Documentation

- **Main Analysis**: `HASH_ROUTING_ANALYSIS.md`
- **Phase 1**: `HASH_ROUTING_IMPLEMENTATION_COMPLETE.md`
- **Phase 2**: `HASH_ROUTING_PHASE2_COMPLETE.md`
- **Complete**: `PHASE_1_AND_2_COMPLETE.md`

---

## 🎊 Summary

**Issue**: Manual URL edits were lost on any URL update  
**Root Cause**: Components rebuilt entire URL from local state  
**Solution**: Merge new parameters with existing URL by default  
**Result**: Manual edits preserved, simpler code, better UX  

**Status**: ✅ Fixed and tested  
**Impact**: Positive - Better user experience, cleaner code  
**Breaking Changes**: None - Fully backward compatible  

---

**Date Fixed**: November 27, 2025  
**Version**: Phase 2.1  
**Tested**: ✅ Yes  
**Deployed**: Ready for deployment  

Thank you for catching this issue! 🙏


