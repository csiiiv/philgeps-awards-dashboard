import { lazy } from 'react'
import { ErrorBoundary } from '../features/shared/ErrorBoundary'
import { LoadingContainer, LoadingContent, LoadingSpinner, LoadingText } from '../styled/Loading.styled'

// Lazy load components for better performance
const DataExplorer = lazy(() => import('../features/data-explorer/DataExplorer').then(m => ({ default: m.DataExplorer })))
const AdvancedSearch = lazy(() => import('../features/advanced-search/AdvancedSearch').then(m => ({ default: m.AdvancedSearch })))
const ApiDocumentation = lazy(() => import('../../pages/ApiDocumentation').then(m => ({ default: m.ApiDocumentation })))
const Help = lazy(() => import('../../pages/Help').then(m => ({ default: m.Help })))
const About = lazy(() => import('../../pages/About').then(m => ({ default: m.About })))

// Wrapped components with error boundaries
export const LazyDataExplorer = () => (
  <ErrorBoundary>
    <DataExplorer />
  </ErrorBoundary>
)

export const LazyAdvancedSearch = () => (
  <ErrorBoundary>
    <AdvancedSearch />
  </ErrorBoundary>
)

export const LazyApiDocumentation = () => (
  <ErrorBoundary>
    <ApiDocumentation />
  </ErrorBoundary>
)

export const LazyHelp = () => (
  <ErrorBoundary>
    <Help />
  </ErrorBoundary>
)

export const LazyAbout = () => (
  <ErrorBoundary>
    <About />
  </ErrorBoundary>
)

// Loading component for suspense fallback
export const ComponentLoadingFallback = () => (
  <LoadingContainer>
    <LoadingContent>
      <LoadingSpinner />
      <LoadingText>Loading component...</LoadingText>
    </LoadingContent>
  </LoadingContainer>
)
