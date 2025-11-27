import React, { useEffect, useState, useMemo } from 'react'
import { spacing, typography } from '../../../design-system'
import { getThemeVars } from '../../../design-system/theme'
import { ChipSearchParams } from '../../../services/AdvancedSearchService'
import { resolveUrl } from '../../../utils/api'

interface RoundingPatternsProps {
  currentFilters: ChipSearchParams
  isDark: boolean
}

interface RoundingBucket {
  bucket: string
  count: number
  percentage: number
  total_value: number
}

interface RoundingPatternsResponse {
  total_contracts: number
  rounding_buckets: RoundingBucket[]
  trailing_zeros_distribution: {
    zeros: number
    count: number
    percentage: number
  }[]
  suspicion_score: number
  is_suspicious: boolean
  last_digit_distribution: {
    digit: number
    count: number
    percentage: number
  }[]
}

export const RoundingPatterns: React.FC<RoundingPatternsProps> = ({ currentFilters, isDark }) => {
  const vars = getThemeVars(isDark)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RoundingPatternsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoundingAnalysis = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const baseUrl = resolveUrl('/')
        const response = await fetch(`${baseUrl}/data-processing/rounding-patterns/`, {
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
        console.error('Rounding patterns analysis error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRoundingAnalysis()
  }, [currentFilters])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div style={{ padding: spacing[4], textAlign: 'center' }}>
        <div style={{ fontSize: typography.fontSize.base, color: vars.text.secondary }}>
          Analyzing rounding patterns...
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

  const maxLastDigitPercentage = Math.max(...data.last_digit_distribution.map(d => d.percentage))

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
            Rounding Pattern Analysis
          </h4>
          <p style={{ 
            margin: `${spacing[1]} 0 0 0`,
            fontSize: typography.fontSize.sm,
            color: vars.text.secondary
          }}>
            Detecting artificial rounding in {data.total_contracts.toLocaleString()} contracts
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

      {/* Suspicion Score */}
      <div style={{ 
        marginBottom: spacing[4],
        padding: spacing[3],
        backgroundColor: vars.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${vars.border.light}`
      }}>
        <div style={{ fontSize: typography.fontSize.xs, color: vars.text.secondary, marginBottom: spacing[1] }}>
          Suspicion Score
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={{ flex: 1, height: '24px', backgroundColor: vars.background.primary, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${data.suspicion_score}%`,
              backgroundColor: data.suspicion_score > 70 ? 'rgb(239, 68, 68)' : data.suspicion_score > 40 ? 'rgb(251, 191, 36)' : 'rgb(34, 197, 94)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.text.primary, minWidth: '60px' }}>
            {data.suspicion_score.toFixed(0)}%
          </div>
        </div>
        <div style={{ 
          marginTop: spacing[2],
          fontSize: typography.fontSize.xs,
          color: vars.text.secondary,
          fontStyle: 'italic'
        }}>
          {data.suspicion_score > 70 
            ? '⚠️ High level of artificial rounding detected'
            : data.suspicion_score > 40
            ? '⚠️ Moderate rounding patterns detected'
            : '✓ Rounding patterns appear natural'}
        </div>
      </div>

      {/* Rounding Buckets */}
      <div style={{ 
        marginBottom: spacing[4],
        backgroundColor: vars.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${vars.border.light}`,
        padding: spacing[4]
      }}>
        <h5 style={{ 
          margin: `0 0 ${spacing[3]} 0`,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: vars.text.primary
        }}>
          Rounding Magnitude Distribution
        </h5>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: typography.fontSize.sm
          }}>
            <thead>
              <tr style={{ backgroundColor: vars.background.primary }}>
                <th style={{ padding: spacing[3], textAlign: 'left', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                  Rounding Level
                </th>
                <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                  Count
                </th>
                <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                  Percentage
                </th>
                <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rounding_buckets.map((bucket, index) => {
                const isHighRounding = bucket.percentage > 15 && bucket.bucket !== 'No rounding'
                
                return (
                  <tr 
                    key={bucket.bucket}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? vars.background.primary : vars.background.secondary,
                      borderTop: `1px solid ${vars.border.light}`
                    }}
                  >
                    <td style={{ 
                      padding: spacing[3], 
                      color: vars.text.primary, 
                      fontWeight: typography.fontWeight.medium 
                    }}>
                      {bucket.bucket}
                    </td>
                    <td style={{ padding: spacing[3], textAlign: 'right', color: vars.text.secondary }}>
                      {bucket.count.toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: spacing[3], 
                      textAlign: 'right',
                      color: isHighRounding ? 'rgb(239, 68, 68)' : vars.text.primary,
                      fontWeight: isHighRounding ? typography.fontWeight.bold : typography.fontWeight.normal
                    }}>
                      {bucket.percentage.toFixed(1)}%
                    </td>
                    <td style={{ padding: spacing[3], textAlign: 'right', color: vars.text.secondary }}>
                      {formatCurrency(bucket.total_value)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Digit Distribution */}
      <div style={{ 
        marginBottom: spacing[4],
        backgroundColor: vars.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${vars.border.light}`,
        padding: spacing[4]
      }}>
        <h5 style={{ 
          margin: `0 0 ${spacing[3]} 0`,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: vars.text.primary
        }}>
          Last Digit Distribution
        </h5>
        
        <p style={{ 
          margin: `0 0 ${spacing[3]} 0`,
          fontSize: typography.fontSize.sm,
          color: vars.text.secondary
        }}>
          Natural data should have roughly equal distribution (10% each). Bias toward 0 or 5 indicates rounding.
        </p>

        <svg width="100%" height="300" viewBox="0 0 1000 300">
          {/* Grid lines */}
          <g>
            {[0, 5, 10, 15, 20].map((tick) => (
              <g key={tick}>
                <line
                  x1="60"
                  y1={250 - (tick / maxLastDigitPercentage) * 200}
                  x2="950"
                  y2={250 - (tick / maxLastDigitPercentage) * 200}
                  stroke={vars.border.light}
                  strokeDasharray="2,2"
                />
                <text
                  x="50"
                  y={250 - (tick / maxLastDigitPercentage) * 200}
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

          {/* Expected line (10%) */}
          <line
            x1="60"
            y1={250 - (10 / maxLastDigitPercentage) * 200}
            x2="950"
            y2={250 - (10 / maxLastDigitPercentage) * 200}
            stroke="rgb(34, 197, 94)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x="955"
            y={250 - (10 / maxLastDigitPercentage) * 200}
            fill="rgb(34, 197, 94)"
            fontSize="10"
            dominantBaseline="middle"
          >
            Expected (10%)
          </text>

          {/* Bars */}
          <g>
            {data.last_digit_distribution.map((item, index) => {
              const barWidth = 70
              const x = 80 + index * 90
              const barHeight = (item.percentage / maxLastDigitPercentage) * 200
              
              const isAnomalous = Math.abs(item.percentage - 10) > 5
              
              return (
                <g key={item.digit}>
                  <rect
                    x={x}
                    y={250 - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={isAnomalous ? 'rgb(239, 68, 68)' : vars.primary[600]}
                  />
                  
                  {/* Digit label */}
                  <text
                    x={x + barWidth / 2}
                    y="270"
                    fill={vars.text.primary}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {item.digit}
                  </text>
                  
                  {/* Percentage label */}
                  <text
                    x={x + barWidth / 2}
                    y={250 - barHeight - 5}
                    fill={vars.text.primary}
                    fontSize="10"
                    fontWeight="semibold"
                    textAnchor="middle"
                  >
                    {item.percentage.toFixed(1)}%
                  </text>
                </g>
              )
            })}
          </g>

          {/* Axis labels */}
          <text x="15" y="150" fill={vars.text.secondary} fontSize="11" textAnchor="middle" transform="rotate(-90, 15, 150)">
            Percentage
          </text>
          <text x="500" y="290" fill={vars.text.secondary} fontSize="11" textAnchor="middle">
            Last Digit
          </text>
        </svg>
      </div>

      {/* Trailing Zeros Distribution */}
      <div style={{ 
        marginBottom: spacing[4],
        backgroundColor: vars.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${vars.border.light}`,
        padding: spacing[4]
      }}>
        <h5 style={{ 
          margin: `0 0 ${spacing[3]} 0`,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: vars.text.primary
        }}>
          Trailing Zeros Pattern
        </h5>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: typography.fontSize.sm
          }}>
            <thead>
              <tr style={{ backgroundColor: vars.background.primary }}>
                <th style={{ padding: spacing[3], textAlign: 'left', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                  Trailing Zeros
                </th>
                <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                  Count
                </th>
                <th style={{ padding: spacing[3], textAlign: 'right', color: vars.text.primary, fontWeight: typography.fontWeight.semibold }}>
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {data.trailing_zeros_distribution.map((item, index) => {
                const isExcessive = item.zeros >= 4 && item.percentage > 20
                
                return (
                  <tr 
                    key={item.zeros}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? vars.background.primary : vars.background.secondary,
                      borderTop: `1px solid ${vars.border.light}`
                    }}
                  >
                    <td style={{ padding: spacing[3], color: vars.text.primary, fontWeight: typography.fontWeight.medium }}>
                      {item.zeros === 0 ? 'No trailing zeros' : `${item.zeros} zero${item.zeros > 1 ? 's' : ''}`}
                    </td>
                    <td style={{ padding: spacing[3], textAlign: 'right', color: vars.text.secondary }}>
                      {item.count.toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: spacing[3], 
                      textAlign: 'right',
                      color: isExcessive ? 'rgb(239, 68, 68)' : vars.text.primary,
                      fontWeight: isExcessive ? typography.fontWeight.bold : typography.fontWeight.normal
                    }}>
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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
          <strong>Red Flags:</strong>
        </div>
        <ul style={{ 
          margin: `${spacing[2]} 0 0 0`,
          paddingLeft: spacing[4],
          fontSize: typography.fontSize.sm,
          color: vars.text.secondary
        }}>
          <li>&gt;20% of values rounded to millions (₱1M, ₱5M, ₱10M)</li>
          <li>Last digit biased toward 0 or 5 (&gt;15% deviation from 10%)</li>
          <li>&gt;4 trailing zeros in &gt;20% of contracts</li>
          <li>Suspicion score &gt;70%</li>
        </ul>
      </div>
    </div>
  )
}

