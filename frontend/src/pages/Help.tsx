import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeColors } from '../design-system/theme'
import { typography, spacing } from '../design-system'
import {
  PageContainer,
  ContentContainer,
  Card,
  SectionTitle,
  BodyText,
  Alert
} from '../components/styled/Common.styled'

export const Help: React.FC = () => {
  const { isDark } = useTheme()
  const colors = getThemeColors(isDark)
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
  { id: 'overview', title: 'Overview', icon: '🏠', color: colors.primary[600] },
  { id: 'quickstart', title: 'Quick Start', icon: '🚀', color: colors.success[600] },
  { id: 'search', title: 'Advanced Search', icon: '🔍', color: colors.primary[500] },
  { id: 'analytics', title: 'Analytics', icon: '📊', color: colors.warning[600] },
  { id: 'drilldown', title: 'Drill-down', icon: '🔍', color: colors.secondary[600] },
  { id: 'treemap', title: 'Treemap', icon: '�', color: colors.primary[400] },
  { id: 'presets', title: 'Filter Presets', icon: '💾', color: colors.warning[500] },
  { id: 'dataset', title: 'Sumbong sa Pangulo', icon: '🌊', color: colors.primary[400] },
  { id: 'examples', title: 'Examples', icon: '💡', color: colors.success[500] },
  { id: 'tips', title: 'Tips & Best Practices', icon: '💡', color: colors.secondary[500] },
  { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧', color: colors.error[600] }
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
            onClick={() => setActiveSection(section.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: spacing[3],
              backgroundColor: activeSection === section.id ? section.color : colors.background.secondary,
              color: activeSection === section.id ? colors.text.inverse : colors.text.primary,
              border: `1px solid ${activeSection === section.id ? section.color : colors.border.medium}`,
              borderRadius: spacing[2],
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}
            onMouseOver={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.backgroundColor = colors.background.tertiary
                e.currentTarget.style.borderColor = section.color
              }
            }}
            onMouseOut={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.backgroundColor = colors.background.secondary
                e.currentTarget.style.borderColor = colors.border.medium
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
        background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.primary[100]} 100%)`,
        borderRadius: spacing[3],
        padding: spacing[6],
        marginBottom: spacing[6],
        border: `1px solid ${colors.primary[200]}`
      }}>
        <h1 style={{
          ...typography.textStyles.h1,
          color: colors.primary[800],
          marginBottom: spacing[3],
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3]
        }}>
          <span style={{ fontSize: '2em' }}>🏛️</span>
          PHILGEPS Awards Data Explorer
        </h1>
        <div style={{
          ...typography.textStyles.h3,
          color: colors.primary[700],
          marginBottom: spacing[4],
          fontWeight: typography.fontWeight.normal
        }}>
          v3.2.0 - Value Range Filter & Enhanced UX
        </div>
        <p style={{
          ...typography.textStyles.body,
          color: colors.primary[700],
          fontSize: typography.fontSize.lg,
          lineHeight: 1.6,
          margin: 0
        }}>
          This dashboard provides access to Philippine government procurement data from 2013-2025. 
          Use the search and analytics tools to explore contract information, analyze spending patterns, 
          and export data for further analysis. Now with complete OpenAPI 3.0 compliance and enhanced export functionality.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing[4], marginBottom: spacing[6] }}>
        <div style={{
          backgroundColor: colors.success[50],
          border: `1px solid ${colors.success[600]}`,
          borderRadius: spacing[2],
          padding: spacing[4],
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: spacing[2] }}>📊</div>
            <h3 style={{ ...typography.textStyles.h4, color: colors.success[600], marginBottom: spacing[2] }}>
            5M+ Contracts
          </h3>
            <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Comprehensive database of awarded government contracts
          </p>
        </div>
        <div style={{
          backgroundColor: colors.primary[50],
          border: `1px solid ${colors.primary[600]}`,
          borderRadius: spacing[2],
          padding: spacing[4],
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: spacing[2] }}>🏢</div>
          <h3 style={{ ...typography.textStyles.h4, color: colors.primary[600], marginBottom: spacing[2] }}>
            23K+ Organizations
          </h3>
          <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Government agencies and contracting entities
          </p>
        </div>
        <div style={{
          backgroundColor: colors.warning[50],
          border: `1px solid ${colors.warning[600]}`,
          borderRadius: spacing[2],
          padding: spacing[4],
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: spacing[2] }}>👥</div>
          <h3 style={{ ...typography.textStyles.h4, color: colors.warning[600], marginBottom: spacing[2] }}>
            119K+ Contractors
          </h3>
          <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Registered contractors and suppliers
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing[4] }}>
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: spacing[3] }}>🔍</div>
          <h3 style={{ ...typography.textStyles.h4, color: colors.text.primary, marginBottom: spacing[2] }}>
            Advanced Search
          </h3>
          <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Powerful search with multiple filters, keywords, and time ranges
          </p>
        </Card>
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: spacing[3] }}>📊</div>
          <h3 style={{ ...typography.textStyles.h4, color: colors.text.primary, marginBottom: spacing[2] }}>
            Analytics & Charts
          </h3>
          <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Interactive visualizations and data analysis tools
          </p>
        </Card>
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: spacing[3] }}>📥</div>
          <h3 style={{ ...typography.textStyles.h4, color: colors.text.primary, marginBottom: spacing[2] }}>
            Export & Download
          </h3>
          <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Export individual contracts or aggregated data as CSV
          </p>
        </Card>
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: spacing[3] }}>🔍</div>
          <h3 style={{ ...typography.textStyles.h4, color: colors.text.primary, marginBottom: spacing[2] }}>
            Drill-down Analysis
          </h3>
          <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Multi-level data exploration and detailed insights
          </p>
        </Card>
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: spacing[3] }}>👁</div>
          <h3 style={{ ...typography.textStyles.h4, color: colors.text.primary, marginBottom: spacing[2] }}>
            Treemap Visualization
          </h3>
          <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Interactive treemap charts with drill-down capabilities
          </p>
        </Card>
        <Card $isDark={isDark} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: spacing[3] }}>📚</div>
          <h3 style={{ ...typography.textStyles.h4, color: colors.text.primary, marginBottom: spacing[2] }}>
            API Documentation
          </h3>
          <p style={{ ...typography.textStyles.body, color: colors.text.secondary, margin: 0 }}>
            Complete OpenAPI 3.0 documentation with live testing
          </p>
        </Card>
      </div>
    </div>
  )

  const renderQuickStart = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.success[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          🚀
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Quick Start Guide</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Get up and running in minutes
          </BodyText>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing[4], marginBottom: spacing[6] }}>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4],
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>🔍</div>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
            Step 1: Search
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Use Advanced Search to find specific contracts with filters
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4],
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>📊</div>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
            Step 2: Analyze
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Click "Show Analytics" to explore patterns and trends
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4],
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2em', marginBottom: spacing[2] }}>📥</div>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
            Step 3: Export
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Download your results as CSV for further analysis
          </p>
        </div>
      </div>

      <Alert $isDark={isDark} $variant="info" style={{ marginBottom: spacing[4] }}>
        <strong>Tip:</strong> Start with predefined filters to explore common patterns, 
        then customize your search criteria for specific analysis needs.
      </Alert>
    </Card>
  )

  const renderAdvancedSearch = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.primary[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          🔍
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Advanced Search</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Master the search interface
          </BodyText>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing[4], marginBottom: spacing[6] }}>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>👤</span> Contractors
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Search by contractor names with autocomplete and whole-word matching
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>📍</span> Areas
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Filter by delivery areas and geographic regions
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>🏢</span> Organizations
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Search by contracting government agencies
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>🏷️</span> Categories
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Filter by business categories and types of goods/services
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>🔍</span> Keywords
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Search contract titles with AND logic support (use && for multiple keywords)
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>📅</span> Time Ranges
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Filter by award dates (yearly, quarterly, custom ranges)
          </p>
        </div>
      </div>

      <Alert $isDark={isDark} $variant="info">
        <strong>💡 Filter Logic:</strong> Within filter types use OR logic (Contractor A OR Contractor B), 
        between filter types use AND logic (Contractor A AND Area X AND 2023). Keywords support AND logic with &&.
      </Alert>
    </Card>
  )

  const renderAnalytics = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.warning[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          📊
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Analytics & Data Visualization</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Interactive charts and data analysis
          </BodyText>
        </div>
      </div>

      <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
        The Analytics feature provides interactive visualizations to help you understand data patterns and trends. 
        Access analytics from the Advanced Search interface after running a search.
      </BodyText>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing[4], marginBottom: spacing[6] }}>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>📈</span> Charts
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Horizontal bar charts showing top entities by value, count, or average
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>📋</span> Summary Statistics
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Key metrics including total value, contract count, and average amounts
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>🔍</span> Drill-down
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Click on entities in tables to see detailed contract information
          </p>
        </div>
      </div>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>How to Use Analytics</h4>
      <ol style={{ paddingLeft: spacing[4], marginBottom: spacing[4] }}>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Configure search filters in Advanced Search
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Run a search to enable the Analytics button
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Click "Show Analytics" to open the analytics modal
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Select dimension (Contractor, Organization, Area, Category)
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Choose metric (Amount, Count, Average)
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Click on table rows for detailed drill-down analysis
        </li>
      </ol>
    </Card>
  )

  const renderTreemap = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.primary[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          �
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Treemap Visualization</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Interactive treemap charts with drill-down capabilities
          </BodyText>
        </div>
      </div>

      <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
        The Treemap feature provides an interactive visualization of government procurement data using 
        hierarchical rectangles. Each rectangle's size represents the relative value of contracts, 
        making it easy to identify the largest spending areas at a glance.
      </BodyText>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing[4], marginBottom: spacing[6] }}>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>📊</span> Visual Representation
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Rectangles sized by contract value with color coding for different categories
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>🔍</span> Drill-down
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Click on rectangles to explore detailed contract information
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span>🎯</span> Filtering
          </h4>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Apply filters to focus on specific contractors, areas, or time periods
          </p>
        </div>
      </div>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>How to Use Treemap</h4>
      <ol style={{ paddingLeft: spacing[4], marginBottom: spacing[4] }}>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Navigate to the Treemap tab in the main interface
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Select a dimension (Contractor, Organization, Area, Category) to visualize
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Apply filters to focus on specific data subsets
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Click on rectangles to drill down into detailed contract information
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Use the legend to understand color coding and categories
        </li>
      </ol>

      <Alert $isDark={isDark} $variant="info">
        <strong>💡 Tip:</strong> The treemap is most effective for identifying the largest spending areas. 
        Use it in combination with the Data Explorer for comprehensive analysis.
      </Alert>
    </Card>
  )

  const renderDrillDown = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.secondary[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          🔍
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Drill-down Analysis</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Multi-level data exploration
          </BodyText>
        </div>
      </div>

      <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
        The drill-down system allows you to explore data at multiple levels of granularity. 
        Start with broad analytics and drill down to specific contracts and entities.
      </BodyText>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Drill-down Levels</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[3]
        }}>
          <h5 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2], fontSize: typography.fontSize.sm }}>Level 1: Entity Analysis</h5>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Click entities in analytics tables to see their contracts
          </p>
        </div>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[3]
        }}>
          <h5 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2], fontSize: typography.fontSize.sm }}>Level 2: Nested Analysis</h5>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
            Click entities within drill-down modals for combined analysis
          </p>
        </div>
      </div>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Available Tabs</h4>
      <ul style={{ paddingLeft: spacing[4], marginBottom: spacing[4] }}>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Contracts</strong> - Detailed contract information
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Related Contractors</strong> - Other contractors in the same area/category
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Organizations</strong> - Government agencies involved
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Areas</strong> - Geographic delivery areas
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Categories</strong> - Business categories and types
        </li>
      </ul>
    </Card>
  )

  const renderPresets = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.warning[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          💾
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Filter Presets</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Save and load custom filter configurations
          </BodyText>
        </div>
      </div>

      <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
        Save frequently used filter configurations for quick access. The system automatically saves 
        your last used filter configuration and provides predefined filters for common search patterns.
      </BodyText>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Saving Filters</h4>
      <ol style={{ paddingLeft: spacing[4], marginBottom: spacing[4] }}>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Configure your desired filters in Advanced Search
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Click the "Save Filter" button
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Enter a descriptive name and optional description
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Filter configuration is saved to your browser's local storage
        </li>
      </ol>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Loading Filters</h4>
      <ol style={{ paddingLeft: spacing[4], marginBottom: spacing[4] }}>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Click the "Load Filter" dropdown
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Select from saved filters or predefined patterns
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Filter configuration is automatically applied
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Run search to see results with loaded filters
        </li>
      </ol>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Predefined Filters</h4>
      <ul style={{ paddingLeft: spacing[4], marginBottom: spacing[4] }}>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>DPWH District Offices</strong> - Department of Public Works and Highways
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Flood Control Projects</strong> - Infrastructure and flood management
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Multi-purpose Buildings</strong> - Community facilities and offices
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Pumping Stations</strong> - Water infrastructure projects
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Contractor Analysis</strong> - Specific contractor performance
        </li>
      </ul>
    </Card>
  )

  const renderDataset = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.primary[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          🌊
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Sumbong sa Pangulo Dataset</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Extended data coverage from 2022-2025
          </BodyText>
        </div>
      </div>

      <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
        The dashboard includes an additional dataset that extends coverage from 2022-2025, 
        focusing on flood control projects from the "Sumbong sa Pangulo" initiative. This dataset 
        can be optionally included in searches.
      </BodyText>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Dataset Features</h4>
      <ul style={{ paddingLeft: spacing[4], marginBottom: spacing[4] }}>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Extended Timeline</strong> - Additional data from 2022-2025
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Flood Control Focus</strong> - Specialized infrastructure and flood management projects
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Optional Inclusion</strong> - Toggle to include/exclude from searches
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1] }}>
          <strong>Duplicate Handling</strong> - Automatic detection of duplicate entries
        </li>
      </ul>

      <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>How to Use</h4>
      <ol style={{ paddingLeft: spacing[4], marginBottom: spacing[4] }}>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Check "Include Sumbong sa Pangulo Dataset" checkbox in Advanced Search
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Configure your search filters as usual
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Run search to see results from both datasets
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Use analytics to explore the extended data
        </li>
        <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
          Export includes data from both sources when enabled
        </li>
      </ol>

      <Alert $isDark={isDark} $variant="warning">
        <strong>Note:</strong> Enabling this dataset may result in duplicate entries if the same contract 
        exists in both PHILGEPS and Sumbong sa Pangulo datasets.
      </Alert>
    </Card>
  )

  const renderExamples = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.success[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          💡
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Usage Examples</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Common search patterns and workflows
          </BodyText>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>DPWH District Analysis</h4>
          <ol style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Load "DPWH District Offices" filter
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Set time range to "2023-2025"
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Run search and view analytics
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Click districts for drill-down analysis
            </li>
          </ol>
        </div>

        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Flood Control Projects</h4>
          <ol style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Load "Flood control projects" filter
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Enable Sumbong sa Pangulo dataset
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Set time range to "2022-2025"
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Analyze spending by area
            </li>
          </ol>
        </div>

        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Contractor Performance</h4>
          <ol style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Search for specific contractor name
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Set time range to "All Time"
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              View analytics for project trends
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Export data for performance evaluation
            </li>
          </ol>
        </div>

        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Keyword Search</h4>
          <ol style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Use keywords like "fuel && supply"
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Add area or organization filters
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Set appropriate time range
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
              Analyze results and export data
            </li>
          </ol>
        </div>
      </div>
    </Card>
  )

  const renderTips = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.secondary[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          💡
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Tips & Best Practices</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Optimize your search and analysis workflow
          </BodyText>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing[4] }}>
        <div>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Search Tips</h4>
          <ul style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Use autocomplete effectively - type partial names in dropdowns
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Start with broad criteria (year, area) then add specific filters
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Use specific keywords for better results
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Sort results by amount or date for meaningful analysis
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Use "Clear All" to reset and start fresh searches
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Analytics Tips</h4>
          <ul style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Run search first to enable analytics
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Apply relevant filters before opening analytics
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Try different dimensions and metrics
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Click entities for detailed drill-down analysis
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Export data for analysis in external tools
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>General Tips</h4>
          <ul style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Use dark mode for comfortable viewing
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Save complex search criteria for repeated use
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Check API documentation for programmatic access
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Data is updated regularly - check About page for latest info
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Use smaller page sizes (10-20) for faster loading
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )

  const renderTroubleshooting = () => (
    <Card $isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
        <div style={{
          backgroundColor: themeColors.error[50],
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8em'
        }}>
          🔧
        </div>
        <div>
          <SectionTitle $isDark={isDark} style={{ margin: 0 }}>Troubleshooting</SectionTitle>
          <BodyText $isDark={isDark} style={{ margin: 0, color: themeColors.text.secondary }}>
            Common issues and solutions
          </BodyText>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing[4] }}>
        <div>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Common Issues</h4>
          <ul style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              <strong>No search results</strong> - Try removing some filters or using broader terms
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              <strong>Slow loading</strong> - Use more specific filters or smaller page sizes
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              <strong>Export issues</strong> - Check the estimate before proceeding with large exports
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              <strong>Analytics not loading</strong> - Ensure you have run a search first
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              <strong>Analytics button disabled</strong> - Run a search to enable analytics
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>Performance Tips</h4>
          <ul style={{ paddingLeft: spacing[4] }}>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Use specific filters for faster results
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Limit time ranges instead of "All Time"
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Use smaller page sizes (10-20) for faster loading
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Clear browser cache if experiencing issues
            </li>
            <li style={{ ...typography.textStyles.body, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Check your internet connection for large data requests
            </li>
          </ul>
        </div>
      </div>

      <Alert $isDark={isDark} $variant="info" style={{ marginTop: spacing[4] }}>
        <strong>Data Disclaimer:</strong> This dashboard processes publicly available data for visualization purposes. 
        Data quality issues may exist and could affect analysis accuracy. For official procurement information, 
        please refer to the official PHILGEPS website.
      </Alert>
    </Card>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'quickstart':
        return renderQuickStart()
      case 'search':
        return renderAdvancedSearch()
      case 'analytics':
        return renderAnalytics()
      case 'drilldown':
        return renderDrillDown()
      case 'treemap':
        return renderTreemap()
      case 'presets':
        return renderPresets()
      case 'dataset':
        return renderDataset()
      case 'examples':
        return renderExamples()
      case 'tips':
        return renderTips()
      case 'troubleshooting':
        return renderTroubleshooting()
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