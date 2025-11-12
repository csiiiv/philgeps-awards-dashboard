import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing, commonStyles } from '../../../design-system'
import { advancedSearchService, type FilterOptions } from '../../../services/AdvancedSearchService'

// Import extracted hooks
import { useAdvancedSearchFilters } from '../../../hooks/advanced-search/useAdvancedSearchFilters'
import { useAdvancedSearchData } from '../../../hooks/advanced-search/useAdvancedSearchData'
import { useAdvancedSearchPagination } from '../../../hooks/advanced-search/useAdvancedSearchPagination'
import { useUnifiedExport } from '../../../hooks/useUnifiedExport'
import { createAdvancedSearchConfig } from '../../../hooks/useUnifiedExportConfigs'

// Import extracted components
import { AdvancedSearchFilters } from './components/AdvancedSearchFilters'
import { AdvancedSearchResults } from './components/AdvancedSearchResults'
import { AdvancedSearchActions } from './components/AdvancedSearchActions'
import { AnalyticsModal } from './AnalyticsModal'
import { ExportCSVModal } from '../shared/ExportCSVModal'

const AdvancedSearch: React.FC = () => {
  const { isDark } = useTheme()
  const vars = getThemeVars(isDark)

  // Use extracted hooks
  const filtersHook = useAdvancedSearchFilters()
  const dataHook = useAdvancedSearchData()
  const paginationHook = useAdvancedSearchPagination()
  const unifiedExport = useUnifiedExport()
  const [currentExportConfig, setCurrentExportConfig] = useState<any>(null)

  // Local state for filter options and analytics modal
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    contractors: [],
    areas: [],
    organizations: [],
    business_categories: []
  })
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoadingOptions(true)
      try {
        const options = await advancedSearchService.getFilterOptions()
        console.log('📋 AdvancedSearch - loaded filter options:', options)
        setFilterOptions(options)
      } catch (error) {
        console.error('Error loading filter options:', error)
        dataHook.setError('Failed to load filter options')
      } finally {
        setLoadingOptions(false)
      }
    }

    loadFilterOptions()
  }, []) // Remove dataHook dependency to prevent multiple loads

  // Build search parameters from current state
  const buildSearchParams = useCallback(() => {
      // Build time ranges array based on date range type
      const timeRanges = []
    if (filtersHook.dateRange.type !== 'all_time') {
      if (filtersHook.dateRange.type === 'yearly') {
          timeRanges.push({
            type: 'yearly' as const,
          year: filtersHook.dateRange.year
          })
      } else if (filtersHook.dateRange.type === 'quarterly') {
          timeRanges.push({
            type: 'quarterly' as const,
          year: filtersHook.dateRange.year,
          quarter: filtersHook.dateRange.quarter
          })
      } else if (filtersHook.dateRange.type === 'custom') {
          timeRanges.push({
            type: 'custom' as const,
          startDate: filtersHook.dateRange.startDate,
          endDate: filtersHook.dateRange.endDate
        })
      }
    }
    
    console.log('🔍 buildSearchParams - dateRange:', filtersHook.dateRange)
    console.log('🔍 buildSearchParams - timeRanges:', timeRanges)

    return {
      contractors: filtersHook.filters.contractors,
      areas: filtersHook.filters.areas,
      organizations: filtersHook.filters.organizations,
      businessCategories: filtersHook.filters.business_categories,
      keywords: filtersHook.filters.keywords,
      timeRanges: timeRanges,
      valueRange: filtersHook.valueRange,
      page: paginationHook.pagination.page,
      pageSize: paginationHook.pagination.pageSize,
      sortBy: paginationHook.sortConfig.key,
      sortDirection: paginationHook.sortConfig.direction,
      includeFloodControl: filtersHook.includeFloodControl
    }
  }, [filtersHook, paginationHook])

  // Handle search
  const handleSearch = useCallback(async () => {
    console.log('🔍 AdvancedSearch - handleSearch called')
    
    // Validate custom date range
    if (filtersHook.dateRange.type === 'custom') {
      if (!filtersHook.dateRange.startDate || !filtersHook.dateRange.endDate) {
        console.warn('❌ Custom date range validation failed: missing dates', {
          startDate: filtersHook.dateRange.startDate,
          endDate: filtersHook.dateRange.endDate
        })
        return
      }
      
      // Check if dates are valid
      const startDate = new Date(filtersHook.dateRange.startDate)
      const endDate = new Date(filtersHook.dateRange.endDate)
      
      if (startDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date') {
        console.warn('❌ Custom date range validation failed: invalid date format')
        return
      }
      
      if (filtersHook.dateRange.startDate > filtersHook.dateRange.endDate) {
        console.warn('❌ Custom date range validation failed: start date after end date')
        return
      }
    }
    
    paginationHook.setPagination(prev => ({ ...prev, page: 1 }))
    
    const searchParams = buildSearchParams()
    await dataHook.performSearch(searchParams, paginationHook.setPagination)
  }, [buildSearchParams, dataHook, paginationHook, filtersHook.dateRange])

  // Handle sorting
  const handleSort = useCallback((key: string) => {
    console.log('🔄 AdvancedSearch - handleSort called:', key)
    const newDirection = paginationHook.sortConfig.key === key && paginationHook.sortConfig.direction === 'asc' ? 'desc' : 'asc'
    paginationHook.handleSort(key)
    
    if (dataHook.hasSearched) {
      // Build search params with the new sort configuration
      const searchParams = {
        ...buildSearchParams(),
        sortBy: key,
        sortDirection: newDirection
      }
      dataHook.performSearch(searchParams, paginationHook.setPagination)
    }
  }, [paginationHook, dataHook, buildSearchParams])

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    console.log('📄 AdvancedSearch - handlePageChange called:', page)
    paginationHook.handlePageChange(page)
    
    // Build search params with the new page number
    const searchParams = {
      ...buildSearchParams(),
      page: page
    }
    dataHook.performSearch(searchParams, paginationHook.setPagination)
  }, [paginationHook, dataHook, buildSearchParams])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    console.log('📄 AdvancedSearch - handlePageSizeChange called:', pageSize)
    paginationHook.handlePageSizeChange(pageSize)
    
    // Build search params with the new page size and reset to page 1
    const searchParams = {
      ...buildSearchParams(),
      page: 1,
      pageSize: pageSize
    }
    dataHook.performSearch(searchParams, paginationHook.setPagination)
  }, [paginationHook, dataHook, buildSearchParams])

  // Handle export
  const handleExport = useCallback(async () => {
    console.log('📊 AdvancedSearch - handleExport called')
    const searchParams = buildSearchParams()
    
    // Create unified export config with search parameters
    const exportConfig = {
      ...createAdvancedSearchConfig(),
      filters: searchParams,
      filename: `advanced_search_results_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.csv`
    }
    
    // Store config for download handler
    setCurrentExportConfig(exportConfig)
    
    await unifiedExport.initiateExport(exportConfig)
  }, [unifiedExport, buildSearchParams])

  // Handle export download
  const handleExportDownload = useCallback(async (startRank: number, endRank: number) => {
    console.log('📥 AdvancedSearch - export download requested for ranks', startRank, 'to', endRank)
    if (currentExportConfig) {
      await unifiedExport.downloadExport(currentExportConfig)
    }
  }, [unifiedExport, currentExportConfig])

  // Handle analytics
  const handleShowAnalytics = useCallback(() => {
    console.log('📈 AdvancedSearch - handleShowAnalytics called')
    setAnalyticsOpen(true)
  }, [])

  // Handle analytics modal close
  const handleAnalyticsClose = useCallback(() => {
    console.log('📈 AdvancedSearch - handleAnalyticsClose called')
    setAnalyticsOpen(false)
  }, [])

  // Get current filters for analytics modal - memoized to prevent unnecessary re-renders
  const currentFilters = useMemo(() => {
    // Use the actual date range from filters, don't apply default time restrictions
    let timeRanges = []
    if (filtersHook.dateRange.type !== 'all_time') {
      timeRanges = [filtersHook.dateRange]
    }
    // For 'all_time', don't add any time range filter to get the full dataset

    return {
      contractors: filtersHook.filters.contractors,
      areas: filtersHook.filters.areas,
      organizations: filtersHook.filters.organizations,
      business_categories: filtersHook.filters.business_categories,
      keywords: filtersHook.filters.keywords,
      time_ranges: timeRanges,
      includeFloodControl: filtersHook.includeFloodControl
    }
  }, [
    filtersHook.filters.contractors,
    filtersHook.filters.areas,
    filtersHook.filters.organizations,
    filtersHook.filters.business_categories,
    filtersHook.filters.keywords,
    filtersHook.dateRange.type,
    filtersHook.dateRange.year,
    filtersHook.dateRange.quarter,
    filtersHook.dateRange.startDate,
    filtersHook.dateRange.endDate,
    filtersHook.includeFloodControl
  ])

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: spacing[4],
      backgroundColor: vars.background.primary,
      color: vars.text.primary,
      fontFamily: typography.fontFamily.sans
    }}>
      {/* Header */}
      <div style={{
        marginBottom: spacing[6],
        textAlign: 'center'
      }}>
        <h1 style={{
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
          margin: `0 0 ${spacing[2]} 0`,
          color: vars.text.primary
        }}>
          Advanced Search
        </h1>
        <p style={{
    fontSize: typography.fontSize.lg,
    color: vars.text.secondary,
          margin: 0
        }}>
          Search and analyze government contracts with advanced filtering options
        </p>
      </div>

      {/* Filters Section */}
      <AdvancedSearchFilters
        filters={filtersHook.filters}
        keywordInput={filtersHook.keywordInput}
        includeFloodControl={filtersHook.includeFloodControl}
        dateRange={filtersHook.dateRange}
        valueRange={filtersHook.valueRange}
        filterOptions={filterOptions}
        onAddFilter={filtersHook.addFilter}
        onRemoveFilter={filtersHook.removeFilter}
        onClearAllFilters={filtersHook.clearAllFilters}
        onClearContractors={filtersHook.clearContractors}
        onClearAreas={filtersHook.clearAreas}
        onClearOrganizations={filtersHook.clearOrganizations}
        onClearBusinessCategories={filtersHook.clearBusinessCategories}
        onKeywordInputChange={filtersHook.setKeywordInput}
        onKeywordKeyDown={filtersHook.handleKeywordKeyDown}
        onKeywordAdd={filtersHook.handleKeywordAdd}
        onDateRangeTypeChange={filtersHook.setDateRangeType}
        onDateRangeYearChange={filtersHook.setDateRangeYear}
        onDateRangeQuarterChange={filtersHook.setDateRangeQuarter}
        onDateRangeStartDateChange={filtersHook.setDateRangeStartDate}
        onDateRangeEndDateChange={filtersHook.setDateRangeEndDate}
        onIncludeFloodControlChange={filtersHook.setIncludeFloodControl}
        onValueRangeChange={filtersHook.setValueRange}
        onSaveCurrentFilter={filtersHook.saveCurrentFilter}
        loading={dataHook.loading}
        loadingOptions={loadingOptions}
      />

      {/* Actions Section */}
          <div style={{
            display: 'flex',
        justifyContent: 'center',
        marginBottom: spacing[6]
      }}>
        <AdvancedSearchActions
          loading={dataHook.loading}
          analyticsLoading={dataHook.analyticsLoading}
          hasResults={dataHook.hasResults}
          hasAggregates={dataHook.aggregates !== null}
          onSearch={handleSearch}
          onExport={handleExport}
          onShowAnalytics={handleShowAnalytics}
        />
      </div>

      {/* Results Section */}
      <AdvancedSearchResults
        results={dataHook.searchResults}
        totalCount={paginationHook.pagination.totalCount}
        loading={dataHook.loading}
        error={dataHook.error}
        hasSearched={dataHook.hasSearched}
        pagination={paginationHook.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortConfig={paginationHook.sortConfig}
            onSort={handleSort}
        analyticsLoading={dataHook.analyticsLoading}
          />

      {/* Analytics Modal */}
      {analyticsOpen && (
          <AnalyticsModal
            open={analyticsOpen}
          onClose={handleAnalyticsClose}
          currentFilters={currentFilters}
              isDark={isDark}
            />
      )}

      {/* Export Modal */}
      <ExportCSVModal
        open={unifiedExport.showExportModal}
        onClose={unifiedExport.closeExportModal}
        onExport={handleExportDownload}
        onCancel={unifiedExport.cancelExport}
        totalCount={unifiedExport.exportEstimate?.count || 0}
        dataType="Search Results"
        isDark={isDark}
        loading={unifiedExport.isExporting}
        progress={unifiedExport.exportProgress}
        estimatedSize={unifiedExport.exportEstimate?.bytes}
        showProgress={true}
        showFileSize={true}
      />
    </div>
  )
}

export { AdvancedSearch }
