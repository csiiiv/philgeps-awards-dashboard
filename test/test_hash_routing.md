# Hash Routing Test Plan

**Test Date**: _______________  
**Tester**: _______________  
**Browser**: _______________  
**Status**: [ ] Pass [ ] Fail

---

## Quick Test URLs

Copy and paste these URLs to test (replace `localhost:3000` with your server URL):

### Valid URLs (Should Work)

```bash
# 1. Basic keyword search
http://localhost:3000/advanced-search#q=road

# 2. Multiple filters
http://localhost:3000/advanced-search#q=road&areas=manila&min=1000000

# 3. Analytics view with tab
http://localhost:3000/advanced-search#q=road&view=analytics&tab=charts

# 4. Date filters
http://localhost:3000/advanced-search#dateType=yearly&year=2023

# 5. Complex multi-filter
http://localhost:3000/advanced-search#q=road,bridge&areas=manila,quezon&min=1000000&max=5000000&dateType=yearly&year=2023&view=analytics&tab=clustering
```

### Invalid URLs (Should Not Crash)

```bash
# 6. Invalid year
http://localhost:3000/advanced-search#year=9999

# 7. Invalid quarter
http://localhost:3000/advanced-search#quarter=5

# 8. Invalid numeric values
http://localhost:3000/advanced-search#min=abc&max=xyz

# 9. Invalid date
http://localhost:3000/advanced-search#startDate=not-a-date

# 10. Mixed valid/invalid
http://localhost:3000/advanced-search#q=road&year=9999&areas=manila
```

---

## Test Cases

### 1. Basic Functionality

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **1.1** Apply Filter | 1. Go to advanced search<br>2. Add keyword "road"<br>3. Click search | URL shows `#q=road` | [ ] |
| **1.2** Reload Page | 1. With filters applied<br>2. Refresh page (F5) | Filters restored | [ ] |
| **1.3** Share URL | 1. With filters applied<br>2. Copy URL<br>3. Open in incognito | Same filters shown | [ ] |
| **1.4** Multiple Filters | 1. Add area "manila"<br>2. Add min value 1M<br>3. Click search | URL shows all filters | [ ] |

---

### 2. URL Validation (NEW)

| Test | URL | Expected Result | Console Warning | Status |
|------|-----|-----------------|-----------------|--------|
| **2.1** Invalid Year | `#year=9999` | Year ignored, app works | "[URL Validation] Invalid year" | [ ] |
| **2.2** Invalid Quarter | `#quarter=5` | Quarter ignored, app works | "[URL Validation] Invalid quarter" | [ ] |
| **2.3** Invalid Min | `#min=abc` | Min ignored, app works | "[URL Validation] Invalid minValue" | [ ] |
| **2.4** Invalid Date | `#startDate=xyz` | Date ignored, app works | "[URL Validation] Invalid startDate" | [ ] |
| **2.5** Mixed Valid/Invalid | `#q=road&year=9999&areas=manila` | Only "road" and "manila" applied | Warning for year | [ ] |

**Notes**: Check browser console (F12) for warning messages

---

### 3. Browser Navigation (IMPROVED)

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **3.1** Back After Filter | 1. Apply filter<br>2. Click back button | Returns to no filter | [ ] |
| **3.2** Back After Analytics | 1. Open analytics<br>2. Click back button | Closes analytics | [ ] |
| **3.3** Back After Tab Change | 1. Open analytics<br>2. Change tab to "charts"<br>3. Change tab to "clustering"<br>4. Click back | Skips tab changes, goes to before analytics | [ ] |
| **3.4** Forward After Back | 1. After any back<br>2. Click forward | Advances correctly | [ ] |
| **3.5** Multiple Backs | 1. Do several actions<br>2. Click back multiple times | Only filter changes in history | [ ] |

**Critical**: Tab changes should NOT create history entries

---

### 4. Tab Synchronization (FIXED)

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **4.1** Tab from URL | 1. Visit `#view=analytics&tab=charts` | Analytics opens with charts tab | [ ] |
| **4.2** Edit URL Tab | 1. Analytics open<br>2. Edit URL to `tab=clustering`<br>3. Press Enter | Tab changes to clustering | [ ] |
| **4.3** Tab Persistence | 1. Open analytics with tab<br>2. Reload page | Same tab shown | [ ] |

---

### 5. Error Handling

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| **5.1** Malformed URL | Visit `#invalid===&&&` | App works, no crash | [ ] |
| **5.2** Console Check | Visit any invalid URL | Error logged but handled | [ ] |
| **5.3** Partial Decode | Visit `#q=road&invalid=xyz&areas=manila` | Valid params applied, invalid ignored | [ ] |

---

### 6. Performance

| Test | Action | Expected Time | Actual | Status |
|------|--------|---------------|--------|--------|
| **6.1** URL Update | Apply filter | Instant (<100ms) | _____ | [ ] |
| **6.2** Page Load | Visit URL with filters | Fast (<1s) | _____ | [ ] |
| **6.3** Tab Change | Change analytics tab | Instant | _____ | [ ] |

---

## Console Messages to Verify

### Normal Operation

✅ Should see these:
```
🔗 updateUrlHash called with filters: {...}
🔗 Encoded hash: q=road&areas=manila
🔗 URL updated (added to history): http://...
[AnalyticsExplorer] Tab changed from URL: charts
```

### URL Validation (When testing invalid URLs)

✅ Should see these warnings:
```
[URL Validation] Invalid year: 9999. Ignoring.
[URL Validation] Invalid quarter: 5. Ignoring.
[URL Validation] Invalid minValue: NaN. Ignoring.
[URL Validation] Invalid startDate: not-a-date. Ignoring.
```

### Errors

❌ Should NOT see:
```
Uncaught Error: ...
TypeError: ...
[Any unhandled exceptions]
```

---

## Regression Testing

Test that existing functionality still works:

| Feature | Works? | Notes |
|---------|--------|-------|
| Search with filters | [ ] | |
| Export to CSV | [ ] | |
| Analytics modal | [ ] | |
| Treemap view | [ ] | |
| Filter chips | [ ] | |
| Clear filters | [ ] | |
| Date range picker | [ ] | |
| Value range slider | [ ] | |

---

## Browser Compatibility

Test in multiple browsers if possible:

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | _____ | [ ] | |
| Firefox | _____ | [ ] | |
| Safari | _____ | [ ] | |
| Edge | _____ | [ ] | |

---

## Issues Found

Document any issues below:

### Issue 1
- **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
- **Description**: 
- **Steps to Reproduce**: 
- **Expected**: 
- **Actual**: 

### Issue 2
- **Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
- **Description**: 
- **Steps to Reproduce**: 
- **Expected**: 
- **Actual**: 

---

## Test Summary

**Total Tests**: 26  
**Passed**: _____  
**Failed**: _____  
**Blocked**: _____  
**Pass Rate**: _____%

### Overall Assessment

[ ] ✅ Ready for Production  
[ ] ⚠️  Minor Issues Found (acceptable)  
[ ] ❌ Major Issues Found (needs fix)

### Notes

_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________

---

## Sign-off

**Tester**: _______________  
**Date**: _______________  
**Signature**: _______________

---

## Quick Verification Commands

Run these in browser console (F12):

```javascript
// 1. Check utilities exist
console.log(window.location.hash)

// 2. Test parseHashParams (if exported)
// Should parse current URL hash

// 3. Test validation
// Apply invalid year via URL, check console for warnings

// 4. Test history
history.length  // Should increase after filter changes, not tab changes
```

---

## Automated Testing (Future)

To add unit tests:

```bash
cd frontend
npm test -- urlState.test.ts
```

Create file: `frontend/src/utils/__tests__/urlState.test.ts`

---

**End of Test Plan**


