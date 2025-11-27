import React, { useState, useEffect, useMemo } from 'react'
import { spacing, typography } from '../../../design-system'
import { getThemeVars } from '../../../design-system/theme'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ErrorDisplay } from '../shared/ErrorDisplay'
import { Modal } from '../shared/Modal'
import { ContractsTable } from '../shared/ContractsTable'
import { UnifiedPagination } from '../shared/UnifiedPagination'
import { advancedSearchService, type ValueDistributionResponse, type ChipSearchParams } from '../../../services/AdvancedSearchService'

interface ThresholdClusteringProps {
  currentFilters?: ChipSearchParams
  isDark?: boolean
}

interface InfoWindow {
  id: string
  bin_start: number
  bin_end: number
  count: number
  total_value: number
  avg_value: number
  position: { x: number; y: number }
  color: string // Unique color for this window/bar pair
}

// Color palette for bar-window pairs (20 distinct colors, avoiding default blue tones)
const TOOLTIP_COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
  '#a855f7', // purple
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#d946ef', // fuchsia
  '#22c55e', // green
  '#fb923c', // orange-400
  '#6366f1', // indigo
  '#e11d48', // rose-600
  '#0ea5e9', // sky
  '#a3e635', // lime-400
  '#c026d3', // fuchsia-600
]

export const ThresholdClustering: React.FC<ThresholdClusteringProps> = ({
  currentFilters,
  isDark = false
}) => {
  const vars = getThemeVars()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<ValueDistributionResponse | null>(null)
  const [displayBins, setDisplayBins] = useState(100) // Client-side bin count
  const [zoomStart, setZoomStart] = useState(0)
  const [zoomEnd, setZoomEnd] = useState(100)
  const [selectedBinRange, setSelectedBinRange] = useState<{ start: number; end: number } | null>(null)
  const [infoWindows, setInfoWindows] = useState<InfoWindow[]>([])
  const [draggingWindow, setDraggingWindow] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Drilldown modal state
  const [drilldownModal, setDrilldownModal] = useState<{
    open: boolean
    filters: ChipSearchParams | null
    color: string | null
  }>({ open: false, filters: null, color: null })
  const [drilldownContracts, setDrilldownContracts] = useState<any[]>([])
  const [drilldownLoading, setDrilldownLoading] = useState(false)
  const [drilldownPagination, setDrilldownPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [drilldownSort, setDrilldownSort] = useState({
    key: 'contract_amount' as string,
    direction: 'desc' as 'asc' | 'desc'
  })

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
    const targetBins = Math.min(displayBins, rawBins.length)
    
    // If we want all bins or more, just return raw bins
    if (targetBins >= rawBins.length) {
      return {
        ...rawData,
        bins: rawBins
      }
    }

    // Combine bins to achieve target count
    // Calculate how many raw bins should go into each output bin
    const combined = []
    const rawBinsPerOutput = rawBins.length / targetBins
    
    for (let i = 0; i < targetBins; i++) {
      // Calculate which raw bins belong to this output bin
      const startIdx = Math.floor(i * rawBinsPerOutput)
      const endIdx = Math.floor((i + 1) * rawBinsPerOutput)
      
      const group = rawBins.slice(startIdx, endIdx)
      if (group.length === 0) continue
      
      const firstBin = group[0]
      const lastBin = group[group.length - 1]
      
      const totalCount = group.reduce((sum, b) => sum + b.count, 0)
      const totalValue = group.reduce((sum, b) => sum + b.total_value, 0)
      
      combined.push({
        bin_number: combined.length + 1,
        bin_start: firstBin.bin_start,
        bin_end: lastBin.bin_end,
        count: totalCount,
        total_value: totalValue,
        avg_value: totalCount > 0 ? totalValue / totalCount : 0
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

  // Handle bar click - toggle tooltip for this bar
  const handleBarClick = (bin: any, event: React.MouseEvent) => {
    // Check if window for this bin already exists
    const existingWindow = infoWindows.find(
      w => w.bin_start === bin.bin_start && w.bin_end === bin.bin_end
    )
    
    if (existingWindow) {
      // Toggle: close the existing window
      closeInfoWindow(existingWindow.id)
      if (selectedBinRange?.start === bin.bin_start && selectedBinRange?.end === bin.bin_end) {
        setSelectedBinRange(null)
      }
      return
    }
    
    // Create new window
    const svgElement = (event.currentTarget as SVGRectElement).ownerSVGElement
    if (!svgElement) return
    
    const chartContainer = svgElement.parentElement
    if (!chartContainer) return
    
    const containerRect = chartContainer.getBoundingClientRect()
    const windowId = `info-${Date.now()}-${Math.random()}`
    
    // Assign color from palette (cycle through colors)
    const colorIndex = infoWindows.length % TOOLTIP_COLORS.length
    const color = TOOLTIP_COLORS[colorIndex]
    
    // Position relative to container, offset from click point
    const relativeX = event.clientX - containerRect.left
    const relativeY = event.clientY - containerRect.top
    
    const newWindow: InfoWindow = {
      id: windowId,
      bin_start: bin.bin_start,
      bin_end: bin.bin_end,
      count: bin.count,
      total_value: bin.total_value,
      avg_value: bin.avg_value,
      position: {
        x: relativeX + 10, // Slight offset from cursor
        y: Math.max(10, relativeY - 120) // Above the cursor, with min margin
      },
      color: color
    }
    
    setInfoWindows(prev => [...prev, newWindow])
    setSelectedBinRange({ start: bin.bin_start, end: bin.bin_end })
  }

  // Handle close info window
  const closeInfoWindow = (id: string) => {
    setInfoWindows(prev => prev.filter(w => w.id !== id))
  }

  // Handle drag start
  const handleDragStart = (id: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDraggingWindow(id)
    
    const chartContainer = document.getElementById('threshold-clustering-chart')
    if (!chartContainer) return
    
    const containerRect = chartContainer.getBoundingClientRect()
    const window = infoWindows.find(w => w.id === id)
    if (window) {
      // Calculate offset relative to container
      const absoluteX = containerRect.left + window.position.x
      const absoluteY = containerRect.top + window.position.y
      setDragOffset({
        x: event.clientX - absoluteX,
        y: event.clientY - absoluteY
      })
    }
  }

  // Handle drag
  useEffect(() => {
    if (!draggingWindow) return

    const chartContainer = document.getElementById('threshold-clustering-chart')
    if (!chartContainer) return

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = chartContainer.getBoundingClientRect()
      
      setInfoWindows(prev => prev.map(w => {
        if (w.id !== draggingWindow) return w
        
        // Convert absolute mouse position to container-relative position
        const newX = e.clientX - dragOffset.x - containerRect.left
        const newY = e.clientY - dragOffset.y - containerRect.top
        
        return { ...w, position: { x: newX, y: newY } }
      }))
    }

    const handleMouseUp = () => {
      setDraggingWindow(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingWindow, dragOffset])

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

  // Handle open drilldown modal with value range
  const handleOpenDrilldown = (binStart: number, binEnd: number, color: string) => {
    // Create filters with the value range from the selected bin
    const drilldownFilters: ChipSearchParams = {
      contractors: currentFilters?.contractors || [],
      areas: currentFilters?.areas || [],
      organizations: currentFilters?.organizations || [],
      businessCategories: currentFilters?.businessCategories || [],
      keywords: currentFilters?.keywords || [],
      timeRanges: currentFilters?.timeRanges || [],
      includeFloodControl: currentFilters?.includeFloodControl || false,
      value_range: {
        min: binStart,
        max: binEnd
      }
    }
    
    setDrilldownModal({
      open: true,
      filters: drilldownFilters,
      color: color
    })
  }

  // Handle close drilldown modal
  const handleCloseDrilldown = () => {
    setDrilldownModal({ open: false, filters: null, color: null })
    setDrilldownContracts([])
    setDrilldownPagination({ page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })
  }

  // Fetch contracts for drilldown
  const fetchDrilldownContracts = async (page: number = 1) => {
    if (!drilldownModal.filters) return

    setDrilldownLoading(true)
    try {
      const params = {
        ...drilldownModal.filters,
        page,
        pageSize: drilldownPagination.pageSize,
        sortBy: drilldownSort.key,
        sortDirection: drilldownSort.direction
      }

      const response = await advancedSearchService.searchContractsWithChips(params)
      setDrilldownContracts(response.data || [])
      if (response.pagination) {
        setDrilldownPagination({
          page: response.pagination.page,
          pageSize: response.pagination.page_size,
          totalCount: response.pagination.total_count,
          totalPages: response.pagination.total_pages
        })
      }
    } catch (err) {
      console.error('Error fetching drilldown contracts:', err)
    } finally {
      setDrilldownLoading(false)
    }
  }

  // Fetch contracts when modal opens or pagination/sort changes
  useEffect(() => {
    if (drilldownModal.open && drilldownModal.filters) {
      fetchDrilldownContracts(drilldownPagination.page)
    }
  }, [drilldownModal.open, drilldownPagination.page, drilldownSort])

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
      <div style={{ padding: spacing[4], textAlign: 'center', color: vars.text.secondary }}>
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
      backgroundColor: vars.background.secondary,
      borderRadius: '8px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[4] }}>
        <h3 style={{ 
          margin: 0,
          marginBottom: spacing[2],
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: vars.text.primary
        }}>
          Value Distribution & Threshold Clustering
        </h3>
        <p style={{ 
          margin: 0,
          fontSize: typography.fontSize.sm,
          color: vars.text.secondary
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
          <div style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary, marginBottom: spacing[1] }}>
            Total Contracts
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.text.primary }}>
            {formatCount(rawData?.total_contracts || 0)}
          </div>
        </div>
        <div style={{ 
          padding: spacing[3],
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary, marginBottom: spacing[1] }}>
            Min Value
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.text.primary }}>
            {formatCurrency(rawData?.min_value || 0)}
          </div>
        </div>
        <div style={{ 
          padding: spacing[3],
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary, marginBottom: spacing[1] }}>
            Max Value
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.text.primary }}>
            {formatCurrency(rawData?.max_value || 0)}
          </div>
        </div>
        <div style={{ 
          padding: spacing[3],
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary, marginBottom: spacing[1] }}>
            Display Bins
          </div>
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: vars.text.primary }}>
            {processedData.num_bins}
          </div>
        </div>
      </div>

      {/* Bin Size Slider */}
      <div style={{ marginBottom: spacing[4] }}>
        <div style={{ 
          fontSize: typography.fontSize.sm,
          color: vars.text.secondary,
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
          color: vars.text.secondary,
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
            backgroundColor: vars.primary[600],
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
            backgroundColor: vars.primary[700],
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
      <div 
        id="threshold-clustering-chart"
        style={{ 
          position: 'relative',
          height: '450px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '4px',
          padding: `${spacing[3]} ${spacing[2]}`,
          overflow: 'visible', // Allow tooltips to overflow
          backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          {/* Y-axis labels */}
          <g>
            {yTicks.map((tick, i) => (
              <g key={i}>
                <text 
                  x="50" 
                  y={380 - (tick / maxCount) * 340} 
                  fill={vars.text.secondary} 
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
              
              // Check if this bin has an associated window
              const associatedWindow = infoWindows.find(
                w => w.bin_start === bin.bin_start && w.bin_end === bin.bin_end
              )
              
              // Use window color if exists, otherwise use default
              const barColor = associatedWindow ? associatedWindow.color : vars.primary[600]
              const barOpacity = associatedWindow ? 1 : 0.7
              
              return (
                <rect
                  key={bin.bin_number}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  opacity={barOpacity}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={(e) => handleBarClick(bin, e as any)}
                />
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
                fill={vars.text.secondary} 
                fontSize="10"
                textAnchor="middle"
              >
                {formatCurrency(tick)}
              </text>
            ))}
          </g>

          {/* Axis labels */}
          <text x="20" y="200" fill={vars.text.secondary} fontSize="11" textAnchor="middle" transform="rotate(-90, 20, 200)">
            Contract Count
          </text>
          <text x="520" y="410" fill={vars.text.secondary} fontSize="11" textAnchor="middle">
            Contract Value Range
          </text>
        </svg>
      </div>

      {/* Zoom slider */}
      <div style={{ marginTop: spacing[4] }}>
        <div style={{ 
          fontSize: typography.fontSize.sm,
          color: vars.text.secondary,
          marginBottom: spacing[2]
        }}>
          Zoom Range: {zoomStart.toFixed(0)}% - {zoomEnd.toFixed(0)}%
        </div>
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
          <span style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
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
          <span style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
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
          border: `2px solid ${vars.primary[700]}`
        }}>
          <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: vars.text.primary, marginBottom: spacing[2] }}>
            Selected Range
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
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
        borderLeft: `4px solid ${vars.primary[600]}`
      }}>
        <div style={{ fontSize: typography.fontSize.sm, color: vars.text.primary }}>
          <strong>How to use:</strong>
        </div>
        <ul style={{ 
          margin: `${spacing[2]} 0 0 0`,
          paddingLeft: spacing[4],
          fontSize: typography.fontSize.sm,
          color: vars.text.secondary
        }}>
          <li>Adjust bin resolution slider for coarse or fine-grained view</li>
          <li><strong>Click bars</strong> to toggle detailed information tooltips</li>
          <li>Each bar gets a unique color when its tooltip is shown</li>
          <li>Open multiple tooltips to compare different value ranges</li>
          <li><strong>Drag tooltips</strong> to reposition them</li>
          <li>Click the same bar again or use ✕ button to close tooltips</li>
          <li>Use "Zoom to Clustering" to focus on areas with high contract density</li>
          <li>Adjust zoom sliders to explore specific value ranges</li>
        </ul>
      </div>

      {/* Draggable Info Tooltips */}
      {infoWindows.map((window) => (
        <div
          key={window.id}
          onMouseDown={(e) => handleDragStart(window.id, e)}
          style={{
            position: 'absolute',
            left: `${window.position.x}px`,
            top: `${window.position.y}px`,
            zIndex: draggingWindow === window.id ? 1001 : 1000,
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            border: `3px solid ${window.color}`,
            borderRadius: spacing[2],
            boxShadow: isDark 
              ? `0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 1px ${window.color}40` 
              : `0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px ${window.color}40`,
            padding: spacing[3],
            minWidth: '220px',
            maxWidth: '280px',
            cursor: draggingWindow === window.id ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeInfoWindow(window.id)
            }}
            style={{
              position: 'absolute',
              top: spacing[1],
              right: spacing[1],
              background: 'none',
              border: 'none',
              color: vars.text.secondary,
              cursor: 'pointer',
              fontSize: typography.fontSize.base,
              lineHeight: 1,
              padding: spacing[1],
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="Close"
          >
            ✕
          </button>

          {/* Tooltip Content */}
          <div style={{ paddingRight: spacing[4] }}>
            {/* Range */}
            <div style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.semibold,
              color: window.color,
              marginBottom: spacing[2]
            }}>
              {formatCurrency(window.bin_start)} - {formatCurrency(window.bin_end)}
            </div>

            {/* Contract Count */}
            <div style={{ marginBottom: spacing[2] }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: vars.text.secondary
              }}>
                Contracts:
              </div>
              <div style={{ 
                fontSize: typography.fontSize.base, 
                fontWeight: typography.fontWeight.bold,
                color: vars.text.primary
              }}>
                {formatCount(window.count)}
              </div>
            </div>

            {/* Total Value */}
            <div style={{ marginBottom: spacing[2] }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: vars.text.secondary
              }}>
                Total Value:
              </div>
              <div style={{ 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium,
                color: vars.text.primary
              }}>
                {formatCurrency(window.total_value)}
              </div>
            </div>

            {/* Average Value */}
            <div style={{ marginBottom: spacing[3] }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: vars.text.secondary
              }}>
                Avg Value:
              </div>
              <div style={{ 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium,
                color: vars.text.primary
              }}>
                {formatCurrency(window.avg_value)}
              </div>
            </div>

            {/* View Contracts Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleOpenDrilldown(window.bin_start, window.bin_end, window.color)
              }}
              style={{
                width: '100%',
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: window.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: spacing[1],
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[1]
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span>📋</span>
              <span>View Contracts ({formatCount(window.count)})</span>
            </button>
          </div>

          {/* Drag hint */}
          <div style={{ 
            fontSize: typography.fontSize.xs, 
            color: vars.text.secondary,
            marginTop: spacing[2],
            paddingTop: spacing[2],
            borderTop: `1px solid ${vars.border.light}`,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Drag to move
          </div>
        </div>
      ))}

      {/* Drilldown Contracts Modal - reuses existing components */}
      {drilldownModal.open && drilldownModal.filters && (
        <Modal
          open={drilldownModal.open}
          onClose={handleCloseDrilldown}
          title={`Contracts in Range: ${formatCurrency(drilldownModal.filters.value_range?.min || 0)} - ${formatCurrency(drilldownModal.filters.value_range?.max || 0)}`}
          isDark={isDark}
          size="xlarge"
        >
          <div style={{ padding: spacing[4] }}>
            {/* Summary */}
            <div style={{ 
              marginBottom: spacing[4],
              padding: spacing[3],
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: spacing[2],
              borderLeft: `4px solid ${drilldownModal.color || vars.primary[600]}`
            }}>
              <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2], color: vars.text.primary }}>
                {drilldownLoading ? 'Loading...' : `Found ${formatCount(drilldownPagination.totalCount)} contracts`}
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
                Contracts with values between {formatCurrency(drilldownModal.filters.value_range?.min || 0)} and {formatCurrency(drilldownModal.filters.value_range?.max || 0)}
              </div>
            </div>

            {/* Contracts Table */}
            <ContractsTable
              contracts={drilldownContracts}
              loading={drilldownLoading}
              totalCount={drilldownPagination.totalCount}
              pageSize={drilldownPagination.pageSize}
              currentPage={drilldownPagination.page}
              totalPages={drilldownPagination.totalPages}
              sortBy={drilldownSort.key}
              sortDirection={drilldownSort.direction}
              onSortChange={(field, direction) => {
                setDrilldownSort({ key: field, direction })
              }}
              onPageChange={(page) => {
                setDrilldownPagination(prev => ({ ...prev, page }))
              }}
              isDark={isDark}
              showPagination={false}
            />

            {/* Unified Pagination */}
            <UnifiedPagination
              currentPage={drilldownPagination.page}
              totalPages={drilldownPagination.totalPages}
              totalCount={drilldownPagination.totalCount}
              pageSize={drilldownPagination.pageSize}
              showingText={`Showing ${((drilldownPagination.page - 1) * drilldownPagination.pageSize) + 1}-${Math.min(drilldownPagination.page * drilldownPagination.pageSize, drilldownPagination.totalCount)} of ${drilldownPagination.totalCount} contracts`}
              onPageChange={(page) => setDrilldownPagination(prev => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setDrilldownPagination(prev => ({ ...prev, pageSize, page: 1 }))}
              onFirstPage={() => setDrilldownPagination(prev => ({ ...prev, page: 1 }))}
              onPreviousPage={() => setDrilldownPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              onNextPage={() => setDrilldownPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              onLastPage={() => setDrilldownPagination(prev => ({ ...prev, page: prev.totalPages }))}
              isDark={isDark}
              variant="minimal"
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
