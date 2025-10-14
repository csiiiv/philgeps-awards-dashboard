import React, { memo } from 'react'
import { getThemeColors } from '../../../../design-system/theme'
import { spacing, typography } from '../../../../design-system'
import { Card } from '../../../styled/Common.styled'
import { FilterSection } from '../../advanced-search/FilterSection'
import { AccessibleButton } from '../../shared/AccessibleButton'
import { type FilterOptions } from '../../../../services/AdvancedSearchService'

interface DataExplorerEntityFiltersProps {
  dimension: string
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
  isDark: boolean
}

export const DataExplorerEntityFilters: React.FC<DataExplorerEntityFiltersProps> = memo(({
  dimension,
  filterOptions,
  filters,
  includeFloodControl,
  hasSearched,
  onAddFilter,
  onRemoveFilter,
  onIncludeFloodControlChange,
  onSearch,
  onClearSearch,
  isDark
}) => {
  const theme = getThemeColors(isDark)

  return (
    <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
      {/* Entity Filter Section - Show based on dimension */}
      <div style={{ marginTop: spacing[4] }}>
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
          />
        )}
      </div>

      {/* Search Actions */}
      <div style={{ 
        marginTop: spacing[4], 
        display: 'flex', 
        gap: spacing[2],
        justifyContent: 'center'
      }}>
        <AccessibleButton
          onClick={onSearch}
          variant="primary"
          size="md"
          aria-label="Search with current filters"
        >
          🔍 Search
        </AccessibleButton>
        
        {hasSearched && (
          <AccessibleButton
            onClick={onClearSearch}
            variant="secondary"
            size="md"
            aria-label="Clear all filters and search"
          >
            🧹 Clear
          </AccessibleButton>
        )}
      </div>

      {/* Flood Control Toggle */}
      <div style={{ marginTop: spacing[4] }}>
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
              width: '16px',
              height: '16px',
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
