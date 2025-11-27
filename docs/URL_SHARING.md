# URL Sharing & Deep Linking

## Overview

The Advanced Search page now supports **shareable URLs with filter state** encoded in hash parameters. This allows users to:

- 📋 **Bookmark specific searches** for quick access
- 🔗 **Share searches with colleagues** via URL
- 📊 **Link directly to analytics views** with filters applied
- 🔄 **Maintain state across page refreshes**

## Features

### 1. Automatic URL Updates

The URL automatically updates as you apply filters:

```
Example: http://localhost:3000/advanced-search#q=road,bridge&areas=manila&min=1000000&max=5000000
```

### 2. Share Button

Click the **"🔗 Share"** button to copy the current URL to clipboard. The button shows "Copied!" confirmation.

### 3. Auto-Load from URL

When you visit a URL with filter parameters, the filters are **automatically applied** on page load.

### 4. Analytics Deep Linking

Add `view=analytics` to automatically open the analytics modal:

```
Example: #q=road&areas=manila&view=analytics
```

## URL Parameter Reference

### Basic Filters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `q` | Keywords (comma-separated) | `q=road,bridge` |
| `contractors` | Contractor names | `contractors=ABC Corp,XYZ Inc` |
| `areas` | Areas of delivery | `areas=manila,quezon` |
| `orgs` | Organizations | `orgs=DPWH,DOH` |
| `categories` | Business categories | `categories=construction` |

### Value Range

| Parameter | Description | Example |
|-----------|-------------|---------|
| `min` | Minimum contract value | `min=1000000` |
| `max` | Maximum contract value | `max=5000000` |

### Date Range

| Parameter | Description | Example |
|-----------|-------------|---------|
| `dateType` | Type: `yearly`, `quarterly`, `custom` | `dateType=yearly` |
| `year` | Year (for yearly/quarterly) | `year=2023` |
| `quarter` | Quarter 1-4 (for quarterly) | `quarter=2` |
| `startDate` | Start date (for custom) | `startDate=2023-01-01` |
| `endDate` | End date (for custom) | `endDate=2023-12-31` |

### Other Options

| Parameter | Description | Example |
|-----------|-------------|---------|
| `flood` | Include flood control (0 or 1) | `flood=1` |
| `view` | View mode: `search` or `analytics` | `view=analytics` |

## Usage Examples

### Example 1: Simple Keyword Search

**Scenario**: Search for "road construction" contracts

**URL**:
```
#q=road,construction
```

**What happens**:
- Adds "road" and "construction" to keyword filters
- Runs search automatically

### Example 2: Value Range Filter

**Scenario**: Contracts between ₱1M and ₱5M

**URL**:
```
#min=1000000&max=5000000
```

**What happens**:
- Sets value range slider
- Applies min/max filter

### Example 3: Complex Multi-Filter Search

**Scenario**: Road contracts in Manila, 2023, ₱4M-₱6M

**URL**:
```
#q=road&areas=manila&dateType=yearly&year=2023&min=4000000&max=6000000
```

**What happens**:
- Keyword: "road"
- Area: "manila"
- Date: Year 2023
- Value: ₱4M to ₱6M
- Auto-executes search

### Example 4: Open Analytics Directly

**Scenario**: Share analytics view for Cagayan contracts

**URL**:
```
#areas=cagayan&view=analytics
```

**What happens**:
- Applies area filter
- Runs search
- **Opens analytics modal automatically**
- Shows charts, trends, and distributions

### Example 5: Quarterly Deep Link

**Scenario**: Q2 2023 contracts with specific contractor

**URL**:
```
#contractors=ABC Construction&dateType=quarterly&year=2023&quarter=2
```

**What happens**:
- Contractor: "ABC Construction"
- Date: Q2 2023 (Apr-Jun)
- Executes search

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────┐
│  User applies filters in UI                     │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  updateUrlHash() encodes filters to URL hash    │
│  Example: #q=road&areas=manila                  │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  URL updated in browser (without page reload)   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  User visits URL or refreshes page              │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  getFiltersFromUrl() decodes hash parameters    │
└────────────────┬────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────┐
│  Apply filters to UI state                      │
│  Run search automatically                       │
│  Open analytics if view=analytics               │
└─────────────────────────────────────────────────┘
```

### Key Components

1. **`urlState.ts`**: Utility functions for encoding/decoding
   - `encodeFiltersToHash()` - Convert filter state to URL params
   - `decodeFiltersFromHash()` - Parse URL params to filter state
   - `updateUrlHash()` - Update browser URL
   - `getFiltersFromUrl()` - Read from current URL

2. **`AdvancedSearch.tsx`**: Integration in main component
   - Load from URL on mount
   - Update URL when filters change
   - Auto-open analytics if requested

3. **`AdvancedSearchActions.tsx`**: Share button UI
   - Copy URL to clipboard
   - Show "Copied!" confirmation

## Technical Details

### URL Encoding

Filters are encoded as **URL hash parameters** (after `#`):

```
#q=keyword&areas=area1,area2&min=1000000&max=5000000
```

**Why hash (`#`) instead of query string (`?`)?**
- ✅ No server round-trip
- ✅ Works with client-side routing
- ✅ Survives page reloads
- ✅ Easy to share

### Multi-Value Parameters

Multiple values are comma-separated:

```
#q=road,bridge,construction
#areas=manila,quezon,cavite
```

### URL Safety

- Values are URL-encoded automatically by `URLSearchParams`
- Special characters are escaped
- Spaces become `%20` or `+`

### State Synchronization

- URL updates **after initial mount** to avoid loops
- `isInitialMount` ref prevents update on first render
- `hasLoadedFromUrl` ref ensures URL is read only once

## User Guide

### Sharing a Search

1. Apply your desired filters
2. Click the **"🔗 Share"** button
3. URL is copied to clipboard
4. Share via email, chat, etc.

### Using a Shared URL

1. Click or paste the URL
2. Page loads with filters pre-applied
3. Search runs automatically
4. If URL contains `view=analytics`, analytics modal opens

### Bookmarking

1. Apply filters
2. Bookmark the page (Ctrl+D / Cmd+D)
3. Browser saves URL with filters
4. Click bookmark to restore exact search

## Best Practices

### For Users

✅ **DO:**
- Use Share button to copy exact URL
- Bookmark frequently used searches
- Share analytics views with `view=analytics`
- Test shared URLs before sending

❌ **DON'T:**
- Manually edit complex URLs
- Share URLs with sensitive data (if applicable)
- Assume others have same data access

### For Developers

✅ **DO:**
- Keep URL parameters concise
- Use abbreviations (`q` not `keywords`)
- Validate decoded parameters
- Handle missing/invalid values gracefully

❌ **DON'T:**
- Put sensitive data in URLs
- Make URLs excessively long
- Break backward compatibility

## Limitations

1. **URL Length**: Browsers have URL length limits (~2000 chars)
   - Keep searches reasonable
   - Use representative keywords

2. **Data Access**: User must have access to the data
   - URLs don't grant permissions
   - Shared URLs respect user access controls

3. **Version Compatibility**: Old URLs may break with major updates
   - Parameter names might change
   - Validation logic may evolve

## Troubleshooting

### Filters Not Loading

**Issue**: URL has parameters but filters aren't applied

**Solutions**:
- Check browser console for errors
- Ensure parameter names are correct
- Verify values are properly formatted

### Analytics Not Opening

**Issue**: `view=analytics` in URL but modal doesn't open

**Solutions**:
- Ensure search has results
- Check that aggregates are available
- Try running search manually first

### Share Button Not Working

**Issue**: Clicking Share doesn't copy URL

**Solutions**:
- Check browser clipboard permissions
- Look for error in console
- Try manually copying URL from address bar

### URL Too Long

**Issue**: Browser truncates or rejects URL

**Solutions**:
- Reduce number of keywords
- Use fewer multi-value filters
- Split into multiple searches

## Future Enhancements

Potential improvements:

- 🔧 **URL Shortener**: Generate short links for long URLs
- 📋 **Save Searches**: Store named searches in database
- 🔄 **History**: Navigate through search history
- 🎨 **QR Codes**: Generate QR codes for mobile sharing
- 📊 **Embed**: Embeddable search widgets for other apps

## API Reference

### `urlState.ts`

#### `encodeFiltersToHash(filters: FilterState): string`

Converts filter state object to URL hash string.

**Parameters**:
- `filters`: Object with filter values

**Returns**: URL hash string (without `#`)

**Example**:
```typescript
const hash = encodeFiltersToHash({
  keywords: ['road'],
  areas: ['manila'],
  minValue: 1000000
})
// Returns: "q=road&areas=manila&min=1000000"
```

#### `decodeFiltersFromHash(hash: string): FilterState`

Parses URL hash string to filter state object.

**Parameters**:
- `hash`: URL hash string (with or without `#`)

**Returns**: Filter state object

**Example**:
```typescript
const filters = decodeFiltersFromHash('#q=road&areas=manila')
// Returns: { keywords: ['road'], areas: ['manila'] }
```

#### `updateUrlHash(filters: FilterState): void`

Updates browser URL with current filter state.

**Parameters**:
- `filters`: Current filter state

**Side Effects**: Modifies `window.location.hash`

#### `getFiltersFromUrl(): FilterState`

Gets filter state from current URL.

**Returns**: Filter state from `window.location.hash`

#### `createShareableUrl(filters: FilterState, baseUrl?: string): string`

Creates full shareable URL with filters.

**Parameters**:
- `filters`: Filter state
- `baseUrl`: Optional base URL (defaults to current page)

**Returns**: Complete URL with hash

**Example**:
```typescript
const url = createShareableUrl({ keywords: ['road'] })
// Returns: "http://localhost:3000/advanced-search#q=road"
```

## Testing

### Manual Testing

1. **Basic filters**:
   - Apply keyword → Check URL
   - Reload page → Verify keyword restored

2. **Multi-value filters**:
   - Add multiple areas → Check URL format
   - Share URL → Test on another browser

3. **Value range**:
   - Set min/max → Check URL params
   - Reload → Verify slider positions

4. **Analytics auto-open**:
   - Create URL with `view=analytics`
   - Visit in new tab → Check modal opens

5. **Share button**:
   - Click Share → Verify "Copied!" message
   - Paste URL → Check it matches

### Automated Testing

Test cases for `urlState.ts`:

```typescript
describe('URL State Management', () => {
  test('encodes keywords correctly', () => {
    const hash = encodeFiltersToHash({ keywords: ['road', 'bridge'] })
    expect(hash).toBe('q=road%2Cbridge')
  })

  test('decodes keywords correctly', () => {
    const filters = decodeFiltersFromHash('q=road,bridge')
    expect(filters.keywords).toEqual(['road', 'bridge'])
  })

  test('handles special characters', () => {
    const hash = encodeFiltersToHash({ keywords: ['C&C Construction'] })
    const filters = decodeFiltersFromHash(hash)
    expect(filters.keywords).toEqual(['C&C Construction'])
  })
})
```

## Summary

The URL sharing feature makes the PhilGEPS Advanced Search more collaborative and efficient by:

- ✅ Enabling easy sharing of complex searches
- ✅ Supporting bookmarks for frequent queries  
- ✅ Providing deep links to specific analytics views
- ✅ Maintaining state across page refreshes
- ✅ No backend changes required (pure client-side)

**Example Real-World Use Case**:

> "I need to share my analysis of road construction contracts in Cagayan worth ₱4-6M with my manager. I click Share, send the URL via email, and when they click it, they see exactly what I see - filters applied, search executed, and analytics ready to view!"

---

**Version**: 1.0  
**Last Updated**: 2025-11-26  
**Status**: ✅ Implemented

