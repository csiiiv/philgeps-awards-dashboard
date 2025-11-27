import React, { useEffect, useState, useMemo } from 'react'
import { spacing, typography } from '../../../design-system'
import { getThemeVars } from '../../../design-system/theme'
import { ChipSearchParams } from '../../../services/AdvancedSearchService'
import { resolveUrl } from '../../../utils/api'

interface BenfordsLawProps {
  currentFilters: ChipSearchParams
  isDark: boolean
}

interface BenfordsLawData {
  digit: number
  observed_frequency: number
  expected_frequency: number
  count: number
  chi_square_component: number
}

interface BenfordsLawResponse {
  analysis: BenfordsLawData[]
  chi_square_statistic: number
  p_value: number
  is_suspicious: boolean
  total_contracts: number
}

export const BenfordsLaw: React.FC<BenfordsLawProps> = ({ currentFilters, isDark }) => {
  const vars = getThemeVars(isDark)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<BenfordsLawResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBenfordsAnalysis = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const baseUrl = resolveUrl('/')
        const response = await fetch(`${baseUrl}/data-processing/benfords-law/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentFilters)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Benford\'s Law analysis error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBenfordsAnalysis()
  }, [currentFilters])

  const maxFrequency = useMemo(() => {
    if (!data) return 35
    return Math.max(...data.analysis.map(d => Math.max(d.observed_frequency, d.expected_frequency)))
  }, [data])

  if (loading) {
    return (
      <div style={{ padding: spacing[4], textAlign: 'center' }}>
        <div style={{ fontSize: typography.fontSize.base, color: vars.text.secondary }}>
          Analyzing first-digit distribution...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: spacing[4],
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        borderRadius: spacing[2],
        border: '1px solid rgb(239, 68, 68)'
      }}>
        <div style={{ fontSize: typography.fontSize.sm, color: 'rgb(239, 68, 68)' }}>
          ⚠️ Error: {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div style={{ padding: spacing[4] }}>
      {/* Header */}
      <div style={{ 
        marginBottom: spacing[4],
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h4 style={{ 
            margin: 0,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: vars.text.primary
          }}>
            Benford's Law Analysis
          </h4>
          <p style={{ 
            margin: `${spacing[1]} 0 0 0`,
            fontSize: typography.fontSize.sm,
            color: vars.text.secondary
          }}>
            First-digit frequency distribution for {data.total_contracts.toLocaleString()} contracts
          </p>
        </div>
        
        {/* Status Badge */}
        <div style={{
          padding: `${spacing[2]} ${spacing[3]}`,
          borderRadius: spacing[2],
          backgroundColor: data.is_suspicious 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(34, 197, 94, 0.1)',
          border: `2px solid ${data.is_suspicious ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)'}`,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: data.is_suspicious ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)'
        }}>
          {data.is_suspicious ? '⚠️ Suspicious' : '✓ Normal'}
        </div>
      </div>

      {/* Statistical Summary */}
      <div style={{ 
        marginBottom: spacing[4],
        padding: spacing[3],
        backgroundColor: vars.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${vars.border.light}`
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
          <div>
            <div style={{ fontSize: typography.fontSize.xs, color: vars.text.secondary }}>
              Chi-Square Statistic
            </div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.text.primary }}>
              {data.chi_square_statistic.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: typography.fontSize.xs, color: vars.text.secondary }}>
              P-Value
            </div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.text.primary }}>
              {data.p_value.toFixed(4)}
            </div>
          </div>
        </div>
        <div style={{ 
          marginTop: spacing[2],
          fontSize: typography.fontSize.xs,
          color: vars.text.secondary,
          fontStyle: 'italic'
        }}>
          {data.p_value < 0.05 
            ? '⚠️ Significant deviation from expected distribution (p < 0.05)'
            : '✓ Distribution conforms to Benford\'s Law (p ≥ 0.05)'}
        </div>
      </div>

      {/* Chart */}
      <div style={{ 
        marginBottom: spacing[4],
        backgroundColor: vars.background.primary,
        padding: spacing[4],
        borderRadius: spacing[2],
        border: `1px solid ${vars.border.light}`
      }}>
        <svg width="100%" height="400" viewBox="0 0 1000 400">
          {/* Grid lines */}
          <g>
            {[0, 10, 20, 30, 40].map((tick) => (
              <g key={tick}>
                <line
                  x1="80"
                  y1={350 - (tick / maxFrequency) * 300}
                  x2="950"
                  y2={350 - (tick / maxFrequency) * 300}
                  stroke={vars.border.light}
                  strokeDasharray="2,2"
                />
                <text
                  x="70"
                  y={350 - (tick / maxFrequency) * 300}
                  fill={vars.text.secondary}
                  fontSize="10"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {tick}%
                </text>
              </g>
            ))}
          </g>

          {/* Bars */}
          <g>
            {data.analysis.map((item, index) => {
              const barWidth = 45
              const groupWidth = 100
              const x = 100 + index * groupWidth
              
              const expectedHeight = (item.expected_frequency / maxFrequency) * 300
              const observedHeight = (item.observed_frequency / maxFrequency) * 300
              
              return (
                <g key={item.digit}>
                  {/* Expected (Benford's Law) - Light bar */}
                  <rect
                    x={x}
                    y={350 - expectedHeight}
                    width={barWidth}
                    height={expectedHeight}
                    fill={vars.primary[300]}
                    opacity={0.5}
                  />
                  
                  {/* Observed - Darker bar */}
                  <rect
                    x={x + barWidth + 5}
                    y={350 - observedHeight}
                    width={barWidth}
                    height={observedHeight}
                    fill={Math.abs(item.observed_frequency - item.expected_frequency) > 5 
                      ? 'rgb(239, 68, 68)' 
                      : vars.primary[600]}
                  />
                  
                  {/* Digit label */}
                  <text
                    x={x + barWidth}
                    y="375"
                    fill={vars.text.primary}
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {item.digit}
                  </text>
                  
                  {/* Count label */}
                  <text
                    x={x + barWidth}
                    y="390"
                    fill={vars.text.secondary}
                    fontSize="10"
                    textAnchor="middle"
                  >
                    ({item.count})
                  </text>
                </g>
              )
            })}
          </g>

          {/* Axis labels */}
          <text x="25" y="200" fill={vars.text.secondary} fontSize="11" textAnchor="middle" transform="rotate(-90, 25, 200)">
            Frequency (%)
          </text>
          <text x="500" y="395" fill={vars.text.secondary} fontSize="11" textAnchor="middle">
            First Digit
          </text>
        </svg>

        {/* Legend */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: spacing[4],
          marginTop: spacing[2]
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: vars.primary[300], opacity: 0.5 }} />
            <span style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              Expected (Benford's Law)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: vars.primary[600] }} />
            <span style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              Observed
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div style={{ 
        overflowX: 'auto',
        backgroundColor: vars.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${vars.border.light}`
      }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: typography.fontSize.sm
        }}>
          <thead>
            <tr style={{ backgroundColor: vars.background.primary }}>
              <th style={{ padding: spacing[3], textAlign: 'left', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                Digit
              </th>
              <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                Count
              </th>
              <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                Observed %
              </th>
              <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                Expected %
              </th>
              <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                Difference
              </th>
              <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                χ² Component
              </th>
            </tr>
          </thead>
          <tbody>
            {data.analysis.map((item, index) => {
              const diff = item.observed_frequency - item.expected_frequency
              const isAnomalous = Math.abs(diff) > 5
              
              return (
                <tr 
                  key={item.digit}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? vars.background.primary : vars.background.secondary,
                    borderTop: `1px solid ${vars.border.light}`
                  }}
                >
                  <td style={{ padding: spacing[3], color: vars.text.primary, fontWeight: typography.fontWeight.medium }}>
                    {item.digit}
                  </td>
                  <td style={{ padding: spacing[3], textAlign: 'right', color: vars.text.secondary }}>
                    {item.count.toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: spacing[3], 
                    textAlign: 'right',
                    color: isAnomalous ? 'rgb(239, 68, 68)' : vars.text.primary,
                    fontWeight: isAnomalous ? typography.fontWeight.bold : typography.fontWeight.normal
                  }}>
                    {item.observed_frequency.toFixed(2)}%
                  </td>
                  <td style={{ padding: spacing[3], textAlign: 'right', color: vars.text.secondary }}>
                    {item.expected_frequency.toFixed(2)}%
                  </td>
                  <td style={{ 
                    padding: spacing[3], 
                    textAlign: 'right',
                    color: isAnomalous ? 'rgb(239, 68, 68)' : vars.text.secondary,
                    fontWeight: isAnomalous ? typography.fontWeight.semibold : typography.fontWeight.normal
                  }}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
                  </td>
                  <td style={{ padding: spacing[3], textAlign: 'right', color: vars.text.secondary }}>
                    {item.chi_square_component.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div style={{ 
        marginTop: spacing[4],
        padding: spacing[3],
        backgroundColor: isDark ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)',
        borderRadius: spacing[2],
        borderLeft: `4px solid ${vars.primary[600]}`
      }}>
        <div style={{ fontSize: typography.fontSize.sm, color: vars.text.primary }}>
          <strong>How to interpret:</strong>
        </div>
        <ul style={{ 
          margin: `${spacing[2]} 0 0 0`,
          paddingLeft: spacing[4],
          fontSize: typography.fontSize.sm,
          color: vars.text.secondary
        }}>
          <li>Natural datasets follow Benford's Law: ~30% start with "1", ~18% with "2", etc.</li>
          <li>P-value &lt; 0.05 indicates significant deviation (potentially suspicious)</li>
          <li>Red bars show digits with &gt;5% deviation from expected</li>
          <li>High χ² components indicate problematic digits</li>
        </ul>
      </div>
    </div>
  )
}

