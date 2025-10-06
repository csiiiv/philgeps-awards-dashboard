/**
 * Advanced Search Service for contracts
 */

export interface SearchFilters {
  contractor: string
  area: string
  organization: string
  businessCategory: string
  keywords: string
  timeRange: {
    type: 'all_time' | 'yearly' | 'quarterly' | 'custom'
    year?: number
    quarter?: number
    startDate?: string
    endDate?: string
  }
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ChipSearchParams {
  contractors: string[]
  areas: string[]
  organizations: string[]
  businessCategories: string[]
  keywords: string[]
  timeRanges: Array<{
    type: 'yearly' | 'quarterly' | 'custom'
    year?: number
    quarter?: number
    startDate?: string
    endDate?: string
  }>
  page?: number
  pageSize?: number
  topN?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  includeFloodControl?: boolean
  dimension?: string
}

export interface SearchResult {
  id: number
  reference_id: string
  notice_title: string
  award_title: string
  organization_name: string
  awardee_name: string
  business_category: string
  area_of_delivery: string
  contract_amount: number
  award_date: string
  award_status: string
  contract_no: string
  created_at: string
}

export interface SearchResponse {
  data: SearchResult[]
  pagination: {
    page: number
    page_size: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  filters_applied: {
    contractor: string
    area: string
    organization: string
    business_category: string
    keywords: string
    time_range: string
  }
}

export interface TimeRange {
  type: 'all_time' | 'yearly' | 'quarterly'
  year?: number
  quarter?: string
}

export interface FilterOptions {
  contractors: string[]
  areas: string[]
  organizations: string[]
  business_categories: string[]
  years?: number[]
}

export interface ChipAggregatesResponse {
  data: {
    summary: Array<{ count: number; total_value: number; avg_value: number }>
    by_year: Array<{ year: number; total_value: number; count: number }>
    by_month: Array<{ month: string; total_value: number; count: number }>
    by_contractor: Array<{ label: string; total_value: number; count: number }>
    by_organization: Array<{ label: string; total_value: number; count: number }>
    by_area: Array<{ label: string; total_value: number; count: number }>
    by_category: Array<{ label: string; total_value: number; count: number }>
  }
}

export interface ChipAggregatesPaginatedResponse {
  data: Array<{ label: string; total_value: number; count: number; avg_value: number }>
  pagination: {
    current_page: number
    page_size: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface ExportEstimateResponse {
  total_count: number
  estimated_csv_bytes: number
}

export class AdvancedSearchService {
  private baseUrl: string

  constructor(baseUrl: string = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1') {
    this.baseUrl = baseUrl
  }

  /**
   * Perform advanced search for contracts
   */
  async searchContracts(filters: SearchFilters): Promise<SearchResponse> {
    try {
      // Create a clean payload to avoid circular references
      const payload = {
        contractor: filters.contractor || '',
        area: filters.area || '',
        organization: filters.organization || '',
        business_category: filters.businessCategory || '',
        keywords: filters.keywords || '',
        time_range: filters.timeRange?.type || 'all_time',
        year: filters.timeRange?.year,
        quarter: filters.timeRange?.quarter,
        page: filters.page || 1,
        page_size: filters.pageSize || 20,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      }
      
      const response = await fetch(`${this.baseUrl}/contracts/advanced-search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Advanced search error:', error)
      throw new Error('Failed to perform search. Please try again.')
    }
  }

  /**
   * Perform search with filter chips (multiple values per filter type)
   */
  async searchContractsWithChips(params: ChipSearchParams): Promise<SearchResponse> {
    try {
      const payload = {
        contractors: params.contractors,
        areas: params.areas,
        organizations: params.organizations,
        business_categories: params.businessCategories,
        keywords: params.keywords,
        time_ranges: params.timeRanges,
        page: params.page || 1,
        page_size: params.pageSize || 20,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        include_flood_control: params.includeFloodControl || false
      }
      
      // Debug logging
      console.log('🚀 AdvancedSearchService - sending payload:', payload)
      
      const response = await fetch(`${this.baseUrl}/contracts/chip-search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Chip search error:', error)
      throw new Error('Failed to perform search. Please try again.')
    }
  }

  async chipAggregates(params: ChipSearchParams): Promise<ChipAggregatesResponse> {
    const payload = {
      contractors: params.contractors,
      areas: params.areas,
      organizations: params.organizations,
      business_categories: params.businessCategories,
      keywords: params.keywords,
      time_ranges: params.timeRanges,
      topN: params.topN || 20,
      include_flood_control: params.includeFloodControl || false
    }

    const response = await fetch(`${this.baseUrl}/contracts/chip-aggregates/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      throw new Error(`Aggregates failed: ${response.statusText}`)
    }
    return response.json()
  }

  async chipAggregatesPaginated(params: ChipSearchParams & { dimension: string }): Promise<ChipAggregatesPaginatedResponse> {
    const payload = {
      contractors: params.contractors,
      areas: params.areas,
      organizations: params.organizations,
      business_categories: params.businessCategories,
      keywords: params.keywords,
      time_ranges: params.timeRanges,
      page: params.page || 1,
      page_size: params.pageSize || 20,
      dimension: params.dimension || 'by_contractor',
      sort_by: params.sortBy || 'total_value',
      sort_direction: params.sortDirection || 'desc',
      include_flood_control: params.includeFloodControl || false
    }

    const response = await fetch(`${this.baseUrl}/contracts/chip-aggregates-paginated/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      throw new Error(`Paginated aggregates failed: ${response.statusText}`)
    }
    return response.json()
  }

  async chipExportEstimate(params: ChipSearchParams): Promise<ExportEstimateResponse> {
    const payload = {
      contractors: params.contractors,
      areas: params.areas,
      organizations: params.organizations,
      business_categories: params.businessCategories,
      keywords: params.keywords,
      time_ranges: params.timeRanges
    }
    const response = await fetch(`${this.baseUrl}/contracts/chip-export-estimate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error('Estimate failed')
    return response.json()
  }

  async chipExport(params: ChipSearchParams): Promise<Blob> {
    const payload = {
      contractors: params.contractors,
      areas: params.areas,
      organizations: params.organizations,
      business_categories: params.businessCategories,
      keywords: params.keywords,
      time_ranges: params.timeRanges
    }
    const response = await fetch(`${this.baseUrl}/contracts/chip-export/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error('Export failed')
    return response.blob()
  }

  /**
   * Get filter options for dropdowns
   */
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/filter-options/?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to load filter options: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Filter options error:', error)
      throw new Error('Failed to load filter options. Please try again.')
    }
  }
}

// Export singleton instance
export const advancedSearchService = new AdvancedSearchService()
