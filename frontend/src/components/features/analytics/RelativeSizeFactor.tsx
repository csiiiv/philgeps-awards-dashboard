import React from 'react'
import { spacing, typography } from '../../../design-system'
import { getThemeVars } from '../../../design-system/theme'
import { ChipSearchParams } from '../../../services/AdvancedSearchService'

interface RelativeSizeFactorProps {
  currentFilters: ChipSearchParams
  isDark: boolean
}

export const RelativeSizeFactor: React.FC<RelativeSizeFactorProps> = ({ currentFilters, isDark }) => {
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
          Relative Size Factor (RSF) Analysis
        </h4>
        <p style={{ 
          margin: `0 0 ${spacing[4]} 0`,
          fontSize: typography.fontSize.base,
          color: vars.text.secondary,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Coming Soon: Proportionality analysis to detect whether contract values are appropriate for the size and capacity of districts/municipalities.
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
            <li>Small municipalities with disproportionately large contracts</li>
            <li>Contracts that exceed reasonable % of local budget</li>
            <li>Comparison to peer localities (similar population, income class)</li>
            <li>Historical budget allocation vs. current contract values</li>
            <li>Per-capita contract spending anomalies</li>
          </ul>
          
          <div style={{ 
            marginTop: spacing[3],
            padding: spacing[3],
            backgroundColor: isDark ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)',
            borderRadius: spacing[1],
            fontSize: typography.fontSize.xs,
            color: vars.text.secondary
          }}>
            <strong>Note:</strong> This analysis requires additional demographic and budget data for each municipality/district.
          </div>
        </div>
      </div>
    </div>
  )
}

