import React from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { getThemeVars } from '../../../../design-system/theme'
import { typography, spacing } from '../../../../design-system'

export interface AdvancedSearchActionsProps {
  // Loading states
  loading: boolean
  analyticsLoading?: boolean
  
  // Data availability
  hasResults: boolean
  hasAggregates: boolean
  
  // Action handlers
  onSearch: () => void
  onExport: () => void
  onShowAnalytics: () => void
  
  // Loading state
  disabled?: boolean
}

export const AdvancedSearchActions: React.FC<AdvancedSearchActionsProps> = ({
  loading,
  analyticsLoading = false,
  hasResults,
  hasAggregates,
  onSearch,
  onExport,
  onShowAnalytics,
  disabled = false
}) => {
  const { isDark } = useTheme()
  const vars = getThemeVars(isDark)

  // Button styles
  const baseButtonStyle = {
    padding: `${spacing[3]} ${spacing[6]}`,
    border: 'none',
    borderRadius: spacing[2],
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2]
  }

  const searchButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: vars.primary[600],
    color: vars.text.inverse,
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.6 : 1
  }

  const searchButtonHoverStyle = {
    backgroundColor: vars.primary[700],
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 8px rgba(0, 123, 255, 0.3)`
  }

  const searchButtonDisabledStyle = {
    ...searchButtonStyle,
    // vars.gray is not provided by getThemeVars; use background/border tokens instead
    backgroundColor: vars.background.secondary,
    color: vars.text.secondary,
    cursor: 'not-allowed'
  }

  const exportButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: vars.primary[600],
    color: vars.text.inverse,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1
  }

  const analyticsButtonStyle = {
    ...baseButtonStyle,
    // map gray tokens to available semantic tokens from getThemeVars()
    backgroundColor: hasAggregates ? vars.background.tertiary : vars.background.secondary,
    color: vars.text.primary,
    border: `1px solid ${vars.border.medium}`,
    cursor: hasAggregates && !disabled ? 'pointer' : 'not-allowed',
    opacity: hasAggregates && !disabled ? 1 : 0.6
  }

  const analyticsButtonHoverStyle = {
    backgroundColor: vars.background.tertiary,
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
  }

  return (
    <div style={{
      display: 'flex',
      gap: spacing[3],
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      {/* Search Button */}
      <button
        style={loading ? searchButtonDisabledStyle : searchButtonStyle}
        onClick={onSearch}
        disabled={loading || disabled}
        onMouseEnter={(e) => {
          if (!loading && !disabled) {
            Object.assign(e.currentTarget.style, searchButtonHoverStyle)
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !disabled) {
            Object.assign(e.currentTarget.style, searchButtonStyle)
          }
        }}
        title={loading ? 'Searching...' : 'Search for contracts with current filters'}
      >
        {loading ? (
          <>
            <div style={{
              width: 16,
              height: 16,
              border: `2px solid ${vars.text.inverse}`,
              borderTop: `2px solid transparent`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Searching...
          </>
        ) : (
          <>
            <span>🔍</span>
            Search Contracts
          </>
        )}
      </button>

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={disabled}
        style={exportButtonStyle}
        onMouseEnter={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, {
              backgroundColor: vars.primary[700],
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 8px rgba(0, 123, 255, 0.3)`
            })
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, exportButtonStyle)
          }
        }}
        title="Estimate and export all matches"
      >
        <span>📊</span>
        Export CSV
      </button>

      {/* Analytics Button */}
      <button
        onClick={onShowAnalytics}
        disabled={!hasAggregates || disabled}
        style={analyticsButtonStyle}
        onMouseEnter={(e) => {
          if (hasAggregates && !disabled) {
            Object.assign(e.currentTarget.style, analyticsButtonHoverStyle)
          }
        }}
        onMouseLeave={(e) => {
          if (hasAggregates && !disabled) {
            Object.assign(e.currentTarget.style, analyticsButtonStyle)
          }
        }}
        title={hasAggregates ? 'Open analytics dashboard' : 'Run a search to enable analytics'}
      >
        <span>📈</span>
        {analyticsLoading ? 'Loading Analytics...' : 'Show Analytics'}
      </button>

      {/* Loading Indicator for Analytics */}
      {analyticsLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          color: vars.text.secondary,
          fontSize: typography.fontSize.sm
        }}>
          <div style={{
            width: 16,
            height: 16,
            border: `2px solid ${vars.border.light}`,
            borderTop: `2px solid ${vars.primary[600]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading analytics...
        </div>
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
