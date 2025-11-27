/**
 * URL State Management for Advanced Search
 * 
 * Enables shareable URLs with filter state encoded in hash parameters
 * Example: #q=road&areas=manila&min=1000000&max=5000000&view=analytics
 */

/**
 * Debug flag for URL state logging
 * Set to false in production to reduce console noise
 */
const DEBUG_URL_STATE = import.meta.env.DEV ?? true

/**
 * Conditional debug logging for URL state operations
 * Only logs in development or when DEBUG_URL_STATE is true
 */
function debugLog(message: string, ...args: any[]): void {
  if (DEBUG_URL_STATE) {
    console.log(`🔗 ${message}`, ...args)
  }
}

/**
 * Filter state interface for URL encoding/decoding
 * Exported for use in components and tests
 */
export interface FilterState {
  contractors?: string[]
  areas?: string[]
  organizations?: string[]
  business_categories?: string[]
  keywords?: string[]
  dateRangeType?: string
  year?: number
  quarter?: number
  startDate?: string
  endDate?: string
  minValue?: number
  maxValue?: number
  includeFloodControl?: boolean
  view?: 'search' | 'analytics'
  tab?: 'tables' | 'charts' | 'clustering' | 'misc'
}

/**
 * Parse URL hash into URLSearchParams
 * Centralized to avoid duplication across components
 */
export function parseHashParams(hash?: string): URLSearchParams {
  const currentHash = hash ?? window.location.hash
  const cleanHash = currentHash.startsWith('#') 
    ? currentHash.substring(1) 
    : currentHash
  return new URLSearchParams(cleanHash)
}

/**
 * Validate and sanitize filter state parameters
 * Prevents invalid values from crashing the app
 */
export function validateFilterState(filters: FilterState): FilterState {
  const validated: FilterState = { ...filters }
  
  // Validate year (1900-2100)
  if (validated.year !== undefined) {
    const year = validated.year
    if (year < 1900 || year > 2100 || isNaN(year)) {
      console.warn(`[URL Validation] Invalid year: ${year}. Ignoring.`)
      delete validated.year
    }
  }
  
  // Validate quarter (1-4)
  if (validated.quarter !== undefined) {
    const quarter = validated.quarter
    if (quarter < 1 || quarter > 4 || isNaN(quarter)) {
      console.warn(`[URL Validation] Invalid quarter: ${quarter}. Ignoring.`)
      delete validated.quarter
    }
  }
  
  // Validate min value
  if (validated.minValue !== undefined && isNaN(validated.minValue)) {
    console.warn(`[URL Validation] Invalid minValue: ${validated.minValue}. Ignoring.`)
    delete validated.minValue
  }
  
  // Validate max value
  if (validated.maxValue !== undefined && isNaN(validated.maxValue)) {
    console.warn(`[URL Validation] Invalid maxValue: ${validated.maxValue}. Ignoring.`)
    delete validated.maxValue
  }
  
  // Validate start date
  if (validated.startDate) {
    const date = new Date(validated.startDate)
    if (date.toString() === 'Invalid Date') {
      console.warn(`[URL Validation] Invalid startDate: ${validated.startDate}. Ignoring.`)
      delete validated.startDate
    }
  }
  
  // Validate end date
  if (validated.endDate) {
    const date = new Date(validated.endDate)
    if (date.toString() === 'Invalid Date') {
      console.warn(`[URL Validation] Invalid endDate: ${validated.endDate}. Ignoring.`)
      delete validated.endDate
    }
  }
  
  return validated
}

/**
 * Deep equality comparison for filter values
 * Handles arrays, undefined/null/empty string equivalence, and defaults
 */
export function areFiltersEqual(val1: any, val2: any): boolean {
  // Handle arrays (sort and compare)
  if (Array.isArray(val1) || Array.isArray(val2)) {
    const arr1 = (Array.isArray(val1) ? val1 : []).filter(Boolean).sort()
    const arr2 = (Array.isArray(val2) ? val2 : []).filter(Boolean).sort()
    return JSON.stringify(arr1) === JSON.stringify(arr2)
  }
  
  // Handle dates/strings (empty string equals undefined/null)
  if ((val1 === '' || val1 === null || val1 === undefined) && 
      (val2 === '' || val2 === null || val2 === undefined)) {
    return true
  }
  
  // Handle Date Range Type default (state 'all_time' vs url undefined)
  if (val1 === 'all_time' && !val2) return true
  if (!val1 && val2 === 'all_time') return true
  
  return val1 === val2
}

/**
 * Compare complete filter states
 * Returns which parts changed: filters, view, or tab
 */
export function compareFilterStates(
  state: FilterState, 
  urlFilters: FilterState
): { filtersMatch: boolean; viewMatch: boolean; tabMatch: boolean } {
  const filtersMatch = 
    areFiltersEqual(state.keywords, urlFilters.keywords) &&
    areFiltersEqual(state.contractors, urlFilters.contractors) &&
    areFiltersEqual(state.areas, urlFilters.areas) &&
    areFiltersEqual(state.organizations, urlFilters.organizations) &&
    areFiltersEqual(state.business_categories, urlFilters.business_categories) &&
    areFiltersEqual(state.minValue, urlFilters.minValue) &&
    areFiltersEqual(state.maxValue, urlFilters.maxValue) &&
    areFiltersEqual(state.includeFloodControl ?? false, urlFilters.includeFloodControl ?? false) &&
    areFiltersEqual(state.dateRangeType, urlFilters.dateRangeType) &&
    areFiltersEqual(state.year, urlFilters.year) &&
    areFiltersEqual(state.quarter, urlFilters.quarter) &&
    areFiltersEqual(state.startDate, urlFilters.startDate) &&
    areFiltersEqual(state.endDate, urlFilters.endDate)
    
  const viewMatch = areFiltersEqual(state.view, urlFilters.view)
  const tabMatch = areFiltersEqual(state.tab, urlFilters.tab)
  
  return { filtersMatch, viewMatch, tabMatch }
}

/**
 * Encode filter state to URL hash
 */
export function encodeFiltersToHash(filters: FilterState): string {
  const params = new URLSearchParams()

  // Keywords - use 'q' for brevity
  if (filters.keywords?.length) {
    params.set('q', filters.keywords.join(','))
  }

  // Multi-value filters
  if (filters.contractors?.length) {
    params.set('contractors', filters.contractors.join(','))
  }
  if (filters.areas?.length) {
    params.set('areas', filters.areas.join(','))
  }
  if (filters.organizations?.length) {
    params.set('orgs', filters.organizations.join(','))
  }
  if (filters.business_categories?.length) {
    params.set('categories', filters.business_categories.join(','))
  }

  // Date range
  if (filters.dateRangeType && filters.dateRangeType !== 'all_time') {
    params.set('dateType', filters.dateRangeType)
    if (filters.year) {
      params.set('year', filters.year.toString())
    }
    if (filters.quarter) {
      params.set('quarter', filters.quarter.toString())
    }
    if (filters.startDate) {
      params.set('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate)
    }
  }

  // Value range
  if (filters.minValue !== undefined) {
    params.set('min', filters.minValue.toString())
  }
  if (filters.maxValue !== undefined) {
    params.set('max', filters.maxValue.toString())
  }

  // Other options
  if (filters.includeFloodControl !== undefined) {
    params.set('flood', filters.includeFloodControl ? '1' : '0')
  }

  // View mode
  if (filters.view) {
    params.set('view', filters.view)
  }

  // Analytics tab
  if (filters.tab) {
    params.set('tab', filters.tab)
  }

  return params.toString()
}

/**
 * Decode filter state from URL hash
 * Now includes validation and error handling
 */
export function decodeFiltersFromHash(hash: string): FilterState {
  try {
  // Remove leading # if present
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash
  const params = new URLSearchParams(cleanHash)

  const filters: FilterState = {}

  // Keywords
  const keywords = params.get('q')
  if (keywords) {
    filters.keywords = keywords.split(',').map(k => k.trim()).filter(Boolean)
  }

  // Multi-value filters
  const contractors = params.get('contractors')
  if (contractors) {
    filters.contractors = contractors.split(',').map(c => c.trim()).filter(Boolean)
  }

  const areas = params.get('areas')
  if (areas) {
    filters.areas = areas.split(',').map(a => a.trim()).filter(Boolean)
  }

  const orgs = params.get('orgs')
  if (orgs) {
    filters.organizations = orgs.split(',').map(o => o.trim()).filter(Boolean)
  }

  const categories = params.get('categories')
  if (categories) {
    filters.business_categories = categories.split(',').map(c => c.trim()).filter(Boolean)
  }

  // Date range
  const dateType = params.get('dateType')
  if (dateType) {
    filters.dateRangeType = dateType
    
    const year = params.get('year')
    if (year) {
      filters.year = parseInt(year)
    }
    
    const quarter = params.get('quarter')
    if (quarter) {
      filters.quarter = parseInt(quarter)
    }
    
    const startDate = params.get('startDate')
    if (startDate) {
      filters.startDate = startDate
    }
    
    const endDate = params.get('endDate')
    if (endDate) {
      filters.endDate = endDate
    }
  }

  // Value range
  const min = params.get('min')
  if (min) {
    filters.minValue = parseFloat(min)
  }

  const max = params.get('max')
  if (max) {
    filters.maxValue = parseFloat(max)
  }

  // Other options
  const flood = params.get('flood')
  if (flood !== null) {
    filters.includeFloodControl = flood === '1'
  }

  // View mode
  const view = params.get('view')
  if (view === 'analytics' || view === 'search') {
    filters.view = view
  }

  // Analytics tab
  const tab = params.get('tab')
  if (tab === 'tables' || tab === 'charts' || tab === 'clustering' || tab === 'misc') {
    filters.tab = tab
  }

    // Validate and sanitize before returning
    return validateFilterState(filters)
    
  } catch (error) {
    console.error('[URL Decode] Error decoding URL hash:', error)
    return {}
  }
}

/**
 * Update URL hash with current filter state
 * @param filters - Filter state to encode
 * @param optionsOrAddToHistory - Either an options object or boolean for backward compatibility
 * @param replace - (Optional, legacy) If true, completely replace URL instead of merging
 */
export function updateUrlHash(
  filters: FilterState, 
  optionsOrAddToHistory?: boolean | { addToHistory?: boolean; replace?: boolean },
  replace?: boolean
): void {
  // Handle backward compatibility with old signature: updateUrlHash(filters, addToHistory, replace)
  let addToHistory = true
  let shouldReplace = false
  
  if (typeof optionsOrAddToHistory === 'boolean') {
    // Old signature: updateUrlHash(filters, addToHistory)
    addToHistory = optionsOrAddToHistory
    shouldReplace = replace ?? false
  } else if (optionsOrAddToHistory) {
    // New signature: updateUrlHash(filters, { addToHistory, replace })
    addToHistory = optionsOrAddToHistory.addToHistory ?? true
    shouldReplace = optionsOrAddToHistory.replace ?? false
  }
  
  debugLog('updateUrlHash called', { filters, addToHistory, replace: shouldReplace })
  
  // Merge with current URL parameters unless replace is true
  let finalFilters = filters
  if (!shouldReplace) {
    const currentFilters = getFiltersFromUrl()
    // Merge current URL with new filters (new filters override)
    finalFilters = { ...currentFilters, ...filters }
    debugLog('Merged with current URL:', finalFilters)
  }
  
  const hash = encodeFiltersToHash(finalFilters)
  debugLog('Encoded hash:', hash)
  
  if (hash) {
    const newUrl = `#${hash}`
    
    if (addToHistory) {
      // Add to history - allows browser back/forward
    window.location.hash = hash
      debugLog('URL updated (added to history):', window.location.href)
    } else {
      // Replace current history entry - doesn't add to stack
      window.history.replaceState(null, '', newUrl)
      debugLog('URL updated (replaced history):', window.location.href)
    }
  } else {
    // Clear hash if no filters
    history.pushState('', document.title, window.location.pathname + window.location.search)
    debugLog('URL hash cleared')
  }
}

/**
 * Get current filter state from URL hash
 * Safely handles all errors and returns empty state if anything fails
 */
export function getFiltersFromUrl(): FilterState {
  try {
  return decodeFiltersFromHash(window.location.hash)
  } catch (error) {
    console.error('[getFiltersFromUrl] Unexpected error:', error)
    return {}
  }
}

/**
 * Create a shareable URL for current filters
 */
export function createShareableUrl(filters: FilterState, baseUrl?: string): string {
  const base = baseUrl || window.location.origin + window.location.pathname
  const hash = encodeFiltersToHash(filters)
  return hash ? `${base}#${hash}` : base
}

/**
 * Check if URL contains filter parameters
 * Safely handles all errors
 */
export function hasUrlFilters(): boolean {
  try {
  const hash = window.location.hash
  return hash.length > 1 // More than just '#'
  } catch (error) {
    console.error('[hasUrlFilters] Unexpected error:', error)
    return false
  }
}

