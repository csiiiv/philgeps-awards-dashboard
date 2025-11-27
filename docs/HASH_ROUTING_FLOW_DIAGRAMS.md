# Hash Routing Flow Diagrams

Visual representation of current implementation vs. proposed improvements.

## Current Implementation (Before Refactoring)

### Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Actions                            │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
    Apply Filter                   Change Analytics Tab
             │                           │
             v                           v
┌────────────────────────────┐  ┌──────────────────────────┐
│   AdvancedSearch.tsx       │  │  AnalyticsExplorer.tsx   │
│                            │  │                          │
│  - handleSearch()          │  │  - handleTabChange()     │
│  - updateUrlHash()         │  │  - window.history        │
│    (adds to history)       │  │    .replaceState()       │
└────────────┬───────────────┘  └──────────┬───────────────┘
             │                              │
             │ window.location.hash =       │ replaceState()
             │                              │
             v                              v
        ┌────────────────────────────────────────┐
        │         Browser URL Bar                 │
        │  #q=road&areas=manila&tab=charts       │
        └────────────┬───────────────────────────┘
                     │
                     │ hashchange event
                     v
        ┌────────────────────────────────────────┐
        │    Multiple Event Listeners             │
        │                                         │
        │  1. AdvancedSearch hashchange           │
        │  2. AnalyticsExplorer popstate          │
        └────────────┬───────────────────────────┘
                     │
                     v
        ┌────────────────────────────────────────┐
        │    Each Component Parses URL            │
        │                                         │
        │  - Manually parse hash                  │
        │  - Clean and split                      │
        │  - Create URLSearchParams               │
        │  - Extract parameters                   │
        └─────────────────────────────────────────┘
```

### Problem: Duplicate Parsing Logic

```
┌─────────────────────────────────────────────────────────────┐
│              URL: #q=road&areas=manila&tab=charts           │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             v                                v
    AdvancedSearch.tsx                AnalyticsExplorer.tsx
    Line 195-206                      Line 203-206
             │                                │
┌────────────v─────────────┐    ┌────────────v─────────────┐
│ const hash = window      │    │ const hash = window      │
│   .location.hash         │    │   .location.hash         │
│ const cleanHash = hash   │    │ const cleanHash = hash   │
│   .startsWith('#')       │    │   .startsWith('#')       │
│   ? hash.substring(1)    │    │   ? hash.substring(1)    │
│   : hash                 │    │   : hash                 │
│ const params = new       │    │ const params = new       │
│   URLSearchParams(       │    │   URLSearchParams(       │
│     cleanHash)           │    │     cleanHash)           │
└──────────────────────────┘    └──────────────────────────┘
      ❌ Duplicated 4x              ❌ Duplicated 4x
```

### Problem: Complex Comparison in handleHashChange

```
┌──────────────────────────────────────────────────────────────┐
│           AdvancedSearch.tsx handleHashChange                 │
│                      (Lines 187-276)                          │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             v
             ┌───────────────────────────────┐
             │  Define isEqual() function    │
             │  - Handle arrays (20 lines)   │
             │  - Handle null/undefined      │
             │  - Handle defaults            │
             │  - Handle date types          │
             └────────────┬──────────────────┘
                          │
                          v
             ┌───────────────────────────────┐
             │  Compare 15+ fields           │
             │  - keywordsMatch              │
             │  - contractorsMatch           │
             │  - areasMatch                 │
             │  - orgsMatch                  │
             │  - catsMatch                  │
             │  - minMatch                   │
             │  - maxMatch                   │
             │  - floodMatch                 │
             │  - typeMatch                  │
             │  - yearMatch                  │
             │  - quarterMatch               │
             │  - startMatch                 │
             │  - endMatch                   │
             │  - datesMatch (complex)       │
             │  - filtersMatch (combined)    │
             └────────────┬──────────────────┘
                          │
                          v
             ┌───────────────────────────────┐
             │  Decide action based on       │
             │  comparison results           │
             │  - Reload if filters changed  │
             │  - Update view/tab if same    │
             └───────────────────────────────┘
                 ❌ 80+ lines inline
                 ❌ Hard to test
                 ❌ Hard to maintain
```

### Problem: Inconsistent History Management

```
User Changes Filter                    User Changes Tab
        │                                     │
        v                                     v
┌───────────────────┐              ┌─────────────────────┐
│ AdvancedSearch    │              │ AnalyticsExplorer   │
│ handleSearch()    │              │ handleTabChange()   │
└────────┬──────────┘              └──────────┬──────────┘
         │                                    │
         v                                    v
┌────────────────────┐              ┌─────────────────────┐
│ updateUrlHash()    │              │ window.history      │
│ (in urlState.ts)   │              │ .replaceState()     │
└────────┬───────────┘              └──────────┬──────────┘
         │                                     │
         v                                     v
┌────────────────────┐              ┌─────────────────────┐
│ window.location    │              │ URL replaced        │
│ .hash = hash       │              │ No history entry    │
└────────┬───────────┘              └─────────────────────┘
         │                                     
         v                          ❌ Can't go back to
┌────────────────────┐                 previous tab
│ Creates history    │              
│ entry - can go back│              
└────────────────────┘              
         ✅
```

---

## Proposed Implementation (After Refactoring)

### Phase 1: Extract Utilities

```
┌─────────────────────────────────────────────────────────────┐
│                    urlState.ts (Enhanced)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  parseHashParams()                                          │
│    ├─ Clean hash                                            │
│    ├─ Parse with URLSearchParams                            │
│    └─ Return params object                                  │
│                                                              │
│  areFiltersEqual(val1, val2)                                │
│    ├─ Handle arrays                                         │
│    ├─ Handle null/undefined/empty                           │
│    ├─ Handle defaults (all_time)                            │
│    └─ Return boolean                                        │
│                                                              │
│  compareFilterStates(state1, state2)                        │
│    ├─ Compare all filter fields                             │
│    ├─ Compare view field                                    │
│    ├─ Compare tab field                                     │
│    └─ Return { filtersMatch, viewMatch, tabMatch }          │
│                                                              │
│  validateFilterState(filters)                               │
│    ├─ Validate year (1900-2100)                             │
│    ├─ Validate quarter (1-4)                                │
│    ├─ Validate numeric values (not NaN)                     │
│    ├─ Validate dates (valid Date)                           │
│    └─ Return sanitized filters                              │
│                                                              │
│  updateUrlHash(filters, addToHistory = true)                │
│    ├─ Encode filters                                        │
│    ├─ if addToHistory: location.hash = hash                 │
│    ├─ else: history.replaceState()                          │
│    └─ Log update                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Single source of truth
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        v                                         v
┌───────────────────────┐            ┌───────────────────────┐
│  AdvancedSearch.tsx   │            │ AnalyticsExplorer.tsx │
│                       │            │                       │
│  Uses:                │            │  Uses:                │
│  - parseHashParams()  │            │  - parseHashParams()  │
│  - compareFilters()   │            │  - updateUrlHash()    │
│  - updateUrlHash()    │            │  - validateFilters()  │
│  - validateFilters()  │            │                       │
└───────────────────────┘            └───────────────────────┘
         ✅ No duplication              ✅ Consistent API
```

### Phase 2: Custom Hook Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       useUrlState Hook                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  State:                                                      │
│  ├─ urlFilters: FilterState                                 │
│  └─ hasLoadedRef: boolean                                   │
│                                                              │
│  Effects:                                                    │
│  ├─ Load from URL on mount                                  │
│  │   └─ Call onFiltersChange()                              │
│  └─ Listen for hashchange                                   │
│      ├─ Compare old vs new                                  │
│      ├─ Call onFiltersChange() if filters changed           │
│      ├─ Call onViewChange() if view changed                 │
│      └─ Call onTabChange() if tab changed                   │
│                                                              │
│  Methods:                                                    │
│  ├─ updateUrl(filters, addToHistory)                        │
│  ├─ parseUrl()                                              │
│  └─ hasFilters()                                            │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Shared by all components
                         │
        ┌────────────────┴────────────────────┐
        │                                     │
        v                                     v
┌───────────────────────┐        ┌──────────────────────────┐
│  AdvancedSearch.tsx   │        │  AnalyticsExplorer.tsx   │
├───────────────────────┤        ├──────────────────────────┤
│                       │        │                          │
│ const urlState =      │        │ const urlState =         │
│   useUrlState({       │        │   useUrlState({          │
│     onFiltersChange:  │        │     onTabChange:         │
│       loadFilters,    │        │       setActiveTab,      │
│     onViewChange:     │        │   })                     │
│       setAnalytics,   │        │                          │
│   })                  │        │ // Update tab            │
│                       │        │ urlState.updateUrl(      │
│ // Update filters     │        │   {...filters, tab},     │
│ urlState.updateUrl(   │        │   false  // Replace      │
│   filters,            │        │ )                        │
│   true  // Add to     │        │                          │
│         // history    │        │                          │
│ )                     │        │                          │
│                       │        │                          │
└───────────────────────┘        └──────────────────────────┘
         ✅ Clean API                  ✅ Consistent behavior
         ✅ Separation of concerns     ✅ Easy to test
```

### Improved Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      User Action                              │
└────────────┬─────────────────────────────────────────────────┘
             │
             v
    ┌────────────────────┐
    │   Component         │
    │   (Any component    │
    │    using hook)      │
    └────────┬───────────┘
             │
             v
    ┌────────────────────┐
    │  useUrlState Hook   │
    │  - Parse URL        │
    │  - Validate         │
    │  - Compare          │
    │  - Dispatch events  │
    └────────┬───────────┘
             │
             ├─────────────────┐
             │                 │
             v                 v
    ┌────────────────┐  ┌──────────────────┐
    │ Update State   │  │  Update URL       │
    │ (React)        │  │  (Browser)        │
    └────────────────┘  └──────────────────┘
             │                 │
             └────────┬────────┘
                      │
                      v
         ┌────────────────────────┐
         │   Single Source of     │
         │   Truth                │
         │                        │
         │   ✅ No duplication    │
         │   ✅ Easy to test      │
         │   ✅ Maintainable      │
         └────────────────────────┘
```

---

## State Synchronization Comparison

### Before: Complex Manual Sync

```
URL Changed (hashchange event)
         │
         v
┌────────────────────────────────────────┐
│  Get URL filters                        │
│  const urlFilters = getFiltersFromUrl() │
└────────┬───────────────────────────────┘
         │
         v
┌────────────────────────────────────────┐
│  Define inline comparison function      │
│  (20+ lines)                            │
└────────┬───────────────────────────────┘
         │
         v
┌────────────────────────────────────────┐
│  Compare each field manually            │
│  - keywordsMatch = isEqual(...)         │
│  - contractorsMatch = isEqual(...)      │
│  - ... (15+ comparisons)                │
└────────┬───────────────────────────────┘
         │
         v
┌────────────────────────────────────────┐
│  Compute combined results               │
│  - filtersMatch = ... && ... && ...     │
│  - viewMatch = ...                      │
│  - tabMatch = ...                       │
└────────┬───────────────────────────────┘
         │
         v
┌────────────────────────────────────────┐
│  If filters changed:                    │
│    - Clear all filters                  │
│    - Apply each filter individually     │
│    - Trigger search                     │
│  Else if view changed:                  │
│    - Open/close modal                   │
│  Else if tab changed:                   │
│    - Store in ref                       │
└─────────────────────────────────────────┘
         ❌ 90+ lines
         ❌ Hard to maintain
         ❌ Potential bugs
```

### After: Hook-Based Sync

```
URL Changed (hashchange event)
         │
         v
┌────────────────────────────────────────┐
│  useUrlState Hook                       │
│  - parseUrl()                           │
│  - compareFilterStates()                │
└────────┬───────────────────────────────┘
         │
         ├─────────┬─────────┬───────────┐
         │         │         │           │
         v         v         v           v
    Filters   View Only  Tab Only   No Change
    Changed   Changed    Changed    
         │         │         │           │
         v         v         v           v
    onFilters  onView    onTab       (ignore)
    Change()   Change()  Change()
         │         │         │
         v         v         v
    Component Component Component
    Handler   Handler   Handler
    
         ✅ Clean separation
         ✅ Easy to follow
         ✅ Testable callbacks
```

---

## History Management Comparison

### Before: Inconsistent

```
Filter Change                         Tab Change
      │                                   │
      v                                   v
┌──────────────┐                  ┌──────────────────┐
│ location.hash│                  │ replaceState()   │
│    = hash    │                  │                  │
└──────┬───────┘                  └──────┬───────────┘
       │                                 │
       v                                 v
  Adds to history               Doesn't add to history
       │                                 │
       v                                 v
┌──────────────┐                  ┌──────────────────┐
│ Can go back  │                  │ Can't go back    │
│      ✅      │                  │      ❌          │
└──────────────┘                  └──────────────────┘
```

### After: Consistent & Explicit

```
Filter Change                         Tab Change
      │                                   │
      v                                   v
┌──────────────────┐              ┌──────────────────────┐
│ updateUrlHash(   │              │ updateUrlHash(       │
│   filters,       │              │   filters,           │
│   true           │              │   false              │
│ )                │              │ )                    │
└──────┬───────────┘              └──────┬───────────────┘
       │                                 │
       v                                 v
┌──────────────────┐              ┌──────────────────────┐
│ Adds to history  │              │ Replaces current     │
│ (explicit)       │              │ (explicit)           │
└──────┬───────────┘              └──────┬───────────────┘
       │                                 │
       v                                 v
┌──────────────────┐              ┌──────────────────────┐
│ User can go back │              │ Tab changes don't    │
│ to previous      │              │ clutter history      │
│ filters          │              │                      │
│      ✅          │              │      ✅              │
└──────────────────┘              └──────────────────────┘
```

---

## Error Handling Comparison

### Before: No Error Handling

```
URL: #year=invalid&quarter=99
         │
         v
┌────────────────────────┐
│ decodeFiltersFromHash()│
└────────┬───────────────┘
         │
         v
┌────────────────────────┐
│ parseInt('invalid')    │  ──→  NaN
│ parseInt('99')         │  ──→  99 (invalid quarter)
└────────┬───────────────┘
         │
         v
┌────────────────────────┐
│ filters.year = NaN     │  ❌ Bad data in state
│ filters.quarter = 99   │  ❌ Invalid quarter
└────────┬───────────────┘
         │
         v
    App uses bad data
    Crashes or wrong results
```

### After: Robust Error Handling

```
URL: #year=invalid&quarter=99
         │
         v
┌────────────────────────┐
│ decodeFiltersFromHash()│
│ (wrapped in try-catch) │
└────────┬───────────────┘
         │
         v
┌────────────────────────┐
│ validateFilterState()  │
└────────┬───────────────┘
         │
         ├─────────┬──────────┐
         v         v          v
    Year NaN   Quarter 99  Other OK
         │         │          │
         v         v          v
    console    console      Keep
    .warn()    .warn()      value
    delete     delete          │
    year       quarter         │
         │         │           │
         └─────────┴───────────┘
                   │
                   v
         ┌─────────────────────┐
         │ Clean, valid filters│
         │ App continues safely│
         │        ✅           │
         └─────────────────────┘
```

---

## Code Size Comparison

### Before

```
urlState.ts:                 230 lines
AdvancedSearch.tsx:          687 lines
  ├─ URL handling:           ~150 lines
  └─ Comparison logic:       ~90 lines
AnalyticsExplorer.tsx:       753 lines
  └─ URL handling:           ~80 lines

Total URL-related:           ~320 lines
Duplication factor:          ~3x
```

### After (Phase 1)

```
urlState.ts:                 350 lines (+120)
  ├─ Utilities:              +80 lines
  └─ Validation:             +40 lines
AdvancedSearch.tsx:          550 lines (-137)
  └─ Uses utilities:         -137 lines
AnalyticsExplorer.tsx:       690 lines (-63)
  └─ Uses utilities:         -63 lines

Total URL-related:           ~220 lines
Duplication factor:          ~1.2x
Reduction:                   -100 lines (-31%)
```

### After (Phase 2 - with Hook)

```
urlState.ts:                 380 lines (+30)
useUrlState.ts:              150 lines (new)
AdvancedSearch.tsx:          480 lines (-70)
  └─ Uses hook:              -70 lines
AnalyticsExplorer.tsx:       620 lines (-70)
  └─ Uses hook:              -70 lines

Total URL-related:           ~180 lines
Duplication factor:          1x
Reduction:                   -140 lines (-44%)
```

---

## Testing Strategy Visualization

### Unit Tests

```
┌─────────────────────────────────────────────────────────────┐
│                    urlState.test.ts                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Test: encodeFiltersToHash()                                │
│    ├─ Empty filters → ""                                    │
│    ├─ Keywords → "q=road,bridge"                            │
│    ├─ Multiple filters → correct format                     │
│    └─ Special characters → properly encoded                 │
│                                                              │
│  Test: decodeFiltersFromHash()                              │
│    ├─ Valid hash → correct object                           │
│    ├─ Invalid hash → empty object                           │
│    └─ Partial hash → partial object                         │
│                                                              │
│  Test: areFiltersEqual()                                    │
│    ├─ Arrays (sorted) → true                                │
│    ├─ undefined/null/'' → true                              │
│    ├─ 'all_time'/undefined → true                           │
│    └─ Different values → false                              │
│                                                              │
│  Test: validateFilterState()                                │
│    ├─ Valid year → kept                                     │
│    ├─ Invalid year → removed                                │
│    ├─ Valid quarter → kept                                  │
│    ├─ Invalid quarter → removed                             │
│    └─ NaN values → removed                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Integration Tests

```
┌─────────────────────────────────────────────────────────────┐
│                AdvancedSearch.test.tsx                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Test: Load from URL on mount                               │
│    ├─ Set window.location.hash                              │
│    ├─ Render component                                      │
│    └─ Assert filters applied                                │
│                                                              │
│  Test: Update URL on filter change                          │
│    ├─ Apply filter in UI                                    │
│    ├─ Click search                                          │
│    └─ Assert URL contains filter                            │
│                                                              │
│  Test: Handle invalid URL                                   │
│    ├─ Set invalid hash                                      │
│    ├─ Render component                                      │
│    └─ Assert no crash                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Browser Navigation Flow

### Current: Unpredictable

```
User Journey:
  1. Visit page
  2. Add filter "road" → URL: #q=road (history +1)
  3. Click "Show Analytics" → URL: #q=road&view=analytics (history +1)
  4. Change tab to "charts" → URL: #q=road&view=analytics&tab=charts (NO HISTORY!)
  5. Change tab to "clustering" → URL: ...&tab=clustering (NO HISTORY!)
  6. Click browser back
     Expected: Back to tab=charts
     Actual: Back to before tab changes (#q=road&view=analytics)
     ❌ Confusing!
```

### Improved: Predictable

```
User Journey:
  1. Visit page
  2. Add filter "road" → URL: #q=road (history +1)
  3. Click "Show Analytics" → URL: #q=road&view=analytics (history +1)
  4. Change tab to "charts" → URL: #q=road&view=analytics&tab=charts (NO HISTORY)
  5. Change tab to "clustering" → URL: ...&tab=clustering (NO HISTORY)
  6. Click browser back
     Expected: Back to before analytics
     Actual: #q=road
     ✅ Predictable!
     
Note: Tab changes don't add to history because:
  - They're UI state, not filter state
  - Users don't expect to navigate through tabs with back button
  - Keeps history clean
```

---

## Summary

| Aspect | Before | After Phase 1 | After Phase 2 |
|--------|--------|---------------|---------------|
| **Code Lines** | 320 | 220 (-31%) | 180 (-44%) |
| **Duplication** | 3x | 1.2x | 1x |
| **Error Handling** | ❌ None | ✅ Validation | ✅ Validation |
| **History Mgmt** | ❌ Inconsistent | ✅ Explicit | ✅ Centralized |
| **Testability** | ❌ Hard | ✅ Easy | ✅ Very Easy |
| **Maintainability** | ❌ Complex | ✅ Better | ✅ Excellent |
| **Risk** | - | 🟢 Low | 🟡 Medium |
| **Time** | - | 45 min | 4-5 hrs |

---

**Recommendation**: Start with **Phase 1** (quick wins), then evaluate **Phase 2** based on results.



