import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeColors } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import {
  PageContainer,
  ContentContainer,
  Card,
  SectionTitle,
  BodyText
} from '../../styled/Common.styled'
import { D3TreemapChart as TreemapChart, type TreemapData } from '../../charts/D3TreemapChart'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ErrorDisplay } from '../shared/ErrorDisplay'
import { advancedSearchService, type ChipSearchParams } from '../../../services/AdvancedSearchService'

// Types
interface HierarchyConfig {
  id: string
  label: string
  description: string
  levels: string[]
}

interface DrillDownState {
  level: number
  path: Array<{ id: string; name: string; type: string }>
  filters: Record<string, string[]>
}

export const TreemapPage: React.FC = () => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)
  
  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('area-org-contractor-contracts')
  const [drillDownState, setDrillDownState] = useState<DrillDownState>({
    level: 0,
    path: [],
    filters: {}
  })
  const [treemapData, setTreemapData] = useState<TreemapData>({
    level: 'grouping',
    entities: []
  })

  // Hierarchy configurations
  const hierarchies: HierarchyConfig[] = [
    {
      id: 'area-org-contractor-contracts',
      label: 'Area → Agency → Contractor → Contracts',
      description: 'Start with geographic area, see agencies, then contractors, then individual contracts',
      levels: ['area', 'organization', 'contractor', 'contracts']
    },
    {
      id: 'area-category-contractor-contracts',
      label: 'Area → Category → Contractor → Contracts',
      description: 'Start with geographic area, see spending categories, then contractors, then individual contracts',
      levels: ['area', 'category', 'contractor', 'contracts']
    },
    {
      id: 'area-contractor-contracts',
      label: 'Area → Contractor → Contracts',
      description: 'Start with geographic area, see contractors there, then their individual contracts',
      levels: ['area', 'contractor', 'contracts']
    },
    {
      id: 'contractor-area-org-contracts',
      label: 'Contractor → Area → Agency → Contracts',
      description: 'Start with contractor, see their geographic areas, then agencies, then specific contracts',
      levels: ['contractor', 'area', 'organization', 'contracts']
    },
    {
      id: 'contractor-area-contracts',
      label: 'Contractor → Area → Contracts',
      description: 'Start with contractor, see their geographic areas, then specific contracts',
      levels: ['contractor', 'area', 'contracts']
    },
    {
      id: 'contractor-org-contracts',
      label: 'Contractor → Agency → Contracts',
      description: 'Start with contractor, see their government clients, then specific contracts',
      levels: ['contractor', 'organization', 'contracts']
    },
    {
      id: 'category-area-contractor-contracts',
      label: 'Category → Area → Contractor → Contracts',
      description: 'Start with business category, see geographic areas, then contractors, then individual contracts',
      levels: ['category', 'area', 'contractor', 'contracts']
    },
    {
      id: 'category-contractor-contracts',
      label: 'Category → Contractor → Contracts',
      description: 'Start with business category, see contractors, then their individual contracts',
      levels: ['category', 'contractor', 'contracts']
    },
    {
      id: 'category-org-contracts',
      label: 'Category → Agency → Contracts',
      description: 'Start with business category, see government agencies, then their individual contracts',
      levels: ['category', 'organization', 'contracts']
    },
    {
      id: 'org-contractor-contracts',
      label: 'Agency → Contractor → Contracts',
      description: 'Start with government agency, see contractors, then their individual contracts',
      levels: ['organization', 'contractor', 'contracts']
    }
  ]

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const hierarchy = hierarchies.find(h => h.id === selectedHierarchy)
      if (!hierarchy) return

      const currentLevelType = hierarchy.levels[0]
      const response = await fetch('/api/v1/contracts/chip-aggregates/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topN: 20, // Limit to top 20 for better visualization
          include_flood_control: false
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to load data')
      }

      const dataKey = `by_${currentLevelType === 'organization' ? 'organization' : 
                              currentLevelType === 'area' ? 'area' :
                              currentLevelType === 'category' ? 'category' : 'contractor'}`
      
      const entities = (result.data[dataKey] || []).map((item: any, index: number) => ({
        id: `${currentLevelType}_${index}`,
        name: item.label || item.name || 'Unknown',
        value: parseFloat(item.total_value) || 0,
        count: parseInt(item.count) || 0
      }))

      setTreemapData({
        level: 'grouping',
        entities
      })

      setDrillDownState({
        level: 0,
        path: [],
        filters: {}
      })
    } catch (err) {
      console.error('Error loading treemap data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedHierarchy])

  // Load drill-down data
  const loadDrillDownData = useCallback(async (entity: { id: string; name: string; type: string }) => {
    setLoading(true)
    setError(null)
    
    try {
      const hierarchy = hierarchies.find(h => h.id === selectedHierarchy)
      if (!hierarchy) return

      const currentLevel = drillDownState.level + 1
      const currentLevelType = hierarchy.levels[currentLevel]
      
      if (currentLevelType === 'contracts') {
        // Load individual contracts
        const searchParams: ChipSearchParams = {
          contractors: drillDownState.filters.contractors || [],
          areas: drillDownState.filters.areas || [],
          organizations: drillDownState.filters.organizations || [],
          businessCategories: drillDownState.filters.business_categories || [],
          keywords: [],
          timeRanges: []
        }
        
        // Add the specific entity filter
        if (entity.type === 'organization') {
          searchParams.organizations = [entity.name]
        } else if (entity.type === 'area') {
          searchParams.areas = [entity.name]
        } else if (entity.type === 'category') {
          searchParams.businessCategories = [entity.name]
        } else if (entity.type === 'contractor') {
          searchParams.contractors = [entity.name]
        }

        const response = await advancedSearchService.searchContractsWithChips(searchParams)
        
        if (response.success && response.data) {
          const contracts = response.data.map((contract: any, index: number) => ({
            id: `contract_${index}`,
            name: contract.award_title || contract.notice_title || 'Untitled Contract',
            value: parseFloat(contract.contract_amount) || 0,
            count: 1,
            contractDetails: [{
              award_date: contract.award_date || '',
              award_title: contract.award_title || '',
              notice_title: contract.notice_title || '',
              awardee_name: contract.awardee_name || '',
              organization_name: contract.organization_name || '',
              business_category: contract.business_category || '',
              area_of_delivery: contract.area_of_delivery || '',
              contract_amount: parseFloat(contract.contract_amount) || 0
            }]
          }))

          setTreemapData({
            level: 'contracts',
            entities: contracts
          })
        }
      } else if (currentLevelType === 'contractor') {
        // Load contractors for the selected entity
        const filters = {
          ...drillDownState.filters,
          [entity.type === 'organization' ? 'organizations' : 
           entity.type === 'area' ? 'areas' :
           entity.type === 'category' ? 'business_categories' : 'contractors']: [entity.name]
        }

        const response = await fetch('/api/v1/contracts/chip-aggregates/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
            topN: 20,
            include_flood_control: false
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to load data')
        }

        const entities = (result.data.by_contractor || []).map((item: any, index: number) => ({
          id: `contractor_${index}`,
          name: item.label || item.name || 'Unknown',
          value: parseFloat(item.total_value) || 0,
          count: parseInt(item.count) || 0
        }))

        setTreemapData({
          level: 'sub-grouping',
          entities
        })
      } else if (currentLevelType === 'category') {
        // Load categories for the selected area
        const filters = {
          ...drillDownState.filters,
          [entity.type === 'organization' ? 'organizations' : 
           entity.type === 'area' ? 'areas' :
           entity.type === 'category' ? 'business_categories' : 'contractors']: [entity.name]
        }

        const response = await fetch('/api/v1/contracts/chip-aggregates/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
            topN: 20,
            include_flood_control: false
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to load data')
        }

        const entities = (result.data.by_category || []).map((item: any, index: number) => ({
          id: `category_${index}`,
          name: item.label || item.name || 'Unknown',
          value: parseFloat(item.total_value) || 0,
          count: parseInt(item.count) || 0
        }))

        setTreemapData({
          level: 'sub-grouping',
          entities
        })
      } else {
        // Load next level aggregations
        const filters = {
          ...drillDownState.filters,
          [entity.type === 'organization' ? 'organizations' : 
           entity.type === 'area' ? 'areas' :
           entity.type === 'category' ? 'business_categories' : 'contractors']: [entity.name]
        }

        const response = await fetch('/api/v1/contracts/chip-aggregates/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
            topN: 20, // Limit to top 20 for better visualization
            include_flood_control: false
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to load data')
        }

        const dataKey = `by_${currentLevelType === 'organization' ? 'organization' : 
                                currentLevelType === 'area' ? 'area' :
                                currentLevelType === 'category' ? 'category' : 'contractor'}`
        
        const entities = (result.data[dataKey] || []).map((item: any, index: number) => ({
          id: `${currentLevelType}_${index}`,
          name: item.label || item.name || 'Unknown',
          value: parseFloat(item.total_value) || 0,
          count: parseInt(item.count) || 0
        }))

        setTreemapData({
          level: currentLevel === hierarchy.levels.length - 1 ? 'contracts' : 'sub-grouping',
          entities
        })
      }

      // Update drill-down state
      setDrillDownState(prev => ({
        level: currentLevel,
        path: [...prev.path, entity],
        filters: {
          ...prev.filters,
          [entity.type === 'organization' ? 'organizations' : 
           entity.type === 'area' ? 'areas' :
           entity.type === 'category' ? 'business_categories' : 'contractors']: [entity.name]
        }
      }))
    } catch (err) {
      console.error('Error loading drill-down data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedHierarchy, drillDownState])

  // Load data for a specific level with filters
  const loadDataForLevel = useCallback(async (level: number, filters: Record<string, string[]>) => {
    setLoading(true)
    setError(null)
    
    try {
      const hierarchy = hierarchies.find(h => h.id === selectedHierarchy)
      if (!hierarchy) return

      const currentLevelType = hierarchy.levels[level]
      
      if (currentLevelType === 'contracts') {
        // Load individual contracts
        const searchParams: ChipSearchParams = {
          contractors: filters.contractors || [],
          areas: filters.areas || [],
          organizations: filters.organizations || [],
          businessCategories: filters.business_categories || [],
          keywords: [],
          timeRanges: []
        }

        const response = await advancedSearchService.searchContractsWithChips(searchParams)
        
        if (response.success && response.data) {
          const contracts = response.data.map((contract: any, index: number) => ({
            id: `contract_${index}`,
            name: contract.award_title || contract.notice_title || 'Untitled Contract',
            value: parseFloat(contract.contract_amount) || 0,
            count: 1,
            contractDetails: [{
              award_date: contract.award_date || '',
              award_title: contract.award_title || '',
              notice_title: contract.notice_title || '',
              awardee_name: contract.awardee_name || '',
              organization_name: contract.organization_name || '',
              business_category: contract.business_category || '',
              area_of_delivery: contract.area_of_delivery || '',
              contract_amount: parseFloat(contract.contract_amount) || 0
            }]
          }))

          setTreemapData({
            level: 'contracts',
            entities: contracts
          })
        }
      } else {
        // Load aggregations for the level
        const response = await fetch('/api/v1/contracts/chip-aggregates/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
            topN: 20,
            include_flood_control: false
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to load data')
        }

        const dataKey = `by_${currentLevelType === 'organization' ? 'organization' : 
                                currentLevelType === 'area' ? 'area' :
                                currentLevelType === 'category' ? 'category' : 'contractor'}`
        
        const entities = (result.data[dataKey] || []).map((item: any, index: number) => ({
          id: `${currentLevelType}_${index}`,
          name: item.label || item.name || 'Unknown',
          value: parseFloat(item.total_value) || 0,
          count: parseInt(item.count) || 0
        }))

        setTreemapData({
          level: level === hierarchy.levels.length - 1 ? 'contracts' : 'sub-grouping',
          entities
        })
      }
    } catch (err) {
      console.error('Error loading data for level:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedHierarchy, hierarchies])

  // Event handlers
  const handleDrillDown = useCallback((entity: { id: string; name: string; type: string }) => {
    loadDrillDownData(entity)
  }, [loadDrillDownData])

  const handleDrillUp = useCallback(() => {
    if (drillDownState.level === 0) {
      loadInitialData()
    } else {
      const newPath = drillDownState.path.slice(0, -1)
      const newLevel = drillDownState.level - 1
      
      // Reconstruct filters for the previous level
      const newFilters: Record<string, string[]> = {}
      newPath.forEach(item => {
        const key = item.type === 'organization' ? 'organizations' : 
                   item.type === 'area' ? 'areas' :
                   item.type === 'category' ? 'business_categories' : 'contractors'
        newFilters[key] = [item.name]
      })

      setDrillDownState({
        level: newLevel,
        path: newPath,
        filters: newFilters
      })

      // Load data for the previous level
      if (newLevel === 0) {
        loadInitialData()
      } else {
        // Load data for the intermediate level
        loadDataForLevel(newLevel, newFilters)
      }
    }
  }, [drillDownState, loadInitialData, loadDataForLevel])

  const handleContractClick = useCallback((contract: any) => {
    // Open contract details modal or navigate to contract view
    console.log('Contract clicked:', contract)
    // TODO: Implement contract details modal
  }, [])

  const handleHierarchyChange = useCallback((hierarchyId: string) => {
    setSelectedHierarchy(hierarchyId)
  }, [])

  // Load initial data on mount and when hierarchy changes
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const currentHierarchy = hierarchies.find(h => h.id === selectedHierarchy)

  return (
    <PageContainer $isDark={isDark}>
      <ContentContainer $isDark={isDark}>
        {/* Header */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
          <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
            🗺️ Treemap Visualization
          </SectionTitle>
          
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
            Interactive treemap visualization with drill-down capabilities. Explore government procurement data 
            through different hierarchical views. Click on rectangles to drill down into more detailed data.
          </BodyText>
        </Card>

        {/* Hierarchy Selection */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
          <h3 style={{
            ...typography.textStyles.h3,
            color: themeColors.text.primary,
            marginBottom: spacing[4]
          }}>
            Select Exploration Path
          </h3>
          
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: themeColors.text.secondary,
              marginBottom: spacing[2]
            }}>
              Choose how you want to explore the data:
            </label>
            <select
              value={selectedHierarchy}
              onChange={(e) => handleHierarchyChange(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: themeColors.background.secondary,
                color: themeColors.text.primary,
                border: `1px solid ${themeColors.border.medium}`,
                borderRadius: spacing[1],
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = themeColors.primary[500]
                e.target.style.boxShadow = `0 0 0 2px ${themeColors.primary[100]}`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = themeColors.border.medium
                e.target.style.boxShadow = 'none'
              }}
            >
              {hierarchies.map(hierarchy => (
                <option key={hierarchy.id} value={hierarchy.id}>
                  {hierarchy.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Selected Hierarchy Description */}
          <div style={{
            padding: spacing[3],
            backgroundColor: themeColors.background.tertiary,
            borderRadius: spacing[1],
            border: `1px solid ${themeColors.border.light}`
          }}>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: themeColors.text.secondary,
              lineHeight: '1.5'
            }}>
              {hierarchies.find(h => h.id === selectedHierarchy)?.description}
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
            <ErrorDisplay
              error={error}
              onRetry={loadInitialData}
            />
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing[8]
            }}>
              <LoadingSpinner size="large" />
            </div>
          </Card>
        )}

        {/* Treemap Visualization */}
        {!loading && !error && currentHierarchy && (
          <Card $isDark={isDark}>
            {/* Dynamic Path Information */}
            {drillDownState.level > 0 && (
              <div style={{
                marginBottom: spacing[4],
                padding: spacing[3],
                backgroundColor: themeColors.background.tertiary,
                borderRadius: spacing[1],
                border: `1px solid ${themeColors.border.light}`
              }}>
                <div style={{
                  fontSize: typography.fontSize.base,
                  color: themeColors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[1]
                }}>
                  📍 Current View: {drillDownState.path.map(item => item.name).join(' → ')}
                </div>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  color: themeColors.text.secondary
                }}>
                  {currentHierarchy.levels[drillDownState.level] === 'contracts' 
                    ? 'Showing individual contracts' 
                    : `Showing ${currentHierarchy.levels[drillDownState.level]}s`}
                </div>
              </div>
            )}
            
            <TreemapChart
              data={treemapData}
              hierarchy={currentHierarchy.levels}
              currentLevel={drillDownState.level}
              onDrillDown={handleDrillDown}
              onDrillUp={handleDrillUp}
              onContractClick={handleContractClick}
              title={`${currentHierarchy.label} - Level ${drillDownState.level + 1}`}
              height={500}
            />
          </Card>
        )}
      </ContentContainer>
    </PageContainer>
  )
}
