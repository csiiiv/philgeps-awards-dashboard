import React, { memo } from 'react'
import { spacing, typography } from '../../../../design-system'
import { Card, SectionTitle } from '../../../styled/Common.styled'
import { AnalyticsTable } from '../../analytics/AnalyticsTable'
import { UnifiedPagination } from '../../shared/UnifiedPagination'
import { AccessibleButton } from '../../shared/AccessibleButton'

interface DataExplorerTableProps {
  dimension: string
  metric: string
  processedData: Array<{
    label: string
    totalContracts: number
    totalValue: number
    averageValue: number
  }>
  tableLoading: boolean
  pagination: {
    currentPage: number
    totalCount: number
    pageSize: number
    setCurrentPage: (page: number) => void
    setPageSize: (size: number) => void
  }
  onEntityClick: (entityName: string) => void
  onExport: () => void
  isDark: boolean
}

export const DataExplorerTable: React.FC<DataExplorerTableProps> = memo(({
  dimension,
  metric,
  processedData,
  tableLoading,
  pagination,
  onEntityClick,
  onExport,
  isDark
}) => {
  return (
    <Card $isDark={isDark} style={{ marginBottom: spacing[4] }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[3]
      }}>
        <SectionTitle $isDark={isDark}>
          📊 {dimension.replace('by_', 'By ')} Analysis
        </SectionTitle>
        <AccessibleButton
          onClick={onExport}
          variant="secondary"
          size="sm"
          aria-label="Export data to CSV"
        >
          📥 Export CSV
        </AccessibleButton>
      </div>
      
      <AnalyticsTable
        data={processedData}
        metric={metric}
        onEntityClick={onEntityClick}
        loading={tableLoading}
        isDark={isDark}
      />

      {/* Pagination */}
      {pagination.totalCount > 0 && (
        <div style={{ marginTop: spacing[3] }}>
          <UnifiedPagination
            currentPage={pagination.currentPage}
            totalPages={Math.ceil(pagination.totalCount / pagination.pageSize)}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            onPageChange={pagination.setCurrentPage}
            onPageSizeChange={pagination.setPageSize}
            isDark={isDark}
          />
        </div>
      )}
    </Card>
  )
})
