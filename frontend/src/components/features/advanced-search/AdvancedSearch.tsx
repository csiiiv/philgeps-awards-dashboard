import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing, commonStyles } from '../../../design-system'
import { advancedSearchService, type FilterOptions } from '../../../services/AdvancedSearchService'
import { getFiltersFromUrl, updateUrlHash, hasUrlFilters } from '../../../utils/urlState'

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
  const hasLoadedFromUrl = useRef(false)
  const shouldTriggerSearch = useRef(false)

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

  // Load filters from URL on mount
  useEffect(() => {
    if (hasLoadedFromUrl.current) return
    
    // Check if we have URL filters
    if (hasUrlFilters()) {
      const urlFilters = getFiltersFromUrl()
      console.log('🔗 Loading filters from URL:', urlFilters)

      // Apply filters from URL using individual add methods
      if (urlFilters.keywords?.length) {
        urlFilters.keywords.forEach(k => {
          console.log('🔗 Adding keyword from URL:', k)
          filtersHook.addKeyword(k)
        })
      }
      if (urlFilters.contractors?.length) {
        urlFilters.contractors.forEach(c => {
          console.log('🔗 Adding contractor from URL:', c)
          filtersHook.addFilter('contractors', c)
        })
      }
      if (urlFilters.areas?.length) {
        urlFilters.areas.forEach(a => {
          console.log('🔗 Adding area from URL:', a)
          filtersHook.addFilter('areas', a)
        })
      }
      if (urlFilters.organizations?.length) {
        urlFilters.organizations.forEach(o => {
          console.log('🔗 Adding organization from URL:', o)
          filtersHook.addFilter('organizations', o)
        })
      }
      if (urlFilters.business_categories?.length) {
        urlFilters.business_categories.forEach(b => {
          console.log('🔗 Adding business category from URL:', b)
          filtersHook.addFilter('business_categories', b)
        })
      }

      // Apply date range
      if (urlFilters.dateRangeType && urlFilters.dateRangeType !== 'all_time') {
        console.log('🔗 Setting date range from URL:', urlFilters.dateRangeType)
        if (urlFilters.dateRangeType === 'yearly' && urlFilters.year) {
          filtersHook.setDateRange({
            type: 'yearly',
            year: urlFilters.year,
            quarter: 1,
            startDate: '',
            endDate: ''
          })
        } else if (urlFilters.dateRangeType === 'quarterly' && urlFilters.year && urlFilters.quarter) {
          filtersHook.setDateRange({
            type: 'quarterly',
            year: urlFilters.year,
            quarter: urlFilters.quarter,
            startDate: '',
            endDate: ''
          })
        } else if (urlFilters.dateRangeType === 'custom' && urlFilters.startDate && urlFilters.endDate) {
          filtersHook.setDateRange({
            type: 'custom',
            year: new Date().getFullYear(),
            quarter: 1,
            startDate: urlFilters.startDate,
            endDate: urlFilters.endDate
          })
        }
      }

      // Apply value range
      if (urlFilters.minValue !== undefined || urlFilters.maxValue !== undefined) {
        console.log('🔗 Setting value range from URL:', { min: urlFilters.minValue, max: urlFilters.maxValue })
        filtersHook.setValueRange({
          min: urlFilters.minValue,
          max: urlFilters.maxValue
        })
      }

      // Apply flood control
      if (urlFilters.includeFloodControl !== undefined) {
        console.log('🔗 Setting flood control from URL:', urlFilters.includeFloodControl)
        filtersHook.setIncludeFloodControl(urlFilters.includeFloodControl)
      }

      // Trigger search after filters are loaded
      shouldTriggerSearch.current = true
      
      // Auto-open analytics if view=analytics
      if (urlFilters.view === 'analytics') {
        console.log('🔗 Will auto-open analytics after search')
        setTimeout(() => setAnalyticsOpen(true), 2000)
      }
    } else {
      console.log('🔗 No URL filters found, starting fresh')
    }
    
    // Mark as loaded regardless
    hasLoadedFromUrl.current = true
  }, [])

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
      value_range: filtersHook.valueRange,  // Backend expects snake_case
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
    
    // Update URL with current filters after search
    const urlState = {
      keywords: filtersHook.filters.keywords,
      contractors: filtersHook.filters.contractors,
      areas: filtersHook.filters.areas,
      organizations: filtersHook.filters.organizations,
      business_categories: filtersHook.filters.business_categories,
      dateRangeType: filtersHook.dateRange.type,
      year: filtersHook.dateRange.year,
      quarter: filtersHook.dateRange.quarter,
      startDate: filtersHook.dateRange.startDate,
      endDate: filtersHook.dateRange.endDate,
      minValue: filtersHook.valueRange?.min,
      maxValue: filtersHook.valueRange?.max,
      includeFloodControl: filtersHook.includeFloodControl,
      view: analyticsOpen ? 'analytics' as const : 'search' as const
    }
    
    console.log('🔗 Updating URL after search:', urlState)
    updateUrlHash(urlState)
  }, [buildSearchParams, dataHook, paginationHook, filtersHook, analyticsOpen])

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
    
    // Update URL to include view=analytics
    const urlState = {
      keywords: filtersHook.filters.keywords,
      contractors: filtersHook.filters.contractors,
      areas: filtersHook.filters.areas,
      organizations: filtersHook.filters.organizations,
      business_categories: filtersHook.filters.business_categories,
      dateRangeType: filtersHook.dateRange.type,
      year: filtersHook.dateRange.year,
      quarter: filtersHook.dateRange.quarter,
      startDate: filtersHook.dateRange.startDate,
      endDate: filtersHook.dateRange.endDate,
      minValue: filtersHook.valueRange?.min,
      maxValue: filtersHook.valueRange?.max,
      includeFloodControl: filtersHook.includeFloodControl,
      view: 'analytics' as const
    }
    updateUrlHash(urlState)
  }, [filtersHook])

  // Handle analytics modal close
  const handleAnalyticsClose = useCallback(() => {
    console.log('📈 AdvancedSearch - handleAnalyticsClose called')
    setAnalyticsOpen(false)
    
    // Update URL to remove view=analytics
    const urlState = {
      keywords: filtersHook.filters.keywords,
      contractors: filtersHook.filters.contractors,
      areas: filtersHook.filters.areas,
      organizations: filtersHook.filters.organizations,
      business_categories: filtersHook.filters.business_categories,
      dateRangeType: filtersHook.dateRange.type,
      year: filtersHook.dateRange.year,
      quarter: filtersHook.dateRange.quarter,
      startDate: filtersHook.dateRange.startDate,
      endDate: filtersHook.dateRange.endDate,
      minValue: filtersHook.valueRange?.min,
      maxValue: filtersHook.valueRange?.max,
      includeFloodControl: filtersHook.includeFloodControl,
      view: 'search' as const
    }
    updateUrlHash(urlState)
  }, [filtersHook])

  // Handle share
  const handleShare = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      console.log('🔗 URL copied to clipboard:', url)
    }).catch((err) => {
      console.error('Failed to copy URL:', err)
      // Fallback: show URL in alert
      alert(`Share this URL:\n${url}`)
    })
  }, [])

  // Auto-trigger search after loading from URL (placed after all callbacks are defined)
  useEffect(() => {
    if (shouldTriggerSearch.current) {
      shouldTriggerSearch.current = false
      console.log('🔗 Auto-triggering search after URL load')
      handleSearch()
    }
  }, [handleSearch])

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
      value_range: filtersHook.valueRange,
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
    filtersHook.valueRange,
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
          onShare={handleShare}
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
