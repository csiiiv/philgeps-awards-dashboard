import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeColors } from '../design-system/theme'
import { typography, spacing } from '../design-system'

const ApiDocumentation: React.FC = () => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)
  
  // Get the correct API base URL from environment variables
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://philgeps-api.simple-systems.dev'

  // Get the correct URLs for Swagger UI and ReDoc
  const swaggerUrl = `${apiBaseUrl}/api/docs/`
  const redocUrl = `${apiBaseUrl}/api/redoc/`
  const schemaUrl = `${apiBaseUrl}/api/schema/`


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
          padding: spacing[4],
          marginBottom: spacing[4]
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[3] }}>
            Interactive Documentation
          </h3>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, marginBottom: spacing[4] }}>
            Access the full interactive API documentation with testing capabilities:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: spacing[3] }}>
            <a
              href={swaggerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: spacing[4],
                backgroundColor: themeColors.primary[600],
                color: themeColors.text.inverse,
                textDecoration: 'none',
                borderRadius: spacing[2],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                border: `2px solid ${themeColors.primary[600]}`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primary[700]
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primary[600]
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: spacing[2] }}>📚</div>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.inverse, marginBottom: spacing[1] }}>
                Swagger UI
              </h4>
              <p style={{ ...typography.textStyles.body, color: themeColors.text.inverse, fontSize: typography.fontSize.sm, margin: 0, opacity: 0.9 }}>
                Interactive API explorer with testing capabilities
              </p>
            </a>
            <a
              href={redocUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: spacing[4],
                backgroundColor: themeColors.primary[600],
                color: themeColors.text.inverse,
                textDecoration: 'none',
                borderRadius: spacing[2],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                border: `2px solid ${themeColors.primary[600]}`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primary[700]
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.primary[600]
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: spacing[2] }}>📖</div>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.inverse, marginBottom: spacing[1] }}>
                ReDoc
              </h4>
              <p style={{ ...typography.textStyles.body, color: themeColors.text.inverse, fontSize: typography.fontSize.sm, margin: 0, opacity: 0.9 }}>
                Clean, readable API documentation format
              </p>
            </a>
          </div>
        </div>

        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[3] }}>
            Additional Resources
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
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
                border: `1px solid ${themeColors.border.medium}`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
            >
              📄 Download OpenAPI Schema
            </a>
            <a
              href={`${apiBaseUrl}/api/v1/`}
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
                border: `1px solid ${themeColors.border.medium}`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
            >
              🔗 API Root Endpoint
            </a>
          </div>
        </div>
      </div>
    </div>
  )


  const renderContent = () => {
        return renderOverview()
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {renderContent()}
    </div>
  )
}

export { ApiDocumentation }
