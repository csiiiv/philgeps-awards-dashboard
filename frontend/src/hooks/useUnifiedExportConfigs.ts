import type { ExportConfig } from './useUnifiedExport'

// Utility function to create standardized timestamp
const createTimestamp = (): string => {
  return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
}

// Pre-configured export configs for different use cases
export const createAdvancedSearchConfig = (): ExportConfig => ({
  type: 'streaming',
  dataSource: 'contracts',
  apiEndpoint: '/api/v1/contracts/chip-export/',
  filename: `contracts_export_${createTimestamp()}.csv`,
  useStreamSaver: true
})

export const createDataExplorerConfig = (dimension: string): ExportConfig => ({
  type: 'streaming',
  dataSource: 'aggregated',
  apiEndpoint: '/api/v1/contracts/chip-export-aggregated/',
  filename: `analytics_${dimension.replace('by_', '')}_${createTimestamp()}.csv`,
  useStreamSaver: true
})

export const createEntityDrillDownConfig = (entityName: string, activeTab: string): ExportConfig => ({
  type: 'client-side',
  dataSource: 'custom',
  filename: `entity_${entityName.replace(/[^a-zA-Z0-9]/g, '_')}_${activeTab}_${createTimestamp()}.csv`,
  headers: activeTab === 'contracts' 
    ? ['Reference ID', 'Notice Title', 'Award Title', 'Organization', 'Awardee', 'Category', 'Area', 'Contract Amount', 'Award Amount', 'Status', 'Contract No', 'Award Date']
    : ['Entity', 'Total Value', 'Contract Count', 'Average Value'],
  dataProcessor: (data: any[]) => {
    const headers = activeTab === 'contracts' 
      ? ['Reference ID', 'Notice Title', 'Award Title', 'Organization', 'Awardee', 'Category', 'Area', 'Contract Amount', 'Award Amount', 'Status', 'Contract No', 'Award Date']
      : ['Entity', 'Total Value', 'Contract Count', 'Average Value']
    
    const csvContent = [
      headers.join(','),
      ...data.map((item) => {
        if (activeTab === 'contracts') {
          return [
            `"${item.reference_id || ''}"`,
            `"${item.notice_title || ''}"`,
            `"${item.award_title || ''}"`,
            `"${item.organization_name || ''}"`,
            `"${item.awardee_name || ''}"`,
            `"${item.business_category || ''}"`,
            `"${item.area_of_delivery || ''}"`,
            item.contract_amount || 0,
            item.award_amount || 0,
            `"${item.award_status || ''}"`,
            `"${item.contract_no || ''}"`,
            `"${item.created_at || ''}"`
          ].join(',')
        } else {
          return [
            `"${item.label || ''}"`,
            item.total_value || 0,
            item.count || 0,
            ((item.total_value || 0) / Math.max(1, item.count || 0)).toFixed(2)
          ].join(',')
        }
      })
    ].join('\n')
    
    return csvContent
  }
})

export const createAnalyticsConfig = (dimension: string): ExportConfig => ({
  type: 'client-side',
  dataSource: 'analytics',
  filename: `analytics_${dimension}_${createTimestamp()}.csv`,
  headers: ['Rank', 'Entity', 'Total Value', 'Count', 'Average Value'],
  dataProcessor: (data: any[]) => {
    const headers = ['Rank', 'Entity', 'Total Value', 'Count', 'Average Value']
    const csvContent = [
      headers.join(','),
      ...data.map((item, index) => [
        index + 1,
        `"${item.label}"`,
        item.total_value || 0,
        item.count || 0,
        item.avg_value || 0
      ].join(','))
    ].join('\n')
    
    return csvContent
  }
})

// Helper function to create custom export configs
export const createCustomConfig = (
  type: 'streaming' | 'client-side',
  dataSource: 'contracts' | 'aggregated' | 'analytics' | 'custom',
  baseFilename: string,
  options: {
    apiEndpoint?: string
    headers?: string[]
    dataProcessor?: (data: any[]) => string
    useStreamSaver?: boolean
  } = {}
): ExportConfig => ({
  type,
  dataSource,
  filename: `${baseFilename}_${createTimestamp()}.csv`,
  ...options
})

// Export configuration validation
export const validateExportConfig = (config: ExportConfig): string[] => {
  const errors: string[] = []
  
  if (!config.filename) {
    errors.push('Filename is required')
  }
  
  if (config.type === 'streaming' && !config.apiEndpoint) {
    errors.push('API endpoint is required for streaming exports')
  }
  
  if (config.type === 'client-side' && !config.dataProcessor) {
    errors.push('Data processor is required for client-side exports')
  }
  
  if (!['streaming', 'client-side'].includes(config.type)) {
    errors.push('Export type must be either "streaming" or "client-side"')
  }
  
  if (!['contracts', 'aggregated', 'analytics', 'custom'].includes(config.dataSource)) {
    errors.push('Data source must be one of: contracts, aggregated, analytics, custom')
  }
  
  return errors
}

// Export size estimation helpers
export const getEstimatedBytesPerRow = (dataSource: string): number => {
  switch (dataSource) {
    case 'contracts':
      return 350 // Individual contract records are larger
    case 'aggregated':
      return 60 // Aggregated data is more compact
    case 'analytics':
      return 80 // Analytics data with calculations
    case 'custom':
      return 100 // Conservative estimate for custom data
    default:
      return 100
  }
}

// Memory threshold for StreamSaver usage
export const shouldUseStreamSaver = (estimatedBytes: number): boolean => {
  const STREAM_SAVER_THRESHOLD = 50 * 1024 * 1024 // 50MB
  return estimatedBytes > STREAM_SAVER_THRESHOLD
}

// Export filename sanitization
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}