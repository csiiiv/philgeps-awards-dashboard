import React, { memo } from 'react'
import { getThemeColors } from '../../../../design-system/theme'
import { spacing, typography } from '../../../../design-system'
import { Card, SectionTitle } from '../../../styled/Common.styled'
import { AnalyticsControls } from '../../analytics/AnalyticsControls'
import { FilterSection } from '../../advanced-search/FilterSection'
import { AccessibleButton } from '../../shared/AccessibleButton'
import { type FilterOptions } from '../../../../services/AdvancedSearchService'

interface DataExplorerFiltersProps {
  // Analytics Controls
  dimension: string
  metric: string
  yearFilter: string
  onDimensionChange: (dimension: string) => void
  onMetricChange: (metric: string) => void
  onYearFilterChange: (year: string) => void
  
  // Entity Filters
  filterOptions: FilterOptions
  filters: {
    contractors: string[]
    areas: string[]
    organizations: string[]
    business_categories: string[]
  }
  includeFloodControl: boolean
  hasSearched: boolean
  onAddFilter: (type: string, value: string) => void
  onRemoveFilter: (type: string, index: number) => void
  onIncludeFloodControlChange: (checked: boolean) => void
  onSearch: () => void
  onClearSearch: () => void
  
  // Loading state
  loadingOptions: boolean
  
  isDark: boolean
}

export const DataExplorerFilters: React.FC<DataExplorerFiltersProps> = memo(({
  // Analytics Controls
  dimension,
  metric,
  yearFilter,
  onDimensionChange,
  onMetricChange,
  onYearFilterChange,
  
  // Entity Filters
  filterOptions,
  filters,
  includeFloodControl,
  hasSearched,
  onAddFilter,
  onRemoveFilter,
  onIncludeFloodControlChange,
  onSearch,
  onClearSearch,
  
  // Loading state
  loadingOptions,
  
  isDark
}) => {
  const theme = getThemeColors(isDark)

  return (
    <Card $isDark={isDark} style={{ marginBottom: spacing[4] }}>
      {/* Compact Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: spacing[3]
      }}>
        <SectionTitle $isDark={isDark} style={{ margin: 0 }}>
          🔍 Filters & Controls
        </SectionTitle>
        
        {/* Search Actions - Moved to header */}
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <AccessibleButton
            onClick={onSearch}
            variant="primary"
            size="sm"
            aria-label="Search with current filters"
          >
            🔍 Search
          </AccessibleButton>
          
          {hasSearched && (
            <AccessibleButton
              onClick={onClearSearch}
              variant="secondary"
              size="sm"
              aria-label="Clear all filters and search"
            >
              🧹 Clear
            </AccessibleButton>
          )}
        </div>
      </div>

      {/* Analytics Controls - Compact */}
      <div style={{ marginBottom: spacing[3] }}>
        <AnalyticsControls
          dimension={dimension}
          metric={metric}
          yearFilter={yearFilter}
          onDimensionChange={onDimensionChange}
          onMetricChange={onMetricChange}
          onYearFilterChange={onYearFilterChange}
          isDark={isDark}
        />
      </div>

      {/* Entity Filter Section - Compact */}
      <div style={{ marginBottom: spacing[2] }}>
        {dimension === 'by_contractor' && (
          <FilterSection
            title="Contractors"
            icon="🏢"
            type="contractor"
            options={filterOptions.contractors}
            selectedValues={filters.contractors}
            onAdd={(value) => onAddFilter('contractors', value)}
            onRemove={(index) => onRemoveFilter('contractors', index)}
            isDark={isDark}
            loading={loadingOptions}
          />
        )}
        
        {dimension === 'by_organization' && (
          <FilterSection
            title="Organizations"
            icon="🏛️"
            type="organization"
            options={filterOptions.organizations}
            selectedValues={filters.organizations}
            onAdd={(value) => onAddFilter('organizations', value)}
            onRemove={(index) => onRemoveFilter('organizations', index)}
            isDark={isDark}
            loading={loadingOptions}
          />
        )}
        
        {dimension === 'by_area' && (
          <FilterSection
            title="Areas"
            icon="📍"
            type="area"
            options={filterOptions.areas}
            selectedValues={filters.areas}
            onAdd={(value) => onAddFilter('areas', value)}
            onRemove={(index) => onRemoveFilter('areas', index)}
            isDark={isDark}
            loading={loadingOptions}
          />
        )}
        
        {dimension === 'by_category' && (
          <FilterSection
            title="Business Categories"
            icon="🏷️"
            type="category"
            options={filterOptions.business_categories}
            selectedValues={filters.business_categories}
            onAdd={(value) => onAddFilter('business_categories', value)}
            onRemove={(index) => onRemoveFilter('business_categories', index)}
            isDark={isDark}
            loading={loadingOptions}
          />
        )}
      </div>

      {/* Flood Control Toggle - Compact */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        paddingTop: spacing[2],
        borderTop: `1px solid ${theme.border.primary}`,
        opacity: 0.7
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          cursor: 'pointer',
          color: theme.text.primary
        }}>
          <input
            type="checkbox"
            checked={includeFloodControl}
            onChange={(e) => onIncludeFloodControlChange(e.target.checked)}
            style={{
              width: '14px',
              height: '14px',
              accentColor: theme.primary[500]
            }}
          />
          <span style={{ fontSize: typography.fontSize.sm }}>
            Include Sumbong sa Pangulo Dataset (2022-2025)
          </span>
        </label>
      </div>
    </Card>
  )
})
