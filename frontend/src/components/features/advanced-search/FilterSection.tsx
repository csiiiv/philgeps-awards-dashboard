import React, { useState } from 'react'
import { getThemeColors } from '../../../design-system/theme'
import { typography, spacing } from '../../../design-system'
import { SearchableSelect } from './SearchableSelect'
import { FilterChip } from './FilterChip'

export interface FilterSectionProps {
  title: string
  icon: string
  type: 'contractor' | 'area' | 'organization' | 'category' | 'keyword' | 'timerange'
  options: string[]
  selectedValues: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  isDark?: boolean
  disabled?: boolean
  supportAndLogic?: boolean
  loading?: boolean
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  type,
  options,
  selectedValues = [], // Default to empty array to prevent undefined errors
  onAdd,
  onRemove,
  isDark = false,
  disabled = false,
  supportAndLogic = false,
  loading = false
}) => {
  const themeColors = getThemeColors(isDark)
  const [exactWord, setExactWord] = useState(false)

  const containerStyle = {
    marginBottom: spacing[4]
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing[2],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: themeColors.text.primary
  }

  const chipsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: spacing[2],
    marginBottom: spacing[2],
    minHeight: '32px'
  }

  const selectContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2]
  }

  const addButtonStyle = {
    padding: `${spacing[1]} ${spacing[3]}`,
    backgroundColor: themeColors.primary[500],
    color: themeColors.white,
    border: 'none',
    borderRadius: spacing[2],
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap' as const
  }

  const addButtonHoverStyle = {
    backgroundColor: themeColors.primary[600]
  }

  const handleAdd = (value: string) => {
    if (value && !selectedValues.includes(value)) {
      onAdd(value)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ marginRight: spacing[2] }}>{icon}</span>
        {title}
        {loading && (
          <span style={{ 
            marginLeft: spacing[2], 
            color: themeColors.text.secondary,
            fontSize: typography.fontSize.xs
          }}>
            (Loading...)
          </span>
        )}
        {!loading && (
          <span style={{ 
            marginLeft: spacing[2], 
            color: themeColors.text.secondary,
            fontSize: typography.fontSize.xs
          }}>
            ({selectedValues.length} selected)
          </span>
        )}
      </div>

      {/* Selected chips */}
      {selectedValues.length > 0 && (
        <div style={chipsContainerStyle}>
          {selectedValues.map((value, index) => (
            <FilterChip
              key={`${type}-${index}`}
              label={value}
              value={value}
              type={type}
              onRemove={() => onRemove(index)}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {/* Add new filter */}
      <div style={selectContainerStyle}>
        <div style={{ flex: 1 }}>
          <SearchableSelect
            value=""
            onChange={handleAdd}
            options={options}
            placeholder={loading ? `Loading ${title.toLowerCase()}...` : `Select ${title.toLowerCase()}...`}
            icon={icon}
            isDark={isDark}
            disabled={disabled || loading}
            typeKey={type === 'contractor' || type === 'area' || type === 'organization' || type === 'category' ? type : undefined}
            exactWord={exactWord}
            supportAndLogic={supportAndLogic}
          />
        </div>
        {(type === 'contractor' || type === 'area' || type === 'organization' || type === 'category') && (
          <label style={{ display: 'flex', alignItems: 'center', gap: spacing[1], fontSize: typography.fontSize.sm, color: themeColors.text.secondary }}>
            <input type="checkbox" checked={exactWord} onChange={(e) => setExactWord(e.target.checked)} />
            Exact word
          </label>
        )}
      </div>
    </div>
  )
}

export { FilterSection }
