import { useState, useEffect, useCallback } from 'react'

export interface ColumnDefinition {
  key: string
  label: string
  defaultVisible?: boolean
}

const STORAGE_KEY = 'advancedSearch_columnVisibility'

/**
 * Default column definitions for the advanced search table
 */
export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { key: 'contract_no', label: 'Contract No', defaultVisible: true },
  { key: 'award_title', label: 'Award Title', defaultVisible: true },
  { key: 'notice_title', label: 'Notice Title', defaultVisible: true },
  { key: 'awardee_name', label: 'Contractor', defaultVisible: true },
  { key: 'organization_name', label: 'Organization', defaultVisible: true },
  { key: 'area_of_delivery', label: 'Area', defaultVisible: true },
  { key: 'business_category', label: 'Category', defaultVisible: true },
  { key: 'contract_amount', label: 'Amount', defaultVisible: true },
  { key: 'award_date', label: 'Date', defaultVisible: true }
]

/**
 * Get default visibility state for all columns
 */
const getDefaultVisibility = (columns: ColumnDefinition[]): Record<string, boolean> => {
  const visibility: Record<string, boolean> = {}
  columns.forEach(col => {
    visibility[col.key] = col.defaultVisible !== false
  })
  return visibility
}

/**
 * Load column visibility from localStorage
 */
const loadVisibility = (columns: ColumnDefinition[]): Record<string, boolean> => {
  if (typeof window === 'undefined') {
    return getDefaultVisibility(columns)
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return getDefaultVisibility(columns)
    }

    const savedVisibility = JSON.parse(stored) as Record<string, boolean>
    
    // Merge with defaults to handle new columns
    const defaultVisibility = getDefaultVisibility(columns)
    const merged: Record<string, boolean> = {}
    
    columns.forEach(col => {
      merged[col.key] = savedVisibility[col.key] !== undefined 
        ? savedVisibility[col.key] 
        : defaultVisibility[col.key]
    })
    
    return merged
  } catch (error) {
    console.error('Failed to load column visibility:', error)
    return getDefaultVisibility(columns)
  }
}

/**
 * Save column visibility to localStorage
 */
const saveVisibility = (visibility: Record<string, boolean>): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility))
  } catch (error) {
    console.error('Failed to save column visibility:', error)
  }
}

/**
 * Hook to manage column visibility state with localStorage persistence
 */
export const useColumnVisibility = (columns: ColumnDefinition[] = DEFAULT_COLUMNS) => {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => 
    loadVisibility(columns)
  )

  // Update visibility when columns change
  useEffect(() => {
    const loaded = loadVisibility(columns)
    setVisibility(loaded)
  }, [columns])

  /**
   * Toggle visibility of a specific column
   */
  const toggleColumn = useCallback((columnKey: string) => {
    setVisibility(prev => {
      const newVisibility = {
        ...prev,
        [columnKey]: !prev[columnKey]
      }
      saveVisibility(newVisibility)
      return newVisibility
    })
  }, [])

  /**
   * Set visibility of a specific column
   */
  const setColumnVisible = useCallback((columnKey: string, visible: boolean) => {
    setVisibility(prev => {
      const newVisibility = {
        ...prev,
        [columnKey]: visible
      }
      saveVisibility(newVisibility)
      return newVisibility
    })
  }, [])

  /**
   * Show all columns
   */
  const showAllColumns = useCallback(() => {
    const allVisible = getDefaultVisibility(columns)
    setVisibility(allVisible)
    saveVisibility(allVisible)
  }, [columns])

  /**
   * Hide all columns (except the first one)
   */
  const hideAllColumns = useCallback(() => {
    const allHidden: Record<string, boolean> = {}
    columns.forEach((col, index) => {
      allHidden[col.key] = index === 0 // Keep first column visible
    })
    setVisibility(allHidden)
    saveVisibility(allHidden)
  }, [columns])

  /**
   * Reset to default visibility
   */
  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultVisibility(columns)
    setVisibility(defaults)
    saveVisibility(defaults)
  }, [columns])

  /**
   * Get visible columns
   */
  const visibleColumns = columns.filter(col => visibility[col.key] !== false)

  /**
   * Check if a column is visible
   */
  const isColumnVisible = useCallback((columnKey: string): boolean => {
    return visibility[columnKey] !== false
  }, [visibility])

  return {
    visibility,
    visibleColumns,
    toggleColumn,
    setColumnVisible,
    showAllColumns,
    hideAllColumns,
    resetToDefaults,
    isColumnVisible
  }
}





