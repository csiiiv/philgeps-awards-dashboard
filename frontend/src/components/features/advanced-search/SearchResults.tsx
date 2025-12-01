import React from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing } from '../../../design-system'
import { useColumnVisibility, DEFAULT_COLUMNS } from '../../../hooks/useColumnVisibility'
import { ColumnVisibilityDropdown } from './components/ColumnVisibilityDropdown'

export interface SearchResult {
  // Backwards-compatible: frontend historically used 'contract_number'
  // Backend returns 'contract_no' and 'reference_id'. Prefer those but keep compatibility
  contract_number?: string
  contract_no?: string
  reference_id?: string
  award_title: string
  notice_title: string
  award_date: string
  awardee_name: string
  area_of_delivery: string
  organization_name: string
  business_category: string
  contract_amount: number
  award_amount: number
  award_status: string
  created_at: string
  id: number
}

export interface SearchResultsProps {
  results: SearchResult[]
  totalCount: number
  loading: boolean
  error: string | null
  onSort: (key: string) => void
  sortConfig: { key: string; direction: 'asc' | 'desc' }
  isDark?: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  totalCount,
  loading,
  error,
  onSort,
  sortConfig,
  isDark = false
}) => {
  const vars = getThemeVars(isDark)
  const { isColumnVisible } = useColumnVisibility(DEFAULT_COLUMNS)

  const formatCurrency = (amount: any): string => {
    if (amount === null || amount === undefined || amount === '' || isNaN(Number(amount))) {
      return '₱0'
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
    if (isNaN(numAmount)) {
      return '₱0'
    }
    
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount)
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return '↕️'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const containerStyle = {
    backgroundColor: vars.background.primary,
    borderRadius: spacing[2],
    border: `1px solid ${vars.border.light}`,
    overflow: 'hidden'
  }

  const headerStyle = {
    backgroundColor: vars.background.secondary,
    padding: `${spacing[3]} ${spacing[4]}`,
    borderBottom: `1px solid ${vars.border.light}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }

  const titleStyle = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: vars.text.primary
  }

  const countStyle = {
    fontSize: typography.fontSize.sm,
    color: vars.text.secondary
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const
  }

  const thStyle = {
    padding: `${spacing[3]} ${spacing[4]}`,
    textAlign: 'left' as const,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: vars.text.primary,
    backgroundColor: vars.background.secondary,
    borderBottom: `1px solid ${vars.border.medium}`,
    cursor: 'pointer',
    userSelect: 'none' as const,
    transition: 'background-color 0.2s ease'
  }

  const tdStyle = {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSize.sm,
    color: vars.text.primary,
    borderBottom: `1px solid ${vars.border.light}`,
    verticalAlign: 'top' as const,
    wordWrap: 'break-word' as const,
    wordBreak: 'break-word' as const,
    whiteSpace: 'normal' as const,
    maxWidth: '200px',
    backgroundColor: 'inherit'
  }

  const tdAmountStyle = {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSize.sm,
    color: vars.text.primary,
    borderBottom: `1px solid ${vars.border.light}`,
    verticalAlign: 'top' as const,
    whiteSpace: 'nowrap' as const,
    textAlign: 'right' as const,
    minWidth: '120px',
    backgroundColor: 'inherit'
  }

  const trHoverStyle = {
    backgroundColor: vars.background.tertiary
  }

  const loadingStyle = {
    padding: spacing[8],
    textAlign: 'center' as const,
    color: vars.text.secondary
  }

  const errorStyle = {
    padding: spacing[8],
    textAlign: 'center' as const,
    color: vars.error[600],
    backgroundColor: vars.error[50],
    border: `1px solid ${vars.error[200]}`,
    borderRadius: spacing[2],
    margin: spacing[4]
  }

  const emptyStyle = {
    padding: spacing[8],
    textAlign: 'center' as const,
    color: vars.text.secondary
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{ fontSize: typography.fontSize.lg, marginBottom: spacing[2] }}>⏳</div>
          Loading search results...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <div style={{ fontSize: typography.fontSize.lg, marginBottom: spacing[2] }}>❌</div>
          {error}
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyStyle}>
          <div style={{ fontSize: typography.fontSize.lg, marginBottom: spacing[2] }}>🔍</div>
          No results found. Try adjusting your search criteria.
        </div>
      </div>
    )
  }

  // Column configuration with render functions
  const columnConfigs = [
    {
      key: 'contract_no',
      label: 'Contract No',
      sortKey: 'contract_no',
      renderHeader: () => `Contract No ${getSortIcon('contract_no')}`,
      renderCell: (result: SearchResult) => (
        <div style={{ fontWeight: typography.fontWeight.medium }}>
          {result.contract_number || result.contract_no || result.reference_id || 'N/A'}
        </div>
      ),
      cellStyle: tdStyle
    },
    {
      key: 'award_title',
      label: 'Award Title',
      sortKey: 'award_title',
      renderHeader: () => `Award Title ${getSortIcon('award_title')}`,
      renderCell: (result: SearchResult) => (
        <div>{result.award_title || 'N/A'}</div>
      ),
      cellStyle: tdStyle
    },
    {
      key: 'notice_title',
      label: 'Notice Title',
      sortKey: 'notice_title',
      renderHeader: () => `Notice Title ${getSortIcon('notice_title')}`,
      renderCell: (result: SearchResult) => (
        <div>{result.notice_title || 'N/A'}</div>
      ),
      cellStyle: tdStyle
    },
    {
      key: 'awardee_name',
      label: 'Contractor',
      sortKey: 'awardee_name',
      renderHeader: () => `Contractor ${getSortIcon('awardee_name')}`,
      renderCell: (result: SearchResult) => (
        <div>{result.awardee_name || 'N/A'}</div>
      ),
      cellStyle: tdStyle
    },
    {
      key: 'organization_name',
      label: 'Organization',
      sortKey: 'organization_name',
      renderHeader: () => `Organization ${getSortIcon('organization_name')}`,
      renderCell: (result: SearchResult) => (
        <div>{result.organization_name || 'N/A'}</div>
      ),
      cellStyle: tdStyle
    },
    {
      key: 'area_of_delivery',
      label: 'Area',
      sortKey: 'area_of_delivery',
      renderHeader: () => `Area ${getSortIcon('area_of_delivery')}`,
      renderCell: (result: SearchResult) => (
        <div>{result.area_of_delivery || 'N/A'}</div>
      ),
      cellStyle: tdStyle
    },
    {
      key: 'business_category',
      label: 'Category',
      sortKey: 'business_category',
      renderHeader: () => `Category ${getSortIcon('business_category')}`,
      renderCell: (result: SearchResult) => (
        <div>{result.business_category || 'N/A'}</div>
      ),
      cellStyle: tdStyle
    },
    {
      key: 'contract_amount',
      label: 'Amount',
      sortKey: 'contract_amount',
      renderHeader: () => `Amount ${getSortIcon('contract_amount')}`,
      renderCell: (result: SearchResult) => (
        <div style={{ 
          fontWeight: typography.fontWeight.medium,
          color: vars.success[600]
        }}>
          {formatCurrency(result.contract_amount)}
        </div>
      ),
      cellStyle: tdAmountStyle
    },
    {
      key: 'award_date',
      label: 'Date',
      sortKey: 'award_date',
      renderHeader: () => `Date ${getSortIcon('award_date')}`,
      renderCell: (result: SearchResult) => (
        <div>{formatDate(result.award_date)}</div>
      ),
      cellStyle: tdStyle
    }
  ]

  // Filter columns based on visibility
  const visibleColumns = columnConfigs.filter(col => isColumnVisible(col.key))

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>Search Results</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={countStyle}>{totalCount} contracts found</div>
          <ColumnVisibilityDropdown columns={DEFAULT_COLUMNS} isDark={isDark} />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  style={thStyle}
                  onClick={() => onSort(col.sortKey)}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, { backgroundColor: vars.background.tertiary })
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, { backgroundColor: vars.background.secondary })
                  }}
                >
                  {col.renderHeader()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={result.id || index}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, trHoverStyle)
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, { backgroundColor: 'transparent' })
                }}
              >
                {visibleColumns.map((col) => (
                  <td key={col.key} style={col.cellStyle}>
                    {col.renderCell(result)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { SearchResults }
