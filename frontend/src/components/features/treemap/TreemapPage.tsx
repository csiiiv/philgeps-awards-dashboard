import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeColors } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import {
  PageContainer,
  ContentContainer,
  Card,
  SectionTitle,
  BodyText,
  Grid,
  GridItem
} from '../../styled/Common.styled'
import { TreemapChart, TreemapData } from '../../charts/TreemapChart'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ErrorDisplay } from '../shared/ErrorDisplay'
import { advancedSearchService } from '../../../services/AdvancedSearchService'

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
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('org-category-contracts')
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
      id: 'org-category-contracts',
      label: 'Agency → Category → Contracts',
      description: 'Start with government agency, see spending categories, then individual contracts',
      levels: ['organization', 'category', 'contracts']
    },
    {
      id: 'area-org-contracts',
      label: 'Region → Agency → Contracts',
      description: 'Start with geographic region, see agencies there, then their contracts',
      levels: ['area', 'organization', 'contracts']
    },
    {
      id: 'category-org-contracts',
      label: 'Category → Agency → Contracts',
      description: 'Start with business category, see which agencies buy it, then their contracts',
      levels: ['category', 'organization', 'contracts']
    },
    {
      id: 'contractor-org-contracts',
      label: 'Contractor → Client Agency → Contracts',
      description: 'Start with contractor, see their government clients, then specific contracts',
      levels: ['contractor', 'organization', 'contracts']
    },
    {
      id: 'org-area-contracts',
      label: 'Agency → Region → Contracts',
      description: 'Start with agency, see where they operate, then contracts by region',
      levels: ['organization', 'area', 'contracts']
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
        const searchParams = {
          ...drillDownState.filters,
          [entity.type === 'organization' ? 'organizations' : 
           entity.type === 'area' ? 'areas' :
           entity.type === 'category' ? 'business_categories' : 'contractors']: [entity.name],
          page: 1,
          pageSize: 100,
          sortBy: 'award_date',
          sortDirection: 'desc'
        }

        const response = await advancedSearchService.searchContractsWithChips(searchParams)
        
        if (response.success && response.data) {
          const contracts = response.data.map((contract: any, index: number) => ({
            id: `contract_${index}`,
            name: contract.award_title || contract.notice_title || 'Untitled Contract',
            value: parseFloat(contract.contract_amount) || 0,
            count: 1,
            contractDetails: {
              amount: parseFloat(contract.contract_amount) || 0,
              date: contract.award_date || '',
              description: contract.award_title || contract.notice_title || '',
              contractor: contract.awardee_name || ''
            }
          }))

          setTreemapData({
            level: 'contracts',
            entities: contracts
          })
        }
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
        // This would need to be implemented to load data for intermediate levels
        // For now, just reload initial data
        loadInitialData()
      }
    }
  }, [drillDownState, loadInitialData])

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
            🌳 Treemap Visualization
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
          
          <Grid $columns={2} $gap={spacing[4]}>
            {hierarchies.map(hierarchy => (
              <GridItem key={hierarchy.id}>
                <button
                  onClick={() => handleHierarchyChange(hierarchy.id)}
                  style={{
                    width: '100%',
                    padding: spacing[4],
                    backgroundColor: selectedHierarchy === hierarchy.id 
                      ? themeColors.primary[600] 
                      : themeColors.background.secondary,
                    color: selectedHierarchy === hierarchy.id 
                      ? themeColors.text.inverse 
                      : themeColors.text.primary,
                    border: `2px solid ${selectedHierarchy === hierarchy.id 
                      ? themeColors.primary[600] 
                      : themeColors.border.medium}`,
                    borderRadius: spacing[2],
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (selectedHierarchy !== hierarchy.id) {
                      e.currentTarget.style.backgroundColor = themeColors.primary[50]
                      e.currentTarget.style.borderColor = themeColors.primary[300]
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedHierarchy !== hierarchy.id) {
                      e.currentTarget.style.backgroundColor = themeColors.background.secondary
                      e.currentTarget.style.borderColor = themeColors.border.medium
                    }
                  }}
                >
                  <div style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: spacing[2]
                  }}>
                    {hierarchy.label}
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    opacity: 0.8
                  }}>
                    {hierarchy.description}
                  </div>
                </button>
              </GridItem>
            ))}
          </Grid>
        </Card>

        {/* Error State */}
        {error && (
          <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
            <ErrorDisplay
              error={error}
              onRetry={loadInitialData}
              retryText="Retry loading data"
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
