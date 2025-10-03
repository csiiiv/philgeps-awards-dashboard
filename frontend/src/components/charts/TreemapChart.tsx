import React, { useRef, useEffect, useState } from 'react'
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

export const TreemapChart: React.FC<TreemapChartProps> = ({
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
  const [, setHoveredItem] = useState<string | null>(null)

  // Calculate treemap layout using improved algorithm
  const calculateTreemapLayout = (items: TreemapData['entities'], width: number, height: number) => {
    if (items.length === 0) return []

    // Sort by value descending
    const sortedItems = [...items].sort((a, b) => b.value - a.value)
    const totalValue = sortedItems.reduce((sum, item) => sum + item.value, 0)

    const rectangles: Array<{
      x: number
      y: number
      width: number
      height: number
      data: typeof items[0]
    }> = []

    // Use a more sophisticated layout that creates better-sized rectangles
    const padding = 2
    const minRectSize = 60 // Minimum rectangle size for readability
    
    if (sortedItems.length === 1) {
      // Single item takes full space
      rectangles.push({
        x: padding,
        y: padding,
        width: width - 2 * padding,
        height: height - 2 * padding,
        data: sortedItems[0]
      })
    } else if (sortedItems.length <= 4) {
      // 2x2 grid for small datasets
      const cols = 2
      const rows = Math.ceil(sortedItems.length / cols)
      const cellWidth = (width - padding * (cols + 1)) / cols
      const cellHeight = (height - padding * (rows + 1)) / rows

      sortedItems.forEach((item, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols
        rectangles.push({
          x: padding + col * (cellWidth + padding),
          y: padding + row * (cellHeight + padding),
          width: cellWidth,
          height: cellHeight,
          data: item
        })
      })
    } else {
      // Use a more sophisticated layout for larger datasets
      // Calculate optimal grid based on data size and aspect ratio
      const aspectRatio = width / height
      let cols = Math.ceil(Math.sqrt(sortedItems.length * aspectRatio))
      let rows = Math.ceil(sortedItems.length / cols)
      
      // Ensure we don't have too many rows (max 6 for readability)
      if (rows > 6) {
        rows = 6
        cols = Math.ceil(sortedItems.length / rows)
      }
      
      const cellWidth = (width - padding * (cols + 1)) / cols
      const cellHeight = (height - padding * (rows + 1)) / rows

      sortedItems.forEach((item, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols
        
        // Calculate proportional height based on value, but with better constraints
        const itemValue = item.value
        const maxHeight = cellHeight * 1.2 // Allow rectangles to be 20% taller than cell
        const minHeight = Math.max(cellHeight * 0.3, minRectSize) // Minimum 30% of cell height
        
        const proportionalHeight = Math.max(
          minHeight,
          Math.min(
            maxHeight,
            (itemValue / totalValue) * height * 0.6 // Use 60% of total height for proportional sizing
          )
        )
        
        rectangles.push({
          x: padding + col * (cellWidth + padding),
          y: padding + row * (cellHeight + padding),
          width: cellWidth,
          height: proportionalHeight,
          data: item
        })
      })
    }

    return rectangles
  }

  // Render treemap
  useEffect(() => {
    if (!svgRef.current || !data.entities.length) return

    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Clear previous content
    svg.innerHTML = ''

    const rectangles = calculateTreemapLayout(data.entities, width, height)

    rectangles.forEach((rect, index) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      
      const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rectElement.setAttribute('x', rect.x.toString())
      rectElement.setAttribute('y', rect.y.toString())
      rectElement.setAttribute('width', rect.width.toString())
      rectElement.setAttribute('height', rect.height.toString())
      rectElement.setAttribute('fill', getColorForIndex(index, isDark))
      rectElement.setAttribute('stroke', themeColors.border.medium)
      rectElement.setAttribute('stroke-width', '1')
      rectElement.setAttribute('rx', '4')
      rectElement.setAttribute('ry', '4')
      rectElement.style.cursor = 'pointer'
      rectElement.style.transition = 'all 0.2s ease'

      // Hover effects
      rectElement.addEventListener('mouseenter', () => {
        setHoveredItem(rect.data.id)
        rectElement.setAttribute('fill', getColorForIndex(index, isDark, true))
        rectElement.setAttribute('stroke-width', '2')
      })

      rectElement.addEventListener('mouseleave', () => {
        setHoveredItem(null)
        rectElement.setAttribute('fill', getColorForIndex(index, isDark))
        rectElement.setAttribute('stroke-width', '1')
      })

      // Click handler
      rectElement.addEventListener('click', () => {
        if (data.level === 'contracts' && onContractClick) {
          onContractClick(rect.data)
        } else {
          onDrillDown({
            id: rect.data.id,
            name: rect.data.name,
            type: hierarchy[currentLevel] || 'unknown'
          })
        }
      })

      // Add text label with better sizing and positioning
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', (rect.x + rect.width / 2).toString())
      text.setAttribute('y', (rect.y + rect.height / 2 - 8).toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'middle')
      text.setAttribute('fill', themeColors.text.inverse)
      
      // Better font sizing based on rectangle size
      const fontSize = Math.max(10, Math.min(16, Math.min(rect.width, rect.height) / 6))
      text.setAttribute('font-size', fontSize + 'px')
      text.setAttribute('font-weight', '600')
      text.style.pointerEvents = 'none'
      text.style.userSelect = 'none'

      // Truncate text more intelligently
      const maxLength = Math.floor(rect.width / (fontSize * 0.6))
      const displayText = rect.data.name.length > maxLength 
        ? rect.data.name.substring(0, maxLength) + '...'
        : rect.data.name

      text.textContent = displayText

      // Add value label with better positioning
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      valueText.setAttribute('x', (rect.x + rect.width / 2).toString())
      valueText.setAttribute('y', (rect.y + rect.height / 2 + 12).toString())
      valueText.setAttribute('text-anchor', 'middle')
      valueText.setAttribute('dominant-baseline', 'middle')
      valueText.setAttribute('fill', themeColors.text.inverse)
      
      const valueFontSize = Math.max(8, Math.min(12, fontSize * 0.8))
      valueText.setAttribute('font-size', valueFontSize + 'px')
      valueText.setAttribute('font-weight', '400')
      valueText.style.pointerEvents = 'none'
      valueText.style.userSelect = 'none'

      const formattedValue = formatValue(rect.data.value)
      valueText.textContent = formattedValue

      group.appendChild(rectElement)
      group.appendChild(text)
      group.appendChild(valueText)
      svg.appendChild(group)
    })
  }, [data, isDark, themeColors, hierarchy, currentLevel, onDrillDown, onContractClick])

  // Color generation
  const getColorForIndex = (index: number, isDark: boolean, hovered = false) => {
    const colors = isDark 
      ? [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ]
      : [
          '#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED',
          '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
        ]
    
    const baseColor = colors[index % colors.length]
    return hovered ? lightenColor(baseColor, 20) : baseColor
  }

  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }

  const formatValue = (value: number) => {
    if (value >= 1e9) return `₱${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `₱${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `₱${(value / 1e3).toFixed(1)}K`
    return `₱${value.toFixed(0)}`
  }

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
    </div>
  )
}
