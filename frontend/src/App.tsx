import React, { useState, Suspense } from 'react'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { ThemeToggle } from './components/features/shared/ThemeToggle'
import { ErrorBoundary } from './components/features/shared/ErrorBoundary'
import { usePerformanceMonitoring, usePageLoadPerformance } from './hooks/usePerformanceMonitoring'
import { useServiceWorker } from './utils/serviceWorker'
import { TAB_CONFIGS, DEFAULT_TAB, type TabType } from './constants/tabs'
import {
  LazyDataExplorer,
  LazyAdvancedSearch,
  LazyApiDocumentation,
  LazyHelp,
  LazyAbout,
  ComponentLoadingFallback,
} from './components/lazy/LazyComponents'
import {
  AppContainer,
  Header,
  HeaderContent,
  Title,
  HeaderRight,
  Version,
  Navigation,
  NavigationContent,
  TabButton,
  MainContent,
  Footer,
  TabIcon,
  TabLabel,
} from './components/styled/App.styled'
import './App.css'
import './styles/theme.css'

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(DEFAULT_TAB)
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

  const renderContent = () => {
    switch (activeTab) {
      case 'data-explorer':
        return <LazyDataExplorer />
      case 'advanced-search':
        return <LazyAdvancedSearch />
      case 'api-docs':
        return <LazyApiDocumentation />
      case 'help':
        return <LazyHelp />
      case 'about':
        return <LazyAbout />
      default:
        return <LazyDataExplorer />
    }
  }

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
  }

  return (
    <AppContainer $isDark={isDark}>
      {/* Header */}
      <Header $isDark={isDark}>
        <HeaderContent>
          <Title $isDark={isDark}>
            PHILGEPS Awards Data Explorer
          </Title>
          <HeaderRight>
            <Version $isDark={isDark}>
              v3.0.1 - Metrics Dashboard
            </Version>
            <ThemeToggle />
            {isUpdateAvailable && (
              <button
                onClick={updateServiceWorker}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
                aria-label="Update available - click to refresh"
              >
                Update Available
              </button>
            )}
          </HeaderRight>
        </HeaderContent>
      </Header>

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
          {renderContent()}
        </Suspense>
      </MainContent>

      {/* Footer */}
      <Footer $isDark={isDark}>
        <p>
          Built with React, TypeScript, and Django REST API
          {isRegistered && ' • Service Worker Active'}
        </p>
      </Footer>
    </AppContainer>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App