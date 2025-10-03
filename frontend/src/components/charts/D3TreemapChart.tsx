import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
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
    contractDetails?: any[]
  }>
}

export interface D3TreemapChartProps {
  data: TreemapData
  title: string
  height?: number
  className?: string
  hierarchy: string[]
  currentLevel: number
  onDrillDown: (entity: { id: string; name: string; type: string }) => void
  onDrillUp?: () => void
  onContractClick?: (contract: any) => void
}

export const D3TreemapChart: React.FC<D3TreemapChartProps> = ({
  data,
  title,
  height = 400,
  className = '',
  hierarchy,
  currentLevel,
  onDrillDown,
  onDrillUp,
  onContractClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredItem, setHoveredItem] = useState<{ x: number; y: number; text: string } | null>(null)
  const { isDark } = useTheme()
  const themeColors = useMemo(() => getThemeColors(isDark), [isDark])

  // Format value for display
  const formatValue = useCallback((value: number) => {
    if (value >= 1e9) return `₱${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `₱${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `₱${(value / 1e3).toFixed(1)}K`
    return `₱${value.toFixed(0)}`
  }, [])

  // Function to wrap text based on available width
  const wrapText = useCallback((text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    // Estimate character width (rough approximation: fontSize * 0.6)
    const charWidth = fontSize * 0.6
    const maxCharsPerLine = Math.floor(maxWidth / charWidth)

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          // Single word is too long, truncate it
          lines.push(word.substring(0, maxCharsPerLine - 3) + '...')
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }, [])

  // Memoize the color scale to prevent re-creation
  const colorScale = useMemo(() => {
    return d3.scaleOrdinal(d3.schemeCategory10)
  }, [])

  // Memoize the hierarchy data to prevent re-creation
  const hierarchyData = useMemo(() => {
    return data.entities.map((entity, index) => ({
      name: entity.name,
      value: entity.value,
      count: entity.count,
      id: entity.id || `entity_${index}`,
      contractDetails: entity.contractDetails
    }))
  }, [data.entities])

  // Memoize event handlers to prevent re-creation
  const handleClick = useCallback((event: MouseEvent, d: any) => {
    if (data.level === 'contracts' && onContractClick) {
      onContractClick(d.data)
    } else {
      onDrillDown({
        id: d.data.id || d.data.name,
        name: d.data.name,
        type: hierarchy[currentLevel] || 'unknown'
      })
    }
  }, [data.level, currentLevel, hierarchy, onContractClick, onDrillDown])

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
      children: hierarchyData
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

    // Add text labels with wrapping and value positioning
    const textGroups = cells.append('g')
      .attr('transform', d => `translate(${(d.x1 - d.x0) / 2}, ${(d.y1 - d.y0) / 2})`)

    textGroups.each(function(d: any) {
      const group = d3.select(this)
      const rectWidth = d.x1 - d.x0
      const rectHeight = d.y1 - d.y0
      const fontSize = Math.max(8, Math.min(14, Math.min(rectWidth, rectHeight) / 8))
      const valueFontSize = Math.max(6, Math.min(10, Math.min(rectWidth, rectHeight) / 12))
      
      // Only show text if rectangle is large enough
      if (rectHeight > 30 && rectWidth > 60) {
        const wrappedLines = wrapText(d.data.name, rectWidth - 8, fontSize) // 8px padding
        
        // Limit to 3 lines maximum
        const linesToShow = wrappedLines.slice(0, 3)
        const lineHeight = fontSize + 2
        const totalLabelHeight = linesToShow.length * lineHeight
        
        // Position label text above center
        const labelStartY = -totalLabelHeight / 2 - 6 // 6px gap from center
        
        linesToShow.forEach((line, index) => {
          group.append('text')
            .attr('x', 0)
            .attr('y', labelStartY + index * lineHeight)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', themeColors.text.inverse)
            .attr('font-size', fontSize + 'px')
            .attr('font-weight', '600')
            .style('pointer-events', 'none')
            .style('user-select', 'none')
            .text(line)
        })
        
        // Add value text below the label text
        if (rectHeight > 50 && rectWidth > 80) {
          const valueY = labelStartY + totalLabelHeight + 8 // 8px gap after label text
          
          group.append('text')
            .attr('x', 0)
            .attr('y', valueY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', themeColors.text.inverse)
            .attr('font-size', valueFontSize + 'px')
            .attr('font-weight', '400')
            .style('pointer-events', 'none')
            .style('user-select', 'none')
            .text(formatValue(d.data.value))
        }
      }
    })

    // Hover effects
    const handleMouseOver = (event: MouseEvent, d: any) => {
      const rect = (event.target as Element).getBoundingClientRect()
      
      let tooltipText = ''
      
      if (data.level === 'contracts' && d.data.contractDetails) {
        // Show detailed contract information
        const contract = d.data.contractDetails[0] // Get first contract for details
        tooltipText = [
          `Award Date: ${contract.award_date || 'N/A'}`,
          `Award Title: ${contract.award_title || 'N/A'}`,
          `Notice Title: ${contract.notice_title || 'N/A'}`,
          `Contractor: ${contract.awardee_name || 'N/A'}`,
          `Organization: ${contract.organization_name || 'N/A'}`,
          `Category: ${contract.business_category || 'N/A'}`,
          `Area: ${contract.area_of_delivery || 'N/A'}`,
          `Value: ${formatValue(d.data.value)}`
        ].join('\n')
      } else {
        // Show simple entity information
        tooltipText = `${d.data.name}: ${formatValue(d.data.value)}`
      }
      
      setHoveredItem({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        text: tooltipText
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

    // Add event listeners
    rects
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleClick)

    // Debug logs removed to prevent continuous re-rendering

  }, [hierarchyData, themeColors, hierarchy, currentLevel, handleClick, colorScale, data.level, formatValue])

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing[4],
          padding: `0 ${spacing[2]}`
        }}>
          <button
            onClick={onDrillUp}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: themeColors.background.secondary,
              color: themeColors.text.primary,
              border: `1px solid ${themeColors.border.medium}`,
              borderRadius: spacing[1],
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}
          >
            ← Back
          </button>
          
          <div style={{
            fontSize: typography.fontSize.sm,
            color: themeColors.text.secondary
          }}>
            Level {currentLevel + 1} of {hierarchy.length}
          </div>
        </div>
      )}

      {/* Treemap Container */}
      <div style={{
        position: 'relative',
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
        
        {/* Tooltip */}
        {hoveredItem && (
          <div style={{
            position: 'absolute',
            left: hoveredItem.x,
            top: hoveredItem.y,
            backgroundColor: themeColors.background.primary,
            color: themeColors.text.primary,
            padding: `${spacing[2]} ${spacing[3]}`,
            borderRadius: spacing[1],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            boxShadow: `0 4px 12px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
            border: `1px solid ${themeColors.border.medium}`,
            pointerEvents: 'none',
            zIndex: 1000,
            transform: 'translate(-50%, -100%)',
            maxWidth: '300px',
            whiteSpace: 'pre-line',
            lineHeight: '1.4'
          }}>
            {hoveredItem.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: spacing[4],
        padding: `0 ${spacing[2]}`,
        fontSize: typography.fontSize.sm,
        color: themeColors.text.secondary
      }}>
        <div style={{ marginBottom: spacing[2] }}>
          <strong>Total Entities:</strong> {data.entities.length}
        </div>
        <div style={{ marginBottom: spacing[2] }}>
          <strong>Total Value:</strong> {formatValue(data.entities.reduce((sum, entity) => sum + entity.value, 0))}
        </div>
        <div>
          <strong>Total Count:</strong> {data.entities.reduce((sum, entity) => sum + entity.count, 0).toLocaleString()}
        </div>
      </div>
    </div>
  )
}