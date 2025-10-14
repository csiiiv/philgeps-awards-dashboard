export type TabType = 'data-explorer' | 'advanced-search' | 'treemap' | 'api-docs' | 'help' | 'about'

export interface TabConfig {
  id: TabType
  label: string
  icon: string
  description: string
  ariaLabel: string
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'data-explorer',
    label: 'Data Explorer',
    icon: '📊',
    description: 'Explore data by entity with simple filters',
    ariaLabel: 'Navigate to Data Explorer tab'
  },
  {
    id: 'advanced-search',
    label: 'Advanced Search',
    icon: '🔎',
    description: 'Perform advanced searches with filters',
    ariaLabel: 'Navigate to Advanced Search tab'
  },
  {
    id: 'treemap',
    label: 'Treemap',
    icon: '👁',
    description: 'Interactive treemap visualization with drill-down',
    ariaLabel: 'Navigate to Treemap tab'
  },
  {
    id: 'api-docs',
    label: 'API Docs',
    icon: '📚',
    description: 'View API documentation and examples',
    ariaLabel: 'Navigate to API Documentation tab'
  },
  {
    id: 'help',
    label: 'Help',
    icon: '❓',
    description: 'Get help and support information',
    ariaLabel: 'Navigate to Help tab'
  },
  {
    id: 'about',
    label: 'About',
    icon: 'ℹ️',
    description: 'Learn about the application',
    ariaLabel: 'Navigate to About tab'
  }
]

export const DEFAULT_TAB: TabType = 'data-explorer'
