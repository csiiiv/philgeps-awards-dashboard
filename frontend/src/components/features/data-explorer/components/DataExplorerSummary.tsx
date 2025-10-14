import React, { memo } from 'react'
import { getThemeColors } from '../../../../design-system/theme'
import { spacing, typography } from '../../../../design-system'
import { Card, SectionTitle } from '../../../styled/Common.styled'
import { AnalyticsSummary } from '../../analytics/AnalyticsSummary'

interface DataExplorerSummaryProps {
  summaryStats: {
    totalContracts: number
    totalValue: number
    averageValue: number
  } | null
  isDark: boolean
}

export const DataExplorerSummary: React.FC<DataExplorerSummaryProps> = memo(({
  summaryStats,
  isDark
}) => {
  const theme = getThemeColors(isDark)

  return (
    <Card $isDark={isDark} style={{ marginBottom: spacing[4] }}>
      <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[3] }}>
        📈 Summary Statistics
      </SectionTitle>
      {summaryStats ? (
        <AnalyticsSummary
          totalContracts={summaryStats.totalContracts}
          totalValue={summaryStats.totalValue}
          averageValue={summaryStats.averageValue}
          isDark={isDark}
        />
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: spacing[4],
          color: theme.text.secondary,
          fontStyle: 'italic'
        }}>
          No data available. Use the filters above to search for data.
        </div>
      )}
    </Card>
  )
})
