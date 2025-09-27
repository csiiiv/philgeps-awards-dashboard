# Frontend - PhilGEPS Dashboard

React TypeScript frontend application providing an intuitive interface for exploring PhilGEPS government procurement data with advanced search, analytics, and data visualization capabilities.

## 🏗️ Architecture

The frontend is built with modern React patterns, TypeScript for type safety, and a comprehensive design system for consistent UI/UX.

### Core Technologies

- **React 18** - Component-based UI library with hooks and context
- **TypeScript** - Type-safe JavaScript with comprehensive type definitions
- **Vite** - Fast build tool and development server
- **Styled Components** - CSS-in-JS styling with theme support
- **REST API** - Server-side data processing with Django backend

## 📁 Directory Structure

### `/src/` - Source Code

- **`/components/`** - Reusable UI components organized by feature
  - `/features/` - Feature-specific components (Data Explorer, Advanced Search, Analytics)
  - `/lazy/` - Lazy-loaded components for performance
  - `/styled/` - Styled components and theme definitions
- **`/pages/`** - Top-level page components (About, Help, API Documentation)
- **`/hooks/`** - Custom React hooks for state management and data fetching
- **`/services/`** - API service layers and data processing utilities
- **`/contexts/`** - React context providers for global state
- **`/design-system/`** - Design tokens, themes, and styling utilities
- **`/utils/`** - Utility functions for common operations
- **`/types/`** - TypeScript type definitions
- **`/constants/`** - Application constants and configuration

### Configuration Files

- **`package.json`** - Dependencies and build scripts
- **`vite.config.ts`** - Vite build configuration
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.js`** - ESLint configuration for code quality

## 🚀 Development

### Prerequisites

- Node.js 16+
- npm package manager

### Setup

```bash
cd frontend
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## 🌐 Access Points

- **Development**: `http://localhost:3000`
- **Production**: `https://philgeps.simple-systems.dev`

## 📊 Key Features

### Data Explorer (Default Tab)
- **Entity-First Analysis** - Explore data by contractors, organizations, areas, or business categories
- **Interactive Filters** - Dynamic filtering based on selected dimension
- **Real-time Search** - Search and filter entities with autocomplete
- **Summary Statistics** - Quick overview of total contracts, values, and averages
- **Compact UI** - Optimized for space efficiency

### Advanced Search
- **Comprehensive Filtering** - Multi-dimensional search across all data fields
- **Keyword Search** - AND logic for precise keyword matching
- **Date Range Filtering** - Flexible time period selection (2013-2025)
- **Export Capabilities** - CSV export with rank range selection
- **Filter Presets** - Save, load, and manage custom filter configurations

### Analytics
- **Contract Analysis** - Detailed breakdown by various dimensions
- **Drill-down Capabilities** - Nested modals for granular data exploration
- **Performance Metrics** - Contract value, count, and efficiency analysis
- **Table Loading** - Optimized loading states for better UX

### User Experience
- **Dark/Light Mode** - Toggle between themes with persistent preference
- **Responsive Design** - Works on desktop and mobile devices
- **Performance Optimized** - Lazy loading, memoization, and efficient rendering

## 🎨 Design System

The application uses a comprehensive design system with:

- **Color Palettes** - Light and dark theme color schemes
- **Typography** - Consistent font scales and text styles
- **Spacing** - Standardized spacing scale
- **Components** - Reusable UI components with consistent styling
- **Animations** - Smooth transitions and micro-interactions

## 🏗️ Component Architecture

### Feature Components
- **DataExplorer** - Main data exploration interface
- **AdvancedSearch** - Comprehensive search functionality
- **AnalyticsModal** - Analytics and drill-down capabilities
- **EntityDrillDownModal** - Detailed entity analysis

### Shared Components
- **AccessibleButton** - Accessible button component
- **ErrorBoundary** - Error handling and recovery
- **LoadingSpinner** - Loading states
- **ThemeToggle** - Theme switching
- **UnifiedPagination** - Pagination controls

### Styled Components
- **Common.styled** - Common styled components
- **App.styled** - Application-level styling
- **Loading.styled** - Loading state styling

## 🔧 Custom Hooks

- **useUnifiedAnalytics** - Analytics data management
- **useAdvancedSearchFilters** - Search filter management
- **useAnalyticsControls** - Analytics control state
- **usePerformanceMonitoring** - Performance tracking
- **useAccessibility** - Accessibility features

## 📊 Performance Optimizations

- **Lazy Loading** - Components loaded on demand
- **Memoization** - React.memo for expensive components
- **Efficient Queries** - Optimized API calls
- **Caching** - Strategic data caching
- **Bundle Splitting** - Code splitting for faster loads

## 🔒 Security

- **Input Validation** - Comprehensive input sanitization
- **CORS Configuration** - Proper cross-origin setup
- **Environment Variables** - Secure configuration management
- **HTTPS Ready** - Production-ready security headers

## 📈 Data Coverage

### PhilGEPS Dataset (2013-2021)
- Government procurement contracts
- Contractor information
- Organization data
- Geographic information

### Sumbong sa Pangulo Dataset (2022-2025)
- Flood control projects
- Infrastructure data
- Extended coverage for recent years

---

**Last Updated**: January 28, 2025  
**Version**: v3.0.1 - Clean Frontend Documentation