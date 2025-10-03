import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeColors } from '../../design-system/theme'
import { spacing, typography } from '../../design-system'

// Types
export interface TreemapData {
  level: 'grouping' | 'sub-grouping' | 'contracts'
  entities: Array<{
    id: string
    name: string
    value: number
    count: number
    // For contracts level:
    contractDetails?: {
      amount: number
      date: string
      description: string
      contractor: string
    }
  }>
}

export interface TreemapChartProps {
  data: TreemapData
  hierarchy: string[]
  currentLevel: number
  onDrillDown: (entity: { id: string; name: string; type: string }) => void
  onDrillUp: () => void
  onContractClick?: (contract: any) => void
  title?: string
  height?: number
  className?: string
}

export const D3TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  hierarchy,
  currentLevel,
  onDrillDown,
  onDrillUp,
  onContractClick,
  title = 'Treemap Visualization',
  height = 400,
  className = ''
}) => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredItem, setHoveredItem] = useState<{ x: number; y: number; text: string } | null>(null)

  // Color scale
  const colorScale = d3.scaleOrdinal<string>()
    .domain(data.entities.map((_, i) => i.toString()))
    .range(isDark 
      ? [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ]
      : [
          '#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED',
          '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
        ]
    )

  // Format value helper
  const formatValue = (value: number) => {
    if (value >= 1e9) return `₱${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `₱${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `₱${(value / 1e3).toFixed(1)}K`
    return `₱${value.toFixed(0)}`
  }

  // Render treemap using D3
  useEffect(() => {
    if (!svgRef.current || !data.entities.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous content

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Create hierarchy data for D3
    const root = d3.hierarchy({
      name: 'root',
      children: data.entities.map(entity => ({
        name: entity.name,
        value: entity.value,
        count: entity.count,
        id: entity.id,
        contractDetails: entity.contractDetails
      }))
    })
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    // Create treemap layout
    const treemap = d3.treemap<any>()
      .size([width, height])
      .padding(2)
      .round(true)

    treemap(root)

    // Create groups for each rectangle
    const cells = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)

    // Add rectangles
    const rects = cells.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', (d, i) => colorScale(i.toString()))
      .attr('stroke', themeColors.border.medium)
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .style('pointer-events', 'all') // Ensure rectangles can receive events

    // Add text labels
    const texts = cells.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 - 6)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', themeColors.text.inverse)
      .attr('font-size', d => {
        const size = Math.min(d.x1 - d.x0, d.y1 - d.y0)
        return Math.max(8, Math.min(14, size / 8)) + 'px'
      })
      .attr('font-weight', '600')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => {
        const maxLength = Math.floor((d.x1 - d.x0) / 8)
        return d.data.name.length > maxLength 
          ? d.data.name.substring(0, maxLength) + '...'
          : d.data.name
      })

    // Add value labels
    const valueTexts = cells.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 + 10)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', themeColors.text.inverse)
      .attr('font-size', d => {
        const size = Math.min(d.x1 - d.x0, d.y1 - d.y0)
        return Math.max(6, Math.min(10, size / 12)) + 'px'
      })
      .attr('font-weight', '400')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => formatValue(d.data.value))

    // Only show value text if rectangle is large enough
    valueTexts.style('display', d => (d.y1 - d.y0) > 40 ? 'block' : 'none')

    // Hover effects
    const handleMouseOver = (event: MouseEvent, d: any) => {
      const rect = (event.target as Element).getBoundingClientRect()
      setHoveredItem({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        text: `${d.data.name}: ${formatValue(d.data.value)}`
      })

      d3.select(event.target as Element)
        .attr('stroke-width', 2)
        .attr('fill', d3.color(colorScale(d.data.id))?.brighter(0.2)?.toString() || colorScale(d.data.id))
    }

    const handleMouseOut = (event: MouseEvent, d: any) => {
      setHoveredItem(null)
      
      d3.select(event.target as Element)
        .attr('stroke-width', 1)
        .attr('fill', colorScale(d.data.id))
    }

    const handleClick = (event: MouseEvent, d: any) => {
      console.log('Click event fired!', d) // Debug log
      console.log('Data level:', data.level)
      console.log('Current level:', currentLevel)
      console.log('Hierarchy:', hierarchy)
      
      if (data.level === 'contracts' && onContractClick) {
        console.log('Calling onContractClick')
        onContractClick(d.data)
      } else {
        console.log('Calling onDrillDown')
        onDrillDown({
          id: d.data.id || d.data.name,
          name: d.data.name,
          type: hierarchy[currentLevel] || 'unknown'
        })
      }
    }

    // Add event listeners
    rects
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleClick)

    // Debug: Log the data structure
    console.log('Treemap data:', data)
    console.log('Root leaves:', root.leaves())

  }, [data, isDark, themeColors, hierarchy, currentLevel, onDrillDown, onContractClick, colorScale])

  return (
    <div className={className} style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
        padding: `0 ${spacing[2]}`
      }}>
        <h3 style={{
          ...typography.textStyles.h3,
          color: themeColors.text.primary,
          margin: 0
        }}>
          {title}
        </h3>
        
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          fontSize: typography.fontSize.sm,
          color: themeColors.text.secondary
        }}>
          {hierarchy.slice(0, currentLevel + 1).map((level, index) => (
            <React.Fragment key={index}>
              <span style={{
                textTransform: 'capitalize',
                fontWeight: index === currentLevel ? typography.fontWeight.semibold : typography.fontWeight.normal
              }}>
                {level}
              </span>
              {index < currentLevel && <span>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {currentLevel > 0 && (
        <div style={{
          marginBottom: spacing[4],
          display: 'flex',
          gap: spacing[2]
        }}>
          <button
            onClick={onDrillUp}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: themeColors.primary[600],
              color: themeColors.text.inverse,
              border: 'none',
              borderRadius: spacing[1],
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.primary[700]
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.primary[600]
            }}
          >
            ← Back to {hierarchy[currentLevel - 1]}
          </button>
        </div>
      )}

      {/* Treemap SVG */}
      <div style={{
        width: '100%',
        height: height,
        backgroundColor: themeColors.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${themeColors.border.medium}`,
        overflow: 'hidden'
      }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        />
      </div>

      {/* Legend/Info */}
      <div style={{
        marginTop: spacing[4],
        padding: spacing[3],
        backgroundColor: themeColors.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${themeColors.border.medium}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: typography.fontSize.sm,
          color: themeColors.text.secondary
        }}>
          <span>
            {data.entities.length} {hierarchy[currentLevel] || 'items'} • 
            Total: {formatValue(data.entities.reduce((sum, item) => sum + item.value, 0))}
          </span>
          <span>
            {data.level === 'contracts' ? 'Click items to view details' : 'Click items to drill down'}
          </span>
        </div>
      </div>

      {/* Tooltip for hover */}
      {hoveredItem && (
        <div
          style={{
            position: 'fixed',
            left: hoveredItem.x,
            top: hoveredItem.y,
            transform: 'translateX(-50%)',
            backgroundColor: themeColors.background.primary,
            color: themeColors.text.primary,
            padding: `${spacing[2]} ${spacing[3]}`,
            borderRadius: spacing[1],
            border: `1px solid ${themeColors.border.medium}`,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {hoveredItem.text}
        </div>
      )}
    </div>
  )
}
