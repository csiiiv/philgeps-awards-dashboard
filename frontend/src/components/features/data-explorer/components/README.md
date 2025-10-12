# Data Explorer Components

This directory contains the specific components used within the Data Explorer feature.

## 📁 Components

### Core Components
- **`DataExplorerControls.tsx`** - Main control panel for dimension and metric selection
- **`DataExplorerEntityFilters.tsx`** - Entity-specific filtering components
- **`DataExplorerFilters.tsx`** - General filtering interface
- **`DataExplorerSummary.tsx`** - Summary statistics display
- **`DataExplorerTable.tsx`** - Analytics data table with sorting and pagination
- **`index.ts`** - Component exports

## 🎯 Purpose

These components work together to provide the Data Explorer interface, which is the primary analytics interface of the dashboard. The Data Explorer allows users to:

- Analyze data by contractors, organizations, areas, or business categories
- Apply dimension-specific filters
- View summary statistics
- Export aggregated data

## 🔧 Architecture

The components follow a hierarchical structure:
```
DataExplorerControls (top-level controls)
├── DataExplorerFilters (filtering interface)
├── DataExplorerEntityFilters (entity-specific filters)
├── DataExplorerSummary (statistics summary)
└── DataExplorerTable (results table)
```

## 📊 Data Flow

1. **Controls** → Set dimension (contractors/organizations/areas/categories) and metric
2. **Filters** → Apply general and entity-specific filters
3. **Summary** → Display aggregated statistics
4. **Table** → Show detailed analytics results with export capabilities

## 🎨 Styling

Components use styled-components and the project's design system for consistent theming and responsive design.

---

Part of the [Data Explorer Feature](../) within the [Frontend Components](../../../) system.