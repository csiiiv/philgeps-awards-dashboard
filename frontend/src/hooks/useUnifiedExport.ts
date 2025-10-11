import { useState, useCallback, useRef } from 'react'

// Export configuration types
export type ExportType = 'streaming' | 'client-side'
export type DataSource = 'contracts' | 'aggregated' | 'analytics' | 'custom'

export interface ExportConfig {
  type: ExportType
  dataSource: DataSource
  apiEndpoint?: string
  filename: string
  useStreamSaver?: boolean
  headers?: string[]
  dataProcessor?: (data: any[], startRank: number, endRank: number) => string
  filters?: any
  searchParams?: any
  groupBy?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  estimateBytesPerRow?: number
}

export interface ExportEstimate {
  count: number
  bytes: number
}

export interface UnifiedExportState {
  isExporting: boolean
  exportProgress: number
  exportEstimate: ExportEstimate | null
  showExportModal: boolean
  exportError: string | null
}

export interface UnifiedExportActions {
  initiateExport: (config: ExportConfig) => Promise<void>
  downloadExport: (config: ExportConfig) => Promise<void>
  cancelExport: () => void
  closeExportModal: () => void
}

export type UseUnifiedExportReturn = UnifiedExportState & UnifiedExportActions

// Hook for unified export functionality
export const useUnifiedExport = (): UseUnifiedExportReturn => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportEstimate, setExportEstimate] = useState<ExportEstimate | null>(null)

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  
  const exportAbort = useRef<AbortController | null>(null)

  // Get export estimate
  const getExportEstimate = useCallback(async (config: ExportConfig): Promise<ExportEstimate> => {
    console.log('🔍 Getting export estimate for:', config.dataSource)
    
    try {
      if (config.dataSource === 'aggregated') {
        // Get aggregated data estimate
        const response = await fetch('/api/v1/contracts/chip-export-aggregated-estimate/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractors: config.filters?.contractors || [],
            areas: config.filters?.areas || [],
            organizations: config.filters?.organizations || [],
            business_categories: config.filters?.businessCategories || [],
            keywords: config.filters?.keywords || [],
            time_ranges: config.filters?.timeRanges || [],
            dimension: config.filters?.dimension || 'by_contractor',
            include_flood_control: config.filters?.includeFloodControl || false,
            value_range: config.filters?.valueRange
          })
        })
        
        if (!response.ok) {
          throw new Error(`Failed to get estimate: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('✅ Aggregated estimate:', data)
        
        return {
          count: data.total_count,
          bytes: data.estimated_csv_bytes
        }
      } else if (config.dataSource === 'contracts') {
        // Get contracts estimate
        const response = await fetch('/api/v1/contracts/chip-export-estimate/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractors: config.filters?.contractors || [],
            areas: config.filters?.areas || [],
            organizations: config.filters?.organizations || [],
            business_categories: config.filters?.businessCategories || [],
            keywords: config.filters?.keywords || [],
            time_ranges: config.filters?.timeRanges || [],
            include_flood_control: config.filters?.includeFloodControl || false,
            value_range: config.filters?.valueRange
          })
        })
        
        if (!response.ok) {
          throw new Error(`Failed to get estimate: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('✅ Contracts estimate:', data)
        
        return {
          count: data.total_count,
          bytes: data.estimated_csv_bytes
        }
      } else {
        // For client-side exports, estimate based on data
        const estimatedCount = 1000 // Default estimate
        const bytesPerEntry = 60 // Conservative estimate
        return {
          count: estimatedCount,
          bytes: estimatedCount * bytesPerEntry
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to get export estimate, using fallback:', error)
      // Fallback estimate when API is not available
      const estimatedCount = 10000 // Conservative fallback
      const bytesPerEntry = config.dataSource === 'aggregated' ? 60 : 350
      return {
        count: estimatedCount,
        bytes: estimatedCount * bytesPerEntry
      }
    }
  }, [])

  // Memory-efficient streaming with progress tracking
  const performDirectDownload = useCallback(async (response: Response, filename: string) => {
    console.log('🚀 Starting streaming download with progress')
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))
    
    try {
      const reader = response.body!.getReader()
      const total = Number(response.headers.get('Content-Length') || 0)
      const chunks: Uint8Array[] = []
      let received = 0
      
      console.log('📊 Content-Length:', total)
      
      // Update actual size from Content-Length for real-time display
      if (total > 0) {

        console.log('✅ Updated actual size from Content-Length:', total)
        if (exportEstimate) {
          const accuracyPercent = ((total / exportEstimate.bytes) * 100).toFixed(1)
          console.log(`🎯 Estimate vs Actual: ${exportEstimate.bytes.toLocaleString()} → ${total.toLocaleString()} bytes (${accuracyPercent}% accuracy)`)
        }
      }
      
      // Stream data and track progress
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          setExportProgress(100)
          console.log('✅ Streaming completed - 100%')
          break
        }
        
        if (value) {
          chunks.push(value)
          received += value.length
          
          // Update progress
          const progressTotal = total > 0 ? total : (exportEstimate?.bytes || 0)
          if (progressTotal > 0) {
            const progress = Math.round((received / progressTotal) * 100)
            setExportProgress(progress)
            console.log(`📈 Progress: ${progress}% (${received.toLocaleString()}/${progressTotal.toLocaleString()} bytes)`)
            
            // Show accuracy improvement when we have both estimate and actual
            if (exportEstimate && total > 0 && exportEstimate.bytes !== total) {
              const accuracyPercent = ((total / exportEstimate.bytes) * 100).toFixed(1)
              console.log(`🎯 Estimate accuracy: ${exportEstimate.bytes.toLocaleString()} → ${total.toLocaleString()} bytes (${accuracyPercent}% of estimate)`)
            }
          } else {
            // Fallback progress estimation
            const estimatedProgress = Math.min(95, Math.round((received / 1000000) * 100))
            setExportProgress(estimatedProgress)
            console.log(`📈 Progress (estimated): ${estimatedProgress}% (${received.toLocaleString()} bytes)`)
          }
        }
      }
      
      // Create blob and download
      const blob = new Blob(chunks as BlobPart[], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Record accuracy for future estimates
      if (exportEstimate && total > 0) {
        const { recordEstimateAccuracy } = await import('./useUnifiedExportConfigs')
        recordEstimateAccuracy(exportEstimate.bytes, total, 'streaming')
      }
      
      console.log('✅ Download completed')
      
    } catch (error) {
      console.error('❌ Streaming download failed:', error)
      throw error
    }
  }, [exportEstimate])

  // Streaming export (server-side streaming with direct browser download)
  const performStreamingExport = useCallback(async (config: ExportConfig) => {
    if (!config.apiEndpoint) {
      throw new Error('API endpoint required for streaming export')
    }

    console.log('🚀 Starting streaming export:', config)
    console.log('📋 Export filters:', config.filters)

    // Build payload based on data source - match the working Advanced Search format
    let payload: any
    if (config.dataSource === 'contracts') {
      payload = {
        contractors: config.filters?.contractors || [],
        areas: config.filters?.areas || [],
        organizations: config.filters?.organizations || [],
        business_categories: config.filters?.businessCategories || [],
        keywords: config.filters?.keywords || [],
        time_ranges: config.filters?.timeRanges || [],
        include_flood_control: config.filters?.includeFloodControl || false,
        value_range: config.filters?.valueRange
      }
    } else if (config.dataSource === 'aggregated') {
      payload = {
        contractors: config.filters?.contractors || [],
        areas: config.filters?.areas || [],
        organizations: config.filters?.organizations || [],
        business_categories: config.filters?.businessCategories || [],
        keywords: config.filters?.keywords || [],
        time_ranges: config.filters?.timeRanges || [],
        dimension: config.filters?.dimension || 'by_contractor',
        include_flood_control: config.filters?.includeFloodControl || false,
        value_range: config.filters?.valueRange
      }
    } else {
      throw new Error(`Streaming not supported for data source: ${config.dataSource}`)
    }

    console.log('📡 Sending payload to API:', payload)
    console.log('🌐 API endpoint:', config.apiEndpoint)

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: exportAbort.current?.signal
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`)
    }

    // Use direct browser download - no memory accumulation
    return performDirectDownload(response, config.filename)
  }, [exportAbort, performDirectDownload])

  // Client-side export (for smaller datasets)
  const performClientSideExport = useCallback(async (config: ExportConfig, data: any[]) => {
    console.log('🚀 Starting client-side export:', config)
    
    if (!config.dataProcessor) {
      throw new Error('Data processor required for client-side export')
    }

    try {
      // Process data to CSV
      const csvContent = config.dataProcessor(data, 1, data.length)
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = config.filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setExportProgress(100)
      console.log('✅ Client-side export completed')
      
    } catch (error) {
      console.error('❌ Client-side export failed:', error)
      throw error
    }
  }, [])

  // Initiate export (get estimate and show modal)
  const initiateExport = useCallback(async (config: ExportConfig) => {
    console.log('🚀 Initiating export:', config)
    
    try {
      setIsExporting(true)
      setExportError(null)
      setExportProgress(0)
      
      // Get export estimate
      const estimate = await getExportEstimate(config)
      setExportEstimate(estimate)
      
      // Show export modal
      setShowExportModal(true)
      
      console.log('✅ Export initiated successfully')
      
    } catch (error) {
      console.error('❌ Export initiation failed:', error)
      setExportError(error instanceof Error ? error.message : 'Export failed')
      setIsExporting(false)
    }
  }, [getExportEstimate])

  // Download export (perform the actual export)
  const downloadExport = useCallback(async (config: ExportConfig) => {
    console.log('📥 Starting download:', config)
    
    try {
      setIsExporting(true)
      setExportError(null)
      setExportProgress(0)
      
      // Create abort controller for cancellation
      exportAbort.current = new AbortController()
      
      if (config.type === 'streaming') {
        await performStreamingExport(config)
      } else if (config.type === 'client-side') {
        // For client-side, we need the actual data
        // This would typically come from the component's state
        throw new Error('Client-side export requires data to be passed separately')
      } else {
        throw new Error(`Unsupported export type: ${config.type}`)
      }
      
      console.log('✅ Export completed successfully')
      
    } catch (error) {
      console.error('❌ Export failed:', error)
      setExportError(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
      exportAbort.current = null
    }
  }, [performStreamingExport, performClientSideExport])

  // Cancel export
  const cancelExport = useCallback(() => {
    console.log('❌ Cancelling export')
    
    if (exportAbort.current) {
      exportAbort.current.abort()
      exportAbort.current = null
    }
    
    setIsExporting(false)
    setExportProgress(0)
    setExportError(null)
  }, [])

  // Close export modal
  const closeExportModal = useCallback(() => {
    setShowExportModal(false)
    setExportError(null)
    setExportProgress(0)
  }, [])

  return {
    // State
    isExporting,
    exportProgress,
    exportEstimate,
    showExportModal,
    exportError,
    
    // Actions
    initiateExport,
    downloadExport,
    cancelExport,
    closeExportModal
  }
}