# Advanced Search Filtering Issue - Analysis & Solution

## 🐛 Issue Reported

When searching with keywords "farm && road", results include contracts from Masbate worth 200M+.  
However, when adding an **area filter** for "Masbate", those contracts disappear (no results).  
Same issue occurs with **organization filters**.

## 🔍 Root Cause Analysis

Found in `backend/django/contracts/parquet_search.py`:

### Current Logic (Line 691)

```python
where_clause = " AND ".join(where_conditions)
```

All filter types are combined with **AND** logic:

```sql
WHERE (keywords conditions)
  AND (contractor conditions)  
  AND (area conditions)
  AND (organization conditions)
  AND (business_category conditions)
```

### The Problem

When searching:
1. **Keywords only**: `"farm && road"`
   - Searches in `search_text` column
   - Returns contracts containing both "farm" AND "road" in their full text
   
2. **Keywords + Area filter**: `"farm && road"` + `"Masbate"`
   - Query becomes: `WHERE (search_text contains 'farm' AND 'road') AND (area_of_delivery contains 'Masbate')`
   - Should work correctly...

**BUT** - Likely issues:

### Issue 1: Area Name Mismatch
Data might contain:
- ❌ "Province of Masbate"
- ❌ "Masbate, Masbate"  
- ❌ "MASBATE"
- ✅ User searches for: "Masbate"

The LIKE `'%masbate%'` should match these, but if the data has:
- "Masbate Province" - ✅ Would match
- "Msbte" (typo) - ❌ Won't match
- NULL or empty - ❌ Won't match

### Issue 2: Search Text Column Scope
The `search_text` column might not include area information. If keywords are searched ONLY in title/description but NOT in area field, then:
- Keywords "farm && road" might match title
- But if the area field is separate and keywords don't search it, adding area filter creates impossible condition

### Issue 3: AND Keyword Parsing
Line 517-522 shows areas are parsed for AND keywords:
```python
and_keywords = self._parse_and_keywords(area.strip())
```

If user enters "Masbate" but the parsing treats it as AND-separated, it might break the filter.

## 🎯 Recommended Solutions

### Solution 1: Debug Logging (Immediate)

Add query logging to see actual SQL being executed:

```python
def _build_chip_where_conditions(self, ...):
    where_conditions = []
    
    # ... existing filter logic ...
    
    # ADD THIS:
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"WHERE conditions: {where_conditions}")
    
    return where_conditions
```

### Solution 2: Expand Search Text (Recommended)

Ensure `search_text` column includes ALL searchable fields:

```sql
CREATE VIEW contracts_searchable AS
SELECT *,
  CONCAT(
    COALESCE(award_title, ''), ' ',
    COALESCE(notice_title, ''), ' ',
    COALESCE(awardee_name, ''), ' ',
    COALESCE(organization_name, ''), ' ',
    COALESCE(area_of_delivery, ''), ' ',
    COALESCE(business_category, '')
  ) as search_text
FROM contracts
```

This way, keyword search would also match area names.

### Solution 3: Case-Insensitive Exact Match Option

Add exact match filter option:

```python
if areas:
    area_conditions = []
    for area in areas:
        if area.strip():
            # Option 1: Fuzzy match (current)
            area_conditions.append(f"LOWER(area_of_delivery) LIKE LOWER('%{area}%')")
            
            # Option 2: Exact match (add this)
            # area_conditions.append(f"LOWER(area_of_delivery) = LOWER('{area}')")
    
    if area_conditions:
        where_conditions.append(f"({' OR '.join(area_conditions)})")
```

### Solution 4: Fix AND Keyword Parsing

The `_parse_and_keywords` method splits on "&&". If user enters just "Masbate", it should NOT be split:

```python
def _parse_and_keywords(self, keyword_string: str) -> List[str]:
    """Parse keywords with AND logic (&&)"""
    if '&&' in keyword_string:
        keywords = [kw.strip() for kw in keyword_string.split('&&') if kw.strip()]
    else:
        keywords = [keyword_string.strip()]  # Single keyword, no splitting
    return keywords
```

### Solution 5: Data Quality Check

Check actual data:

```sql
-- Check unique area values
SELECT DISTINCT area_of_delivery 
FROM contracts 
WHERE LOWER(area_of_delivery) LIKE '%masbate%'
LIMIT 20;

-- Check if contracts matching keywords also have area data
SELECT contract_number, award_title, area_of_delivery, contract_amount
FROM contracts
WHERE (LOWER(award_title) LIKE '%farm%' AND LOWER(award_title) LIKE '%road%')
  AND contract_amount > 200000000
LIMIT 10;
```

## 🚀 Implementation Plan

### Step 1: Add Debug Logging

Update `_build_chip_where_conditions` to log SQL conditions

### Step 2: Test with Example Data

```python
# Test case
filters = {
    "keywords": ["farm && road"],
    "areas": ["Masbate"],
    "value_range": {"min": 200000000}
}

# Expected SQL:
WHERE (
  LOWER(search_text) LIKE '%farm%' AND 
  LOWER(search_text) LIKE '%road%'
) AND (
  LOWER(area_of_delivery) LIKE '%masbate%'
) AND (
  contract_amount >= 200000000
)
```

### Step 3: Verify Data

Query the data directly to confirm Masbate contracts exist:

```bash
docker exec philgeps-backend python -c "
from contracts.parquet_search import ParquetSearchService
service = ParquetSearchService()

# Test 1: Keywords only
result1 = service.search_contracts_with_chips(
    keywords=['farm && road'],
    value_range={'min': 200000000}
)
print(f'Keywords only: {result1[\"pagination\"][\"total_count\"]} results')

# Test 2: Area only  
result2 = service.search_contracts_with_chips(
    areas=['Masbate']
)
print(f'Area only: {result2[\"pagination\"][\"total_count\"]} results')

# Test 3: Both
result3 = service.search_contracts_with_chips(
    keywords=['farm && road'],
    areas=['Masbate'],
    value_range={'min': 200000000}
)
print(f'Both filters: {result3[\"pagination\"][\"total_count\"]} results')
"
```

### Step 4: Fix Based on Results

- If Test 1 and Test 2 return results but Test 3 returns 0 → Area name mismatch
- If all return 0 → Data doesn't exist or parquet files not loaded
- If Test 1 returns results with Masbate area but Test 3 doesn't → Logic bug

## 💡 Quick Fix (Apply Now)

The most likely issue is **case sensitivity or data format mismatch**. Try these in order:

### Fix 1: Make Area Search More Flexible

```python
# In _build_chip_where_conditions, line 522
# CURRENT:
area_and_conditions.append(f"LOWER(area_of_delivery) LIKE LOWER('%{escaped_keyword}%')")

# CHANGE TO (more flexible):
area_and_conditions.append(f"LOWER(REPLACE(area_of_delivery, ',', ' ')) LIKE LOWER('%{escaped_keyword}%')")
```

### Fix 2: Don't Use AND Parsing for Single Keywords

```python
# Line 517
if area.strip():
    # CURRENT:
    and_keywords = self._parse_and_keywords(area.strip())
    
    # CHANGE TO:
    # Only parse if contains &&
    if '&&' in area:
        and_keywords = self._parse_and_keywords(area.strip())
    else:
        and_keywords = [area.strip()]  # Treat as single keyword
```

### Fix 3: Add NULL Safety

```python
# Line 522
# CURRENT:
area_and_conditions.append(f"LOWER(area_of_delivery) LIKE LOWER('%{escaped_keyword}%')")

# CHANGE TO:
area_and_conditions.append(f"(area_of_delivery IS NOT NULL AND LOWER(area_of_delivery) LIKE LOWER('%{escaped_keyword}%'))")
```

## 📊 Expected Behavior

After fixes:

| Search | Expected Result |
|--------|-----------------|
| Keywords: "farm && road" | All contracts with "farm" AND "road" in text |
| Area: "Masbate" | All contracts in Masbate |
| Both | Contracts with "farm" AND "road" in text THAT ARE ALSO in Masbate |

The AND logic between different filter types is CORRECT. The issue is likely data matching or NULL handling.

---

**Next Step:** Run the debug tests above to identify the exact cause, then apply the appropriate fix.

