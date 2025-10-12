# Advanced Search Components

This directory contains the specific components used within the Advanced Search feature.

## 📁 Components

### Core Components
- **`AdvancedSearchActions.tsx`** - Action buttons and controls (search, clear, export)
- **`AdvancedSearchFilters.tsx`** - Main filtering interface with chip-based filters
- **`AdvancedSearchResults.tsx`** - Search results table with sorting and pagination
- **`PredefinedFilterSelector.tsx`** - Predefined filter configurations selector

## 🎯 Purpose

These components provide the Advanced Search interface, which allows users to:

- Apply multi-dimensional filters (contractors, areas, organizations, categories)
- Use keyword search with AND logic
- Apply date range and value range filtering
- Save and load predefined filter configurations
- Export filtered search results

## 🔧 Architecture

The components follow a filter-action-results pattern:
```
AdvancedSearchFilters (filter interface)
├── Chip-based multi-value filters
├── Keyword search input
├── Date range selection
└── Value range filtering

AdvancedSearchActions (action controls)
├── Execute search button
├── Clear all filters
├── Export functionality
└── Analytics access

PredefinedFilterSelector (saved configurations)
├── Load saved filters
├── Save current configuration
└── Manage filter presets

AdvancedSearchResults (results display)
├── Sortable results table
├── Pagination controls
└── Individual record export
```

## 🔍 Search Logic

- **Within filter types**: OR logic (e.g., "Contractor A" OR "Contractor B")
- **Between filter types**: AND logic (e.g., "Contractor A" AND "Area X" AND "2023")
- **Keywords**: Full-text search in titles and descriptions
- **Value ranges**: Min/Max contract amount filtering with KMBT format

## 🎨 Styling

Components use styled-components with:
- Chip-based filter visualization
- Responsive table layouts
- Interactive filter controls
- Consistent theming with dark/light mode support

---

Part of the [Advanced Search Feature](../) within the [Frontend Components](../../../) system.