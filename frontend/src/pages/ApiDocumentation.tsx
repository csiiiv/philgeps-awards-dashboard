import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeColors } from '../design-system/theme'
import { typography, spacing } from '../design-system'

const ApiDocumentation: React.FC = () => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)
  
  // Get the correct API base URL from environment variables
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://philgeps-api.simple-systems.dev'
  const [activeSection, setActiveSection] = useState('swagger')
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const sections = [
    { id: 'swagger', label: 'Swagger UI', icon: '📚' },
    { id: 'redoc', label: 'ReDoc', icon: '📖' },
    { id: 'overview', label: 'Overview', icon: 'ℹ️' }
  ]

  // Get the correct URLs for Swagger UI and ReDoc
  const swaggerUrl = `${apiBaseUrl}/api/docs/`
  const redocUrl = `${apiBaseUrl}/api/redoc/`
  const schemaUrl = `${apiBaseUrl}/api/schema/`

  // Handle iframe load events
  useEffect(() => {
    setIframeLoaded(false)
  }, [activeSection])

  const renderSwaggerUI = () => (
    <div style={{ height: '80vh', width: '100%' }}>
      {!iframeLoaded && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: themeColors.background.secondary,
          borderRadius: spacing[2],
          border: `1px solid ${themeColors.border.medium}`
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: spacing[4] }}>📚</div>
            <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary }}>
              Loading Swagger UI...
            </p>
          </div>
        </div>
      )}
      <iframe
        src={swaggerUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: spacing[2],
          display: iframeLoaded ? 'block' : 'none'
        }}
        onLoad={() => setIframeLoaded(true)}
        title="Swagger UI - API Documentation"
      />
    </div>
  )

  const renderReDoc = () => (
    <div style={{ height: '80vh', width: '100%' }}>
      {!iframeLoaded && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: themeColors.background.secondary,
          borderRadius: spacing[2],
          border: `1px solid ${themeColors.border.medium}`
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: spacing[4] }}>📖</div>
            <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary }}>
              Loading ReDoc...
            </p>
          </div>
        </div>
      )}
      <iframe
        src={redocUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: spacing[2],
          display: iframeLoaded ? 'block' : 'none'
        }}
        onLoad={() => setIframeLoaded(true)}
        title="ReDoc - API Documentation"
      />
    </div>
  )

  const renderOverview = () => (
    <div>
      <div style={{ marginBottom: spacing[6] }}>
        <h2 style={{ ...typography.textStyles.h2, color: themeColors.text.primary, marginBottom: spacing[4] }}>
          API Documentation
        </h2>
        <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, marginBottom: spacing[4] }}>
          The PHILGEPS Awards Data Explorer provides a comprehensive REST API for querying and analyzing government contract data. 
          The API is built with Django REST Framework and uses DuckDB for efficient data processing with Parquet files.
        </p>
        
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4],
          marginBottom: spacing[4]
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[2] }}>
            Interactive Documentation
          </h3>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, marginBottom: spacing[3] }}>
            Use the tabs above to access interactive API documentation:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing[3] }}>
            <div style={{
            backgroundColor: themeColors.background.primary,
              border: `1px solid ${themeColors.border.light}`,
            borderRadius: spacing[1],
              padding: spacing[3]
            }}>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[1] }}>
                📚 Swagger UI
            </h4>
              <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, fontSize: typography.fontSize.sm, margin: 0 }}>
                Interactive API explorer with testing capabilities
            </p>
          </div>
          <div style={{
              backgroundColor: themeColors.background.primary,
              border: `1px solid ${themeColors.border.light}`,
              borderRadius: spacing[1],
              padding: spacing[3]
            }}>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[1] }}>
                📖 ReDoc
            </h4>
              <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, fontSize: typography.fontSize.sm, margin: 0 }}>
                Clean, readable API documentation format
            </p>
            </div>
          </div>
        </div>

          <div style={{
            backgroundColor: themeColors.background.secondary,
            border: `1px solid ${themeColors.border.medium}`,
            borderRadius: spacing[2],
          padding: spacing[4],
          marginBottom: spacing[4]
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[2] }}>
            API Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[3] }}>
            <div>
              <strong style={{ color: themeColors.text.primary }}>Base URL:</strong>
              <br />
              <code style={{
                backgroundColor: themeColors.background.primary,
                padding: spacing[1],
                borderRadius: spacing[1],
                fontFamily: 'monospace',
                color: themeColors.primary[600],
                fontSize: typography.fontSize.sm
              }}>
                {apiBaseUrl}/api/v1/
              </code>
            </div>
            <div>
              <strong style={{ color: themeColors.text.primary }}>OpenAPI Version:</strong>
              <br />
              <span style={{ color: themeColors.text.secondary }}>3.0.3</span>
            </div>
            <div>
              <strong style={{ color: themeColors.text.primary }}>Total Endpoints:</strong>
              <br />
              <span style={{ color: themeColors.text.secondary }}>12</span>
            </div>
            <div>
              <strong style={{ color: themeColors.text.primary }}>Rate Limit:</strong>
              <br />
              <span style={{ color: themeColors.text.secondary }}>240/hour</span>
            </div>
        </div>
      </div>

        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[2] }}>
            Quick Links
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
            <a
              href={swaggerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: themeColors.primary[600],
                color: themeColors.text.inverse,
                textDecoration: 'none',
              borderRadius: spacing[1],
              fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
            >
              📚 Open Swagger UI
            </a>
            <a
              href={redocUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: themeColors.primary[600],
                color: themeColors.text.inverse,
                textDecoration: 'none',
                borderRadius: spacing[1],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
            >
              📖 Open ReDoc
            </a>
            <a
              href={schemaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: themeColors.background.primary,
                color: themeColors.text.primary,
                textDecoration: 'none',
                borderRadius: spacing[1],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                border: `1px solid ${themeColors.border.medium}`
              }}
            >
              📄 Download Schema
            </a>
          </div>
        </div>
      </div>
    </div>
  )


  const renderContent = () => {
    switch (activeSection) {
      case 'swagger':
        return renderSwaggerUI()
      case 'redoc':
        return renderReDoc()
      case 'overview':
        return renderOverview()
      default:
        return renderSwaggerUI()
    }
  }

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      {/* Section Navigation */}
      <div style={{
        display: 'flex',
        gap: spacing[2],
        marginBottom: spacing[6],
        padding: spacing[2],
        backgroundColor: themeColors.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${themeColors.border.medium}`
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              border: 'none',
              backgroundColor: activeSection === section.id ? themeColors.primary[600] : 'transparent',
              color: activeSection === section.id ? themeColors.text.inverse : themeColors.text.primary,
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              borderRadius: spacing[1],
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}
            onMouseOver={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.backgroundColor = themeColors.primary[50]
              }
            }}
            onMouseOut={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <span>{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}

export { ApiDocumentation }
