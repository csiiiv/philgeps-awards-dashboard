/**
 * Route paths for the application
 * Each constant represents a unique route in the SPA
 */

export const ROUTES = {
  HOME: '/',
  DATA_EXPLORER: '/',
  ADVANCED_SEARCH: '/advanced-search',
  TREEMAP: '/treemap',
  API_DOCS: '/api-docs',
  HELP: '/help',
  ABOUT: '/about',
} as const

// Type for route paths
export type RoutePath = typeof ROUTES[keyof typeof ROUTES]

/**
 * Map tab IDs to route paths
 */
export const TAB_TO_ROUTE: Record<string, RoutePath> = {
  'data-explorer': ROUTES.DATA_EXPLORER,
  'advanced-search': ROUTES.ADVANCED_SEARCH,
  'treemap': ROUTES.TREEMAP,
  'api-docs': ROUTES.API_DOCS,
  'help': ROUTES.HELP,
  'about': ROUTES.ABOUT,
}

/**
 * Map route paths to tab IDs
 */
export const ROUTE_TO_TAB: Record<RoutePath, string> = {
  [ROUTES.HOME]: 'data-explorer',
  [ROUTES.DATA_EXPLORER]: 'data-explorer',
  [ROUTES.ADVANCED_SEARCH]: 'advanced-search',
  [ROUTES.TREEMAP]: 'treemap',
  [ROUTES.API_DOCS]: 'api-docs',
  [ROUTES.HELP]: 'help',
  [ROUTES.ABOUT]: 'about',
}
