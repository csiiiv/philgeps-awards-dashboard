# PHILGEPS Awards Data Explorer - Current Dashboard Documentation

## Overview

The PHILGEPS Awards Data Explorer is a comprehensive transparency dashboard that provides access to Philippine government procurement data from 2013-2025. The dashboard is built as a single-page application with a tabbed interface, featuring advanced search, analytics, and export capabilities with complete OpenAPI 3.0 compliance.

**Version**: v3.3.0 - Docker Support & Unified Export System  
**Last Updated**: October 12, 2025

## 🏗️ Current Dashboard Architecture

### Main Interface Structure

The dashboard consists of five main tabs:

1. **📊 Data Explorer** - Primary analytics interface (default tab)
2. **🔎 Advanced Search** - Detailed contract search with filtering
3. **📚 API Docs** - Complete API documentation
4. **❓ Help** - User guide and support information  
5. **ℹ️ About** - Technical details and data sources

### Core Features

- **Dark/Light Mode Toggle** - Seamless theme switching
- **Responsive Design** - Mobile-friendly interface
- **Real-time Search** - Fast, interactive search capabilities
- **Enhanced Data Export** - Individual and aggregated CSV export with accurate estimation
- **Analytics Integration** - Charts and visualizations via modal
- **OpenAPI 3.0 Compliance** - Complete API documentation with Swagger UI and ReDoc
- **Service Worker** - Offline capability and update notifications

---

## 🆕 Latest Updates - v3.3.0

### Docker Support & Unified Export System

The dashboard now features complete containerization and a unified export system with major improvements:

#### Docker Containerization
- **Complete Docker Support** - Full containerization with Docker Compose
- **Multi-Service Setup** - Backend (Django + Gunicorn) and frontend (React + Nginx)
- **Production Ready** - Multi-stage builds and health check endpoints
- **Flexible Data Handling** - Configurable Parquet data management
- **Cloud Deployment** - Azure and AWS deployment guides

#### Unified Export System
- **Streaming CSV Export** - Memory-efficient export for large datasets
- **Real-time Progress** - Progress tracking with cancellation support
- **Performance Optimization** - 3-5x faster export times with 50,000 record batches
- **Memory Efficiency** - Eliminates browser crashes with large datasets (1.7GB+)
- **Consistent Interface** - Unified export across all components

#### Value Range Filtering
- **Contract Amount Filtering** - Min/Max value filtering with KMBT format support
- **Smart Input Validation** - Real-time validation and formatting
- **Enhanced Pagination** - Custom page input for direct navigation
- **Filter Persistence** - Value range settings saved and restored

#### Development Workflow
- **Docker-First Approach** - Single `docker compose up` command for setup
- **Environment Standardization** - Consistent development across platforms
- **Health Monitoring** - Built-in health checks for container orchestration
- **Production Deployment** - Comprehensive cloud deployment documentation

#### Technical Improvements
- **OpenAPI 3.0 Compliance** - Complete API documentation with Swagger UI
- **Rate Limiting** - 240 requests per hour per IP address
- **Enhanced Security** - Proper CORS, CSRF, and security headers
- **Performance Optimization** - Faster data processing and response times

---

## 📊 Data Explorer - Primary Analytics Interface

### Overview
The Data Explorer is the primary interface and default tab of the dashboard. It provides analytics-focused data exploration with entity-based analysis, allowing users to explore data by contractors, organizations, areas, or business categories with integrated filtering and visualization capabilities.

### Key Components

#### 1. Analytics Controls
The Data Explorer features sophisticated analytics controls:

**Dimension Selection:**
- **By Contractor** - Analyze data by contractor entities
- **By Organization** - Analyze data by government agencies
- **By Area** - Analyze data by delivery areas
- **By Category** - Analyze data by business categories

**Metric Selection:**
- **Contract Amount** - Sort by total contract value
- **Contract Count** - Sort by number of contracts
- **Average Contract Price** - Sort by average contract value

**Time Filtering:**
- **Year Selection** - Filter by specific years (2015-2025)
- **All Years** - Include all available data

#### 2. Entity Filtering
When a specific dimension is selected, users can filter by specific entities:
- **Contractor Filter** - Search and select specific contractors
- **Organization Filter** - Search and select specific government agencies
- **Area Filter** - Search and select specific delivery areas
- **Category Filter** - Search and select specific business categories

#### 3. Analytics Table
**Features:**
- **Sortable Columns** - Click headers to sort by different metrics
- **Entity Drill-down** - Click on entities to see detailed information
- **Pagination** - Navigate through large datasets
- **Export Functionality** - Download analytics data as CSV

#### 4. Summary Statistics
- **Total Contracts** - Overall contract count
- **Total Value** - Sum of all contract amounts
- **Average Value** - Average contract amount

### Data Explorer Workflow

1. **Select Dimension** - Choose what to analyze (contractors, organizations, areas, categories)
2. **Choose Metric** - Select how to sort the data (amount, count, average)
3. **Set Year Filter** - Optionally filter by specific year or view all years
4. **Add Entity Filters** - Optionally filter by specific entities within the selected dimension
5. **Execute Search** - Click "Search" to load analytics data
6. **Explore Results** - View analytics table and summary statistics
7. **Drill Down** - Click on entities for detailed information
8. **Export Data** - Download results as CSV if needed

---

## 🔎 Advanced Search - Detailed Contract Search Interface

### Overview
The Advanced Search interface provides comprehensive contract search with sophisticated filtering capabilities. It's designed for users who need to find specific contracts with detailed search criteria.

### Key Components

#### 1. Filter System
The dashboard uses a **chip-based filter system** that allows users to build complex search queries:

**Filter Types:**
- **👤 Contractors** - Search by contractor names with autocomplete
- **📍 Areas** - Filter by delivery areas (geographic regions)
- **🏢 Organizations** - Search by contracting government agencies
- **🏷️ Categories** - Filter by business categories (types of goods/services)
- **🔍 Keywords** - Search contract titles and descriptions
- **📅 Time Ranges** - Filter by award dates (yearly, quarterly, custom)
- **🌊 Flood Control** - Toggle to include flood control dataset

**Filter Logic:**
- **Within filter types**: OR logic (e.g., "Contractor A" OR "Contractor B")
- **Between filter types**: AND logic (e.g., "Contractor A" AND "Area X" AND "2023")
- **Keywords**: Searches both award titles and notice titles for matches

#### 2. Search Interface
- **Autocomplete Dropdowns** - Smart suggestions for entity selection
- **Filter Chips** - Visual representation of applied filters
- **Clear All** - Reset all filters with one click
- **Search Button** - Execute search with current filters
- **Save Filters** - Save current filter configuration

#### 3. Results Display
**Search Results Table:**
- **Sortable Columns** - Click headers to sort by any field
- **Pagination** - Navigate through large result sets
- **Page Size Control** - Choose 10, 20, 50, or 100 results per page
- **Export Options** - CSV export for current page or full dataset

**Column Information:**
- Contract Number
- Award Title
- Notice Title
- Award Date
- Contractor Name
- Area of Delivery
- Organization
- Business Category
- Contract Amount
- Award Status

#### 4. Analytics Integration
- **Analytics Button** - Access charts and visualizations
- **Analytics Modal** - Interactive charts based on current filters
- **Trend Analysis** - Time-based analysis of selected data

### Advanced Search Workflow

1. **Add Filters** - Use dropdown menus to select entities
2. **Add Keywords** - Type keywords and press Enter
3. **Set Date Range** - Choose time period (all time, yearly, quarterly, custom)
4. **Review Chips** - See all applied filters as colored chips
5. **Execute Search** - Click "Execute Search" to run query
6. **Review Results** - Sort, paginate, and analyze results
7. **Access Analytics** - Click "Analytics" for visualizations
8. **Export Data** - Download results as CSV if needed

---

## 📊 Analytics Integration

### Overview
Analytics functionality is integrated throughout the dashboard, with different implementations for each interface:

- **Data Explorer** - Built-in analytics with real-time data processing
- **Advanced Search** - Analytics modal accessible via "Analytics" button

### Key Features

#### 1. Unified Analytics System
The dashboard uses a unified analytics system that provides:
- **Real-time Data Processing** - Live aggregation of contract data
- **Multiple Data Dimensions** - Analysis by contractors, organizations, areas, categories
- **Flexible Metrics** - Contract amount, count, and average value analysis
- **Time-based Filtering** - Year and time range filtering capabilities

#### 2. Data Visualization
- **Summary Statistics** - Key metrics and totals displayed prominently
- **Analytics Tables** - Sortable tables with entity breakdowns
- **Drill-down Capability** - Click entities to see detailed contract information
- **Pagination** - Navigate through large datasets efficiently

#### 3. Export Functionality
- **Individual Contracts Export** - Download individual contract records as CSV
- **Aggregated Data Export** - Download analytics data (contractors, organizations, etc.) as CSV
- **Export Estimation** - Preview export size before download
- **Filtered Export** - Export only filtered results
- **Progress Tracking** - Real-time export progress with file size estimates

### Analytics Workflows

#### Data Explorer Analytics
1. **Select Analysis Type** - Choose dimension and metric
2. **Set Filters** - Optionally filter by specific entities or years
3. **View Results** - See real-time analytics table and summary
4. **Drill Down** - Click entities for detailed information
5. **Export Data** - Download results as CSV

#### Advanced Search Analytics
1. **Set Search Filters** - Configure search criteria in Advanced Search
2. **Click Analytics** - Click "Analytics" button to open modal
3. **Configure Analysis** - Choose dimension, metric, and time range
4. **Explore Data** - View tables and click entities for drill-down
5. **Export Results** - Download data as CSV if needed
6. **Close Modal** - Return to search interface

---

## 🎨 User Interface Design

### Design System
The dashboard uses a comprehensive design system with:

**Color Palettes:**
- **Light Theme** - Clean, professional appearance
- **Dark Theme** - Reduced eye strain for extended use
- **Accent Colors** - Consistent color coding for different data types

**Typography:**
- **Font Scale** - Consistent text sizing hierarchy
- **Font Weights** - Clear visual hierarchy
- **Line Heights** - Optimal readability

**Spacing:**
- **Consistent Spacing** - 4px base unit system
- **Component Padding** - Standardized component spacing
- **Layout Grid** - Responsive grid system


---

## 🔧 Technical Implementation

### Frontend Technology Stack
- **React 19.1.1** - Component-based UI library
- **TypeScript 5.8.3** - Type-safe development
- **Vite 4.5.3** - Fast build tool and development server
- **Styled Components 6.1.13** - CSS-in-JS styling
- **Custom Design System** - Tailored styling and components
- **Chart.js 4.5.0** - Data visualization
- **Recharts 3.2.1** - Additional charting capabilities
- **Zustand 5.0.8** - State management

### Backend Technology Stack
- **Django 5.2** - Web framework
- **Django REST Framework** - API framework
- **SQLite** - Primary database
- **Parquet Files** - Columnar data storage for analytics
- **Django CORS Headers** - Cross-origin resource sharing
- **WhiteNoise** - Static file serving

### Data Processing
- **Real-time Processing** - Live data aggregation
- **Search Optimization** - Fast search capabilities
- **Caching** - Response caching for performance
- **Pagination** - Efficient large dataset handling

---

## 📈 Performance Features

### Optimization Strategies
- **Lazy Loading** - Components loaded on demand
- **Code Splitting** - Optimized bundle sizes
- **Memoization** - Prevent unnecessary re-renders
- **Debouncing** - Optimized search input handling

### Data Handling
- **Parquet Format** - Efficient columnar storage
- **Pre-aggregations** - Pre-computed aggregations
- **Search Indices** - Optimized search capabilities
- **Response Caching** - Frequently accessed data caching

---

## 🚀 Usage Examples

### Example 1: Data Explorer - Analyze Top Contractors by Value
1. Go to Data Explorer tab (default)
2. Select dimension: "By Contractor"
3. Select metric: "Contract Amount"
4. Set year filter: "2023"
5. Click "Search" to see top contractors by value
6. Click on a contractor to drill down for details
7. Export data for further analysis

### Example 2: Advanced Search - Find Face Shield Contracts (2020-2021)
1. Go to Advanced Search tab
2. Add keyword: "face shield"
3. Set date range: 2020-2021
4. Click "Execute Search"
5. Sort by amount to find highest value contracts
6. Click "Analytics" to see spending trends

### Example 3: Data Explorer - Regional Spending Analysis
1. Go to Data Explorer tab
2. Select dimension: "By Area"
3. Select metric: "Contract Amount"
4. Set year filter: "2023"
5. Add area filter: "Cebu"
6. Click "Search" to see Cebu spending analysis
7. Export data for further analysis

### Example 4: Advanced Search - Category-based Research
1. Go to Advanced Search tab
2. Add category: "Medical Equipment"
3. Add keywords: "ventilator"
4. Set date range: "2020-2021"
5. Execute search and analyze results
6. Use analytics to understand market trends

---

## 📊 Data Coverage

### Dataset Statistics
- **Time Period**: 2013-2025 (13+ years)
- **Total Contracts**: ~5M contract records
- **Total Value**: ~₱15 trillion in contract amounts
- **Contractors**: 120K+ unique contractors
- **Organizations**: 14K+ government agencies
- **Areas**: 520 delivery areas
- **Categories**: 169 business categories

### Data Quality
- **Awarded Contracts Only** - No duplicate counting
- **Data Validation** - Automated quality checks
- **Standardization** - Consistent data formats
- **Deduplication** - Removed exact duplicates

---

## 🔍 Search Capabilities

### Advanced Filtering
- **Multi-criteria Search** - Combine multiple filter types
- **Autocomplete** - Smart suggestions for entity names
- **Fuzzy Matching** - Find similar names and variations
- **Keyword Search** - Full-text search in titles and descriptions

### Sorting and Pagination
- **Multi-column Sorting** - Sort by any data field
- **Flexible Pagination** - Choose page size (10-100 results)
- **Large Dataset Handling** - Efficient processing of millions of records

### Export Functionality
- **CSV Export** - Download search results
- **Export Estimation** - Preview export size before download
- **Full Dataset Export** - Export complete filtered results

---

## 🎯 Target Users

### Primary Users
- **Citizens** - Public transparency and accountability
- **Journalists** - Investigative reporting and analysis
- **Researchers** - Academic and policy research
- **Government Officials** - Procurement oversight and analysis
- **Data Analysts** - Business intelligence and market research

### Use Cases

#### Data Explorer Use Cases
- **Entity Performance Analysis** - Analyze top performers by contractors, organizations, areas, or categories
- **Trend Analysis** - Identify spending patterns and trends over time
- **Market Research** - Understand procurement market dynamics
- **Comparative Analysis** - Compare performance across different entities

#### Advanced Search Use Cases
- **Contract Discovery** - Find specific contracts using detailed search criteria
- **Transparency Monitoring** - Track government spending with precise filters
- **Investigative Research** - Deep-dive into specific procurement patterns
- **Compliance Analysis** - Verify procurement compliance and patterns

---

## 🔧 Maintenance and Updates

### Regular Updates
- **Data Refresh** - Regular data updates from PHILGEPS
- **Feature Updates** - Continuous improvement of functionality
- **Performance Optimization** - Ongoing performance enhancements
- **Security Updates** - Regular security patches and updates

### Monitoring
- **Performance Metrics** - Real-time performance monitoring
- **Error Tracking** - Comprehensive error logging
- **Usage Analytics** - User behavior and feature usage
- **System Health** - Continuous system health monitoring

---

## 📞 Support and Resources

### Documentation
- **API Documentation** - Complete API reference
- **User Guide** - Comprehensive help documentation
- **Technical Details** - Implementation and architecture information

### Getting Help
- **Help Tab** - Built-in help and guidance
- **About Tab** - Technical information and data sources
- **API Docs** - Developer resources and examples

---

*This documentation reflects the current state of the PHILGEPS Awards Data Explorer dashboard as of October 12, 2025. The dashboard features a dual-interface architecture with Data Explorer as the primary analytics interface and Advanced Search for detailed contract discovery, now fully containerized with Docker support and unified export system. The system continues to evolve with regular updates and improvements.*
