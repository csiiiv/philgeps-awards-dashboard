import React from 'react'
import { getThemeColors } from '../../../design-system/theme'
import { typography, spacing } from '../../../design-system'

export interface FilterChipProps {
  label: string
  value: string
  type: 'contractor' | 'area' | 'organization' | 'category' | 'keyword' | 'timerange' | 'date'
  onRemove: () => void
  isDark?: boolean
}

const FilterChip: React.FC<FilterChipProps> = ({ 
  label, 
  value, 
  type, 
  onRemove, 
  isDark = false 
}) => {
  const themeColors = getThemeColors(isDark)
  
  const getChipStyle = (type: string) => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      padding: `${spacing[1]} ${spacing[3]}`,
      borderRadius: spacing[2],
      fontSize: typography.fontSize.sm,
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      maxWidth: '200px'
    }

    switch (type) {
      case 'contractor':
        return {
          ...baseStyle,
          backgroundColor: themeColors.primary[100],
          color: themeColors.primary[800],
          borderColor: themeColors.primary[300]
        }
      case 'area':
        return {
          ...baseStyle,
          backgroundColor: themeColors.success[50],
          color: themeColors.success[600],
          borderColor: themeColors.success[500]
        }
      case 'organization':
        return {
          ...baseStyle,
          backgroundColor: themeColors.warning[50],
          color: themeColors.warning[600],
          borderColor: themeColors.warning[500]
        }
      case 'category':
        return {
          ...baseStyle,
          backgroundColor: themeColors.primary[50],
          color: themeColors.primary[600],
          borderColor: themeColors.primary[500]
        }
      case 'keyword':
        return {
          ...baseStyle,
          backgroundColor: themeColors.secondary[50],
          color: themeColors.secondary[600],
          borderColor: themeColors.secondary[500]
        }
      case 'timerange':
        return {
          ...baseStyle,
          backgroundColor: themeColors.gray[100],
          color: themeColors.gray[700],
          borderColor: themeColors.gray[400]
        }
      case 'date':
        return {
          ...baseStyle,
          backgroundColor: themeColors.warning[50],
          color: themeColors.warning[700],
          borderColor: themeColors.warning[400]
        }
      default:
        return {
          ...baseStyle,
          backgroundColor: themeColors.gray[100],
          color: themeColors.gray[700],
          borderColor: themeColors.gray[400]
        }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'contractor': return '👤'
      case 'area': return '📍'
      case 'organization': return '🏢'
      case 'category': return '📂'
      case 'keyword': return '🔍'
      case 'timerange': return '📅'
      case 'date': return '📅'
      default: return '🏷️'
    }
  }

  return (
    <div
      style={getChipStyle(type)}
      onClick={onRemove}
      title={`Remove ${label}`}
    >
      <span style={{ marginRight: spacing[1] }}>
        {getIcon(type)}
      </span>
      <span style={{ 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap',
        flex: 1
      }}>
        {label}
      </span>
      <span style={{ 
        marginLeft: spacing[1], 
        fontSize: typography.fontSize.xs,
        opacity: 0.7
      }}>
        ×
      </span>
    </div>
  )
}

export { FilterChip }
