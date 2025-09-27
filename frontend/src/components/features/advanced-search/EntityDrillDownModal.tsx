import React, { useState, useEffect, useMemo } from 'react'
import { getThemeColors } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import { advancedSearchService } from '../../../services/AdvancedSearchService'
import { ContractsTable } from '../shared/ContractsTable'
import { EntitiesTable } from '../shared/EntitiesTable'
import { ExportCSVModal } from '../shared/ExportCSVModal'
import { AccessibleButton } from '../shared/AccessibleButton'

export interface SearchResult {
  id: number
  reference_id: string
  notice_title: string
  award_title: string
  organization_name: string
  awardee_name: string
  business_category: string
  area_of_delivery: string
  contract_amount: number
  award_amount: number
  award_status: string
  contract_no: string
  created_at: string
}

interface EntityDrillDownModalProps {
  open: boolean
  onClose: () => void
  entityName: string
  entityType: 'contractor' | 'organization' | 'area' | 'category'
  currentFilters: {
    contractors: string[]
    areas: string[]
    organizations: string[]
    business_categories: string[]
    keywords: string[]
    time_ranges: any[]
    includeFloodControl?: boolean
  }
  isDark?: boolean
}

const EntityDrillDownModal: React.FC<EntityDrillDownModalProps> = ({
  open,
  onClose,
  entityName,
  entityType,
  currentFilters,
  isDark = false
}) => {
  const theme = getThemeColors(isDark)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'contract_amount' as keyof SearchResult,
    direction: 'desc' as 'asc' | 'desc'
  })

  // Drill-down tabs: contracts + related entities
  type DrillTab = 'contracts' | 'contractors' | 'organizations' | 'areas' | 'categories'
  const allTabs: DrillTab[] = ['contracts', 'contractors', 'organizations', 'areas', 'categories']
  const visibleTabs: DrillTab[] = useMemo(() => {
    // Hide the tab corresponding to the selected entityType except for contracts
    const hide: DrillTab | null = entityType === 'contractor' ? 'contractors'
      : entityType === 'organization' ? 'organizations'
      : entityType === 'area' ? 'areas'
      : 'categories'
    return allTabs.filter(t => t === 'contracts' || t !== hide)
  }, [entityType])
  const [activeTab, setActiveTab] = useState<DrillTab>('contracts')

  // Aggregates for related entities (scoped by the chosen entity)
  const [relatedAggregates, setRelatedAggregates] = useState<null | {
    by_contractor?: Array<{ label: string; total_value: number; count: number }>
    by_organization?: Array<{ label: string; total_value: number; count: number }>
    by_area?: Array<{ label: string; total_value: number; count: number }>
    by_category?: Array<{ label: string; total_value: number; count: number }>
  }>(null)
  const [aggLoading, setAggLoading] = useState(false)
  
  // Pagination for related entities
  const [entityPageSize, setEntityPageSize] = useState(50)
  const [entityPageIndex, setEntityPageIndex] = useState(0)
  const [entitySortBy, setEntitySortBy] = useState('total_contract_value')
  const [entitySortDirection, setEntitySortDirection] = useState<'asc' | 'desc'>('desc')
  const [entityTotalCounts, setEntityTotalCounts] = useState<{
    contractors: number
    organizations: number
    areas: number
    categories: number
  }>({
    contractors: 0,
    organizations: 0,
    areas: 0,
    categories: 0
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const handleSort = (key: keyof SearchResult) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const getSortIcon = (key: keyof SearchResult) => {
    if (sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const fetchContracts = async (page: number = 1) => {
    if (!open) return

    setLoading(true)
    try {
      // Create filters for the specific entity
      const entityFilters = {
        ...currentFilters,
        [entityType === 'contractor' ? 'contractors' : 
         entityType === 'organization' ? 'organizations' :
         entityType === 'area' ? 'areas' : 'business_categories']: [entityName]
      }

      const searchParams = {
        ...entityFilters,
        page,
        pageSize: pagination.pageSize,
        sortBy: sortConfig.key,
        sortDirection: sortConfig.direction,
        includeFloodControl: currentFilters.includeFloodControl || false
      }

      const response = await advancedSearchService.searchContractsWithChips(searchParams)
      
      if (response.success) {
        setResults(response.data || [])
        setPagination({
          page: response.pagination?.page || 1,
          pageSize: response.pagination?.page_size || 20,
          totalCount: response.pagination?.total_count || 0,
          totalPages: response.pagination?.total_pages || 0
        })
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedAggregates = async (pageIndex: number = 0, pageSize: number = 50, sortBy: string = 'total_contract_value', sortDirection: 'asc' | 'desc' = 'desc') => {
    if (!open) return
    setAggLoading(true)
    try {
      const entityFilters = {
        ...currentFilters,
        [entityType === 'contractor' ? 'contractors' : 
         entityType === 'organization' ? 'organizations' :
         entityType === 'area' ? 'areas' : 'business_categories']: [entityName]
      }
      
      // First, get total counts with a large topN to get accurate totals
      const totalCountParams = {
        contractors: entityFilters.contractors || [],
        areas: entityFilters.areas || [],
        organizations: entityFilters.organizations || [],
        businessCategories: entityFilters.business_categories || [],
        keywords: entityFilters.keywords || [],
        timeRanges: entityFilters.time_ranges || [],
        topN: 10000, // Large number to get all counts
        includeFloodControl: currentFilters.includeFloodControl || false
      }
      
      const totalRes = await advancedSearchService.chipAggregates(totalCountParams as any)
      if ((totalRes as any)?.success) {
        const totalData = (totalRes as any).data
        setEntityTotalCounts({
          contractors: (totalData?.by_contractor || []).length,
          organizations: (totalData?.by_organization || []).length,
          areas: (totalData?.by_area || []).length,
          categories: (totalData?.by_category || []).length
        })
      }
      
      // Then get paginated data
      const params = {
        contractors: entityFilters.contractors || [],
        areas: entityFilters.areas || [],
        organizations: entityFilters.organizations || [],
        businessCategories: entityFilters.business_categories || [],
        keywords: entityFilters.keywords || [],
        timeRanges: entityFilters.time_ranges || [],
        topN: pageSize,
        includeFloodControl: currentFilters.includeFloodControl || false
      }
      
      const res = await advancedSearchService.chipAggregates(params as any)
      if ((res as any)?.success) {
        const data = (res as any).data || null
        if (data) {
          // Apply client-side sorting
          const sortData = (entities: Array<{ label: string; total_value: number; count: number }>) => {
            return entities.sort((a, b) => {
              let aValue: any, bValue: any
              
              switch (sortBy) {
                case 'name':
                  aValue = a.label.toLowerCase()
                  bValue = b.label.toLowerCase()
                  break
                case 'total_contract_value':
                  aValue = a.total_value
                  bValue = b.total_value
                  break
                case 'contract_count':
                  aValue = a.count
                  bValue = b.count
                  break
                case 'average_contract_value':
                  aValue = a.total_value / Math.max(1, a.count)
                  bValue = b.total_value / Math.max(1, b.count)
                  break
                default:
                  aValue = a.total_value
                  bValue = b.total_value
              }
              
              if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
              } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
              }
            })
          }
          
          // Sort each entity type
          const sortedData = {
            ...data,
            by_contractor: data.by_contractor ? sortData(data.by_contractor) : [],
            by_organization: data.by_organization ? sortData(data.by_organization) : [],
            by_area: data.by_area ? sortData(data.by_area) : [],
            by_category: data.by_category ? sortData(data.by_category) : []
          }
          
          setRelatedAggregates(sortedData)
        } else {
          setRelatedAggregates(null)
        }
      } else {
        setRelatedAggregates(null)
      }
    } catch (e) {
      setRelatedAggregates(null)
    } finally {
      setAggLoading(false)
    }
  }

  // Nested drill-down: open another contracts modal combining parent + clicked entity
  const [nestedModal, setNestedModal] = useState<{ open: boolean, entityName: string, entityType: 'contractor' | 'organization' | 'area' | 'category' } | null>(null)
  
  // Export modal state
  const [exportModal, setExportModal] = useState<{ open: boolean; loading: boolean }>({
    open: false,
    loading: false
  })

  const activeTabEntityType: 'contractor' | 'organization' | 'area' | 'category' | null = useMemo(() => {
    if (activeTab === 'contractors') return 'contractor'
    if (activeTab === 'organizations') return 'organization'
    if (activeTab === 'areas') return 'area'
    if (activeTab === 'categories') return 'category'
    return null
  }, [activeTab])

  const handleNestedOpen = (clickedLabel: string) => {
    if (!activeTabEntityType) return
    setNestedModal({ open: true, entityName: clickedLabel, entityType: activeTabEntityType })
  }

  useEffect(() => {
    if (open) {
      fetchContracts(1)
      fetchRelatedAggregates(0, entityPageSize, entitySortBy, entitySortDirection)
      setActiveTab('contracts')
      setEntityPageIndex(0) // Reset pagination when opening modal
    }
  }, [open, entityName, entityType])

  useEffect(() => {
    if (open) {
      fetchContracts(1)
    }
  }, [sortConfig])

  // Refetch related aggregates when page size changes
  useEffect(() => {
    if (open && activeTab !== 'contracts') {
      fetchRelatedAggregates(entityPageIndex, entityPageSize, entitySortBy, entitySortDirection)
    }
  }, [entityPageSize])

  // Refetch related aggregates when sorting changes
  useEffect(() => {
    if (open && activeTab !== 'contracts') {
      fetchRelatedAggregates(0, entityPageSize, entitySortBy, entitySortDirection)
      setEntityPageIndex(0) // Reset to first page when sorting changes
    }
  }, [entitySortBy, entitySortDirection])

  const handlePageChange = (page: number) => {
    fetchContracts(page)
  }

  // Export CSV functionality
  const handleExport = async (startRank: number, endRank: number) => {
    setExportModal(prev => ({ ...prev, loading: true }))
    
    try {
      // Get the data to export based on active tab
      let dataToExport: any[] = []
      let headers: string[] = []
      
      if (activeTab === 'contracts') {
        // Export contracts data
        dataToExport = results.slice(startRank - 1, endRank)
        headers = [
          'Reference ID', 'Notice Title', 'Award Title', 'Organization', 
          'Awardee', 'Category', 'Area', 'Contract Amount', 'Award Amount', 
          'Status', 'Contract No', 'Award Date'
        ]
      } else {
        // Export entity data based on active tab
        const entityData = relatedAggregates?.[`by_${activeTab.slice(0, -1)}` as keyof typeof relatedAggregates] || []
        dataToExport = entityData.slice(startRank - 1, endRank)
        headers = ['Entity', 'Total Value', 'Contract Count', 'Average Value']
      }
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...dataToExport.map((item, index) => {
          if (activeTab === 'contracts') {
            return [
              `"${item.reference_id || ''}"`,
              `"${item.notice_title || ''}"`,
              `"${item.award_title || ''}"`,
              `"${item.organization_name || ''}"`,
              `"${item.awardee_name || ''}"`,
              `"${item.business_category || ''}"`,
              `"${item.area_of_delivery || ''}"`,
              item.contract_amount || 0,
              item.award_amount || 0,
              `"${item.award_status || ''}"`,
              `"${item.contract_no || ''}"`,
              `"${item.created_at || ''}"`
            ].join(',')
          } else {
            return [
              `"${item.label || ''}"`,
              item.total_value || 0,
              item.count || 0,
              ((item.total_value || 0) / Math.max(1, item.count || 0)).toFixed(2)
            ].join(',')
          }
        })
      ].join('\n')
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${entityName}_${activeTab}_export_ranks_${startRank}_to_${endRank}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setExportModal(prev => ({ ...prev, open: false, loading: false }))
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
      setExportModal(prev => ({ ...prev, loading: false }))
    }
  }

  if (!open) return null

  const modalStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  }

  const panelStyle = {
    backgroundColor: isDark ? '#0b1220' : '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '1200px',
    display: 'flex',
    flexDirection: 'column' as const
  }

  const headerStyle = {
    padding: spacing[4],
    borderBottom: `1px solid ${theme.border.light}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const titleStyle = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary
  }

  const closeBtnStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: theme.text.secondary,
    padding: spacing[1]
  }

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: spacing[4]
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: typography.fontSize.sm
  }

  const thStyle = {
    padding: spacing[3],
    textAlign: 'left' as const,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary,
    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
    borderBottom: `2px solid ${theme.border.primary}`,
    cursor: 'pointer',
    userSelect: 'none' as const
  }

  const tdStyle = {
    padding: spacing[3],
    borderBottom: `1px solid ${theme.border.light}`,
    color: theme.text.primary
  }

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
    color: theme.text.secondary
  }

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    padding: spacing[4],
    borderTop: `1px solid ${theme.border.light}`
  }

  const pageBtnStyle = {
    padding: `${spacing[2]} ${spacing[3]}`,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: spacing[1],
    background: 'none',
    color: theme.text.primary,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm
  }

  const activePageBtnStyle = {
    ...pageBtnStyle,
    backgroundColor: theme.primary[500],
    color: '#ffffff',
    borderColor: theme.primary[500]
  }

  const tabsBarStyle = {
    display: 'flex',
    gap: spacing[2],
    borderBottom: `1px solid ${theme.border.light}`,
    marginBottom: spacing[4]
  }
  const tabBtnStyle = (tab: DrillTab) => ({
    padding: `${spacing[2]} ${spacing[3]}`,
    border: 'none',
    borderBottom: `2px solid ${activeTab === tab ? theme.primary[500] : 'transparent'}`,
    background: 'none',
    color: activeTab === tab ? theme.primary[600] : theme.text.secondary,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm
  })

  const getTabCount = (tab: DrillTab): number => {
    if (tab === 'contracts') return pagination.totalCount || 0
    if (tab === 'contractors') return entityTotalCounts.contractors
    if (tab === 'organizations') return entityTotalCounts.organizations
    if (tab === 'areas') return entityTotalCounts.areas
    if (tab === 'categories') return entityTotalCounts.categories
    return 0
  }

  const renderEntityAggTable = (rows: Array<{ label: string; total_value: number; count: number }>, labelHeader: string, totalCount: number) => {
    const totalPages = Math.ceil(totalCount / entityPageSize)
    const currentPage = entityPageIndex + 1
    
    return (
      <div>
        {/* Pagination controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: spacing[3],
          padding: `${spacing[2]} ${spacing[3]}`,
          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
          borderRadius: spacing[1]
        }}>
          <div style={{ color: theme.text.secondary, fontSize: typography.fontSize.sm }}>
            Showing {entityPageIndex * entityPageSize + 1} to {Math.min((entityPageIndex + 1) * entityPageSize, totalCount)} of {totalCount.toLocaleString()} {labelHeader.toLowerCase()}s
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <label style={{ color: theme.text.secondary, fontSize: typography.fontSize.sm }}>
              Per page:
            </label>
            <select
              value={entityPageSize}
              onChange={(e) => {
                const newPageSize = parseInt(e.target.value)
                setEntityPageSize(newPageSize)
                setEntityPageIndex(0)
                fetchRelatedAggregates(0, newPageSize, entitySortBy, entitySortDirection)
              }}
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                border: `1px solid ${theme.border.medium}`,
                borderRadius: spacing[1],
                backgroundColor: isDark ? '#0b1220' : '#ffffff',
                color: theme.text.primary,
                fontSize: typography.fontSize.sm
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
        
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Label</th>
                <th style={{ ...thStyle, textAlign: 'right' as const }}>Total Amount</th>
                <th style={{ ...thStyle, textAlign: 'right' as const }}>Count</th>
                <th style={{ ...thStyle, textAlign: 'right' as const }}>Avg Amount</th>
              </tr>
            </thead>
            <tbody>
              {(rows || []).map((r, i) => (
                <tr key={`${r.label}-${i}`}>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleNestedOpen(r.label)}
                      style={{ background: 'none', border: 'none', color: theme.primary[500], cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      title={`View contracts for ${r.label}`}
                    >
                      {r.label}
                    </button>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const, fontFamily: 'monospace' }}>{
                    new Intl.NumberFormat('en-PH', { 
                      style: 'currency', 
                      currency: 'PHP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(r.total_value || 0)
                  }</td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const }}>{(r.count || 0).toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const, fontFamily: 'monospace' }}>{
                    new Intl.NumberFormat('en-PH', { 
                      style: 'currency', 
                      currency: 'PHP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format((r.total_value || 0) / Math.max(1, r.count || 0))
                  }</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Page navigation */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing[2],
            marginTop: spacing[3],
            padding: `${spacing[2]} ${spacing[3]}`,
            borderTop: `1px solid ${theme.border.light}`
          }}>
            <button
              onClick={() => {
                const newPageIndex = Math.max(0, entityPageIndex - 1)
                setEntityPageIndex(newPageIndex)
                fetchRelatedAggregates(newPageIndex, entityPageSize, entitySortBy, entitySortDirection)
              }}
              disabled={entityPageIndex <= 0}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: spacing[1],
                background: entityPageIndex <= 0 ? (isDark ? '#374151' : '#f3f4f6') : 'none',
                color: entityPageIndex <= 0 ? theme.text.secondary : theme.text.primary,
                cursor: entityPageIndex <= 0 ? 'not-allowed' : 'pointer',
                fontSize: typography.fontSize.sm
              }}
            >
              Previous
            </button>
            
            <span style={{ color: theme.text.secondary, fontSize: typography.fontSize.sm }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => {
                const newPageIndex = Math.min(totalPages - 1, entityPageIndex + 1)
                setEntityPageIndex(newPageIndex)
                fetchRelatedAggregates(newPageIndex, entityPageSize, entitySortBy, entitySortDirection)
              }}
              disabled={entityPageIndex >= totalPages - 1}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${theme.border.primary}`,
                borderRadius: spacing[1],
                background: entityPageIndex >= totalPages - 1 ? (isDark ? '#374151' : '#f3f4f6') : 'none',
                color: entityPageIndex >= totalPages - 1 ? theme.text.secondary : theme.text.primary,
                cursor: entityPageIndex >= totalPages - 1 ? 'not-allowed' : 'pointer',
                fontSize: typography.fontSize.sm
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  }

  

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={titleStyle}>
            Contracts for {entityName} ({entityType})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <AccessibleButton
              variant="secondary"
              onClick={() => setExportModal(prev => ({ ...prev, open: true }))}
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
            <button style={closeBtnStyle} onClick={onClose}>×</button>
          </div>
        </div>

        <div style={contentStyle}>
          <div style={tabsBarStyle}>
            {visibleTabs.map(tab => (
              <button key={tab} style={tabBtnStyle(tab)} onClick={() => setActiveTab(tab)}>
                {tab === 'contracts' ? 'Contracts' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({getTabCount(tab).toLocaleString()})
              </button>
            ))}
          </div>

          {(activeTab === 'contracts') && (
            <ContractsTable
              contracts={results}
              loading={loading}
              totalCount={pagination.totalCount}
              pageSize={pagination.pageSize}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              sortBy={sortConfig.key}
              sortDirection={sortConfig.direction}
              onPageChange={handlePageChange}
              onSortChange={(field, direction) => {
                setSortConfig({ key: field as keyof SearchResult, direction })
              }}
              isDark={isDark}
            />
          )}

          {(activeTab !== 'contracts') && (
            <EntitiesTable
              entities={(activeTab === 'contractors' ? relatedAggregates?.by_contractor || [] :
                       activeTab === 'organizations' ? relatedAggregates?.by_organization || [] :
                       activeTab === 'areas' ? relatedAggregates?.by_area || [] :
                       relatedAggregates?.by_category || []).map(entity => ({
                name: entity.label,
                total_contract_value: entity.total_value,
                contract_count: entity.count,
                average_contract_value: entity.total_value / Math.max(1, entity.count)
              }))}
              loading={aggLoading}
              totalCount={activeTab === 'contractors' ? entityTotalCounts.contractors :
                         activeTab === 'organizations' ? entityTotalCounts.organizations :
                         activeTab === 'areas' ? entityTotalCounts.areas :
                         entityTotalCounts.categories}
              pageSize={entityPageSize}
              currentPage={entityPageIndex + 1}
              totalPages={Math.ceil((activeTab === 'contractors' ? entityTotalCounts.contractors :
                                   activeTab === 'organizations' ? entityTotalCounts.organizations :
                                   activeTab === 'areas' ? entityTotalCounts.areas :
                                   entityTotalCounts.categories) / entityPageSize)}
              onPageChange={(page) => {
                const newPageIndex = page - 1
                setEntityPageIndex(newPageIndex)
                fetchRelatedAggregates(newPageIndex, entityPageSize, entitySortBy, entitySortDirection)
              }}
              onPageSizeChange={(newPageSize) => {
                setEntityPageSize(newPageSize)
                setEntityPageIndex(0)
                fetchRelatedAggregates(0, newPageSize, entitySortBy, entitySortDirection)
              }}
              onSortChange={(field, direction) => {
                setEntitySortBy(field)
                setEntitySortDirection(direction)
                setEntityPageIndex(0)
                fetchRelatedAggregates(0, entityPageSize, field, direction)
              }}
              sortBy={entitySortBy}
              sortDirection={entitySortDirection}
              onEntityClick={(entity) => handleNestedOpen(entity.name)}
              entityType={activeTab}
              isDark={isDark}
            />
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportCSVModal
        open={exportModal.open}
        onClose={() => setExportModal(prev => ({ ...prev, open: false }))}
        onExport={handleExport}
        totalCount={getTabCount(activeTab)}
        dataType={`${entityName} ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        isDark={isDark}
        loading={exportModal.loading}
      />

      {/* Nested modal renders another contracts table with combined filters */}
      {nestedModal?.open && (
        <NestedContractsModal
          isDark={isDark}
          parentFilters={currentFilters}
          parentEntity={{ entityName, entityType }}
          nested={nestedModal}
          onClose={() => setNestedModal(prev => prev ? { ...prev, open: false } : null)}
        />
      )}
    </div>
  )
}

export { EntityDrillDownModal }

// Renders a second-level drill contracts table combining parent + nested entity
const NestedContractsModal: React.FC<{
  isDark?: boolean,
  parentFilters: EntityDrillDownModalProps['currentFilters'],
  parentEntity: { entityName: string, entityType: 'contractor' | 'organization' | 'area' | 'category' },
  nested: { open: boolean, entityName: string, entityType: 'contractor' | 'organization' | 'area' | 'category' },
  onClose: () => void
}> = ({ isDark = false, parentFilters, parentEntity, nested, onClose }) => {
  const theme = getThemeColors(isDark)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })
  const [sortConfig, setSortConfig] = useState({ key: 'contract_amount' as keyof SearchResult, direction: 'desc' as 'asc' | 'desc' })

  const modalStyle = { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000 }
  const panelStyle = { backgroundColor: isDark ? '#0b1220' : '#ffffff', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '90vw', maxHeight: '90vh', width: '1200px', display: 'flex', flexDirection: 'column' as const }
  const headerStyle = { padding: spacing[4], borderBottom: `1px solid ${theme.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const titleStyle = { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }
  const closeBtnStyle = { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.text.secondary, padding: spacing[1] }
  const contentStyle = { flex: 1, overflow: 'auto', padding: spacing[4] }
  const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, fontSize: typography.fontSize.sm }
  const thStyle = { padding: spacing[3], textAlign: 'left' as const, fontWeight: typography.fontWeight.semibold, color: theme.text.primary, backgroundColor: theme.background.secondary, borderBottom: `2px solid ${theme.border.medium}`, cursor: 'pointer', userSelect: 'none' as const }
  const tdStyle = { padding: spacing[3], borderBottom: `1px solid ${theme.border.light}`, color: theme.text.primary }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0)
  const formatDate = (dateString: string) => { try { return new Date(dateString).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return String(dateString) } }

  const handlePageChange = (page: number) => {
    fetchContracts(page)
  }

  const fetchContracts = async (page: number = 1) => {
    setLoading(true)
    try {
      const combined = { ...parentFilters }
      const apply = (filters: any, type: 'contractor' | 'organization' | 'area' | 'category', name: string) => {
        const key = type === 'contractor' ? 'contractors' : type === 'organization' ? 'organizations' : type === 'area' ? 'areas' : 'business_categories'
        const prev = Array.isArray(filters[key]) ? filters[key] : []
        filters[key] = [...prev, name]
      }
      apply(combined, parentEntity.entityType, parentEntity.entityName)
      apply(combined, nested.entityType, nested.entityName)

      const params = { 
        ...combined, 
        page, 
        pageSize: pagination.pageSize, 
        sortBy: sortConfig.key, 
        sortDirection: sortConfig.direction,
        includeFloodControl: parentFilters.includeFloodControl || false
      }
      const response = await advancedSearchService.searchContractsWithChips(params as any)
      if ((response as any)?.success) {
        setResults((response as any).data || [])
        setPagination({
          page: (response as any).pagination?.page || 1,
          pageSize: (response as any).pagination?.page_size || 20,
          totalCount: (response as any).pagination?.total_count || 0,
          totalPages: (response as any).pagination?.total_pages || 0
        })
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { if (nested.open) fetchContracts(1) }, [nested.open, nested.entityName, nested.entityType])
  useEffect(() => { if (nested.open) fetchContracts(1) }, [sortConfig])

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={titleStyle}>
            Contracts for {nested.entityName} ({nested.entityType}) within {parentEntity.entityName} ({parentEntity.entityType})
          </div>
          <button style={closeBtnStyle} onClick={onClose}>×</button>
        </div>
        <div style={contentStyle}>
          <ContractsTable
            contracts={results}
            loading={loading}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  )
}
