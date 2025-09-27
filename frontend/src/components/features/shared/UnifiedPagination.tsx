import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeColors } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'

export interface UnifiedPaginationProps {
  // Core pagination data
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  
  // Callbacks
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  
  // Optional callbacks for advanced navigation (analytics style)
  onFirstPage?: () => void
  onPreviousPage?: () => void
  onNextPage?: () => void
  onLastPage?: () => void
  
  // Display options
  showingText?: string
  isDark?: boolean
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  
  // Styling options
  variant?: 'default' | 'analytics' | 'minimal'
  className?: string
}

export const UnifiedPagination: React.FC<UnifiedPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  showingText,
  isDark = false,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 50, 100],
  variant = 'default',
  className
}) => {
  const { isDark: themeIsDark } = useTheme()
  const darkMode = isDark !== undefined ? isDark : themeIsDark
  const theme = getThemeColors(darkMode)

  // Generate showing text if not provided
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)
  const displayShowingText = showingText || `Showing ${startItem}-${endItem} of ${totalCount} results`

  // Navigation state
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage >= totalPages

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('...')
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Handle navigation with fallbacks
  const handleFirstPage = () => {
    if (onFirstPage) {
      onFirstPage()
    } else {
      onPageChange(1)
    }
  }

  const handlePreviousPage = () => {
    if (onPreviousPage) {
      onPreviousPage()
    } else {
      onPageChange(Math.max(1, currentPage - 1))
    }
  }

  const handleNextPage = () => {
    if (onNextPage) {
      onNextPage()
    } else {
      onPageChange(Math.min(totalPages, currentPage + 1))
    }
  }

  const handleLastPage = () => {
    if (onLastPage) {
      onLastPage()
    } else {
      onPageChange(totalPages)
    }
  }

  // Styles based on variant
  const getContainerStyle = () => {
    const baseStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing[4],
      padding: `${spacing[4]} ${spacing[6]}`,
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      borderRadius: spacing[2],
      border: `1px solid ${theme.border.light}`
    }

    if (variant === 'minimal') {
      return {
        ...baseStyle,
        padding: `${spacing[2]} ${spacing[4]}`,
        backgroundColor: 'transparent',
        border: 'none',
        marginTop: spacing[2]
      }
    }

    return baseStyle
  }

  const buttonStyle = (disabled: boolean, isActive = false) => ({
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: disabled 
      ? theme.background.tertiary 
      : isActive 
        ? theme.primary[600] 
        : theme.primary[500],
    color: disabled ? theme.text.secondary : 'white',
    border: 'none',
    borderRadius: spacing[1],
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    minWidth: variant === 'minimal' ? '32px' : '40px',
    height: variant === 'minimal' ? '32px' : 'auto'
  })

  const selectStyle = {
    padding: `${spacing[1]} ${spacing[2]}`,
    backgroundColor: theme.background.primary,
    color: theme.text.primary,
    border: `1px solid ${theme.border.light}`,
    borderRadius: spacing[1],
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    marginLeft: spacing[2]
  }

  // Don't render if only one page
  if (totalPages <= 1) {
    return (
      <div style={getContainerStyle()}>
        <div style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
          {displayShowingText}
        </div>
      </div>
    )
  }

  const pageNumbers = getPageNumbers()

  return (
    <div style={getContainerStyle()} className={className}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
        <div style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
          {displayShowingText}
        </div>
        
        {showPageSizeSelector && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <label style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
              Show:
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={selectStyle}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
        {/* First and Previous buttons */}
        {variant !== 'minimal' && (
          <>
            <button
              onClick={handleFirstPage}
              disabled={isFirstPage}
              style={buttonStyle(isFirstPage)}
            >
              First
            </button>
            
            <button
              onClick={handlePreviousPage}
              disabled={isFirstPage}
              style={buttonStyle(isFirstPage)}
            >
              Previous
            </button>
          </>
        )}

        {/* Previous button for minimal variant */}
        {variant === 'minimal' && (
          <button
            onClick={handlePreviousPage}
            disabled={isFirstPage}
            style={buttonStyle(isFirstPage)}
          >
            ←
          </button>
        )}
        
        {/* Page numbers */}
        <div style={{ display: 'flex', gap: spacing[1] }}>
          {pageNumbers.map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
              disabled={pageNum === '...'}
              style={{
                ...buttonStyle(false, pageNum === currentPage),
                cursor: pageNum === '...' ? 'default' : 'pointer',
                minWidth: variant === 'minimal' ? '32px' : '40px',
                padding: variant === 'minimal' ? `${spacing[1]} ${spacing[2]}` : `${spacing[2]} ${spacing[2]}`
              }}
            >
              {pageNum}
            </button>
          ))}
        </div>
        
        {/* Next button for minimal variant */}
        {variant === 'minimal' && (
          <button
            onClick={handleNextPage}
            disabled={isLastPage}
            style={buttonStyle(isLastPage)}
          >
            →
          </button>
        )}

        {/* Next and Last buttons */}
        {variant !== 'minimal' && (
          <>
            <button
              onClick={handleNextPage}
              disabled={isLastPage}
              style={buttonStyle(isLastPage)}
            >
              Next
            </button>
            
            <button
              onClick={handleLastPage}
              disabled={isLastPage}
              style={buttonStyle(isLastPage)}
            >
              Last
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default UnifiedPagination

