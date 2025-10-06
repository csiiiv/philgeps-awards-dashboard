import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { usePerformanceMonitoring } from '../../../hooks/usePerformanceMonitoring'
import { useAccessibility } from '../../../hooks/useAccessibility'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ErrorDisplay } from '../shared/ErrorDisplay'
import { getThemeColors } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import {
  PageContainer,
  ContentContainer,
  Card,
  SectionTitle,
  BodyText,
  Grid,
  GridItem
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
      includeFloodControl: filtersHook.includeFloodControl
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
      try {
        const options = await advancedSearchService.getFilterOptions()
        console.log('📋 DataExplorer - loaded filter options:', options)
        setFilterOptions(options)
      } catch (error) {
        console.error('Error loading filter options:', error)
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

  // Export modal state
  const [exportModal, setExportModal] = useState({
    open: false,
    loading: false
  })

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

  // Handle export
  const handleExport = useCallback(() => {
    setExportModal({ open: true, loading: false })
  }, [])

  // Handle export close
  const handleExportClose = useCallback(() => {
    setExportModal({ open: false, loading: false })
  }, [])

  // Handle actual export
  const handleExportConfirm = useCallback(async (startRank: number, endRank: number) => {
    setExportModal(prev => ({ ...prev, loading: true }))
    
    try {
      // Use the same export logic as Advanced Search
      const { advancedSearchService } = await import('../../../services/AdvancedSearchService')
      
      const exportParams = {
        contractors: filtersHook.filters.contractors,
        areas: filtersHook.filters.areas,
        organizations: filtersHook.filters.organizations,
        businessCategories: filtersHook.filters.business_categories,
        keywords: filtersHook.filters.keywords,
        timeRanges: yearFilter !== 'all' ? [{ type: 'yearly', year: yearFilter }] : [],
        includeFloodControl: filtersHook.includeFloodControl,
        startRank,
        endRank
      }
      
      const response = await advancedSearchService.chipExport(exportParams)
      
      if (response.data) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `philgeps-data-explorer-${analyticsControls.dimension.replace('by_', '')}-${Date.now()}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        announce('Data exported successfully', 'polite')
      } else {
        throw new Error(response.error || 'Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      announce('Export failed', 'polite')
    } finally {
      setExportModal(prev => ({ ...prev, loading: false }))
      handleExportClose()
    }
  }, [filtersHook, announce, handleExportClose])

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
                business_categories: filtersHook.filters.business_categories,
                keywords: filtersHook.filters.keywords,
                time_ranges: yearFilter !== 'all' ? [{ type: 'yearly', year: yearFilter }] : [],
                includeFloodControl: filtersHook.includeFloodControl
              }}
            isDark={darkMode}
          />

          {/* Export Modal */}
          <ExportCSVModal
            open={exportModal.open}
            onClose={handleExportClose}
            onExport={handleExportConfirm}
            totalCount={pagination.totalCount}
            dataType={analyticsControls.dimension.replace('by_', '') as any}
            isDark={darkMode}
            loading={exportModal.loading}
          />
        </ContentContainer>
      </PageContainer>
    </ErrorBoundary>
  )
}
