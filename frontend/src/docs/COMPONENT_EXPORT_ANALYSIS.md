# Component-Specific Export Nuances Analysis

## 🏗️ **Current Export Implementations**

### **1. Advanced Search Export** 🔍
**Current Implementation**: `useAdvancedSearchExport` hook
**Data Type**: Individual contract records
**Export Method**: Streaming with progress tracking
**File Size**: Very large (1.7GB+ potential)

#### **Key Features**:
- ✅ **Streaming Download**: Uses fetch streaming with `response.body.getReader()`
- ✅ **Real-time Progress**: Tracks progress based on Content-Length header
- ✅ **Cancellation**: Uses AbortController for user cancellation
- ✅ **Size Estimation**: Pre-estimates export size via API call
- ✅ **Error Handling**: Comprehensive error handling with fallbacks
- ✅ **Memory Efficient**: Processes data in chunks, doesn't accumulate in memory

#### **Specific Requirements**:
```typescript
// Filter parameters structure
ChipSearchParams {
  contractors: string[]
  areas: string[]
  organizations: string[]
  businessCategories: string[]
  keywords: string[]
  timeRanges: TimeRange[]
  includeFloodControl: boolean
  valueRange: { min?: number; max?: number }
}
```

#### **API Endpoints**:
- `/api/v1/contracts/chip-export-estimate/` - Get size estimate
- `/api/v1/contracts/chip-export/` - Stream individual contracts

---

### **2. Data Explorer Export** 📊
**Current Implementation**: ❌ Blob-based (FIXED in unified system)
**Data Type**: Aggregated analytics data
**Export Method**: ✅ Now uses streaming (after our fix)
**File Size**: Medium (~1MB-100MB)

#### **Key Features** (After Fix):
- ✅ **Streaming Download**: Now uses unified streaming system
- ✅ **Real-time Progress**: Progress tracking implemented
- ✅ **Size Estimation**: Uses aggregated data estimation
- ✅ **Dimension-based**: Export filename includes dimension (contractors, areas, etc.)

#### **Specific Requirements**:
```typescript
// Filter parameters + dimension
{
  ...ChipSearchParams,
  dimension: 'by_contractor' | 'by_organization' | 'by_area' | 'by_category'
}
```

#### **API Endpoints**:
- `/api/v1/contracts/chip-export-aggregated-estimate/` - Get aggregated size estimate  
- `/api/v1/contracts/chip-export-aggregated/` - Stream aggregated data

---

### **3. Analytics Explorer Export** 📈
**Current Implementation**: Simple state management
**Data Type**: Pre-loaded analytics data (in-memory)
**Export Method**: Client-side CSV generation
**File Size**: Small (~10KB-1MB)

#### **Key Features**:
- ⚠️ **Client-side Only**: Processes data already loaded in component
- ⚠️ **Simulated Progress**: No real streaming progress
- ✅ **Small Data Sets**: Appropriate for pre-loaded analytics
- ⚠️ **Limited Scalability**: Can't handle large datasets

#### **Specific Requirements**:
```typescript
// Analytics data structure
AnalyticsData {
  label: string
  total_value: number
  count: number
  avg_value: number
}
```

#### **Export Logic**: 
- Data is already loaded in component state
- CSV generated in browser using JavaScript
- No API calls needed for export

---

### **4. Entity Drill Down Export** 🎯
**Current Implementation**: Simple state management  
**Data Type**: Entity-specific filtered data
**Export Method**: Client-side CSV generation
**File Size**: Small to medium (~10KB-10MB)

#### **Key Features**:
- ⚠️ **Client-side Only**: Processes filtered data from drill-down
- ⚠️ **Simulated Progress**: No real streaming progress
- ✅ **Dual Mode**: Can export contracts OR aggregated entity data
- ⚠️ **Memory Limited**: Limited by browser memory for large entity datasets

#### **Specific Requirements**:
```typescript
// Dual export structure based on activeTab
activeTab === 'contracts' ? {
  // Contract fields
  reference_id, notice_title, award_title, organization_name,
  awardee_name, business_category, area_of_delivery, 
  contract_amount, award_amount, award_status, contract_no, created_at
} : {
  // Aggregated fields  
  label, total_value, count, avg_value
}
```

---

## 🎨 **Component-Specific Customizations Needed**

### **1. ExportCSVModal Interface Variations**

Each component needs different modal configurations:

```typescript
// Advanced Search - Full streaming features
<ExportCSVModal
  showProgress={true}      // Real progress tracking
  showFileSize={true}      // Large file size display
  estimatedSize={bytes}    // From API estimate
  dataType="Search Results"
  loading={isStreaming}
  progress={realProgress}
/>

// Data Explorer - Streaming analytics  
<ExportCSVModal
  showProgress={true}      // Real progress tracking
  showFileSize={true}      // Show aggregated data size
  estimatedSize={bytes}    // From aggregated API estimate
  dataType="Analytics Data"
  loading={isStreaming}
  progress={realProgress}
/>

// Analytics Explorer - Client-side small data
<ExportCSVModal
  showProgress={false}     // No streaming progress needed
  showFileSize={false}     // Small files, size not critical
  dataType="Analytics Summary"
  loading={isProcessing}
  progress={undefined}     // Use simulated progress
/>

// Entity Drill Down - Mixed requirements
<ExportCSVModal
  showProgress={false}     // Client-side processing
  showFileSize={true}      // May be larger datasets
  dataType={`${entityName} ${activeTab}`}
  loading={isProcessing}
  progress={undefined}     // Use simulated progress
/>
```

### **2. Export Configuration Variations**

```typescript
// Advanced Search - Large streaming
createAdvancedSearchConfig(): ExportConfig {
  type: 'streaming',
  dataSource: 'contracts',
  apiEndpoint: '/api/v1/contracts/chip-export/',
  useStreamSaver: true,     // Essential for large files
  estimateBytesPerRow: 350  // Individual contracts are large
}

// Data Explorer - Medium streaming  
createDataExplorerConfig(dimension): ExportConfig {
  type: 'streaming',
  dataSource: 'aggregated', 
  apiEndpoint: '/api/v1/contracts/chip-export-aggregated/',
  useStreamSaver: true,     // Good for medium files
  estimateBytesPerRow: 60   // Aggregated data is compact
}

// Analytics Explorer - Small client-side
createAnalyticsConfig(): ExportConfig {
  type: 'client-side',
  dataSource: 'analytics',
  dataProcessor: (data) => generateCSV(data),
  estimateBytesPerRow: 80   // Pre-loaded analytics data
}

// Entity Drill Down - Variable size client-side
createEntityDrillDownConfig(entityName, activeTab): ExportConfig {
  type: 'client-side',
  dataSource: 'custom',
  dataProcessor: (data) => activeTab === 'contracts' 
    ? generateContractCSV(data) 
    : generateAggregatedCSV(data),
  estimateBytesPerRow: activeTab === 'contracts' ? 350 : 100
}
```

### **3. Progress Tracking Variations**

```typescript
// Streaming components (Advanced Search, Data Explorer)
const unifiedExport = useUnifiedExport()
// Real progress from Content-Length header and streaming chunks

// Client-side components (Analytics Explorer, Entity Drill Down)  
const unifiedExport = useUnifiedExport()
// Simulated progress during CSV generation
```

### **4. Error Handling Variations**

```typescript
// Network-dependent (Streaming exports)
try {
  await unifiedExport.downloadExport(config)
} catch (error) {
  // Handle network errors, streaming failures, cancellation
  if (error.name === 'AbortError') {
    // Handle user cancellation
  } else {
    // Handle network/server errors
  }
}

// Client-side only (In-memory exports)
try {
  await unifiedExport.downloadExport(config, localData)
} catch (error) {
  // Handle CSV generation errors, memory issues
}
```

---

## 🎯 **Unified System Requirements**

### **Must Support**:
1. **Streaming exports** for large datasets (Advanced Search, Data Explorer)
2. **Client-side exports** for small datasets (Analytics Explorer, Entity Drill Down)  
3. **Real progress tracking** for streaming exports
4. **Simulated progress** for client-side exports
5. **Component-specific configurations** via export configs
6. **Conditional UI elements** in ExportCSVModal
7. **Different data processors** for various CSV formats
8. **Flexible filename patterns** per component type

### **Key Insight**:
The unified system needs to be **flexible enough** to handle both streaming and client-side exports while providing a **consistent interface** that adapts to each component's specific requirements.

The current implementation ✅ **already supports this flexibility** through the ExportConfig system and conditional props in ExportCSVModal!