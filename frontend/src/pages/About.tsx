import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeVars } from '../design-system/theme'
import { typography, spacing } from '../design-system'
import { ROUTES } from '../constants/routes'
import {
  PageContainer,
  ContentContainer,
  Card,
  SectionTitle,
  BodyText,
  Alert
} from '../components/styled/Common.styled'
import { Schema } from './About/Schema'

export const About: React.FC = () => {
  const { isDark } = useTheme()
  const vars = getThemeVars()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeSection, setActiveSection] = useState('overview')

  // Sync activeSection with URL
  useEffect(() => {
    const path = location.pathname
    if (path === ROUTES.ABOUT || path === ROUTES.ABOUT_OVERVIEW) {
      setActiveSection('overview')
    } else if (path === ROUTES.ABOUT_DATA) {
      setActiveSection('data')
    } else if (path === ROUTES.ABOUT_FEATURES) {
      setActiveSection('features')
    } else if (path === ROUTES.ABOUT_UPDATES) {
      setActiveSection('updates')
    } else if (path === ROUTES.ABOUT_ARCHITECTURE) {
      setActiveSection('architecture')
    } else if (path === ROUTES.ABOUT_METHODOLOGY) {
      setActiveSection('methodology')
    } else if (path === ROUTES.ABOUT_QUALITY) {
      setActiveSection('quality')
    } else if (path === ROUTES.ABOUT_API) {
      setActiveSection('api')
    } else if (path === ROUTES.ABOUT_CONTACT) {
      setActiveSection('contact')
    } else if (path === ROUTES.ABOUT_SCHEMA) {
      setActiveSection('schema')
    }
  }, [location.pathname])

  const sections = [
    { id: 'overview', title: 'Overview', icon: '🏛️', color: vars.primary[600], route: ROUTES.ABOUT_OVERVIEW },
    { id: 'data', title: 'Data Sources', icon: '📊', color: vars.primary[500], route: ROUTES.ABOUT_DATA },
    { id: 'features', title: 'Key Features', icon: '⚡', color: vars.primary[700], route: ROUTES.ABOUT_FEATURES },
    { id: 'updates', title: 'Latest Updates', icon: '🆕', color: vars.primary[500], route: ROUTES.ABOUT_UPDATES },
    { id: 'architecture', title: 'Architecture', icon: '🏗️', color: vars.primary[600], route: ROUTES.ABOUT_ARCHITECTURE },
    { id: 'methodology', title: 'Methodology', icon: '🔬', color: vars.primary[500], route: ROUTES.ABOUT_METHODOLOGY },
    { id: 'quality', title: 'Data Quality', icon: '✅', color: vars.primary[600], route: ROUTES.ABOUT_QUALITY },
    { id: 'api', title: 'API & Development', icon: '🔌', color: vars.primary[700], route: ROUTES.ABOUT_API },
    { id: 'contact', title: 'Support', icon: '📞', color: vars.primary[500], route: ROUTES.ABOUT_CONTACT },
    { id: 'schema', title: 'Schema', icon: '📋', color: vars.primary[600], route: ROUTES.ABOUT_SCHEMA }
  ]

  const renderTableOfContents = () => (
    <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
      <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
        📚 Table of Contents
      </SectionTitle>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing[3]
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id)
              navigate(section.route)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: spacing[3],
              backgroundColor: activeSection === section.id ? section.color : vars.background.secondary,
              color: activeSection === section.id ? vars.text.inverse : vars.text.primary,
              border: `1px solid ${activeSection === section.id ? section.color : vars.border.medium}`,
              borderRadius: spacing[2],
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}
            onMouseOver={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.backgroundColor = vars.background.tertiary
                e.currentTarget.style.borderColor = section.color
              }
            }}
            onMouseOut={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.backgroundColor = vars.background.secondary
                e.currentTarget.style.borderColor = vars.border.medium
              }
            }}
          >
            <span style={{ fontSize: '1.2em' }}>{section.icon}</span>
            <span>{section.title}</span>
          </button>
        ))}
      </div>
    </Card>
  )

  const renderOverview = () => (
    <div>
        <div style={{
          background: `linear-gradient(135deg, ${vars.primary[50]} 0%, ${vars.primary[100]} 100%)`,
          borderRadius: spacing[3],
          padding: spacing[6],
          marginBottom: spacing[6],
          border: `1px solid ${vars.primary[200]}`
        }}>
          <h1 style={{
            ...typography.textStyles.h1,
            color: vars.primary[600],
            marginBottom: spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3]
          }}>
            <span style={{ fontSize: '2em' }}>🏛️</span>
            PHILGEPS Awards Data Explorer
          </h1>
          <p style={{
            ...typography.textStyles.h3,
            color: vars.primary[500],
            marginBottom: spacing[4]
          }}>
            v4.0.0 - Open PhilGEPS by BetterGov.ph
          </p>
        <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.lg, lineHeight: 1.6 }}>
          A comprehensive transparency dashboard providing access to Philippine government procurement data 
          from 2013-2025. Built for citizens, journalists, researchers, and developers seeking to understand 
          government spending and procurement patterns. Now with complete OpenAPI 3.0 compliance, enhanced export functionality, and production-ready deployment.
        </BodyText>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[6]
      }}>
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5em', marginBottom: spacing[2] }}>📈</div>
          <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[2] }}>
            5M+ Contracts
          </h3>
          <BodyText $isDark={isDark}>
            Comprehensive dataset spanning 13 years of government procurement data
          </BodyText>
        </Card>
        
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5em', marginBottom: spacing[2] }}>🏢</div>
          <h3 style={{ ...typography.textStyles.h3, color: vars.success[600], marginBottom: spacing[2] }}>
            23K+ Agencies
          </h3>
          <BodyText $isDark={isDark}>
            Government organizations and contractors across all regions
          </BodyText>
        </Card>
        
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5em', marginBottom: spacing[2] }}>⚡</div>
          <h3 style={{ ...typography.textStyles.h3, color: vars.warning[600], marginBottom: spacing[2] }}>
            Real-time Search
          </h3>
          <BodyText $isDark={isDark}>
            Advanced filtering and analytics with instant results
          </BodyText>
        </Card>
        
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5em', marginBottom: spacing[2] }}>👁</div>
          <h3 style={{ ...typography.textStyles.h3, color: vars.primary[500], marginBottom: spacing[2] }}>
            Treemap Visualization
          </h3>
          <BodyText $isDark={isDark}>
            Interactive hierarchical data visualization with drill-down
          </BodyText>
        </Card>
        
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5em', marginBottom: spacing[2] }}>📚</div>
          <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[2] }}>
            API Documentation
          </h3>
          <BodyText $isDark={isDark}>
            Complete OpenAPI 3.0 documentation with live testing
          </BodyText>
        </Card>
      </div>
    </div>
  )

  const renderDataSources = () => (
    <div>
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          📊 Data Sources & Coverage
        </SectionTitle>
        
        <div style={{
          background: `linear-gradient(135deg, ${vars.success[50]} 0%, ${vars.success[50]} 100%)`,
          borderRadius: spacing[2],
          padding: spacing[4],
          marginBottom: spacing[4],
          border: `1px solid ${vars.success[600]}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.success[600], marginBottom: spacing[2] }}>
            Primary Source: PHILGEPS
          </h3>
          <BodyText $isDark={isDark} style={{ color: vars.success[600] }}>
            Philippine Government Electronic Procurement System - Official government procurement platform
          </BodyText>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[3],
          marginBottom: spacing[4]
        }}>
          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[3],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[1] }}>
              Time Period
            </h4>
            <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>
              2013 - 2025
            </BodyText>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              13+ years of data
            </BodyText>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[3],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[1] }}>
              Total Contracts
            </h4>
            <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>
              2.2M+ Records
            </BodyText>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              Awarded contracts only
            </BodyText>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[3],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[1] }}>
              Contractors
            </h4>
            <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>
              74K+ Unique
            </BodyText>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              Business entities
            </BodyText>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[3],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[1] }}>
              Organizations
            </h4>
            <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>
              14K+ Agencies
            </BodyText>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              Government entities
            </BodyText>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[3],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[1] }}>
              Geographic Areas
            </h4>
            <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>
              520 Areas
            </BodyText>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              Delivery locations
            </BodyText>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[3],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[1] }}>
              Categories
            </h4>
            <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>
              169 Types
            </BodyText>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              Business categories
            </BodyText>
          </div>
        </div>

        <Alert $isDark={isDark} $variant="info">
          <strong>🌊 Sumbong sa Pangulo Dataset</strong><br />
          Optional dataset from 2022-2025 is included for comprehensive coverage of recent procurement activities.
        </Alert>
      </Card>
    </div>
  )

  const renderUpdates = () => (
    <div>
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          🆕 Latest Updates - v4.0.0 - Open PhilGEPS by BetterGov.ph
        </SectionTitle>
        
        <div style={{
          background: `linear-gradient(135deg, ${vars.success[50]} 0%, ${vars.success[50]} 100%)`,
          borderRadius: spacing[2],
          padding: spacing[4],
          marginBottom: spacing[4],
          border: `1px solid ${vars.success[600]}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.success[600], marginBottom: spacing[2] }}>
            ✅ Complete Dark Mode & BetterGov.ph Branding
          </h3>
          <BodyText $isDark={isDark} style={{ color: vars.success[600] }}>
            Rebranded as Open PhilGEPS by BetterGov.ph with full dark mode support across all components, CSS variable theming, and shadcn/ui integration
          </BodyText>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[4]
        }}>
          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[3] }}>
              🔌 Enhanced API Documentation
            </h4>
            <ul style={{ color: vars.text.primary }}>
              <li style={{ marginBottom: spacing[1] }}>Complete OpenAPI 3.0 schema</li>
              <li style={{ marginBottom: spacing[1] }}>Interactive Swagger UI interface</li>
              <li style={{ marginBottom: spacing[1] }}>ReDoc documentation viewer</li>
              <li style={{ marginBottom: spacing[1] }}>Live API testing capabilities</li>
              <li style={{ marginBottom: spacing[1] }}>Code examples for all endpoints</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.success[600], marginBottom: spacing[3] }}>
              📥 Improved Export Functionality
            </h4>
            <ul style={{ color: vars.text.primary }}>
              <li style={{ marginBottom: spacing[1] }}>Accurate file size estimation</li>
              <li style={{ marginBottom: spacing[1] }}>Individual contract export</li>
              <li style={{ marginBottom: spacing[1] }}>Aggregated data export</li>
              <li style={{ marginBottom: spacing[1] }}>Progress tracking for large exports</li>
              <li style={{ marginBottom: spacing[1] }}>Filtered search results export</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.warning[600], marginBottom: spacing[3] }}>
              🚀 Production Ready
            </h4>
            <ul style={{ color: vars.text.primary }}>
              <li style={{ marginBottom: spacing[1] }}>Mobile data loading fixed</li>
              <li style={{ marginBottom: spacing[1] }}>PowerShell setup script improved</li>
              <li style={{ marginBottom: spacing[1] }}>CORS configuration optimized</li>
              <li style={{ marginBottom: spacing[1] }}>Rate limiting implemented</li>
              <li style={{ marginBottom: spacing[1] }}>Error handling enhanced</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[3] }}>
              🔧 Technical Improvements
            </h4>
            <ul style={{ color: vars.text.primary }}>
              <li style={{ marginBottom: spacing[1] }}>13 active API endpoints</li>
              <li style={{ marginBottom: spacing[1] }}>Comprehensive error handling</li>
              <li style={{ marginBottom: spacing[1] }}>Input validation and sanitization</li>
              <li style={{ marginBottom: spacing[1] }}>Performance optimizations</li>
              <li style={{ marginBottom: spacing[1] }}>Security headers configured</li>
            </ul>
          </div>
        </div>

        <Alert $isDark={isDark} $variant="info">
          <strong>🎯 Status:</strong> All features are production-ready and fully tested. 
          The dashboard now provides a complete, professional-grade experience for government procurement data analysis.
        </Alert>
      </Card>
    </div>
  )

  const renderFeatures = () => (
    <div>
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          ⚡ Key Features
        </SectionTitle>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing[4]
        }}>
          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>🔍</div>
            <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[2] }}>
              Advanced Search
            </h3>
            <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
              Multi-criteria contract search with chip-based filters, autocomplete, and real-time results
            </BodyText>
            <ul style={{ paddingLeft: spacing[4], color: vars.text.secondary }}>
              <li>Keyword search with AND logic (&&)</li>
              <li>Entity-based filtering</li>
              <li>Time range selection</li>
              <li>Real-time autocomplete</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>📊</div>
            <h3 style={{ ...typography.textStyles.h3, color: vars.success[600], marginBottom: spacing[2] }}>
              Analytics Dashboard
            </h3>
            <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
              Interactive charts, trend analysis, and drill-down capabilities for comprehensive data exploration
            </BodyText>
            <ul style={{ paddingLeft: spacing[4], color: vars.text.secondary }}>
              <li>Contractor performance metrics</li>
              <li>Spending trend analysis</li>
              <li>Category breakdowns</li>
              <li>Geographic distribution</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>💾</div>
            <h3 style={{ ...typography.textStyles.h3, color: vars.warning[600], marginBottom: spacing[2] }}>
              Data Export
            </h3>
            <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
              CSV export with estimation and full dataset download capabilities
            </BodyText>
            <ul style={{ paddingLeft: spacing[4], color: vars.text.secondary }}>
              <li>Rank range selection</li>
              <li>File size estimation</li>
              <li>Progress tracking</li>
              <li>Filtered data export</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>🔌</div>
            <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[2] }}>
              API Access
            </h3>
            <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
              Complete REST API with interactive documentation and code examples
            </BodyText>
            <ul style={{ paddingLeft: spacing[4], color: vars.text.secondary }}>
              <li>RESTful endpoints</li>
              <li>Interactive documentation</li>
              <li>Code examples</li>
              <li>Live testing tools</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>🔍</div>
            <h3 style={{ ...typography.textStyles.h3, color: vars.primary[500], marginBottom: spacing[2] }}>
              Drill-down Analysis
            </h3>
            <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
              Nested drill-down modals for granular contract analysis and detailed exploration
            </BodyText>
            <ul style={{ paddingLeft: spacing[4], color: vars.text.secondary }}>
              <li>Entity drill-down</li>
              <li>Nested contract views</li>
              <li>Related entity analysis</li>
              <li>Detailed contract information</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.background.secondary,
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.border.light}`
          }}>
            <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>💾</div>
            <h3 style={{ ...typography.textStyles.h3, color: vars.warning[500], marginBottom: spacing[2] }}>
              Filter Presets
            </h3>
            <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
              Save, load, and manage custom filter configurations for efficient workflow
            </BodyText>
            <ul style={{ paddingLeft: spacing[4], color: vars.text.secondary }}>
              <li>Predefined filters</li>
              <li>Custom filter saving</li>
              <li>Auto-save functionality</li>
              <li>Filter management</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderArchitecture = () => (
    <div>
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          🏗️ Technical Architecture
        </SectionTitle>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing[4]
        }}>
          <div style={{
            backgroundColor: vars.primary[50],
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.primary[200]}`
          }}>
            <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[3] }}>
              Frontend
            </h3>
            <ul style={{ color: vars.primary[600] }}>
              <li style={{ marginBottom: spacing[1] }}>React 18 with TypeScript</li>
              <li style={{ marginBottom: spacing[1] }}>Vite for build tooling and development</li>
              <li style={{ marginBottom: spacing[1] }}>Custom design system with theming</li>
              <li style={{ marginBottom: spacing[1] }}>RESTful API integration</li>
              <li style={{ marginBottom: spacing[1] }}>Service Worker for offline capability</li>
              <li style={{ marginBottom: spacing[1] }}>Performance monitoring and optimization</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.success[50],
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.success[600]}`
          }}>
            <h3 style={{ ...typography.textStyles.h3, color: vars.success[600], marginBottom: spacing[3] }}>
              Backend
            </h3>
            <ul style={{ color: vars.success[600] }}>
              <li style={{ marginBottom: spacing[1] }}>Django 4.2 with REST Framework</li>
              <li style={{ marginBottom: spacing[1] }}>DuckDB for fast data processing</li>
              <li style={{ marginBottom: spacing[1] }}>Parquet files for columnar storage</li>
              <li style={{ marginBottom: spacing[1] }}>Automated data validation and cleaning</li>
              <li style={{ marginBottom: spacing[1] }}>RESTful API endpoints</li>
              <li style={{ marginBottom: spacing[1] }}>Comprehensive error handling</li>
            </ul>
          </div>
        </div>

        <div style={{
          backgroundColor: vars.background.secondary,
          padding: spacing[4],
          borderRadius: spacing[2],
          marginTop: spacing[4],
          border: `1px solid ${vars.border.light}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.text.primary, marginBottom: spacing[2] }}>
            Data Flow
          </h3>
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
            Frontend makes API calls to Django backend → DuckDB processes Parquet files → 
            Processed results returned to frontend for display and interaction
          </BodyText>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            flexWrap: 'wrap',
            fontSize: typography.fontSize.sm,
            color: vars.text.secondary
          }}>
            <span>Frontend</span>
            <span>→</span>
            <span>API</span>
            <span>→</span>
            <span>Django</span>
            <span>→</span>
            <span>DuckDB</span>
            <span>→</span>
            <span>Parquet</span>
            <span>→</span>
            <span>Results</span>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderMethodology = () => (
    <div>
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          🔬 Data Processing Methodology
        </SectionTitle>
        
        <div style={{
          backgroundColor: vars.background.secondary,
          padding: spacing[4],
          borderRadius: spacing[2],
          marginBottom: spacing[4],
          border: `1px solid ${vars.border.light}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[3] }}>
            Data Processing Pipeline
          </h3>
          <ol style={{ paddingLeft: spacing[4], color: vars.text.primary }}>
            <li style={{ marginBottom: spacing[2] }}>Raw data extracted from PHILGEPS XLSX files (2013-2025)</li>
            <li style={{ marginBottom: spacing[2] }}>Data cleaning, validation, and standardization</li>
            <li style={{ marginBottom: spacing[2] }}>Aggregation of multiple line items into single contracts</li>
            <li style={{ marginBottom: spacing[2] }}>Filtered for "Awarded" contracts only to avoid double counting</li>
            <li style={{ marginBottom: spacing[2] }}>Deduplication of exact duplicate records</li>
            <li style={{ marginBottom: spacing[2] }}>Conversion to Parquet format for fast analytics</li>
            <li style={{ marginBottom: spacing[2] }}>Indexing and optimization for search performance</li>
          </ol>
        </div>

        <div style={{
          backgroundColor: vars.background.secondary,
          padding: spacing[4],
          borderRadius: spacing[2],
          border: `1px solid ${vars.border.light}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.success[600], marginBottom: spacing[3] }}>
            Search Optimization
          </h3>
          <ul style={{ paddingLeft: spacing[4], color: vars.text.primary }}>
            <li style={{ marginBottom: spacing[2] }}>Whole-word keyword matching (e.g., 'deo' won't match 'montevideo')</li>
            <li style={{ marginBottom: spacing[2] }}>Autocomplete with fuzzy matching for entity names</li>
            <li style={{ marginBottom: spacing[2] }}>Pre-computed aggregations for fast analytics</li>
            <li style={{ marginBottom: spacing[2] }}>Columnar storage for efficient data processing</li>
          </ul>
        </div>
      </Card>
    </div>
  )

  const renderDataQuality = () => (
    <div>
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          ✅ Data Quality & Limitations
        </SectionTitle>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing[4]
        }}>
          <div style={{
            backgroundColor: vars.error[50],
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.error[600]}`
          }}>
            <h3 style={{ ...typography.textStyles.h3, color: vars.error[600], marginBottom: spacing[3] }}>
              Known Issues
            </h3>
            <ul style={{ color: vars.error[600] }}>
              <li style={{ marginBottom: spacing[1] }}>Inconsistent contractor name formatting</li>
              <li style={{ marginBottom: spacing[1] }}>Missing or incomplete contract dates</li>
              <li style={{ marginBottom: spacing[1] }}>Variations in business category classifications</li>
              <li style={{ marginBottom: spacing[1] }}>Some contract amounts may be incomplete</li>
              <li style={{ marginBottom: spacing[1] }}>Geographic data inconsistencies</li>
              <li style={{ marginBottom: spacing[1] }}>Historical data from 1920s (data entry errors)</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: vars.success[50],
            padding: spacing[4],
            borderRadius: spacing[2],
            border: `1px solid ${vars.success[600]}`
          }}>
            <h3 style={{ ...typography.textStyles.h3, color: vars.success[600], marginBottom: spacing[3] }}>
              Quality Improvements
            </h3>
            <ul style={{ color: vars.success[600] }}>
              <li style={{ marginBottom: spacing[1] }}>Automated data validation and cleaning</li>
              <li style={{ marginBottom: spacing[1] }}>Standardization of entity names</li>
              <li style={{ marginBottom: spacing[1] }}>Deduplication of exact duplicates</li>
              <li style={{ marginBottom: spacing[1] }}>Currency formatting and validation</li>
              <li style={{ marginBottom: spacing[1] }}>Date range validation and filtering</li>
              <li style={{ marginBottom: spacing[1] }}>Category normalization</li>
            </ul>
          </div>
        </div>

        <Alert $isDark={isDark} $variant="warning" style={{ marginTop: spacing[4] }}>
          <strong>⚠️ Data Disclaimer</strong><br />
          This dashboard processes publicly available data for visualization purposes. 
          Data quality issues are not completely addressed and may affect analysis accuracy. 
          For official procurement information, please refer to the official PHILGEPS website.
        </Alert>
      </Card>
    </div>
  )

  const renderAPI = () => (
    <div>
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          🔌 API & Development
        </SectionTitle>
        
        <div style={{
          backgroundColor: vars.primary[50],
          padding: spacing[4],
          borderRadius: spacing[2],
          marginBottom: spacing[4],
          border: `1px solid ${vars.primary[200]}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[2] }}>
            Available Endpoints
          </h3>
          <BodyText $isDark={isDark} style={{ color: vars.primary[600], marginBottom: spacing[3] }}>
            Complete REST API with interactive documentation and code examples
          </BodyText>
          <ul style={{ color: vars.primary[600] }}>
            <li style={{ marginBottom: spacing[1] }}><strong>Contract Search</strong> - Advanced multi-criteria contract filtering</li>
            <li style={{ marginBottom: spacing[1] }}><strong>Entity Lookup</strong> - Search contractors, organizations, areas, categories</li>
            <li style={{ marginBottom: spacing[1] }}><strong>Filter Options</strong> - Get available filter values for dropdowns</li>
            <li style={{ marginBottom: spacing[1] }}><strong>Analytics</strong> - Aggregated data and trend analysis</li>
            <li style={{ marginBottom: spacing[1] }}><strong>Export</strong> - CSV export with estimation</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: vars.background.secondary,
          padding: spacing[4],
          borderRadius: spacing[2],
          border: `1px solid ${vars.border.light}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.text.primary, marginBottom: spacing[3] }}>
            Developer Features
          </h3>
          <ul style={{ color: vars.text.primary }}>
            <li style={{ marginBottom: spacing[1] }}>Interactive code examples with copy-to-clipboard</li>
            <li style={{ marginBottom: spacing[1] }}>Live API testing with current domain</li>
            <li style={{ marginBottom: spacing[1] }}>JavaScript integration examples</li>
            <li style={{ marginBottom: spacing[1] }}>cURL command examples</li>
            <li style={{ marginBottom: spacing[1] }}>Response format documentation</li>
          </ul>
        </div>
      </Card>
    </div>
  )

  const renderContact = () => (
    <div>
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          📞 Support & Resources
        </SectionTitle>
        
        <div style={{
          backgroundColor: vars.background.secondary,
          padding: spacing[4],
          borderRadius: spacing[2],
          marginBottom: spacing[4],
          border: `1px solid ${vars.border.light}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.text.primary, marginBottom: spacing[3] }}>
            Available Resources
          </h3>
          <ul style={{ color: vars.text.primary }}>
            <li style={{ marginBottom: spacing[2] }}><strong>Help Tab</strong> - Comprehensive user guide and examples</li>
            <li style={{ marginBottom: spacing[2] }}><strong>API Docs Tab</strong> - Developer resources and code examples</li>
            <li style={{ marginBottom: spacing[2] }}><strong>Official PHILGEPS</strong> - Source data and official information</li>
            <li style={{ marginBottom: spacing[2] }}><strong>Government Agencies</strong> - Contact relevant departments for official data</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: vars.warning[50],
          padding: spacing[4],
          borderRadius: spacing[2],
          border: `1px solid ${vars.warning[600]}`
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.warning[600], marginBottom: spacing[2] }}>
            Purpose & Disclaimer
          </h3>
          <BodyText $isDark={isDark} style={{ color: vars.warning[600] }}>
            This dashboard is designed for public transparency and educational purposes. 
            For questions about the data or technical issues, please refer to the 
            official PHILGEPS documentation or contact the relevant government agencies.
          </BodyText>
        </div>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'data':
        return renderDataSources()
      case 'features':
        return renderFeatures()
      case 'updates':
        return renderUpdates()
      case 'architecture':
        return renderArchitecture()
      case 'methodology':
        return renderMethodology()
      case 'quality':
        return renderDataQuality()
      case 'api':
        return renderAPI()
      case 'contact':
        return renderContact()
      case 'schema':
        return <Schema />
      default:
        return renderOverview()
    }
  }

  return (
    <PageContainer $isDark={isDark}>
      <ContentContainer $isDark={isDark}>
        {renderTableOfContents()}
        {renderContent()}
      </ContentContainer>
    </PageContainer>
  )
}