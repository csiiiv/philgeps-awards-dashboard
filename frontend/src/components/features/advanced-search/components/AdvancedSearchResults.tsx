import React from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { getThemeColors } from '../../../../design-system/theme'
import { typography, spacing } from '../../../../design-system'
import { SearchResults } from '../SearchResults'
import { UnifiedPagination } from '../../shared/UnifiedPagination'
import { SearchResult, PaginationState, SortConfig } from '../../../../hooks/advanced-search/useAdvancedSearchPagination'

export interface AdvancedSearchResultsProps {
  // Results data
  results: SearchResult[]
  totalCount: number
  loading: boolean
  error: string | null
  hasSearched: boolean
  
  // Pagination
  pagination: PaginationState
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  
  // Sorting
  sortConfig: SortConfig
  onSort: (key: string) => void
  
  // Loading state
  analyticsLoading?: boolean
}

export const AdvancedSearchResults: React.FC<AdvancedSearchResultsProps> = ({
  results,
  totalCount,
  loading,
  error,
  hasSearched,
  pagination,
  onPageChange,
  onPageSizeChange,
  sortConfig,
  onSort,
  analyticsLoading = false
}) => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)

  // Don't render if no search has been performed
  if (!hasSearched) {
    return null
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4]
    }}>
      {/* Results Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${spacing[3]} 0`,
        borderBottom: `1px solid ${themeColors.border.light}`
      }}>
        <h3 style={{
          color: themeColors.text.primary,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
          margin: 0
        }}>
          Search Results
        </h3>
        
        {totalCount > 0 && (
          <div style={{
            color: themeColors.text.secondary,
            fontSize: typography.fontSize.sm
          }}>
            {totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing[8],
          color: themeColors.text.secondary
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing[3]
          }}>
            <div style={{
              width: 32,
              height: 32,
              border: `3px solid ${themeColors.border.light}`,
              borderTop: `3px solid ${themeColors.primary[600]}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: typography.fontSize.sm }}>
              {analyticsLoading ? 'Loading analytics...' : 'Searching...'}
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          padding: spacing[4],
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.light}`,
          borderRadius: spacing[2],
          color: themeColors.text.primary
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span style={{ fontSize: typography.fontSize.sm }}>
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Results Table */}
      {!loading && !error && results.length > 0 && (
        <SearchResults
          results={results}
          totalCount={totalCount}
          pagination={pagination}
          sortConfig={sortConfig}
          onSort={onSort}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isDark={isDark}
        />
      )}

      {/* Empty State */}
      {!loading && !error && results.length === 0 && hasSearched && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing[8],
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: spacing[4],
            opacity: 0.5
          }}>
            🔍
          </div>
          <h3 style={{
            color: themeColors.text.primary,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.medium,
            margin: `0 0 ${spacing[2]} 0`
          }}>
            No results found
          </h3>
          <p style={{
            color: themeColors.text.secondary,
            fontSize: typography.fontSize.sm,
            margin: 0,
            maxWidth: '400px'
          }}>
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && results.length > 0 && pagination.totalPages > 1 && (
        <UnifiedPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          variant="default"
        />
      )}

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
