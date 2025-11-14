import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { ThemeToggle } from './components/features/shared/ThemeToggle'
import { ErrorBoundary } from './components/features/shared/ErrorBoundary'
import { usePerformanceMonitoring, usePageLoadPerformance } from './hooks/usePerformanceMonitoring'
import { useServiceWorker } from './utils/serviceWorker'
import { TAB_CONFIGS, type TabType } from './constants/tabs'
import { ROUTES } from './constants/routes'
import {
  LazyDataExplorer,
  LazyAdvancedSearch,
  LazyTreemapPage,
  LazyApiDocumentation,
  LazyHelp,
  LazyAbout,
  ComponentLoadingFallback,
} from './components/lazy/LazyComponents'
import NotFound from './pages/NotFound'
import {
  AppContainer,
  Navigation,
  NavigationContent,
  TabButton,
  MainContent,
  Footer,
  TabIcon,
  TabLabel,
} from './components/styled/App.styled'
import Header from './components/ui/Header'
import './App.css'
import './styles/theme.css'

const AppContent: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  
  // Performance monitoring
  usePerformanceMonitoring('AppContent')
  usePageLoadPerformance()
  
  // Service worker
  const { isRegistered, isUpdateAvailable, updateServiceWorker } = useServiceWorker({
    onUpdate: () => {
      console.log('App update available')
    },
    onSuccess: () => {
      console.log('Service worker registered successfully')
    },
  })

  // Determine active tab based on current route
  const getActiveTab = (): TabType => {
    const path = location.pathname
    if (path === '/' || path === '') return 'data-explorer'
    if (path.startsWith('/advanced-search')) return 'advanced-search'
    if (path.startsWith('/treemap')) return 'treemap'
    if (path.startsWith('/api-docs')) return 'api-docs'
    if (path.startsWith('/help')) return 'help'
    if (path.startsWith('/about')) return 'about'
    return 'data-explorer'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (tabId: TabType) => {
    const routeMap: Record<TabType, string> = {
      'data-explorer': ROUTES.DATA_EXPLORER,
      'advanced-search': ROUTES.ADVANCED_SEARCH,
      'treemap': ROUTES.TREEMAP,
      'api-docs': ROUTES.API_DOCS,
      'help': ROUTES.HELP,
      'about': ROUTES.ABOUT,
    }
    navigate(routeMap[tabId])
  }

  return (
    <AppContainer $isDark={isDark}>
      {/* Header */}
      <Header />

      {/* Navigation Tabs */}
      <Navigation $isDark={isDark}>
        <NavigationContent>
          {TAB_CONFIGS.map(tab => (
            <TabButton
              key={tab.id}
              $isDark={isDark}
              $isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              aria-label={tab.ariaLabel}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              title={tab.description}
            >
              <TabIcon>{tab.icon}</TabIcon>
              <TabLabel>{tab.label}</TabLabel>
            </TabButton>
          ))}
        </NavigationContent>
      </Navigation>

      {/* Main Content */}
      <MainContent>
        <Suspense fallback={<ComponentLoadingFallback />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<LazyDataExplorer />} />
            <Route path={ROUTES.ADVANCED_SEARCH} element={<LazyAdvancedSearch />} />
            <Route path={ROUTES.TREEMAP} element={<LazyTreemapPage />} />
            <Route path={ROUTES.API_DOCS} element={<LazyApiDocumentation />} />
            <Route path={ROUTES.HELP} element={<LazyHelp />} />
            <Route path={ROUTES.ABOUT} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_OVERVIEW} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_DATA} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_FEATURES} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_UPDATES} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_ARCHITECTURE} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_METHODOLOGY} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_QUALITY} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_API} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_CONTACT} element={<LazyAbout />} />
            <Route path={ROUTES.ABOUT_SCHEMA} element={<LazyAbout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MainContent>

      {/* Footer */}
      <Footer $isDark={isDark}>
        <p>
          Built with React, TypeScript, and Django REST API
          {isRegistered && ' • Service Worker Active'}
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          <a href="/PUBLIC_DOMAIN_LICENSE.txt" target="_blank" rel="noopener noreferrer">Public domain license (CC0 1.0)</a>
        </p>
      </Footer>
    </AppContainer>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App