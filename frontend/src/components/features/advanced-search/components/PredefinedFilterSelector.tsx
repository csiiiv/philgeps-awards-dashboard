import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { getThemeVars } from '../../../../design-system/theme'
import { typography, spacing } from '../../../../design-system'
import type { FilterState, DateRangeState } from '../../../../hooks/advanced-search/useAdvancedSearchFilters'
import { FilterPersistence } from '../../../../utils/filterPersistence'
import type { PredefinedFilter, SavedFilter } from '../../../../utils/filterPersistence'
import predefinedFiltersData from '../../../../constants/predefinedFilters.json'

export interface PredefinedFilterSelectorProps {
  onApplyFilter: (filter: {
    filters: FilterState
    dateRange: DateRangeState
    includeFloodControl: boolean
  }) => void
  onSaveCurrentFilter: (name: string, description?: string) => void
  currentFilters: FilterState
  currentDateRange: DateRangeState
  currentIncludeFloodControl: boolean
  loading?: boolean
}

export const PredefinedFilterSelector: React.FC<PredefinedFilterSelectorProps> = ({
  onApplyFilter,
  onSaveCurrentFilter,
  currentFilters,
  currentDateRange,
  currentIncludeFloodControl,
  loading = false
}) => {
  const { isDark } = useTheme()
  const vars = getThemeVars(isDark)
  
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'predefined' | 'saved'>('predefined')
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [saveFilterName, setSaveFilterName] = useState('')
  const [saveFilterDescription, setSaveFilterDescription] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const predefinedFilters: PredefinedFilter[] = Array.isArray(predefinedFiltersData) ? predefinedFiltersData as PredefinedFilter[] : []

  // Load saved filters on mount
  useEffect(() => {
    const saved = FilterPersistence.getSavedFilters()
    setSavedFilters(saved)
  }, [])

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

  const handleApplyPredefinedFilter = (filter: PredefinedFilter) => {
    onApplyFilter({
      filters: filter.filters,
      dateRange: filter.dateRange,
      includeFloodControl: filter.includeFloodControl
    })
    setIsOpen(false)
  }

  const handleApplySavedFilter = (filter: SavedFilter) => {
    onApplyFilter({
      filters: filter.filters,
      dateRange: filter.dateRange,
      includeFloodControl: filter.includeFloodControl
    })
    setIsOpen(false)
  }

  const handleSaveCurrentFilter = () => {
    if (!saveFilterName.trim()) {
      alert('Please enter a name for the filter')
      return
    }

    try {
      if (editingFilter) {
        // Update existing filter
        FilterPersistence.updateFilter(editingFilter.id, {
          name: saveFilterName.trim(),
          description: saveFilterDescription.trim() || undefined,
          filters: currentFilters,
          dateRange: currentDateRange,
          includeFloodControl: currentIncludeFloodControl
        })
        console.log('✅ Filter updated successfully')
      } else {
        // Create new filter
        onSaveCurrentFilter(saveFilterName.trim(), saveFilterDescription.trim() || undefined)
      }
      
      setSaveFilterName('')
      setSaveFilterDescription('')
      setShowSaveDialog(false)
      setEditingFilter(null)
      
      // Refresh saved filters
      const saved = FilterPersistence.getSavedFilters()
      setSavedFilters(saved)
    } catch (error) {
      console.error('Failed to save filter:', error)
      alert('Failed to save filter. Please try again.')
    }
  }

  const handleDeleteSavedFilter = (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved filter?')) {
      try {
        FilterPersistence.deleteFilter(id)
        const saved = FilterPersistence.getSavedFilters()
        setSavedFilters(saved)
      } catch (error) {
        console.error('Failed to delete filter:', error)
        alert('Failed to delete filter. Please try again.')
      }
    }
  }

  const handleEditSavedFilter = (filter: SavedFilter) => {
    setEditingFilter(filter)
    setSaveFilterName(filter.name)
    setSaveFilterDescription(filter.description || '')
    setShowSaveDialog(true)
  }

  const handleExportPresets = () => {
    try {
      const exportedData = FilterPersistence.exportFilters()
      const blob = new Blob([exportedData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `saved-filters-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('✅ Filters exported successfully')
    } catch (error) {
      console.error('❌ Failed to export filters:', error)
      alert('Failed to export filters. Please try again.')
    }
  }

  const handleImportPresets = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Clear previous messages
    setImportError(null)
    setImportSuccess(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)
        
        // Validate the imported data structure
        if (!Array.isArray(importedData)) {
          throw new Error('Invalid file format. Expected an array of filter objects.')
        }

        // Validate each filter object
        const validatedFilters = importedData.map((filter: any, index: number) => {
          if (!filter.name || !filter.filters || !filter.dateRange) {
            throw new Error(`Invalid filter at index ${index}. Missing required fields.`)
          }
          
          // Ensure the filter has a unique ID
          return {
            ...filter,
            id: filter.id || `imported_${Date.now()}_${index}`,
            createdAt: filter.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })

        // Import the filters
        const successCount = FilterPersistence.importFilters(validatedFilters)
        
        // Refresh saved filters
        const saved = FilterPersistence.getSavedFilters()
        setSavedFilters(saved)
        
        setImportSuccess(`Successfully imported ${successCount} filter(s)`)
        console.log(`✅ Successfully imported ${successCount} filter(s)`)
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setImportSuccess(null), 3000)
        
      } catch (error) {
        console.error('❌ Failed to import filters:', error)
        setImportError(error instanceof Error ? error.message : 'Failed to import filters. Please check the file format.')
        
        // Clear error message after 5 seconds
        setTimeout(() => setImportError(null), 5000)
      }
    }
    
    reader.onerror = () => {
      setImportError('Failed to read the file. Please try again.')
      setTimeout(() => setImportError(null), 5000)
    }
    
    reader.readAsText(file)
  }

  const hasActiveFilters = () => {
    return Object.values(currentFilters).some(filterArray => filterArray.length > 0) || 
           currentDateRange.type !== 'all_time'
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        style={{
          padding: `${spacing[2]} ${spacing[4]}`,
          backgroundColor: vars.primary[600],
          color: vars.text.inverse,
          border: 'none',
          borderRadius: spacing[1],
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          opacity: loading ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}
      >
        <span>📋</span>
        <span>Filter Presets</span>
        <span style={{ fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: vars.background.primary,
          border: `1px solid ${vars.border.medium}`,
          borderRadius: spacing[2],
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          marginTop: spacing[1],
          minWidth: '400px'
        }}>
          {/* Header with Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${vars.border.light}`,
            padding: spacing[3]
          }}>
            <button
              onClick={() => setActiveTab('predefined')}
              style={{
                flex: 1,
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: activeTab === 'predefined' ? vars.primary[50] : 'transparent',
                color: activeTab === 'predefined' ? vars.primary[700] : vars.text.secondary,
                border: 'none',
                borderRadius: spacing[1],
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
            >
              Predefined
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              style={{
                flex: 1,
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: activeTab === 'saved' ? vars.primary[50] : 'transparent',
                color: activeTab === 'saved' ? vars.primary[700] : vars.text.secondary,
                border: 'none',
                borderRadius: spacing[1],
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
            >
              Saved ({savedFilters.length})
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: spacing[3], maxHeight: '400px', overflowY: 'auto' }}>
            {activeTab === 'predefined' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {predefinedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    onClick={() => handleApplyPredefinedFilter(filter)}
                    style={{
                      padding: spacing[3],
                      backgroundColor: vars.background.secondary,
                      border: `1px solid ${vars.border.light}`,
                      borderRadius: spacing[1],
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = vars.primary[50]
                      e.currentTarget.style.borderColor = vars.primary[200]
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = vars.background.secondary
                      e.currentTarget.style.borderColor = vars.border.light
                    }}
                  >
                    <div style={{
                      fontWeight: typography.fontWeight.medium,
                      color: vars.text.primary,
                      marginBottom: spacing[1]
                    }}>
                      {filter.name}
                    </div>
                    <div style={{
                      fontSize: typography.fontSize.xs,
                      color: vars.text.secondary,
                      lineHeight: 1.4
                    }}>
                      {filter.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {savedFilters.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: vars.text.secondary,
                    padding: spacing[4],
                    fontStyle: 'italic'
                  }}>
                    No saved filters yet
                  </div>
                ) : (
                  savedFilters.map((filter) => (
                    <div
                      key={filter.id}
                      style={{
                        padding: spacing[3],
                        backgroundColor: vars.background.secondary,
                        border: `1px solid ${vars.border.light}`,
                        borderRadius: spacing[1],
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div
                        onClick={() => handleApplySavedFilter(filter)}
                        style={{
                          flex: 1,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          fontWeight: typography.fontWeight.medium,
                          color: vars.text.primary,
                          marginBottom: spacing[1]
                        }}>
                          {filter.name}
                        </div>
                        {filter.description && (
                          <div style={{
                            fontSize: typography.fontSize.xs,
                            color: vars.text.secondary,
                            marginBottom: spacing[1]
                          }}>
                            {filter.description}
                          </div>
                        )}
                        <div style={{
                          fontSize: typography.fontSize.xs,
                          color: vars.text.tertiary
                        }}>
                          Updated: {new Date(filter.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: spacing[1] }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditSavedFilter(filter)
                          }}
                          style={{
                            padding: spacing[1],
                            backgroundColor: 'transparent',
                            color: vars.primary[600],
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                          title="Edit filter"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSavedFilter(filter.id)
                          }}
                          style={{
                            padding: spacing[1],
                            backgroundColor: 'transparent',
                            color: vars.text.secondary,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                          title="Delete filter"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer with Export and Save Buttons */}
          <div style={{
            padding: spacing[3],
            borderTop: `1px solid ${vars.border.light}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: vars.text.secondary
            }}>
              {hasActiveFilters() ? 'Current filters can be saved' : 'No active filters to save'}
            </div>
            <div style={{ display: 'flex', gap: spacing[2] }}>
              <button
                onClick={handleImportPresets}
                disabled={loading}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: vars.primary[600],
                  color: vars.text.inverse,
                  border: 'none',
                  borderRadius: spacing[1],
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1]
                }}
                title="Import saved filters from JSON file"
              >
                <span>📥</span>
                <span>Import Presets</span>
              </button>
              <button
                onClick={handleExportPresets}
                disabled={savedFilters.length === 0 || loading}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: savedFilters.length > 0 ? vars.success[600] : vars.border.medium,
                  color: savedFilters.length > 0 ? vars.text.inverse : vars.text.secondary,
                  border: 'none',
                  borderRadius: spacing[1],
                  cursor: savedFilters.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: typography.fontSize.sm,
                  opacity: savedFilters.length > 0 ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1]
                }}
                title={savedFilters.length > 0 ? 'Export saved filters as JSON file' : 'No saved filters to export'}
              >
                <span>📤</span>
                <span>Export Presets</span>
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={!hasActiveFilters() || loading}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: hasActiveFilters() ? vars.primary[600] : vars.border.medium,
                  color: hasActiveFilters() ? vars.text.inverse : vars.text.secondary,
                  border: 'none',
                  borderRadius: spacing[1],
                  cursor: hasActiveFilters() ? 'pointer' : 'not-allowed',
                  fontSize: typography.fontSize.sm,
                  opacity: hasActiveFilters() ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1]
                }}
              >
                <span>💾</span>
                <span>Save Current</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: vars.background.primary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.medium}`,
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            <h3 style={{
              margin: `0 0 ${spacing[3]} 0`,
              color: vars.text.primary,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold
            }}>
              {editingFilter ? 'Edit Filter' : 'Save Current Filter'}
            </h3>
            
            <div style={{ marginBottom: spacing[3] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[1],
                color: vars.text.primary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}>
                Filter Name *
              </label>
              <input
                type="text"
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                placeholder="Enter a name for this filter..."
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${vars.border.medium}`,
                  borderRadius: spacing[1],
                  fontSize: typography.fontSize.sm,
                  backgroundColor: vars.background.primary,
                  color: vars.text.primary
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[1],
                color: vars.text.primary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}>
                Description (optional)
              </label>
              <textarea
                value={saveFilterDescription}
                onChange={(e) => setSaveFilterDescription(e.target.value)}
                placeholder="Describe what this filter is for..."
                rows={3}
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${vars.border.medium}`,
                  borderRadius: spacing[1],
                  fontSize: typography.fontSize.sm,
                  backgroundColor: vars.background.primary,
                  color: vars.text.primary,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: spacing[2],
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setSaveFilterName('')
                  setSaveFilterDescription('')
                  setEditingFilter(null)
                }}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: 'transparent',
                  color: vars.text.secondary,
                  border: `1px solid ${vars.border.medium}`,
                  borderRadius: spacing[1],
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentFilter}
                disabled={!saveFilterName.trim()}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: saveFilterName.trim() ? vars.primary[600] : vars.border.medium,
                  color: saveFilterName.trim() ? vars.text.inverse : vars.text.secondary,
                  border: 'none',
                  borderRadius: spacing[1],
                  cursor: saveFilterName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: typography.fontSize.sm,
                  opacity: saveFilterName.trim() ? 1 : 0.6
                }}
              >
                {editingFilter ? 'Update with Current Filters' : 'Save Filter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

      {/* Import success/error messages */}
      {importSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: `${spacing[3]} ${spacing[4]}`,
          backgroundColor: vars.success[50],
          color: vars.success[600],
          border: `1px solid ${vars.success[500]}`,
          borderRadius: spacing[1],
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          zIndex: 1000,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          maxWidth: '300px'
        }}>
          ✅ {importSuccess}
        </div>
      )}

      {importError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: `${spacing[3]} ${spacing[4]}`,
          backgroundColor: vars.error[50],
          color: vars.error[600],
          border: `1px solid ${vars.error[500]}`,
          borderRadius: spacing[1],
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          zIndex: 1000,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          maxWidth: '300px'
        }}>
          ❌ {importError}
        </div>
      )}
    </div>
  )
}
