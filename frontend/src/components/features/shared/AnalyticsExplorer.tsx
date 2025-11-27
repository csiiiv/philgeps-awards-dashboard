import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { usePerformanceMonitoring } from '../../../hooks/usePerformanceMonitoring'
import { useAccessibility } from '../../../hooks/useAccessibility'
import { AppError } from '../../../utils/errorHandling'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorDisplay } from './ErrorDisplay'
import { QuarterlyTrendsChart } from '../../charts/QuarterlyTrendsChart'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import {
  AppContainer,
  HeaderContainer,
  SummaryContainer,
  SummaryCard,
  SummaryValue,
  SummaryLabel,
} from '../../styled/Common.styled'

import { AnalyticsSummary } from '../analytics/AnalyticsSummary'
import { AnalyticsControls } from '../analytics/AnalyticsControls'
import { AnalyticsTable } from '../analytics/AnalyticsTable'
import { ThresholdClustering } from '../analytics/ThresholdClustering'
import { BenfordsLaw } from '../analytics/BenfordsLaw'
import { RoundingPatterns } from '../analytics/RoundingPatterns'
import { DeviantSubsets } from '../analytics/DeviantSubsets'
import { RelativeSizeFactor } from '../analytics/RelativeSizeFactor'
import { UnifiedPagination } from './UnifiedPagination'
import { useUnifiedAnalytics } from '../../../hooks/useUnifiedAnalytics'
import { EntityDrillDownModal } from '../advanced-search/EntityDrillDownModal'
import { Modal } from './Modal'
import { ExportCSVModal } from './ExportCSVModal'
import { AccessibleButton } from './AccessibleButton'
import { useUnifiedExport } from '../../../hooks/useUnifiedExport'
import { createAnalyticsExplorerConfig } from '../../../hooks/useUnifiedExportConfigs'
import { FilterChip } from '../advanced-search/FilterChip'
import { parseHashParams, updateUrlHash } from '../../../utils/urlState'

// Types (re-exported or imported from other files)
export type DatasetType = 'contractors' | 'organizations' | 'areas' | 'categories'
export type TimeRangeType = 'all_time' | 'yearly' | 'quarterly' | 'custom'
export type MetricType = 'amount' | 'count' | 'avg'

interface AnalyticsExplorerProps {
  mode: 'analytics' | 'explorer'
  open?: boolean
  onClose?: () => void
  currentFilters?: {
    contractors: string[]
    areas: string[]
    organizations: string[]
    business_categories: string[]
    keywords: string[]
    time_ranges: any[]
    value_range?: { min?: number; max?: number }
    includeFloodControl?: boolean
  }
  showSearchFilters?: boolean
  showChips?: boolean
  showSummary?: boolean
  showCharts?: boolean
  isDark?: boolean
  error?: AppError | null
}

export const AnalyticsExplorer: React.FC<AnalyticsExplorerProps> = ({
  mode = 'explorer',
  open = true,
  onClose,
  currentFilters,
  showSearchFilters = true,
  showChips = true,
  showSummary = true,
  showCharts = false,
  isDark = false,
  error: propError = null
}) => {
  const { isDark: themeIsDark } = useTheme()
  const { announce, isHighContrast } = useAccessibility()
  const darkMode = isDark !== undefined ? isDark : themeIsDark
  const vars = getThemeVars(darkMode)

  // Performance monitoring - MUST be before any early returns
  usePerformanceMonitoring(`UnifiedAnalyticsExplorer-${mode}`)

  // Use the unified analytics hook
  const {
    aggregates,
    processedData,
    summaryStats,
    loading: dataLoading,
    error: dataError,
    pagination,
    entityFilters,
    analyticsControls,
    reset
  } = useUnifiedAnalytics({ mode, currentFilters, open }) // Pass 'open' to the hook

  // Drilldown modal state (local to this component)
  const [drillDownModal, setDrillDownModal] = useState<{
    open: boolean
    entityName: string
    entityType: 'contractor' | 'organization' | 'area' | 'category'
  }>({
    open: false,
    entityName: '',
    entityType: 'contractor'
  })

  // Unified export
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

  // Handle export initialization
  const handleExportClick = useCallback(async () => {
    console.log('📊 AnalyticsExplorer - export clicked for dimension:', analyticsControls.dimension)
    
    // Create unified streaming export config for analytics
    const exportConfig = createAnalyticsExplorerConfig(analyticsControls.dimension)
    
    // Add current filters to the config if available
    const configWithFilters = {
      ...exportConfig,
      filters: mode === 'analytics' && currentFilters ? {
        contractors: currentFilters.contractors || [],
        areas: currentFilters.areas || [],
        organizations: currentFilters.organizations || [],
        business_categories: currentFilters.business_categories || [],
        keywords: currentFilters.keywords || [],
        time_ranges: currentFilters.time_ranges || [],
        dimension: analyticsControls.dimension,
        include_flood_control: false
      } : {
        dimension: analyticsControls.dimension,
        include_flood_control: false
      }
    }
    
    setCurrentExportConfig(configWithFilters)
    await unifiedExport.initiateExport(configWithFilters)
  }, [analyticsControls.dimension, currentFilters, mode, unifiedExport])
  
  // Handle export download
  const handleExportDownload = useCallback(async (startRank: number, endRank: number) => {
    console.log('📥 AnalyticsExplorer - export download requested for ranks', startRank, 'to', endRank)
    if (currentExportConfig) {
      await unifiedExport.downloadExport(currentExportConfig)
    }
  }, [unifiedExport, currentExportConfig])

  // Get current filters for drilldown (memoized)
  const getCurrentFilters = useMemo(() => {
    if (mode === 'analytics' && currentFilters) {
      return currentFilters
    }
    // For explorer mode, construct filters from entityFilters hook
    return {
      contractors: entityFilters.dataset === 'contractors' && entityFilters.selectedEntity ? [entityFilters.selectedEntity] : [],
      areas: entityFilters.dataset === 'areas' && entityFilters.selectedEntity ? [entityFilters.selectedEntity] : [],
      organizations: entityFilters.dataset === 'organizations' && entityFilters.selectedEntity ? [entityFilters.selectedEntity] : [],
      business_categories: entityFilters.dataset === 'categories' && entityFilters.selectedEntity ? [entityFilters.selectedEntity] : [],
      keywords: [], // Keywords are handled by selectedEntity for DataExplorer
      time_ranges: entityFilters.getTimeRangeParams(),
      includeFloodControl: entityFilters.includeFloodControl
    }
  }, [mode, currentFilters, entityFilters])

  // Announce errors
  useEffect(() => {
    if (dataError || propError) {
      announce(`Error: ${dataError?.message || propError?.message}`, 'assertive')
    }
  }, [dataError, propError, announce])

  // Don't render if not open (for modal mode)
  if (!open) return null

  const displayError = dataError || propError

  // State for tab selection
  const [activeTab, setActiveTab] = React.useState<'tables' | 'charts' | 'clustering' | 'misc'>('tables')

  // Read tab from URL hash on mount and when URL changes
  React.useEffect(() => {
    if (!open) return
    
    const loadTabFromUrl = () => {
      const params = parseHashParams()
    const tabParam = params.get('tab')
    
    if (tabParam && ['tables', 'charts', 'clustering', 'misc'].includes(tabParam)) {
      setActiveTab(tabParam as 'tables' | 'charts' | 'clustering' | 'misc')
        console.log('[AnalyticsExplorer] Tab changed from URL:', tabParam)
    }
    }
    
    // Load initially
    loadTabFromUrl()
    
    // Listen for URL changes
    window.addEventListener('hashchange', loadTabFromUrl)
    return () => window.removeEventListener('hashchange', loadTabFromUrl)
  }, [open])

  // Update URL hash when tab changes
  const handleTabChange = React.useCallback((tab: 'tables' | 'charts' | 'clustering' | 'misc') => {
    setActiveTab(tab)
    
    console.log('[AnalyticsExplorer] Updating tab in URL:', tab)
    
    // Update URL without adding to history (don't clutter back button)
    // Will automatically merge with existing URL parameters
    updateUrlHash({ tab }, false)
  }, [])

  // Note: Browser back/forward navigation is now handled by hashchange listener above
  // No need for separate popstate handler

  // Build applied filters as FilterChips
  const appliedFilters = React.useMemo(() => {
    const filters: Array<{ label: string; type: 'contractor' | 'area' | 'organization' | 'category' | 'keyword' | 'timerange' | 'date' }> = []
    
    if (currentFilters?.keywords && currentFilters.keywords.length > 0) {
      currentFilters.keywords.forEach(keyword => {
        filters.push({ label: keyword, type: 'keyword' })
      })
    }
    if (currentFilters?.contractors && currentFilters.contractors.length > 0) {
      currentFilters.contractors.forEach(contractor => {
        filters.push({ label: contractor, type: 'contractor' })
      })
    }
    if (currentFilters?.areas && currentFilters.areas.length > 0) {
      currentFilters.areas.forEach(area => {
        filters.push({ label: area, type: 'area' })
      })
    }
    if (currentFilters?.organizations && currentFilters.organizations.length > 0) {
      currentFilters.organizations.forEach(org => {
        filters.push({ label: org, type: 'organization' })
      })
    }
    if (currentFilters?.business_categories && currentFilters.business_categories.length > 0) {
      currentFilters.business_categories.forEach(cat => {
        filters.push({ label: cat, type: 'category' })
      })
    }
    if (currentFilters?.value_range) {
      const { min, max } = currentFilters.value_range
      if (min !== undefined || max !== undefined) {
        const formatCurrency = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
        let label = ''
        if (min !== undefined && max !== undefined) {
          label = `Value: ${formatCurrency(min)} - ${formatCurrency(max)}`
        } else if (min !== undefined) {
          label = `Value: ≥ ${formatCurrency(min)}`
        } else if (max !== undefined) {
          label = `Value: ≤ ${formatCurrency(max)}`
        }
        if (label) {
          filters.push({ label, type: 'date' })
        }
      }
    }
    if (currentFilters?.time_ranges && currentFilters.time_ranges.length > 0) {
      currentFilters.time_ranges.forEach(range => {
        let label = ''
        if (range.type === 'yearly' && range.year) {
          label = `Year: ${range.year}`
        } else if (range.type === 'quarterly' && range.year && range.quarter) {
          label = `Q${range.quarter} ${range.year}`
        } else if (range.type === 'custom' && range.startDate && range.endDate) {
          label = `${range.startDate} to ${range.endDate}`
        }
        if (label) {
          filters.push({ label, type: 'timerange' })
        }
      })
    }
    
    return filters
  }, [currentFilters])

  // Modal wrapper for analytics mode
  if (mode === 'analytics') {
    return (
      <ErrorBoundary>
        <Modal
          open={open}
          onClose={onClose || (() => {})}
          title={
            <div>
              <div style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing[1] }}>
                Analytics Overview
              </div>
              {appliedFilters.length > 0 && (
                <div style={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[2],
                  marginTop: spacing[2]
                }}>
                  {appliedFilters.map((filter, idx) => (
                    <FilterChip
                      key={idx}
                      label={filter.label}
                      value={filter.label}
                      type={filter.type}
                      onRemove={() => {}} // Read-only chips
                      isDark={darkMode}
                      readOnly={true}
                    />
                  ))}
                </div>
              )}
            </div>
          }
          isDark={darkMode}
          size="xlarge"
          zIndex={10000}
          headerActions={
            <AccessibleButton
              variant="secondary"
              onClick={handleExportClick}
              announceOnClick
              announceText="Open export dialog"
              style={{
                padding: `${spacing[1]} ${spacing[3]}`,
                fontSize: typography.fontSize.sm,
                whiteSpace: 'nowrap'
              }}
            >
              Export CSV
            </AccessibleButton>
          }
        >
          <AppContainer $isDark={darkMode} $isHighContrast={isHighContrast} style={{ boxShadow: 'none', margin: 0, padding: 0 }}>
            {dataLoading && <LoadingSpinner />}
            {displayError && <ErrorDisplay error={displayError} />}

            {/* Summary Statistics - Always Visible */}
            {showSummary && <AnalyticsSummary {...summaryStats} />}

            {/* Analytics Controls - Always Visible */}
            <AnalyticsControls
              dimension={analyticsControls.dimension}
              metric={analyticsControls.metric}
              yearFilter={analyticsControls.yearFilter}
              onDimensionChange={analyticsControls.setDimension}
              onMetricChange={analyticsControls.setMetric}
              onYearFilterChange={analyticsControls.setYearFilter}
              isDark={darkMode}
            />

            {/* Tabs - Consistent with main navigation style */}
            <div style={{ 
              borderBottom: `1px solid ${vars.border.light}`, 
              marginTop: spacing[6],
              marginBottom: spacing[4]
            }}>
              <div style={{ display: 'flex', gap: spacing[1] }}>
                <button
                  onClick={() => handleTabChange('tables')}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    border: 'none',
                    backgroundColor: activeTab === 'tables' ? vars.primary[600] : 'transparent',
                    color: activeTab === 'tables' ? vars.text.inverse : vars.text.primary,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    borderRadius: `${spacing[1]} ${spacing[1]} 0 0`,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2]
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'tables') {
                      e.currentTarget.style.backgroundColor = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'tables') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span>📊</span>
                  Tables
                </button>
                <button
                  onClick={() => handleTabChange('charts')}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    border: 'none',
                    backgroundColor: activeTab === 'charts' ? vars.primary[600] : 'transparent',
                    color: activeTab === 'charts' ? vars.text.inverse : vars.text.primary,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    borderRadius: `${spacing[1]} ${spacing[1]} 0 0`,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2]
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'charts') {
                      e.currentTarget.style.backgroundColor = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'charts') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span>📈</span>
                  Charts
                </button>
                <button
                  onClick={() => handleTabChange('clustering')}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    border: 'none',
                    backgroundColor: activeTab === 'clustering' ? vars.primary[600] : 'transparent',
                    color: activeTab === 'clustering' ? vars.text.inverse : vars.text.primary,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    borderRadius: `${spacing[1]} ${spacing[1]} 0 0`,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2]
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'clustering') {
                      e.currentTarget.style.backgroundColor = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'clustering') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span>📊</span>
                  Clustering
                </button>
                <button
                  onClick={() => handleTabChange('misc')}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    border: 'none',
                    backgroundColor: activeTab === 'misc' ? vars.primary[600] : 'transparent',
                    color: activeTab === 'misc' ? vars.text.inverse : vars.text.primary,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    borderRadius: `${spacing[1]} ${spacing[1]} 0 0`,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2]
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'misc') {
                      e.currentTarget.style.backgroundColor = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'misc') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span>🔬</span>
                  Misc
                </button>
              </div>
            </div>

            {/* Tables Tab Content */}
            {activeTab === 'tables' && (
              <div>
                {/* Analytics Table */}
                <AnalyticsTable
                  data={processedData}
                  metric={analyticsControls.metric}
                  onEntityClick={handleEntityClick}
                  isDark={darkMode}
                  loading={dataLoading}
                  currentPage={pagination.currentPage}
                  pageSize={pagination.pageSize}
                />

                {/* Pagination */}
                <UnifiedPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalCount={pagination.totalCount}
                  pageSize={pagination.pageSize}
                  showingText={pagination.info.showingText}
                  onPageChange={pagination.goToPage}
                  onPageSizeChange={pagination.setPageSize}
                  onFirstPage={pagination.goToFirstPage}
                  onPreviousPage={pagination.goToPreviousPage}
                  onNextPage={pagination.goToNextPage}
                  onLastPage={pagination.goToLastPage}
                  isDark={darkMode}
                  variant="analytics"
                />
              </div>
            )}

            {/* Charts Tab Content */}
            {activeTab === 'charts' && showCharts && aggregates && (
              <div>
                <div style={{ display: 'grid', gap: spacing[6] }}>
                  {/* Horizontal bar chart for Top entities */}
                  <div>
                    <div style={{ marginBottom: spacing[2], color: vars.text.secondary, fontSize: typography.fontSize.sm }}>
                      Top {Math.min(10, processedData.length)} {analyticsControls.dimension.replace('by_', '').replace('_', ' ')}
                    </div>
                    <div style={{ padding: spacing[4], backgroundColor: vars.background.primary, borderRadius: spacing[2], border: `1px solid ${vars.border.light}` }}>
                      <svg width="100%" height={Math.max(40, Math.min(10, processedData.length) * 26)} style={{ background: darkMode ? '#0b1220' : '#f9fafb' }}>
                        {processedData.slice(0, 10).map((item, i) => {
                          const val = analyticsControls.metric === 'amount' ? item.total_value : 
                                     analyticsControls.metric === 'count' ? item.count : 
                                     ((item.total_value || 0) / Math.max(1, item.count || 0))
                          const maxVal = Math.max(...processedData.slice(0, 10).map(s => 
                            analyticsControls.metric === 'amount' ? s.total_value : 
                            analyticsControls.metric === 'count' ? s.count : 
                            ((s.total_value || 0) / Math.max(1, s.count || 0))
                          ))
                          const pct = (val / (maxVal || 1))
                          const y = i * 26
                          const barColor = darkMode ? '#22c55e' : '#0ea5e9'
                          const leftPad = 12
                          const rightInsetPercent = 2
                          const widthPct = Math.max(0, (pct * 100) - rightInsetPercent)
                          const formatCurrency = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0)
                          const displayValue = analyticsControls.metric === 'amount' || analyticsControls.metric === 'avg' ? formatCurrency(val) : (val || 0).toLocaleString()
                          
                          return (
                            <g key={i} transform={`translate(0, ${y})`}>
                              <rect x={leftPad} y={6} width={`${widthPct}%`} height={16} fill={barColor} rx={4} />
                              <text x={leftPad + 4} y={18} fill={darkMode ? '#f3f4f6' : '#0b1220'} style={{ fontSize: 12 }}>{item.label}</text>
                              <text x={`${100 - rightInsetPercent}%`} y={18} textAnchor="end" dx={-12} fill={darkMode ? '#f3f4f6' : '#0b1220'} style={{ fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                                {displayValue}
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Quarterly Trends Chart */}
                  <div>
                    <div style={{ marginBottom: spacing[2], color: vars.text.secondary, fontSize: typography.fontSize.sm }}>
                      Year/Quarter Trend
                    </div>
                    <div style={{ padding: spacing[4], backgroundColor: vars.background.primary, borderRadius: spacing[2], border: `1px solid ${vars.border.light}` }}>
                      <QuarterlyTrendsChart 
                        quarterlyData={(() => {
                          // Group monthly data by year and quarter, then aggregate
                          const quarterlyMap = new Map<string, { year: number, quarter: number, total_value: number, contract_count: number }>()
                          
                          ;(aggregates.by_month || []).forEach(m => {
                            const [yStr, mm] = String(m.month || '').split('-')
                            const y = parseInt(yStr)
                            const mn = parseInt(mm)
                            
                            if (isNaN(y) || isNaN(mn)) return
                            
                            const q = mn <= 3 ? 1 : mn <= 6 ? 2 : mn <= 9 ? 3 : 4
                            const key = `${y}-${q}`
                            
                            if (quarterlyMap.has(key)) {
                              const existing = quarterlyMap.get(key)!
                              existing.total_value += m.total_value || 0
                              existing.contract_count += m.count || 0
                            } else {
                              quarterlyMap.set(key, {
                                year: y,
                                quarter: q,
                                total_value: m.total_value || 0,
                                contract_count: m.count || 0
                              })
                            }
                          })
                          
                          return Array.from(quarterlyMap.values()).sort((a, b) => {
                            if (a.year !== b.year) return a.year - b.year
                            return a.quarter - b.quarter
                          })
                        })()}
                        yearlyData={(aggregates.by_year || []).map(y => ({
                          year: y.year,
                          total_value: y.total_value || 0,
                          contract_count: y.count || 0
                        }))}
                        height={400}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clustering Tab Content */}
            {activeTab === 'clustering' && (
              <div>
                <ThresholdClustering
                  currentFilters={currentFilters}
                  isDark={darkMode}
                />
              </div>
            )}

            {/* Misc Tab Content */}
            {activeTab === 'misc' && (
              <div>
                {/* Section Header */}
                <div style={{ 
                  marginBottom: spacing[4],
                  padding: spacing[4],
                  backgroundColor: isDark ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)',
                  borderRadius: spacing[2],
                  borderLeft: `4px solid ${vars.primary[600]}`
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    marginBottom: spacing[2],
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: vars.text.primary
                  }}>
                    🔬 Advanced Analytics & Fraud Detection
                  </h3>
                  <p style={{ 
                    margin: 0,
                    fontSize: typography.fontSize.sm,
                    color: vars.text.secondary
                  }}>
                    Statistical analysis tools for detecting anomalies and patterns in procurement data
                  </p>
                </div>

                {/* 1. Benford's Law */}
                <BenfordsLaw currentFilters={currentFilters} isDark={darkMode} />

                {/* 2. Rounding Patterns */}
                <RoundingPatterns currentFilters={currentFilters} isDark={darkMode} />

                {/* 3. Deviant Subsets */}
                <DeviantSubsets currentFilters={currentFilters} isDark={darkMode} />

                {/* 4. Relative Size Factor */}
                <RelativeSizeFactor currentFilters={currentFilters} isDark={darkMode} />
              </div>
            )}

            {/* Export Modal */}
            <ExportCSVModal
              open={unifiedExport.showExportModal}
              onClose={unifiedExport.closeExportModal}
              onExport={handleExportDownload}
              onCancel={unifiedExport.cancelExport}
              totalCount={pagination.totalCount}
              dataType="Analytics"
              isDark={darkMode}
              loading={unifiedExport.isExporting}
              progress={unifiedExport.exportProgress}
              estimatedSize={unifiedExport.exportEstimate?.bytes}
              showProgress={true}
              showFileSize={true}
            />

            {/* Drilldown Modal */}
            <EntityDrillDownModal
              open={drillDownModal.open}
              onClose={() => setDrillDownModal(prev => ({ ...prev, open: false }))}
              entityName={drillDownModal.entityName}
              entityType={drillDownModal.entityType}
              currentFilters={getCurrentFilters}
              isDark={darkMode}
            />
          </AppContainer>
        </Modal>
      </ErrorBoundary>
    )
  }

  // Regular inline rendering for explorer mode
  return (
    <ErrorBoundary>
      <AppContainer $isDark={darkMode} $isHighContrast={isHighContrast}>
        {/* Header */}
        <HeaderContainer $isDark={darkMode} $isHighContrast={isHighContrast}>
          <h1 style={{ margin: 0, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>
            Data Explorer
          </h1>
        </HeaderContainer>

        {/* Explorer mode content - this would be the full DataExplorer implementation */}
        <div style={{ padding: spacing[6] }}>
          <p>Data Explorer content would go here...</p>
        </div>
      </AppContainer>
    </ErrorBoundary>
  )
}