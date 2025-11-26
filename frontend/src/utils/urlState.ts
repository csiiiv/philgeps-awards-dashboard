/**
 * URL State Management for Advanced Search
 * 
 * Enables shareable URLs with filter state encoded in hash parameters
 * Example: #q=road&areas=manila&min=1000000&max=5000000&view=analytics
 */

interface FilterState {
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

  return params.toString()
}

/**
 * Decode filter state from URL hash
 */
export function decodeFiltersFromHash(hash: string): FilterState {
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

  return filters
}

/**
 * Update URL hash with current filter state
 */
export function updateUrlHash(filters: FilterState): void {
  console.log('🔗 updateUrlHash called with filters:', filters)
  const hash = encodeFiltersToHash(filters)
  console.log('🔗 Encoded hash:', hash)
  if (hash) {
    window.location.hash = hash
    console.log('🔗 URL updated to:', window.location.href)
  } else {
    // Clear hash if no filters
    history.pushState('', document.title, window.location.pathname + window.location.search)
    console.log('🔗 URL hash cleared')
  }
}

/**
 * Get current filter state from URL hash
 */
export function getFiltersFromUrl(): FilterState {
  return decodeFiltersFromHash(window.location.hash)
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
 */
export function hasUrlFilters(): boolean {
  const hash = window.location.hash
  return hash.length > 1 // More than just '#'
}

