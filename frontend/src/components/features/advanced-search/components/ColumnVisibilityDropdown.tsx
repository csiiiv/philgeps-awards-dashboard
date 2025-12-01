import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { getThemeVars } from '../../../../design-system/theme'
import { typography, spacing, commonStyles } from '../../../../design-system'
import { useColumnVisibility, type ColumnDefinition } from '../../../../hooks/useColumnVisibility'

export interface ColumnVisibilityDropdownProps {
  columns?: ColumnDefinition[]
  isDark?: boolean
}

export const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({
  columns,
  isDark = false
}) => {
  const { isDark: themeIsDark } = useTheme()
  const actualIsDark = isDark !== undefined ? isDark : themeIsDark
  const vars = getThemeVars(actualIsDark)
  
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const {
    visibility,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetToDefaults
  } = useColumnVisibility(columns)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: vars.background.secondary,
    border: `1px solid ${vars.border.medium}`,
    borderRadius: spacing[2],
    color: vars.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none' as const
  }

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: vars.background.tertiary,
    borderColor: vars.border.medium,
    transform: 'translateY(-1px)'
  }

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: spacing[2],
    backgroundColor: vars.background.primary,
    border: `1px solid ${vars.border.medium}`,
    borderRadius: spacing[2],
    boxShadow: commonStyles.shadow.md,
    minWidth: '220px',
    maxWidth: '300px',
    zIndex: 1000,
    overflow: 'hidden'
  }

  const dropdownHeaderStyle: React.CSSProperties = {
    padding: `${spacing[3]} ${spacing[4]}`,
    borderBottom: `1px solid ${vars.border.light}`,
    backgroundColor: vars.background.secondary
  }

  const dropdownTitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: vars.text.primary,
    margin: 0
  }

  const dropdownContentStyle: React.CSSProperties = {
    padding: spacing[2],
    maxHeight: '400px',
    overflowY: 'auto' as const
  }

  const checkboxItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[2]} ${spacing[3]}`,
    borderRadius: spacing[1],
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    userSelect: 'none' as const
  }

  const checkboxItemHoverStyle: React.CSSProperties = {
    backgroundColor: vars.background.tertiary
  }

  const checkboxStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: vars.primary[600]
  }

  const labelStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: vars.text.primary,
    cursor: 'pointer',
    flex: 1
  }

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    padding: `${spacing[2]} ${spacing[3]}`,
    borderTop: `1px solid ${vars.border.light}`,
    backgroundColor: vars.background.secondary
  }

  const actionButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: `${spacing[1]} ${spacing[2]}`,
    backgroundColor: 'transparent',
    border: `1px solid ${vars.border.medium}`,
    borderRadius: spacing[1],
    color: vars.text.secondary,
    fontSize: typography.fontSize.xs,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }

  const actionButtonHoverStyle: React.CSSProperties = {
    backgroundColor: vars.background.tertiary,
    borderColor: vars.border.medium,
    color: vars.text.primary
  }

  const visibleCount = Object.values(visibility).filter(v => v).length
  const totalCount = Object.keys(visibility).length

  return (
    <div style={{ position: 'relative' as const }} ref={dropdownRef}>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, buttonHoverStyle)
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, buttonStyle)
        }}
        aria-label="Column visibility options"
        aria-expanded={isOpen}
      >
        <span>👁️</span>
        <span>Columns</span>
        <span style={{ 
          fontSize: typography.fontSize.xs, 
          color: vars.text.secondary,
          marginLeft: spacing[1]
        }}>
          ({visibleCount}/{totalCount})
        </span>
        <span style={{ marginLeft: 'auto' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <div style={dropdownHeaderStyle}>
            <h3 style={dropdownTitleStyle}>Show/Hide Columns</h3>
          </div>
          
          <div style={dropdownContentStyle}>
            {columns?.map((column) => {
              const isVisible = visibility[column.key] !== false
              return (
                <div
                  key={column.key}
                  style={checkboxItemStyle}
                  onClick={() => toggleColumn(column.key)}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, checkboxItemHoverStyle)
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, checkboxItemStyle)
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleColumn(column.key)}
                    onClick={(e) => e.stopPropagation()}
                    style={checkboxStyle}
                    aria-label={`Toggle ${column.label} column`}
                  />
                  <label style={labelStyle}>
                    {column.label}
                  </label>
                </div>
              )
            })}
          </div>

          <div style={actionsStyle}>
            <button
              type="button"
              style={actionButtonStyle}
              onClick={showAllColumns}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, actionButtonHoverStyle)
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, actionButtonStyle)
              }}
            >
              Show All
            </button>
            <button
              type="button"
              style={actionButtonStyle}
              onClick={resetToDefaults}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, actionButtonHoverStyle)
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, actionButtonStyle)
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

