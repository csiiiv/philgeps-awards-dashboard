import React, { memo } from 'react'
import { getThemeColors } from '../../../../design-system/theme'
import { spacing, typography } from '../../../../design-system'
import { Card, SectionTitle } from '../../../styled/Common.styled'
import { AnalyticsControls } from '../../analytics/AnalyticsControls'

interface DataExplorerControlsProps {
  dimension: string
  metric: string
  yearFilter: string
  onDimensionChange: (dimension: string) => void
  onMetricChange: (metric: string) => void
  onYearFilterChange: (year: string) => void
  isDark: boolean
}

export const DataExplorerControls: React.FC<DataExplorerControlsProps> = memo(({
  dimension,
  metric,
  yearFilter,
  onDimensionChange,
  onMetricChange,
  onYearFilterChange,
  isDark
}) => {
  const theme = getThemeColors(isDark)

  return (
    <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
      <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
        ⚙️ Analysis Controls
      </SectionTitle>
      <AnalyticsControls
        dimension={dimension}
        metric={metric}
        yearFilter={yearFilter}
        onDimensionChange={onDimensionChange}
        onMetricChange={onMetricChange}
        onYearFilterChange={onYearFilterChange}
        isDark={isDark}
      />
    </Card>
  )
})
