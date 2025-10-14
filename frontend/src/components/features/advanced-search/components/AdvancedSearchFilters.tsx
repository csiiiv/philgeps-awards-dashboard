import React from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { getThemeColors } from '../../../../design-system/theme'
import { typography, spacing } from '../../../../design-system'
import { FilterChip } from '../FilterChip'
import { FilterSection } from '../FilterSection'
import { ValueRangeFilter } from '../../shared/ValueRangeFilter'
import { PredefinedFilterSelector } from './PredefinedFilterSelector'
import type { FilterState, DateRangeState } from '../../../../hooks/advanced-search/useAdvancedSearchFilters'

export interface FilterOptions {
  contractors: string[]
  areas: string[]
  organizations: string[]
  business_categories: string[]
}

export interface AdvancedSearchFiltersProps {
  // Filter state
  filters: FilterState
  keywordInput: string
  includeFloodControl: boolean
  dateRange: DateRangeState
  valueRange?: FilterState['valueRange']
  filterOptions: FilterOptions
  
  // Filter actions
  onAddFilter: (type: keyof FilterState, value: string) => void
  onRemoveFilter: (type: keyof FilterState, index: number) => void
  onClearAllFilters: () => void
  
  // Keyword actions
  onKeywordInputChange: (value: string) => void
  onKeywordKeyDown: (e: React.KeyboardEvent) => void
  onKeywordAdd: () => void
  
  // Date range actions
  onDateRangeTypeChange: (type: DateRangeState['type']) => void
  onDateRangeYearChange: (year: number) => void
  onDateRangeQuarterChange: (quarter: number) => void
  onDateRangeStartDateChange: (startDate: string) => void
  onDateRangeEndDateChange: (endDate: string) => void
  
  // Flood control actions
  onIncludeFloodControlChange: (value: boolean) => void
  
  // Value range actions
  onValueRangeChange: (valueRange: FilterState['valueRange']) => void
  
  // Persistence actions
  onSaveCurrentFilter: (name: string, description?: string) => void
  
  // Loading state
  loading?: boolean
  loadingOptions?: boolean
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  keywordInput,
  includeFloodControl,
  dateRange,
  valueRange,
  filterOptions,
  onAddFilter,
  onRemoveFilter,
  onClearAllFilters,
  onKeywordInputChange,
  onKeywordKeyDown,
  onKeywordAdd,
  onDateRangeTypeChange,
  onDateRangeYearChange,
  onDateRangeQuarterChange,
  onDateRangeStartDateChange,
  onDateRangeEndDateChange,
  onIncludeFloodControlChange,
  onValueRangeChange,
  onSaveCurrentFilter,
  loading = false,
  loadingOptions = false
}) => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)

  // Generate year options (2013-2025)
  const yearOptions = Array.from({ length: 13 }, (_, i) => 2013 + i).reverse()

  // Generate quarter options
  const quarterOptions = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
      marginBottom: spacing[6]
    }}>
      {/* Predefined Filter Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing[3],
        backgroundColor: themeColors.background.secondary,
        border: `1px solid ${themeColors.border.light}`,
        borderRadius: spacing[2]
      }}>
        <div>
          <h3 style={{
            margin: 0,
            color: themeColors.text.primary,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold
          }}>
            Filter Presets
          </h3>
          <p style={{
            margin: `${spacing[1]} 0 0 0`,
            color: themeColors.text.secondary,
            fontSize: typography.fontSize.xs
          }}>
            Choose from predefined filters or save your current configuration
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          {/* Clear All Filters Button */}
          {(filters.contractors.length > 0 || 
            filters.areas.length > 0 || 
            filters.organizations.length > 0 || 
            filters.business_categories.length > 0 || 
            filters.keywords.length > 0 || 
            dateRange.type !== 'all_time') && (
            <button
              onClick={onClearAllFilters}
              disabled={loading}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: 'transparent',
                color: themeColors.text.secondary,
                border: `1px solid ${themeColors.border.medium}`,
                borderRadius: spacing[1],
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: typography.fontSize.sm,
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1]
              }}
            >
              <span>🧹</span>
              <span>Clear All Filters</span>
            </button>
          )}
          
          <PredefinedFilterSelector
            onApplyFilter={(filterConfig) => {
              // Apply the filter configuration
              Object.entries(filterConfig.filters).forEach(([type, values]) => {
                values.forEach((value: string) => onAddFilter(type as keyof FilterState, value))
              })
              onDateRangeTypeChange(filterConfig.dateRange.type)
              onDateRangeYearChange(filterConfig.dateRange.year)
              onDateRangeQuarterChange(filterConfig.dateRange.quarter)
              onDateRangeStartDateChange(filterConfig.dateRange.startDate)
              onDateRangeEndDateChange(filterConfig.dateRange.endDate)
              onIncludeFloodControlChange(filterConfig.includeFloodControl)
            }}
            onSaveCurrentFilter={onSaveCurrentFilter}
            currentFilters={filters}
            currentDateRange={dateRange}
            currentIncludeFloodControl={includeFloodControl}
            loading={loading}
          />
        </div>
      </div>

      {/* Filter Sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: spacing[4]
      }}>
        {/* Contractors Filter */}
        <FilterSection
          title="Contractors"
          icon="🏢"
          type="contractor"
          options={filterOptions.contractors}
          selectedValues={filters.contractors}
          onAdd={(value) => onAddFilter('contractors', value)}
          onRemove={(index) => onRemoveFilter('contractors', index)}
          loading={loadingOptions}
        />

        {/* Areas Filter */}
        <FilterSection
          title="Areas"
          icon="📍"
          type="area"
          options={filterOptions.areas}
          selectedValues={filters.areas}
          onAdd={(value) => onAddFilter('areas', value)}
          onRemove={(index) => onRemoveFilter('areas', index)}
          loading={loadingOptions}
        />

        {/* Organizations Filter */}
        <FilterSection
          title="Organizations"
          icon="🏛️"
          type="organization"
          options={filterOptions.organizations}
          selectedValues={filters.organizations}
          onAdd={(value) => onAddFilter('organizations', value)}
          onRemove={(index) => onRemoveFilter('organizations', index)}
          loading={loadingOptions}
        />

        {/* Business Categories Filter */}
        <FilterSection
          title="Business Categories"
          icon="🏷️"
          type="category"
          options={filterOptions.business_categories}
          selectedValues={filters.business_categories}
          onAdd={(value) => onAddFilter('business_categories', value)}
          onRemove={(index) => onRemoveFilter('business_categories', index)}
          loading={loadingOptions}
        />
      </div>

      {/* Keywords Filter */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[2]
      }}>
        <label style={{
          color: themeColors.text.primary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium
        }}>
          Title Keywords Filter
        </label>
        <div style={{
          display: 'flex',
          gap: spacing[2],
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Enter title keywords (use && for AND logic)..."
            value={keywordInput}
            onChange={(e) => onKeywordInputChange(e.target.value)}
            onKeyDown={onKeywordKeyDown}
            style={{
              flex: 1,
              padding: `${spacing[2]} ${spacing[3]}`,
              border: `1px solid ${themeColors.border.medium}`,
              borderRadius: spacing[1],
              fontSize: typography.fontSize.sm,
              backgroundColor: themeColors.background.primary,
              color: themeColors.text.primary
            }}
            disabled={loading}
          />
          <button
            onClick={onKeywordAdd}
            disabled={loading || !keywordInput.trim()}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: themeColors.primary[600],
              color: themeColors.text.inverse,
              border: 'none',
              borderRadius: spacing[1],
              cursor: loading || !keywordInput.trim() ? 'not-allowed' : 'pointer',
              fontSize: typography.fontSize.sm,
              opacity: loading || !keywordInput.trim() ? 0.6 : 1
            }}
          >
            Add
          </button>
        </div>
        
        {/* Keyword Chips */}
        {filters.keywords.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2],
            marginTop: spacing[2]
          }}>
            {filters.keywords.map((keyword, index) => (
              <FilterChip
                key={`keyword-${keyword}-${index}`}
                label={keyword}
                value={keyword}
                type="keyword"
                onRemove={() => onRemoveFilter('keywords', index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Date Range and Value Range - Horizontal Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing[4],
        alignItems: 'stretch' // Make both cards stretch to same height
      }}>
        {/* Date Range Filter */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[2],
          padding: spacing[3],
          backgroundColor: themeColors.background.secondary,
          borderRadius: spacing[2],
          border: `1px solid ${themeColors.border.light}`,
          minHeight: '120px' // Ensure consistent minimum height
        }}>
          <label style={{
            color: themeColors.text.primary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            textAlign: 'left'
          }}>
            📅 Time Range
          </label>
          <div style={{
            display: 'flex',
            gap: spacing[3],
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <select
              value={dateRange.type}
              onChange={(e) => onDateRangeTypeChange(e.target.value as DateRangeState['type'])}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${themeColors.border.medium}`,
                borderRadius: spacing[1],
                fontSize: typography.fontSize.sm,
                backgroundColor: themeColors.background.primary,
                color: themeColors.text.primary
              }}
              disabled={loading}
            >
              <option value="all_time">All Time</option>
              <option value="yearly">Yearly</option>
              <option value="quarterly">Quarterly</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateRange.type === 'yearly' && (
              <select
                value={dateRange.year}
                onChange={(e) => onDateRangeYearChange(Number(e.target.value))}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${themeColors.border.medium}`,
                  borderRadius: spacing[1],
                  fontSize: typography.fontSize.sm,
                  backgroundColor: themeColors.background.primary,
                  color: themeColors.text.primary
                }}
                disabled={loading}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}

            {dateRange.type === 'quarterly' && (
              <>
                <select
                  value={dateRange.year}
                  onChange={(e) => onDateRangeYearChange(Number(e.target.value))}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${themeColors.border.medium}`,
                    borderRadius: spacing[1],
                    fontSize: typography.fontSize.sm,
                    backgroundColor: themeColors.background.primary,
                    color: themeColors.text.primary
                  }}
                  disabled={loading}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={dateRange.quarter}
                  onChange={(e) => onDateRangeQuarterChange(Number(e.target.value))}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${themeColors.border.medium}`,
                    borderRadius: spacing[1],
                    fontSize: typography.fontSize.sm,
                    backgroundColor: themeColors.background.primary,
                    color: themeColors.text.primary
                  }}
                  disabled={loading}
                >
                  {quarterOptions.map(quarter => (
                    <option key={quarter.value} value={quarter.value}>{quarter.label}</option>
                  ))}
                </select>
              </>
            )}

            {dateRange.type === 'custom' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => {
                      console.log('📅 Date input onChange - startDate:', e.target.value)
                      onDateRangeStartDateChange(e.target.value)
                    }}
                    onBlur={(e) => {
                      // Additional validation on blur
                      if (e.target.value && new Date(e.target.value).toString() === 'Invalid Date') {
                        console.warn('Invalid start date entered:', e.target.value)
                      }
                    }}
                    min="2013-01-01"
                    max="2025-12-31"
                    style={{
                      padding: `${spacing[2]} ${spacing[3]}`,
                      border: `1px solid ${!dateRange.startDate && dateRange.type === 'custom' ? (themeColors.text.error || '#ef4444') : themeColors.border.medium}`,
                      borderRadius: spacing[1],
                      fontSize: typography.fontSize.sm,
                      backgroundColor: themeColors.background.primary,
                      color: themeColors.text.primary
                    }}
                    disabled={loading}
                    placeholder="Start date"
                  />
                  {!dateRange.startDate && dateRange.type === 'custom' && (
                    <span style={{ 
                      color: themeColors.text.error || '#ef4444', 
                      fontSize: typography.fontSize.xs 
                    }}>
                      Please input a valid date
                    </span>
                  )}
                </div>
                <span style={{ color: themeColors.text.secondary }}>to</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => onDateRangeEndDateChange(e.target.value)}
                    onBlur={(e) => {
                      // Additional validation on blur
                      if (e.target.value && new Date(e.target.value).toString() === 'Invalid Date') {
                        console.warn('Invalid end date entered:', e.target.value)
                      }
                    }}
                    min="2013-01-01"
                    max="2025-12-31"
                    style={{
                      padding: `${spacing[2]} ${spacing[3]}`,
                      border: `1px solid ${!dateRange.endDate && dateRange.type === 'custom' ? (themeColors.text.error || '#ef4444') : themeColors.border.medium}`,
                      borderRadius: spacing[1],
                      fontSize: typography.fontSize.sm,
                      backgroundColor: themeColors.background.primary,
                      color: themeColors.text.primary
                    }}
                    disabled={loading}
                    placeholder="End date"
                  />
                  {!dateRange.endDate && dateRange.type === 'custom' && (
                    <span style={{ 
                      color: themeColors.text.error || '#ef4444', 
                      fontSize: typography.fontSize.xs 
                    }}>
                      Please input a valid date
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Value Range Filter */}
        <ValueRangeFilter
          value={valueRange || {}}
          onChange={onValueRangeChange}
          isDark={isDark}
          disabled={loading}
          minValue={0}
          maxValue={10000000000} // 10B max - more reasonable for government contracts
          currency="₱"
          showPresets={false} // Disable presets
          showSlider={false} // Disable slider - keep it simple
          showInputs={true}
          minHeight="120px" // Match the Time Range card height
        />
      </div>

      {/* Flood Control Toggle */}
      <div style={{
        marginBottom: spacing[4],
        padding: spacing[4],
        backgroundColor: themeColors.background.secondary,
        border: `1px solid ${themeColors.border.light}`,
        borderRadius: spacing[2]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3]
        }}>
          <input
            type="checkbox"
            id="include-flood-control"
            checked={includeFloodControl}
            onChange={(e) => onIncludeFloodControlChange(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              accentColor: themeColors.primary[600],
              cursor: 'pointer'
            }}
            disabled={loading}
          />
          <label
            htmlFor="include-flood-control"
            style={{
              color: themeColors.text.primary,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            Include "Sumbong sa Pangulo" Dataset
          </label>
        </div>
        <p style={{
          color: themeColors.text.secondary,
          fontSize: typography.fontSize.xs,
          margin: `${spacing[2]} 0 0 0`,
          fontStyle: 'italic'
        }}>
          This will include flood control projects from the Sumbong sa Pangulo dataset in your search results. This data will all be categorized as "Flood Control". Note: This may lead to duplicate data with PhilGEPS entries.
        </p>
      </div>

    </div>
  )
}
