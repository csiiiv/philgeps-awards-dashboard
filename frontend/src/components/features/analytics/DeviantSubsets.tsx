import React from 'react'
import { spacing, typography } from '../../../design-system'
import { getThemeVars } from '../../../design-system/theme'
import { ChipSearchParams } from '../../../services/AdvancedSearchService'

interface DeviantSubsetsProps {
  currentFilters: ChipSearchParams
  isDark: boolean
}

export const DeviantSubsets: React.FC<DeviantSubsetsProps> = ({ currentFilters, isDark }) => {
  const vars = getThemeVars(isDark)

  return (
    <div style={{ padding: spacing[4] }}>
      <div style={{ 
        textAlign: 'center',
        padding: spacing[6],
        backgroundColor: isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)',
        borderRadius: spacing[2],
        border: `2px dashed ${vars.warning[500]}`
      }}>
        <div style={{ fontSize: typography.fontSize['3xl'], marginBottom: spacing[3] }}>
          🚧
        </div>
        <h4 style={{ 
          margin: `0 0 ${spacing[2]} 0`,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
          color: vars.text.primary
        }}>
          Deviant Subsets Analysis
        </h4>
        <p style={{ 
          margin: `0 0 ${spacing[4]} 0`,
          fontSize: typography.fontSize.base,
          color: vars.text.secondary,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Coming Soon: Statistical outlier detection using Z-score analysis, pattern matching, and anomaly detection algorithms.
        </p>
        
        <div style={{ 
          textAlign: 'left',
          marginTop: spacing[4],
          padding: spacing[4],
          backgroundColor: vars.background.primary,
          borderRadius: spacing[2]
        }}>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.text.primary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
            What this will detect:
          </div>
          <ul style={{ 
            margin: 0,
            paddingLeft: spacing[4],
            fontSize: typography.fontSize.sm,
            color: vars.text.secondary
          }}>
            <li>Contracts &gt;3 standard deviations from the mean</li>
            <li>Unusual contractor/organization combinations</li>
            <li>Anomalous award patterns (timing, frequency, clustering)</li>
            <li>Contracts that don't match peer group characteristics</li>
            <li>Time-based anomalies (unusual award dates, rapid sequences)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

