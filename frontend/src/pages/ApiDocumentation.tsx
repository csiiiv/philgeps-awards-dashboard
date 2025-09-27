import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeColors } from '../design-system/theme'
import { colors, typography, spacing } from '../design-system'

const ApiDocumentation: React.FC = () => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)
  
  // Get the correct API base URL from environment variables
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://philgeps-api.simple-systems.dev'
  const [activeSection, setActiveSection] = useState('overview')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📚' },
    { id: 'endpoints', label: 'Endpoints', icon: '🔗' },
    { id: 'examples', label: 'Examples', icon: '💻' },
    { id: 'testing', label: 'Testing', icon: '🧪' }
  ]

  const codeExamples = {
    getContractors: `# Keyword lookup (substring)
curl "${apiBaseUrl}/api/v1/contractors/?search=petron&page_size=10"

# Whole-word lookup (deo won't match montevideo)
curl "${apiBaseUrl}/api/v1/contractors/?word=deo&page_size=10"`,
    searchContracts: `curl -X POST "${apiBaseUrl}/api/v1/contracts/chip-search/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": ["PETRON CORPORATION"],
    "areas": ["NCR - NATIONAL CAPITAL REGION"],
    "organizations": [],
    "business_categories": ["CONSTRUCTION"],
    "keywords": ["fuel", "supply"],
    "time_ranges": [],
    "page": 1,
    "page_size": 10,
    "sortBy": "award_date",
    "sortDirection": "desc"
  }'`,
    getRelatedEntities: `# Filter options for dropdowns (contractors, areas, organizations, categories)
curl "${apiBaseUrl}/api/v1/contracts/filter-options/"`,
    javascriptExample: `// Get top contractors
const response = await fetch('${apiBaseUrl}/api/v1/contractors/?search=petron&page_size=10');
const data = await response.json();
console.log(data); // DRF list or {results: [...]} depending on pagination settings

// Search for contracts
const searchResponse = await fetch('${apiBaseUrl}/api/v1/contracts/chip-search/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contractors: ['PETRON CORPORATION'],
    areas: ['NCR - NATIONAL CAPITAL REGION'],
    organizations: [],
    business_categories: [],
    keywords: ['fuel'],
    time_ranges: [],
    page: 1,
    page_size: 10,
    sortBy: 'award_date',
    sortDirection: 'desc'
  })
});
const searchData = await searchResponse.json();
console.log(searchData.data); // Array of contracts`,
    pythonExample: `import requests

# Get contractors by keyword
response = requests.get('${apiBaseUrl}/api/v1/contractors/?search=petron&page_size=10')
data = response.json()
print(data)

# Search for contracts with chips
search_response = requests.post('${apiBaseUrl}/api/v1/contracts/chip-search/', 
  json={
    'contractors': ['PETRON CORPORATION'],
    'areas': ['NCR - NATIONAL CAPITAL REGION'],
    'organizations': [],
    'business_categories': [],
    'keywords': ['fuel'],
    'time_ranges': [],
    'page': 1,
    'page_size': 10,
    'sortBy': 'award_date',
    'sortDirection': 'desc'
  }
)
search_data = search_response.json()
print(search_data['data'])  # List of contracts`,
    exportEstimate: `# Estimate size of full CSV export for current filters
curl -X POST "${apiBaseUrl}/api/v1/contracts/chip-export-estimate/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": [],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": ["road"],
    "time_ranges": []
  }'`,
    exportAll: `# Stream full CSV export for current filters
curl -X POST "${apiBaseUrl}/api/v1/contracts/chip-export/" \
  -H "Content-Type: application/json" \
  -d '{
    "contractors": [],
    "areas": [],
    "organizations": [],
    "business_categories": [],
    "keywords": ["road"],
    "time_ranges": []
  }' --output contracts_export.csv`
  }

  const endpoints = [
    {
      method: 'GET',
      path: '/contractors/?search=...|?word=...',
      description: '✅ ACTIVE - Search contractors with substring or exact word matching. Used by SearchableSelect component for autocomplete.',
      parameters: [
        { name: 'search', type: 'string', required: false, description: 'Substring match (e.g., "petron" matches "PETRON CORPORATION")' },
        { name: 'word', type: 'string', required: false, description: 'Whole-word match (e.g., "deo" won\'t match "montevideo")' },
        { name: 'page_size', type: 'integer', required: false, description: 'Results per page (default: 20)' }
      ]
    },
    {
      method: 'GET',
      path: '/organizations/?search=...|?word=...',
      description: '✅ ACTIVE - Search organizations with substring or exact word matching. Used by SearchableSelect component.',
      parameters: [
        { name: 'search', type: 'string', required: false, description: 'Substring match' },
        { name: 'word', type: 'string', required: false, description: 'Whole-word match' },
        { name: 'page_size', type: 'integer', required: false, description: 'Results per page (default: 20)' }
      ]
    },
    {
      method: 'GET',
      path: '/business-categories/?search=...|?word=...',
      description: '✅ ACTIVE - Search business categories with substring or exact word matching. Used by SearchableSelect component.',
      parameters: [
        { name: 'search', type: 'string', required: false, description: 'Substring match' },
        { name: 'word', type: 'string', required: false, description: 'Whole-word match' },
        { name: 'page_size', type: 'integer', required: false, description: 'Results per page (default: 20)' }
      ]
    },
    {
      method: 'GET',
      path: '/areas-of-delivery/?search=...|?word=...',
      description: '✅ ACTIVE - Search delivery areas with substring or exact word matching. Used by SearchableSelect component.',
      parameters: [
        { name: 'search', type: 'string', required: false, description: 'Substring match' },
        { name: 'word', type: 'string', required: false, description: 'Whole-word match' },
        { name: 'page_size', type: 'integer', required: false, description: 'Results per page (default: 20)' }
      ]
    },
    {
      method: 'GET',
      path: '/contracts/filter-options/',
      description: '✅ ACTIVE - Get all available filter options for dropdowns and autocomplete. Used by AdvancedSearchFilters component.',
      parameters: []
    },
    {
      method: 'POST',
      path: '/contracts/chip-search/',
      description: '✅ ACTIVE - Main search endpoint. Advanced contract search using filter chips (multiple values per filter type). Used by AdvancedSearch component.',
      parameters: [
        { name: 'contractors', type: 'array', required: false, description: 'Array of contractor names' },
        { name: 'areas', type: 'array', required: false, description: 'Array of delivery areas' },
        { name: 'organizations', type: 'array', required: false, description: 'Array of organizations' },
        { name: 'business_categories', type: 'array', required: false, description: 'Array of business categories' },
        { name: 'keywords', type: 'array', required: false, description: 'Array of keywords with AND logic support' },
        { name: 'time_ranges', type: 'array', required: false, description: 'Array of time range objects' },
        { name: 'page', type: 'integer', required: false, description: 'Page number (1-based)' },
        { name: 'page_size', type: 'integer', required: false, description: 'Items per page' },
        { name: 'sortBy', type: 'string', required: false, description: 'Sort field (award_date, contract_amount, etc.)' },
        { name: 'sortDirection', type: 'string', required: false, description: 'Sort direction (asc, desc)' },
        { name: 'include_flood_control', type: 'boolean', required: false, description: 'Include Sumbong sa Pangulo data (default: false)' }
      ]
    },
    {
      method: 'POST',
      path: '/contracts/chip-aggregates/',
      description: '✅ ACTIVE - Get aggregated data for charts and analytics. Used by AnalyticsExplorer for chart data and summary statistics.',
      parameters: [
        { name: 'contractors', type: 'array', required: false, description: 'Array of contractor names' },
        { name: 'areas', type: 'array', required: false, description: 'Array of delivery areas' },
        { name: 'organizations', type: 'array', required: false, description: 'Array of organizations' },
        { name: 'business_categories', type: 'array', required: false, description: 'Array of business categories' },
        { name: 'keywords', type: 'array', required: false, description: 'Array of keywords' },
        { name: 'time_ranges', type: 'array', required: false, description: 'Array of time range objects' },
        { name: 'topN', type: 'integer', required: false, description: 'Number of top results (default: 20)' },
        { name: 'include_flood_control', type: 'boolean', required: false, description: 'Include Sumbong sa Pangulo data (default: false)' }
      ]
    },
    {
      method: 'POST',
      path: '/contracts/chip-aggregates-paginated/',
      description: '✅ ACTIVE - Get paginated aggregated data for analytics tables. Used by AnalyticsExplorer for paginated analytics tables.',
      parameters: [
        { name: 'contractors', type: 'array', required: false, description: 'Array of contractor names' },
        { name: 'areas', type: 'array', required: false, description: 'Array of delivery areas' },
        { name: 'organizations', type: 'array', required: false, description: 'Array of organizations' },
        { name: 'business_categories', type: 'array', required: false, description: 'Array of business categories' },
        { name: 'keywords', type: 'array', required: false, description: 'Array of keywords' },
        { name: 'time_ranges', type: 'array', required: false, description: 'Array of time range objects' },
        { name: 'page', type: 'integer', required: false, description: 'Page number (1-based)' },
        { name: 'page_size', type: 'integer', required: false, description: 'Items per page' },
        { name: 'dimension', type: 'string', required: false, description: 'Aggregation dimension (by_contractor, by_organization, by_area, by_category)' },
        { name: 'sort_by', type: 'string', required: false, description: 'Sort field (total_value, count, avg_value)' },
        { name: 'sort_direction', type: 'string', required: false, description: 'Sort direction (asc, desc)' },
        { name: 'include_flood_control', type: 'boolean', required: false, description: 'Include Sumbong sa Pangulo data (default: false)' }
      ]
    },
    {
      method: 'POST',
      path: '/contracts/chip-export-estimate/',
      description: '✅ ACTIVE - Estimate CSV export size for current filters. Used by ExportCSVModal to show estimated file size.',
      parameters: [
        { name: 'contractors', type: 'array', required: false, description: 'Array of contractor names' },
        { name: 'areas', type: 'array', required: false, description: 'Array of delivery areas' },
        { name: 'organizations', type: 'array', required: false, description: 'Array of organizations' },
        { name: 'business_categories', type: 'array', required: false, description: 'Array of business categories' },
        { name: 'keywords', type: 'array', required: false, description: 'Array of keywords' },
        { name: 'time_ranges', type: 'array', required: false, description: 'Array of time range objects' }
      ]
    },
    {
      method: 'POST',
      path: '/contracts/chip-export/',
      description: '✅ ACTIVE - Stream full CSV export for current filters. Used by ExportCSVModal for actual CSV download with progress tracking.',
      parameters: [
        { name: 'contractors', type: 'array', required: false, description: 'Array of contractor names' },
        { name: 'areas', type: 'array', required: false, description: 'Array of delivery areas' },
        { name: 'organizations', type: 'array', required: false, description: 'Array of organizations' },
        { name: 'business_categories', type: 'array', required: false, description: 'Array of business categories' },
        { name: 'keywords', type: 'array', required: false, description: 'Array of keywords' },
        { name: 'time_ranges', type: 'array', required: false, description: 'Array of time range objects' }
      ]
    }
  ]

  const renderOverview = () => (
    <div>
      <div style={{ marginBottom: spacing[6] }}>
        <h2 style={{ ...typography.textStyles.h2, color: themeColors.text.primary, marginBottom: spacing[4] }}>
          API Overview
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
            Base URL
          </h3>
          <code style={{
            backgroundColor: themeColors.background.primary,
            padding: spacing[2],
            borderRadius: spacing[1],
            fontFamily: 'monospace',
            color: themeColors.primary[600],
            display: 'block'
          }}>
            {apiBaseUrl}/api/v1/
          </code>
        </div>
      </div>

      <div style={{ marginBottom: spacing[6] }}>
        <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[4] }}>
          Key Features
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing[4] }}>
          <div style={{
            backgroundColor: themeColors.background.secondary,
            border: `1px solid ${themeColors.border.medium}`,
            borderRadius: spacing[2],
            padding: spacing[4]
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              🔍 Advanced Search
            </h4>
            <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, fontSize: typography.fontSize.sm }}>
              Search across contract titles, descriptions, and metadata with multiple filters and sorting options.
            </p>
          </div>
          <div style={{
            backgroundColor: themeColors.background.secondary,
            border: `1px solid ${themeColors.border.medium}`,
            borderRadius: spacing[2],
            padding: spacing[4]
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              📊 Data Exploration
            </h4>
            <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, fontSize: typography.fontSize.sm }}>
              Browse entities (contractors, areas, organizations) with drill-down navigation and detailed views.
            </p>
          </div>
          <div style={{
            backgroundColor: themeColors.background.secondary,
            border: `1px solid ${themeColors.border.medium}`,
            borderRadius: spacing[2],
            padding: spacing[4]
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              📈 Real-time Analytics
            </h4>
            <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, fontSize: typography.fontSize.sm }}>
              Get aggregated statistics, top entities, and time-based trends with live data processing.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[4] }}>
          Quick Start
        </h3>
        <div style={{
          backgroundColor: themeColors.background.secondary,
          border: `1px solid ${themeColors.border.medium}`,
          borderRadius: spacing[2],
          padding: spacing[4]
        }}>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, marginBottom: spacing[3] }}>
            Test the API with this simple request to get the top 5 contractors:
          </p>
          <div style={{ position: 'relative' }}>
            <pre style={{
              backgroundColor: themeColors.background.primary,
              padding: spacing[3],
              borderRadius: spacing[1],
              overflow: 'auto',
              fontSize: typography.fontSize.sm,
              fontFamily: 'monospace',
              color: themeColors.text.primary,
              margin: 0,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              <code>{codeExamples.getContractors}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(codeExamples.getContractors, 'getContractors')}
              style={{
                position: 'absolute',
                top: spacing[2],
                right: spacing[2],
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: themeColors.primary[600],
                color: themeColors.text.inverse,
                border: 'none',
                borderRadius: spacing[1],
                cursor: 'pointer',
                fontSize: typography.fontSize.xs
              }}
            >
              {copiedCode === 'getContractors' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEndpoints = () => (
    <div>
      <h2 style={{ ...typography.textStyles.h2, color: themeColors.text.primary, marginBottom: spacing[6] }}>
        API Endpoints
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {endpoints.map((endpoint, index) => (
          <div
            key={index}
            style={{
              backgroundColor: themeColors.background.secondary,
              border: `1px solid ${themeColors.border.medium}`,
              borderRadius: spacing[2],
              padding: spacing[4]
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] }}>
              <span style={{
                backgroundColor: endpoint.method === 'GET' ? themeColors.success[600] : themeColors.primary[600],
                color: themeColors.text.inverse,
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: spacing[1],
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {endpoint.method}
              </span>
              <code style={{
                backgroundColor: themeColors.background.primary,
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: spacing[1],
                fontFamily: 'monospace',
                color: themeColors.text.primary,
                fontSize: typography.fontSize.sm
              }}>
                {endpoint.path}
              </code>
            </div>
            <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, marginBottom: spacing[3] }}>
              {endpoint.description}
            </p>
            {endpoint.parameters.length > 0 && (
              <div>
                <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[3] }}>
                  Parameters:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  {endpoint.parameters.map((param, paramIndex) => (
                    <div
                      key={paramIndex}
                      style={{
                        backgroundColor: themeColors.background.primary,
                        border: `1px solid ${themeColors.border.light}`,
                        borderRadius: spacing[1],
                        padding: spacing[3],
                        display: 'flex',
                        flexDirection: 'column',
                        gap: spacing[1]
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <code style={{
                          backgroundColor: themeColors.primary[100],
                          color: themeColors.primary[800],
                          padding: `${spacing[1]} ${spacing[2]}`,
                          borderRadius: spacing[1],
                          fontSize: typography.fontSize.sm,
                          fontFamily: 'monospace',
                          fontWeight: typography.fontWeight.medium
                        }}>
                          {param.name}
                        </code>
                        <span style={{
                          backgroundColor: param.required ? themeColors.error[100] : themeColors.success[100],
                          color: param.required ? themeColors.error[700] : themeColors.success[700],
                          padding: `${spacing[1]} ${spacing[2]}`,
                          borderRadius: spacing[1],
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium
                        }}>
                          {param.type} {param.required ? '(required)' : '(optional)'}
                        </span>
                      </div>
                      <p style={{
                        ...typography.textStyles.body,
                        color: themeColors.text.secondary,
                        fontSize: typography.fontSize.sm,
                        margin: 0
                      }}>
                        {param.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderExamples = () => (
    <div>
      <h2 style={{ ...typography.textStyles.h2, color: themeColors.text.primary, marginBottom: spacing[6] }}>
        Code Examples
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
        {/* cURL Examples */}
        <div>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[4] }}>
            cURL Examples
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            <div>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
                Get Top Contractors
              </h4>
              <div style={{ position: 'relative' }}>
                <pre style={{
                  backgroundColor: themeColors.background.primary,
                  padding: spacing[3],
                  borderRadius: spacing[1],
                  overflow: 'auto',
                  fontSize: typography.fontSize.sm,
                  fontFamily: 'monospace',
                  color: themeColors.text.primary,
                  margin: 0
                }}>
                  <code>{codeExamples.getContractors}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples.getContractors, 'getContractors')}
                  style={{
                    position: 'absolute',
                    top: spacing[2],
                    right: spacing[2],
                    padding: `${spacing[1]} ${spacing[2]}`,
                    backgroundColor: themeColors.primary[600],
                    color: themeColors.text.inverse,
                    border: 'none',
                    borderRadius: spacing[1],
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs
                  }}
                >
                  {copiedCode === 'getContractors' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
                Search Contracts
              </h4>
              <div style={{ position: 'relative' }}>
            <pre style={{
              backgroundColor: themeColors.background.primary,
              padding: spacing[3],
              borderRadius: spacing[1],
              overflow: 'auto',
              fontSize: typography.fontSize.sm,
              fontFamily: 'monospace',
              color: themeColors.text.primary,
              margin: 0,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              <code>{codeExamples.searchContracts}</code>
            </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples.searchContracts, 'searchContracts')}
                  style={{
                    position: 'absolute',
                    top: spacing[2],
                    right: spacing[2],
                    padding: `${spacing[1]} ${spacing[2]}`,
                    backgroundColor: themeColors.primary[600],
                    color: themeColors.text.inverse,
                    border: 'none',
                    borderRadius: spacing[1],
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs
                  }}
                >
                  {copiedCode === 'searchContracts' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* JavaScript Examples */}
        <div>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[4] }}>
            JavaScript Examples
          </h3>
          <div style={{ position: 'relative' }}>
            <pre style={{
              backgroundColor: themeColors.background.primary,
              padding: spacing[3],
              borderRadius: spacing[1],
              overflow: 'auto',
              fontSize: typography.fontSize.sm,
              fontFamily: 'monospace',
              color: themeColors.text.primary,
              margin: 0,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              <code>{codeExamples.javascriptExample}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(codeExamples.javascriptExample, 'javascriptExample')}
              style={{
                position: 'absolute',
                top: spacing[2],
                right: spacing[2],
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: themeColors.primary[600],
                color: themeColors.text.inverse,
                border: 'none',
                borderRadius: spacing[1],
                cursor: 'pointer',
                fontSize: typography.fontSize.xs
              }}
            >
              {copiedCode === 'javascriptExample' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Python Examples */}
        <div>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[4] }}>
            Python Examples
          </h3>
          <div style={{ position: 'relative' }}>
            <pre style={{
              backgroundColor: themeColors.background.primary,
              padding: spacing[3],
              borderRadius: spacing[1],
              overflow: 'auto',
              fontSize: typography.fontSize.sm,
              fontFamily: 'monospace',
              color: themeColors.text.primary,
              margin: 0,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              <code>{codeExamples.pythonExample}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(codeExamples.pythonExample, 'pythonExample')}
              style={{
                position: 'absolute',
                top: spacing[2],
                right: spacing[2],
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: themeColors.primary[600],
                color: themeColors.text.inverse,
                border: 'none',
                borderRadius: spacing[1],
                cursor: 'pointer',
                fontSize: typography.fontSize.xs
              }}
            >
              {copiedCode === 'pythonExample' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTesting = () => (
    <div>
      <h2 style={{ ...typography.textStyles.h2, color: themeColors.text.primary, marginBottom: spacing[6] }}>
        Testing the API
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
        <div>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[4] }}>
            Interactive Testing
          </h3>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, marginBottom: spacing[4] }}>
            Test the API endpoints directly in your browser or with your preferred HTTP client.
          </p>
          <div style={{
            backgroundColor: themeColors.background.secondary,
            border: `1px solid ${themeColors.border.medium}`,
            borderRadius: spacing[2],
            padding: spacing[4]
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Quick Test
            </h4>
            <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, marginBottom: spacing[3] }}>
              Try this URL in your browser to get the top 5 contractors:
            </p>
            <code style={{
              backgroundColor: themeColors.background.primary,
              padding: spacing[2],
              borderRadius: spacing[1],
              fontFamily: 'monospace',
              color: themeColors.primary[600],
              display: 'block',
              wordBreak: 'break-all'
            }}>
              {apiBaseUrl}/api/v1/contractors/?search=petron&page_size=5
            </code>
          </div>
        </div>

        <div>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[4] }}>
            Testing Scripts
          </h3>
          <p style={{ ...typography.textStyles.body, color: themeColors.text.secondary, marginBottom: spacing[4] }}>
            Use our provided testing scripts to validate all endpoints:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing[4] }}>
            <div style={{
              backgroundColor: themeColors.background.secondary,
              border: `1px solid ${themeColors.border.medium}`,
              borderRadius: spacing[2],
              padding: spacing[4]
            }}>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
                Node.js
              </h4>
              <pre style={{
                backgroundColor: themeColors.background.primary,
                padding: spacing[2],
                borderRadius: spacing[1],
                fontSize: typography.fontSize.sm,
                fontFamily: 'monospace',
                color: themeColors.text.primary,
                margin: 0
              }}>
                <code>node docs/test_api.js</code>
              </pre>
            </div>
            <div style={{
              backgroundColor: themeColors.background.secondary,
              border: `1px solid ${themeColors.border.medium}`,
              borderRadius: spacing[2],
              padding: spacing[4]
            }}>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
                Python
              </h4>
              <pre style={{
                backgroundColor: themeColors.background.primary,
                padding: spacing[2],
                borderRadius: spacing[1],
                fontSize: typography.fontSize.sm,
                fontFamily: 'monospace',
                color: themeColors.text.primary,
                margin: 0
              }}>
                <code>python docs/test_api.py</code>
              </pre>
            </div>
            <div style={{
              backgroundColor: themeColors.background.secondary,
              border: `1px solid ${themeColors.border.medium}`,
              borderRadius: spacing[2],
              padding: spacing[4]
            }}>
              <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
                Bash/cURL
              </h4>
              <pre style={{
                backgroundColor: themeColors.background.primary,
                padding: spacing[2],
                borderRadius: spacing[1],
                fontSize: typography.fontSize.sm,
                fontFamily: 'monospace',
                color: themeColors.text.primary,
                margin: 0
              }}>
                <code>bash docs/test_api.sh</code>
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ ...typography.textStyles.h3, color: themeColors.text.primary, marginBottom: spacing[4] }}>
            Response Format
          </h3>
          <div style={{
            backgroundColor: themeColors.background.secondary,
            border: `1px solid ${themeColors.border.medium}`,
            borderRadius: spacing[2],
            padding: spacing[4]
          }}>
            <h4 style={{ ...typography.textStyles.h4, color: themeColors.text.primary, marginBottom: spacing[2] }}>
              Success Response
            </h4>
            <pre style={{
              backgroundColor: themeColors.background.primary,
              padding: spacing[3],
              borderRadius: spacing[1],
              overflow: 'auto',
              fontSize: typography.fontSize.sm,
              fontFamily: 'monospace',
              color: themeColors.text.primary,
              margin: 0,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              <code>{`{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 1000,
    "total_pages": 50
  }
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'endpoints':
        return renderEndpoints()
      case 'examples':
        return renderExamples()
      case 'testing':
        return renderTesting()
      default:
        return renderOverview()
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
