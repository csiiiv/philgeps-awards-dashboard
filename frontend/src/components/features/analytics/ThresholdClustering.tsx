import React, { useState, useEffect, useMemo } from 'react'
import { spacing, typography } from '../../../design-system'
import { getThemeVars } from '../../../design-system/theme'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ErrorDisplay } from '../shared/ErrorDisplay'
import { advancedSearchService, type ValueDistributionResponse, type ChipSearchParams } from '../../../services/AdvancedSearchService'

interface ThresholdClusteringProps {
  currentFilters?: ChipSearchParams
  isDark?: boolean
}

export const ThresholdClustering: React.FC<ThresholdClusteringProps> = ({
  currentFilters,
  isDark = false
}) => {
  const vars = getThemeVars(isDark)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<ValueDistributionResponse | null>(null)
  const [displayBins, setDisplayBins] = useState(100) // Client-side bin count
  const [zoomStart, setZoomStart] = useState(0)
  const [zoomEnd, setZoomEnd] = useState(100)
  const [selectedBinRange, setSelectedBinRange] = useState<{ start: number; end: number } | null>(null)

  // Fetch high-resolution data from backend (always 1000 bins)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = {
          ...currentFilters,
          num_bins: 1000 // Always fetch max resolution
        }
        
        const result = await advancedSearchService.getValueDistribution(params as any)
        setRawData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load value distribution')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentFilters])

  // Combine bins client-side based on displayBins slider
  const processedData = useMemo(() => {
    if (!rawData || !rawData.bins.length) return null

    const rawBins = rawData.bins
    const combineFactor = Math.ceil(rawBins.length / displayBins)
    
    if (combineFactor <= 1) {
      // No combining needed
      return {
        ...rawData,
        bins: rawBins
      }
    }

    // Combine bins
    const combined = []
    for (let i = 0; i < rawBins.length; i += combineFactor) {
      const group = rawBins.slice(i, i + combineFactor)
      const firstBin = group[0]
      const lastBin = group[group.length - 1]
      
      combined.push({
        bin_number: combined.length + 1,
        bin_start: firstBin.bin_start,
        bin_end: lastBin.bin_end,
        count: group.reduce((sum, b) => sum + b.count, 0),
        total_value: group.reduce((sum, b) => sum + b.total_value, 0),
        avg_value: group.reduce((sum, b) => sum + b.total_value, 0) / 
                   group.reduce((sum, b) => sum + b.count, 0)
      })
    }

    return {
      ...rawData,
      num_bins: combined.length,
      bin_width: (rawData.max_value - rawData.min_value) / combined.length,
      bins: combined
    }
  }, [rawData, displayBins])

  // Calculate visible bins based on zoom
  const visibleBins = useMemo(() => {
    if (!processedData || !processedData.bins.length) return []
    
    const totalBins = processedData.bins.length
    const startIdx = Math.floor((zoomStart / 100) * totalBins)
    const endIdx = Math.ceil((zoomEnd / 100) * totalBins)
    
    return processedData.bins.slice(startIdx, endIdx)
  }, [processedData, zoomStart, zoomEnd])

  // Find max count for scaling
  const maxCount = useMemo(() => {
    if (!visibleBins.length) return 0
    return Math.max(...visibleBins.map(b => b.count))
  }, [visibleBins])

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return `₱${(value / 1_000_000_000).toFixed(1)}B`
    } else if (value >= 1_000_000) {
      return `₱${(value / 1_000_000).toFixed(1)}M`
    } else if (value >= 1_000) {
      return `₱${(value / 1_000).toFixed(0)}K`
    }
    return `₱${value.toFixed(0)}`
  }

  // Format count with commas
  const formatCount = (count: number) => {
    return count.toLocaleString()
  }

  // Handle bar click
  const handleBarClick = (binStart: number, binEnd: number) => {
    setSelectedBinRange({ start: binStart, end: binEnd })
  }

  // Handle zoom reset
  const handleZoomReset = () => {
    setZoomStart(0)
    setZoomEnd(100)
    setSelectedBinRange(null)
  }

  // Handle zoom to clustering (bins with high counts)
  const handleZoomToClustering = () => {
    if (!processedData || !processedData.bins.length) return
    
    const threshold = maxCount * 0.5
    const significantBins = processedData.bins.filter(b => b.count >= threshold)
    
    if (significantBins.length === 0) return
    
    const firstBinIdx = processedData.bins.findIndex(b => b.bin_number === significantBins[0].bin_number)
    const lastBinIdx = processedData.bins.findIndex(b => b.bin_number === significantBins[significantBins.length - 1].bin_number)
    
    setZoomStart((firstBinIdx / processedData.bins.length) * 100)
    setZoomEnd(((lastBinIdx + 1) / processedData.bins.length) * 100)
  }

  if (loading) {
    return (
      <div style={{ 
        padding: spacing[4],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: spacing[4] }}>
        <ErrorDisplay error={{ message: error }} />
      </div>
    )
  }

  if (!processedData || !processedData.bins.length) {
    return (
      <div style={{ padding: spacing[4], textAlign: 'center', color: vars.textSecondary }}>
        No data available for value distribution
      </div>
    )
  }

  // Generate tick values for axes
  const yTicks = [0, Math.floor(maxCount * 0.25), Math.floor(maxCount * 0.5), Math.floor(maxCount * 0.75), maxCount]
  const xTicks = visibleBins.length > 0 ? [
    visibleBins[0].bin_start,
    visibleBins[Math.floor(visibleBins.length * 0.25)]?.bin_start || 0,
    visibleBins[Math.floor(visibleBins.length * 0.5)]?.bin_start || 0,
    visibleBins[Math.floor(visibleBins.length * 0.75)]?.bin_start || 0,
    visibleBins[visibleBins.length - 1]?.bin_end || 0
  ] : []

  return (
    <div style={{ 
      padding: spacing[4],
      backgroundColor: vars.surfaceColor,
      borderRadius: '8px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[4] }}>
        <h3 style={{ 
          margin: 0,
          marginBottom: spacing[2],
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: vars.textPrimary
        }}>
          Value Distribution & Threshold Clustering
        </h3>
        <p style={{ 
          margin: 0,
          fontSize: typography.fontSize.sm,
          color: vars.textSecondary
        }}>
          Shows how contracts are distributed across value ranges. Tall bars indicate clustering around specific thresholds.
        </p>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: spacing[3],
        marginBottom: spacing[4]
      }}>
        <div style={{ 
          padding: spacing[3],
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.textSecondary, marginBottom: spacing[1] }}>
            Total Contracts
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.textPrimary }}>
            {formatCount(rawData?.total_contracts || 0)}
          </div>
        </div>
        <div style={{ 
          padding: spacing[3],
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.textSecondary, marginBottom: spacing[1] }}>
            Min Value
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.textPrimary }}>
            {formatCurrency(rawData?.min_value || 0)}
          </div>
        </div>
        <div style={{ 
          padding: spacing[3],
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.textSecondary, marginBottom: spacing[1] }}>
            Max Value
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.textPrimary }}>
            {formatCurrency(rawData?.max_value || 0)}
          </div>
        </div>
        <div style={{ 
          padding: spacing[3],
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.textSecondary, marginBottom: spacing[1] }}>
            Display Bins
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.textPrimary }}>
            {processedData.num_bins}
          </div>
        </div>
      </div>

      {/* Bin Size Slider */}
      <div style={{ marginBottom: spacing[4] }}>
        <div style={{ 
          fontSize: typography.fontSize.sm,
          color: vars.textSecondary,
          marginBottom: spacing[2]
        }}>
          Adjust Bin Resolution: {displayBins} bins
        </div>
        <input
          type="range"
          min="10"
          max="1000"
          step="10"
          value={displayBins}
          onChange={(e) => setDisplayBins(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: typography.fontSize.xs,
          color: vars.textSecondary,
          marginTop: spacing[1]
        }}>
          <span>10 (coarse)</span>
          <span>1000 (fine)</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ 
        marginBottom: spacing[4],
        display: 'flex',
        gap: spacing[2],
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleZoomReset}
          style={{
            padding: `${spacing[2]} ${spacing[3]}`,
            backgroundColor: vars.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium
          }}
        >
          Reset Zoom
        </button>
        <button
          onClick={handleZoomToClustering}
          style={{
            padding: `${spacing[2]} ${spacing[3]}`,
            backgroundColor: vars.accent,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium
          }}
        >
          Zoom to Clustering
        </button>
      </div>

      {/* Improved Histogram */}
      <div style={{ 
        position: 'relative',
        height: '450px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '4px',
        padding: `${spacing[3]} ${spacing[2]}`,
        overflow: 'hidden',
        backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          {/* Y-axis labels */}
          <g>
            {yTicks.map((tick, i) => (
              <g key={i}>
                <text 
                  x="50" 
                  y={380 - (tick / maxCount) * 340} 
                  fill={vars.textSecondary} 
                  fontSize="10"
                  textAnchor="end"
                >
                  {formatCount(tick)}
                </text>
                <line
                  x1="60"
                  y1={380 - (tick / maxCount) * 340}
                  x2="980"
                  y2={380 - (tick / maxCount) * 340}
                  stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth="1"
                />
              </g>
            ))}
          </g>

          {/* Bars */}
          <g transform="translate(60, 20)">
            {visibleBins.map((bin, idx) => {
              const availableWidth = 920 // Total width available for bars
              const barWidth = Math.max(1, (availableWidth / visibleBins.length) - 1) // -1 for spacing
              const barHeight = maxCount > 0 ? (bin.count / maxCount) * 340 : 0
              const x = (idx / visibleBins.length) * availableWidth
              const y = 360 - barHeight
              const isSelected = selectedBinRange && 
                bin.bin_start >= selectedBinRange.start && 
                bin.bin_end <= selectedBinRange.end
              
              return (
                <rect
                  key={bin.bin_number}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isSelected ? vars.accent : vars.primary}
                  opacity={isSelected ? 1 : 0.7}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleBarClick(bin.bin_start, bin.bin_end)}
                >
                  <title>
                    {`${formatCurrency(bin.bin_start)} - ${formatCurrency(bin.bin_end)}\nContracts: ${formatCount(bin.count)}\nTotal Value: ${formatCurrency(bin.total_value)}\nAvg Value: ${formatCurrency(bin.avg_value)}`}
                  </title>
                </rect>
              )
            })}
          </g>

          {/* X-axis labels */}
          <g>
            {xTicks.map((tick, i) => (
              <text 
                key={i}
                x={60 + (i / (xTicks.length - 1)) * 920} 
                y="395" 
                fill={vars.textSecondary} 
                fontSize="10"
                textAnchor="middle"
              >
                {formatCurrency(tick)}
              </text>
            ))}
          </g>

          {/* Axis labels */}
          <text x="20" y="200" fill={vars.textSecondary} fontSize="11" textAnchor="middle" transform="rotate(-90, 20, 200)">
            Contract Count
          </text>
          <text x="520" y="410" fill={vars.textSecondary} fontSize="11" textAnchor="middle">
            Contract Value Range
          </text>
        </svg>
      </div>

      {/* Zoom slider */}
      <div style={{ marginTop: spacing[4] }}>
        <div style={{ 
          fontSize: typography.fontSize.sm,
          color: vars.textSecondary,
          marginBottom: spacing[2]
        }}>
          Zoom Range: {zoomStart.toFixed(0)}% - {zoomEnd.toFixed(0)}%
        </div>
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
          <span style={{ fontSize: typography.fontSize.sm, color: vars.textSecondary }}>
            Start:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={zoomStart}
            onChange={(e) => setZoomStart(Math.min(Number(e.target.value), zoomEnd - 5))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: typography.fontSize.sm, color: vars.textSecondary }}>
            End:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={zoomEnd}
            onChange={(e) => setZoomEnd(Math.max(Number(e.target.value), zoomStart + 5))}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Selected bin info */}
      {selectedBinRange && (
        <div style={{ 
          marginTop: spacing[4],
          padding: spacing[3],
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '6px',
          border: `2px solid ${vars.accent}`
        }}>
          <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: vars.textPrimary, marginBottom: spacing[2] }}>
            Selected Range
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.textSecondary }}>
            {formatCurrency(selectedBinRange.start)} - {formatCurrency(selectedBinRange.end)}
          </div>
        </div>
      )}

      {/* Help text */}
      <div style={{ 
        marginTop: spacing[4],
        padding: spacing[3],
        backgroundColor: isDark ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)',
        borderRadius: '6px',
        borderLeft: `4px solid ${vars.info}`
      }}>
        <div style={{ fontSize: typography.fontSize.sm, color: vars.textPrimary }}>
          <strong>How to use:</strong>
        </div>
        <ul style={{ 
          margin: `${spacing[2]} 0 0 0`,
          paddingLeft: spacing[4],
          fontSize: typography.fontSize.sm,
          color: vars.textSecondary
        }}>
          <li>Adjust bin resolution slider for coarse or fine-grained view</li>
          <li>Hover over bars to see detailed information</li>
          <li>Click bars to select a value range</li>
          <li>Use "Zoom to Clustering" to focus on areas with high contract density</li>
          <li>Adjust zoom sliders to explore specific value ranges</li>
        </ul>
      </div>
    </div>
  )
}
