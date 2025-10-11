import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { usePerformanceMonitoring } from '../../../hooks/usePerformanceMonitoring'
import { useAccessibility } from '../../../hooks/useAccessibility'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ErrorDisplay } from '../shared/ErrorDisplay'
import { getThemeColors } from '../../../design-system/theme'
import { spacing } from '../../../design-system'
import {
  PageContainer,
  ContentContainer,
  Card,
  SectionTitle,
  BodyText
} from '../../styled/Common.styled'

import { 
  DataExplorerSummary,
  DataExplorerFilters,
  DataExplorerTable
} from './components'
import { useUnifiedAnalytics } from '../../../hooks/useUnifiedAnalytics'
import { advancedSearchService, type FilterOptions } from '../../../services/AdvancedSearchService'
import { useAdvancedSearchFilters } from '../../../hooks/advanced-search/useAdvancedSearchFilters'
import { EntityDrillDownModal } from '../advanced-search/EntityDrillDownModal'
import { ExportCSVModal } from '../shared/ExportCSVModal'
import { AccessibleButton } from '../shared/AccessibleButton'
import { useUnifiedExport } from '../../../hooks/useUnifiedExport'
import { createDataExplorerConfig } from '../../../hooks/useUnifiedExportConfigs'

// Types
export type DatasetType = 'contractors' | 'organizations' | 'areas' | 'categories'
export type TimeRangeType = 'all_time' | 'yearly' | 'quarterly' | 'custom'
export type MetricType = 'amount' | 'count' | 'avg'

interface DataExplorerProps {
  isDark?: boolean
  error?: Error | null
}

export const DataExplorer: React.FC<DataExplorerProps> = ({
  isDark = false,
  error: propError = null
}) => {
  const { isDark: themeIsDark } = useTheme()
  const { announce, isHighContrast } = useAccessibility()
  const darkMode = isDark !== undefined ? isDark : themeIsDark
  const theme = getThemeColors(darkMode)

  // Performance monitoring
  usePerformanceMonitoring('DataExplorer')

  // Use the advanced search filters hook (same as Advanced Search)
  const filtersHook = useAdvancedSearchFilters()

  // State for filter options (same as Advanced Search)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    contractors: [],
    areas: [],
    organizations: [],
    business_categories: []
  })
  const [loadingOptions, setLoadingOptions] = useState(false)

  // State for search execution and year filter
  const [hasSearched, setHasSearched] = useState(false)
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [tableLoading, setTableLoading] = useState(false)

  // Use the unified analytics hook in analytics mode (like Advanced Search)
  const {
    aggregates,
    processedData,
    summaryStats,
    loading: dataLoading,
    error: dataError,
    pagination,
    analyticsControls,
    reset
  } = useUnifiedAnalytics({ 
    mode: 'analytics',
    currentFilters: hasSearched ? {
      contractors: filtersHook.filters.contractors,
      areas: filtersHook.filters.areas,
      organizations: filtersHook.filters.organizations,
      business_categories: filtersHook.filters.business_categories,
      keywords: filtersHook.filters.keywords,
      time_ranges: yearFilter !== 'all' ? [{ type: 'yearly', year: yearFilter }] : [],
      includeFloodControl: filtersHook.includeFloodControl,
      valueRange: { min: 0, max: 1000000000000 } // Default to min 0 and max 1T for Data Explorer
    } : undefined
  })

  // Refs for stable handlers - initialize after analyticsControls is available
  const analyticsControlsRef = useRef(analyticsControls)
  analyticsControlsRef.current = analyticsControls

  // Stable handlers that don't cause re-renders
  const handleDimensionChange = useCallback((dimension: string) => {
    setTableLoading(true)
    analyticsControlsRef.current.setDimension(dimension)
  }, []) // No dependencies - stable handler

  const handleMetricChange = useCallback((metric: string) => {
    setTableLoading(true)
    analyticsControlsRef.current.setMetric(metric)
  }, []) // No dependencies - stable handler

  const handleYearFilterChange = useCallback((year: string) => {
    setTableLoading(true)
    setYearFilter(year)
  }, []) // No dependencies - stable handler


  // Handle search button click
  const handleSearch = useCallback(() => {
    console.log('🔍 DataExplorer - handleSearch called')
    setHasSearched(true)
  }, [])

  // Clear search
  const handleClearSearch = useCallback(() => {
    console.log('🧹 DataExplorer - handleClearSearch called')
    filtersHook.clearAllFilters()
    setYearFilter('all')
    setHasSearched(false)
  }, [filtersHook])

  // Load filter options on mount (same as Advanced Search)
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoadingOptions(true)
      try {
        const options = await advancedSearchService.getFilterOptions()
        console.log('📋 DataExplorer - loaded filter options:', options)
        setFilterOptions(options)
      } catch (error) {
        console.error('Error loading filter options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadFilterOptions()
  }, [])

  // Clear table loading when data loads
  useEffect(() => {
    if (!dataLoading && tableLoading) {
      setTableLoading(false)
    }
  }, [dataLoading, tableLoading])


  // Drilldown modal state
  const [drillDownModal, setDrillDownModal] = useState<{
    open: boolean
    entityName: string
    entityType: 'contractor' | 'organization' | 'area' | 'category'
  }>({
    open: false,
    entityName: '',
    entityType: 'contractor'
  })

  // Unified export system
  const unifiedExport = useUnifiedExport()
  const [currentExportConfig, setCurrentExportConfig] = useState<any>(null)

  // Handle entity click for drilldown
  const handleEntityClick = useCallback((entityName: string) => {
    const entityTypeMap = {
      'by_contractor': 'contractor' as const,
      'by_organization': 'organization' as const,
      'by_area': 'area' as const,
      'by_category': 'category' as const,
    }
    
    setDrillDownModal({
      open: true,
      entityName,
      entityType: entityTypeMap[analyticsControls.dimension] || 'contractor'
    })
    announce(`Selected entity ${entityName} for drilldown`, 'polite')
  }, [announce, analyticsControls.dimension])

  // Handle export with unified streaming system
  const handleExport = useCallback(async () => {
    console.log('🔘 Export button clicked!')
    console.log('📊 Analytics controls:', analyticsControls)
    console.log('🔍 Filters:', filtersHook.filters)
    
    try {
      console.log('📝 Creating export config...')
      // Create streaming config for aggregated data
      const config = createDataExplorerConfig(analyticsControls.dimension)
      console.log('✅ Config created:', config)
      
      // Prepare export parameters
      const exportParams = {
        contractors: filtersHook.filters.contractors,
        areas: filtersHook.filters.areas,
        organizations: filtersHook.filters.organizations,
        businessCategories: filtersHook.filters.business_categories,
        keywords: filtersHook.filters.keywords,
        timeRanges: yearFilter !== 'all' ? [{ type: 'yearly', year: yearFilter }] : [],
        dimension: analyticsControls.dimension,
        includeFloodControl: filtersHook.includeFloodControl,
        valueRange: { min: 0, max: 1000000000000 }
      }
      console.log('📋 Export params:', exportParams)

      console.log('🚀 Initiating export...')
      // Update config with export parameters
      const configWithParams = {
        ...config,
        filters: exportParams
      }
      console.log('📋 Config with params:', configWithParams)
      
      // Store config for download use
      setCurrentExportConfig(configWithParams)
      
      // Initiate export with streaming
      await unifiedExport.initiateExport(configWithParams)
      console.log('✅ Export initiated successfully')
      announce('Export initiated', 'polite')
    } catch (error) {
      console.error('❌ Export initiation failed:', error)
      console.error('Error details:', error)
      announce('Export failed', 'polite')
    }
  }, [filtersHook, analyticsControls.dimension, yearFilter, unifiedExport, announce])

  // Dataset options
  const datasetOptions = [
    { value: 'contractors', label: 'Contractors' },
    { value: 'areas', label: 'Areas' },
    { value: 'organizations', label: 'Organizations' },
    { value: 'categories', label: 'Categories' },
  ]

  // Year options (2013-2027)
  const yearOptions = Array.from({ length: 15 }, (_, i) => 2013 + i).reverse()

  // Quarter options
  const quarterOptions = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' },
  ]

  // Time range options
  const timeRangeOptions = [
    { value: 'all_time', label: 'All Time' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'custom', label: 'Custom Range' },
  ]


  // Error state
  const error = propError || dataError

  return (
    <ErrorBoundary>
      <PageContainer $isDark={darkMode}>
        <ContentContainer $isDark={darkMode}>
          {/* Header */}
          <Card $isDark={darkMode} style={{ marginBottom: spacing[6] }}>
            <SectionTitle $isDark={darkMode} style={{ marginBottom: spacing[4] }}>
              📊 Data Explorer
            </SectionTitle>
            <BodyText $isDark={darkMode} style={{ marginBottom: spacing[4] }}>
              Explore government procurement data by entity type. Use the analysis controls below to select 
              dimensions, metrics, and time ranges. Optionally search for specific entities to focus your analysis.
            </BodyText>

          </Card>

          {/* Error State */}
          {error && (
            <Card $isDark={darkMode}>
              <ErrorDisplay
                error={error}
                onRetry={() => window.location.reload()}
                retryText="Retry loading data"
              />
            </Card>
          )}


          {/* Summary Stats - Always visible */}
          <DataExplorerSummary
            summaryStats={summaryStats}
            isDark={darkMode}
          />
          
          {/* Combined Filters - Always visible */}
          <DataExplorerFilters
            // Analytics Controls
            dimension={analyticsControls.dimension}
            metric={analyticsControls.metric}
            yearFilter={yearFilter}
            onDimensionChange={handleDimensionChange}
            onMetricChange={handleMetricChange}
            onYearFilterChange={handleYearFilterChange}
            
            // Entity Filters
            filterOptions={filterOptions}
            filters={filtersHook.filters}
            includeFloodControl={filtersHook.includeFloodControl}
            hasSearched={hasSearched}
            onAddFilter={filtersHook.addFilter}
            onRemoveFilter={filtersHook.removeFilter}
            onIncludeFloodControlChange={filtersHook.setIncludeFloodControl}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            
            // Loading state
            loadingOptions={loadingOptions}
            
            isDark={darkMode}
          />

          {/* Loading State */}
          {/* Loading Spinner - Only show for initial load, not table updates */}
          {dataLoading && !hasSearched && (
            <Card $isDark={darkMode} style={{ textAlign: 'center', padding: spacing[8] }}>
              <LoadingSpinner size="large" />
              <BodyText $isDark={darkMode} style={{ marginTop: spacing[4] }}>
                Loading data...
              </BodyText>
            </Card>
          )}
          
          {/* Analytics Table - Always show, with loading state */}
          {!dataLoading && !error && aggregates ? (
            <DataExplorerTable
              dimension={analyticsControls.dimension}
              metric={analyticsControls.metric}
              processedData={processedData}
              tableLoading={tableLoading}
              pagination={pagination}
              onEntityClick={handleEntityClick}
              onExport={handleExport}
              isDark={darkMode}
            />
          ) : !dataLoading && !error && !aggregates ? (
            <Card $isDark={darkMode} style={{ textAlign: 'center', padding: spacing[8] }}>
              <div style={{ fontSize: '3em', marginBottom: spacing[4] }}>📊</div>
              <SectionTitle $isDark={darkMode} style={{ marginBottom: spacing[2] }}>
                No Data Found
              </SectionTitle>
              <BodyText $isDark={darkMode}>
                Your current filter selection returned no results. Please try adjusting your filters.
              </BodyText>
            </Card>
          ) : null}

          {/* Drilldown Modal */}
          <EntityDrillDownModal
            open={drillDownModal.open}
            onClose={() => setDrillDownModal(prev => ({ ...prev, open: false }))}
            entityName={drillDownModal.entityName}
            entityType={drillDownModal.entityType}
              currentFilters={{
                contractors: filtersHook.filters.contractors,
                areas: filtersHook.filters.areas,
                organizations: filtersHook.filters.organizations,
                businessCategories: filtersHook.filters.business_categories,
                keywords: filtersHook.filters.keywords,
                time_ranges: yearFilter !== 'all' ? [{ type: 'yearly', year: yearFilter }] : [],
                includeFloodControl: filtersHook.includeFloodControl
              }}
            isDark={darkMode}
          />

          {/* Unified Export Modal with Streaming */}
          <ExportCSVModal
            open={unifiedExport.showExportModal}
            onClose={unifiedExport.closeExportModal}
            onExport={async (startRank: number, endRank: number) => {
              console.log(`📊 Export requested for ranks ${startRank}-${endRank}`)
              console.log('🔧 Using stored config:', currentExportConfig)
              console.log('📊 Current dimension:', analyticsControls.dimension)
              console.log('🔍 Current filters:', filtersHook.filters)
              if (currentExportConfig) {
                await unifiedExport.downloadExport(currentExportConfig)
              } else {
                console.error('❌ No export config available')
              }
            }}
            onCancel={unifiedExport.cancelExport}
            totalCount={unifiedExport.exportEstimate?.count || pagination.totalCount}
            dataType={`${analyticsControls.dimension.replace('by_', '')} Analytics`}
            isDark={darkMode}
            loading={unifiedExport.isExporting}
            progress={unifiedExport.exportProgress}
            estimatedSize={unifiedExport.exportEstimate?.bytes}
            showProgress={true}
            showFileSize={true}
          />
        </ContentContainer>
      </PageContainer>
    </ErrorBoundary>
  )
}
