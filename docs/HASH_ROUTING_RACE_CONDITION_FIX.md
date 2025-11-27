# Hash Routing - Race Condition Fix (Keywords Dropped Issue)

**Date**: November 27, 2025  
**Issue**: Keywords and other filters dropped when manually editing URL  
**Status**: ✅ Fixed  

---

## 🐛 The Problem

When manually editing the URL (e.g., changing `areas=cagayan` to `areas=abra`), keywords and unchanged filters would be dropped.

### Example of the Bug

**Steps to Reproduce**:
1. Open: `#q=concreting&areas=cagayan&flood=1&view=analytics`
2. Manually edit to: `#q=concreting&areas=abra&flood=1&view=analytics`
3. Press Enter
4. **Bug**: Keyword "concreting" disappeared from filters!

### Console Evidence

```javascript
🔗 Loading filters from URL: { keywords: ["concreting"], areas: ["abra"], ... }
🧹 clearAllFilters called
✅ all filters cleared
🔗 Adding keyword from URL: concreting
❌ keyword not added: { reason: "already exists" }  // ← THE BUG!
🔗 Adding area from URL: abra
➕ addFilter called: { type: "areas", value: "abra" }
```

### Root Cause

**Race Condition in React State Updates**:

1. `clearAllFilters()` calls `setFilters({...})` (async state update)
2. `addKeyword('concreting')` is called immediately after (before clear completes)
3. `addKeyword` checks if keyword exists in **current state** (not cleared yet!)
4. Finds "concreting" in old state → Returns "already exists"
5. State clear completes → "concreting" is gone forever
6. Never gets re-added

This is a classic React batching issue where `setState` is asynchronous.

---

## ✅ The Solution

Instead of **"clear then re-add"**, use **"set complete state at once"**.

### Technical Changes

#### 1. Exposed `setFilters` from Hook

**File**: `frontend/src/hooks/advanced-search/useAdvancedSearchFilters.ts`

**Before**:
```typescript
return {
  filters,
  addFilter,
  removeFilter,
  clearAllFilters,
  // setFilters was internal only
}
```

**After**:
```typescript
return {
  filters,
  addFilter,
  removeFilter,
  clearAllFilters,
  setFilters,  // ✅ Now exposed for batch updates
}
```

**Why**: Allows components to set the entire filter state in one atomic operation.

---

#### 2. Refactored `loadFiltersFromUrl()`

**File**: `frontend/src/components/features/advanced-search/AdvancedSearch.tsx`

**Before** (Race Condition):
```typescript
const loadFiltersFromUrl = useCallback((triggerSearch = true) => {
  const urlFilters = getFiltersFromUrl()
  
  // Clear filters (async setState)
  filtersHook.clearAllFilters()
  
  // Try to add keywords (but clear hasn't completed yet!)
  if (urlFilters.keywords?.length) {
    urlFilters.keywords.forEach(k => {
      filtersHook.addKeyword(k)  // ❌ Fails with "already exists"
    })
  }
  
  // Same issue for all filter types...
}, [filtersHook])
```

**After** (Atomic Update):
```typescript
const loadFiltersFromUrl = useCallback((triggerSearch = true) => {
  const urlFilters = getFiltersFromUrl()
  
  // Set complete filter state in ONE atomic operation
  filtersHook.setFilters({
    keywords: urlFilters.keywords || [],
    contractors: urlFilters.contractors || [],
    areas: urlFilters.areas || [],
    organizations: urlFilters.organizations || [],
    business_categories: urlFilters.business_categories || []
  })
  
  // No race condition! All filters set at once.
}, [filtersHook])
```

---

## 🎯 Benefits

### Before the Fix

❌ Race condition causing filters to be lost  
❌ "Already exists" errors in console  
❌ 40+ lines of forEach loops  
❌ Multiple state updates (batched but sequential)  
❌ Unpredictable behavior  

### After the Fix

✅ No race condition - atomic state update  
✅ No "already exists" errors  
✅ 10 lines of clean code  
✅ Single state update  
✅ Predictable, reliable behavior  

---

## 🧪 Testing the Fix

### Test Case 1: Edit URL While Page Open

**Steps**:
1. Open: `#q=concreting&areas=cagayan&flood=1&view=analytics`
2. Manually edit to: `#q=concreting&areas=abra&flood=1&view=analytics`
3. Press Enter

**Expected**:
- ✅ Keyword "concreting" is preserved
- ✅ Area changes to "abra"
- ✅ flood parameter preserved
- ✅ view parameter preserved

**Before Fix**: ❌ Keyword lost  
**After Fix**: ✅ All parameters preserved

---

### Test Case 2: Add New Filter to URL

**Steps**:
1. Open: `#q=road&areas=manila`
2. Manually add: `#q=road&areas=manila&contractors=ABC`
3. Press Enter

**Expected**:
- ✅ Keyword "road" preserved
- ✅ Area "manila" preserved
- ✅ Contractor "ABC" added

**Before Fix**: ❌ Keyword and area could be lost  
**After Fix**: ✅ All preserved and new one added

---

### Test Case 3: Change Multiple Filters

**Steps**:
1. Open: `#q=road&areas=cagayan&flood=1`
2. Change to: `#q=bridge&areas=abra&flood=0`
3. Press Enter

**Expected**:
- ✅ Keyword changes to "bridge"
- ✅ Area changes to "abra"
- ✅ Flood changes to false

**Before Fix**: ❌ Some changes might not apply  
**After Fix**: ✅ All changes apply correctly

---

## 🔍 Console Output Comparison

### Before Fix (With Bug)

```javascript
🔗 Loading filters from URL: { keywords: ["concreting"], areas: ["abra"] }
🧹 clearAllFilters called
✅ all filters cleared
🔗 Adding keyword from URL: concreting
❌ keyword not added: { reason: "already exists" }  // ← BUG
🔗 Adding area from URL: abra
➕ addFilter called: { type: "areas", value: "abra" }
// Result: keyword is LOST!
```

### After Fix (Working)

```javascript
🔗 Loading filters from URL: { keywords: ["concreting"], areas: ["abra"] }
🔗 Filters set from URL: { keywords: 1, areas: 1, contractors: 0, ... }
// Result: All filters applied correctly!
```

---

## 📊 Code Metrics

### Before Fix

- **Lines in `loadFiltersFromUrl`**: 48 lines
- **State Updates**: 1 clear + 1-10 adds (sequential)
- **Race Condition**: ✅ YES
- **forEach Loops**: 5 loops

### After Fix

- **Lines in `loadFiltersFromUrl`**: 14 lines
- **State Updates**: 1 atomic update
- **Race Condition**: ❌ NO
- **forEach Loops**: 0 loops

**Improvement**: 70% less code, 100% more reliable!

---

## 🎓 Lessons Learned

### React State Update Rules

1. **`setState` is asynchronous** - Changes don't apply immediately
2. **React batches updates** - Multiple `setState` calls batch together
3. **Current state** - When you call `setState`, you're reading the current (old) state
4. **Atomic updates** - Set complete state at once to avoid race conditions

### Best Practices

✅ **DO**: Set complete state in one operation when possible
```typescript
setFilters({ keywords: [], contractors: [], ... })  // Atomic
```

❌ **DON'T**: Clear then re-add individual items
```typescript
clearFilters()  // Async
addFilter(...)  // Might read old state
```

✅ **DO**: Use functional updates when reading previous state
```typescript
setFilters(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword] }))
```

❌ **DON'T**: Assume state updates are immediate
```typescript
setFilters({})
if (filters.keywords.length > 0) { ... }  // Still has old value!
```

---

## 🔗 Related Issues

This fix also prevents similar issues with:
- ✅ Contractors being dropped
- ✅ Areas being lost
- ✅ Organizations disappearing
- ✅ Business categories vanishing

Any filter type that went through "clear + re-add" is now safe.

---

## 📝 API Changes

### New Export from useAdvancedSearchFilters

```typescript
interface UseAdvancedSearchFiltersReturn {
  // ... existing exports
  setFilters: (filters: FilterState) => void  // ← NEW!
}
```

**Usage**:
```typescript
const filtersHook = useAdvancedSearchFilters()

// Set complete filter state at once
filtersHook.setFilters({
  keywords: ['road', 'bridge'],
  contractors: ['ABC Corp'],
  areas: ['manila'],
  organizations: [],
  business_categories: []
})
```

**When to use**:
- ✅ Loading filters from URL
- ✅ Resetting to a saved state
- ✅ Bulk filter updates
- ✅ Any time you need atomic state update

**When not to use**:
- ❌ Adding single filter (use `addFilter`)
- ❌ Removing single filter (use `removeFilter`)
- ❌ Clearing filters (use `clearAllFilters`)

---

## 🚀 Deployment

### Backward Compatibility

✅ **Fully backward compatible**:
- Existing `addFilter`, `removeFilter`, `clearAllFilters` still work
- Only `loadFiltersFromUrl` changed internally
- No API breaking changes for external consumers

### Migration

**No migration needed!** 

The fix is internal to `AdvancedSearch.tsx`. Other components using `useAdvancedSearchFilters` are unaffected.

---

## 🎯 Success Criteria - All Met

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Keywords preserved | ✅ | No more "already exists" error |
| All filters preserved | ✅ | Atomic state update |
| No race condition | ✅ | Single `setFilters` call |
| No console errors | ✅ | Clean console output |
| Code simplified | ✅ | 70% less code |
| Tests pass | ✅ | Manual testing confirmed |

---

## 📚 Documentation Updated

- ✅ This document (`HASH_ROUTING_RACE_CONDITION_FIX.md`)
- ✅ Code comments in `loadFiltersFromUrl()`
- ✅ `CHANGELOG.md` updated
- ✅ JSDoc for `setFilters` in hook

---

## 🙏 Acknowledgments

**Reported by**: User (Excellent debugging!)  
**Root Cause**: React state batching (async updates)  
**Fix**: Atomic state update with `setFilters`  
**Impact**: Critical - Prevents data loss  

---

## 🎊 Summary

**Issue**: Manual URL edits caused filters to disappear due to React state race condition  
**Root Cause**: `clearAllFilters()` + `addKeyword()` sequence with async state updates  
**Solution**: Single atomic `setFilters()` call instead of clear + re-add  
**Result**: Reliable filter preservation, cleaner code, no race conditions  

**Status**: ✅ Fixed and tested  
**Impact**: High - Prevents user frustration from lost filters  
**Breaking Changes**: None  

---

**Date Fixed**: November 27, 2025  
**Version**: Phase 2.2  
**Tested**: ✅ Yes  
**Production Ready**: ✅ Yes  

Thank you for the excellent bug report! 🎉

