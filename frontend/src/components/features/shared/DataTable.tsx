import React, { useState, useCallback, useMemo } from 'react'
import { getThemeColors } from '../../../design-system/theme'
import { typography, spacing } from '../../../design-system'

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string | number
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  error?: any
  totalCount?: number
  pageSize?: number
  currentPage?: number
  totalPages?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void
  onRowClick?: (item: T, index: number) => void
  emptyMessage?: string
  isDark?: boolean
  className?: string
  showPagination?: boolean
  showPageSizeControl?: boolean
  pageSizeOptions?: number[]
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  totalCount = 0,
  pageSize = 20,
  currentPage = 1,
  totalPages = 1,
  sortBy = '',
  sortDirection = 'desc',
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRowClick,
  emptyMessage = 'No data available',
  isDark = false,
  className = '',
  showPagination = true,
  showPageSizeControl = true,
  pageSizeOptions = [10, 20, 50, 100]
}: DataTableProps<T>) => {
  const theme = getThemeColors(isDark)

  const handleSort = useCallback((field: string) => {
    if (!onSortChange) return
    
    const newDirection = sortBy === field && sortDirection === 'desc' ? 'asc' : 'desc'
    onSortChange(field, newDirection)
  }, [sortBy, sortDirection, onSortChange])

  const getSortIcon = useCallback((field: string) => {
    if (sortBy !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }, [sortBy, sortDirection])

  const renderCell = useCallback((column: Column<T>, item: T, index: number) => {
    const value = column.key.includes('.') 
      ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
      : item[column.key as keyof T]

    if (column.render) {
      return column.render(value, item, index)
    }

    return value?.toString() || ''
  }, [])

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: typography.fontSize.sm,
    color: theme.text.primary
  }

  const thStyle = {
    padding: spacing[3],
    textAlign: 'left' as const,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary,
    backgroundColor: theme.background.secondary,
    borderBottom: `2px solid ${theme.border.medium}`,
    cursor: 'pointer',
    userSelect: 'none' as const,
    position: 'sticky' as const,
    top: 0,
    zIndex: 1
  }

  const getTdStyle = (column: Column<T>) => ({
    padding: spacing[3],
    borderBottom: `1px solid ${theme.border.light}`,
    color: theme.text.primary,
    wordWrap: 'break-word' as const,
    wordBreak: 'break-word' as const,
    whiteSpace: 'normal' as const,
    maxWidth: column.align === 'right' ? '150px' : '300px', // Smaller max width for right-aligned columns (usually currency)
    backgroundColor: 'inherit' // Ensure background color is inherited from row
  })

  const rowStyle = (index: number) => ({
    backgroundColor: index % 2 === 0 
      ? theme.background.primary 
      : theme.background.secondary,
    cursor: onRowClick ? 'pointer' : 'default',
    transition: 'background-color 0.2s ease'
  })

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
    color: theme.text.secondary
  }

  const emptyStyle = {
    textAlign: 'center' as const,
    padding: spacing[8],
    color: theme.text.secondary,
    fontStyle: 'italic' as const
  }

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing[4]}`,
    backgroundColor: theme.background.secondary,
    borderTop: `1px solid ${theme.border.light}`
  }

  const buttonStyle = (disabled: boolean = false) => ({
    padding: `${spacing[2]} ${spacing[3]}`,
    border: `1px solid ${theme.border.medium}`,
    borderRadius: spacing[1],
    backgroundColor: disabled ? theme.background.tertiary : 'transparent',
    color: disabled ? theme.text.secondary : theme.text.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: typography.fontSize.sm,
    margin: `0 ${spacing[1]}`,
    transition: 'all 0.2s ease',
    ':hover': disabled ? {} : {
      backgroundColor: theme.background.tertiary,
      borderColor: theme.border.dark
    }
  })

  const selectStyle = {
    padding: `${spacing[1]} ${spacing[2]}`,
    border: `1px solid ${theme.border.medium}`,
    borderRadius: spacing[1],
    backgroundColor: theme.background.primary,
    color: theme.text.primary,
    fontSize: typography.fontSize.sm,
    marginLeft: spacing[2]
  }

  if (loading) {
    return (
      <div className={className}>
        <div style={loadingStyle}>
          <div>Loading data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <div style={emptyStyle}>
          Error: {error.message || 'Failed to load data'}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Table */}
      <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  style={{
                    ...thStyle,
                    textAlign: column.align || 'left',
                    width: column.width
                  }}
                  onClick={() => column.sortable && onSortChange ? handleSort(column.key as string) : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                    {column.label}
                    {column.sortable && (
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon(column.key as string)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={emptyStyle}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  style={rowStyle(index)}
                  onClick={() => onRowClick?.(item, index)}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = theme.background.tertiary
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 
                        ? theme.background.primary 
                        : theme.background.secondary
                    }
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        ...getTdStyle(column),
                        textAlign: column.align || 'left'
                      }}
                    >
                      {renderCell(column, item, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div style={paginationStyle}>
          <div style={{ color: theme.text.secondary, fontSize: typography.fontSize.sm }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} entries
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            {showPageSizeControl && onPageSizeChange && (
              <>
                <label style={{ color: theme.text.secondary, fontSize: typography.fontSize.sm }}>
                  Per page:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                  style={selectStyle}
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </>
            )}
            
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              style={buttonStyle(currentPage <= 1)}
            >
              Previous
            </button>
            
            <span style={{ color: theme.text.secondary, fontSize: typography.fontSize.sm }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              style={buttonStyle(currentPage >= totalPages)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
