import { useState, useCallback } from 'react'
import { advancedSearchService, type ChipSearchParams } from '../../services/AdvancedSearchService'

export interface ExportEstimate {
  count: number
  bytes: number
}

export interface UseAdvancedSearchExportReturn {
  // Export state
  exportModalOpen: boolean
  exportEstimate: ExportEstimate | null
  exportDownloading: boolean
  exportProgress: number
  exportAbort: AbortController | null
  
  // Export actions
  setExportModalOpen: (open: boolean) => void
  exportAllWithEstimate: (params: ChipSearchParams) => Promise<void>
  downloadExport: () => Promise<void>
  cancelExport: () => void
  clearExportState: () => void
  
  // Utility functions
  isExportReady: boolean
  getFormattedFileSize: () => string
  getFormattedProgress: () => string
}

export const useAdvancedSearchExport = (): UseAdvancedSearchExportReturn => {
  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportEstimate, setExportEstimate] = useState<ExportEstimate | null>(null)
  const [exportDownloading, setExportDownloading] = useState(false)
  const [exportProgress, setExportProgress] = useState<number>(0)
  const [exportAbort, setExportAbort] = useState<AbortController | null>(null)
  const [exportParams, setExportParams] = useState<ChipSearchParams | null>(null)

  // Export with estimate function
  const exportAllWithEstimate = useCallback(async (params: ChipSearchParams) => {
    try {
      console.log('📊 useAdvancedSearchExport - exportAllWithEstimate called with:', params)
      
      // Store the parameters for later use in downloadExport
      setExportParams(params)
      
      const est = await advancedSearchService.chipExportEstimate(params)
      if (!est || !est.total_count) {
        console.error('❌ useAdvancedSearchExport - export estimate failed:', est)
        return
      }
      
      setExportEstimate({ count: est.total_count, bytes: est.estimated_csv_bytes })
      setExportProgress(0)
      setExportModalOpen(true)
      console.log('✅ useAdvancedSearchExport - export estimate completed:', {
        count: est.total_count,
        bytes: est.estimated_csv_bytes
      })
    } catch (error) {
      console.error('🚨 useAdvancedSearchExport - export estimate error:', error)
      throw error
    }
  }, [])

  // Download export function
  const downloadExport = useCallback(async () => {
    if (!exportEstimate || !exportParams) {
      console.error('❌ useAdvancedSearchExport - downloadExport called but no estimate or params available')
      return
    }

    console.log('📥 useAdvancedSearchExport - downloadExport called with params:', exportParams)
    setExportDownloading(true)
    setExportProgress(0)
    
    const controller = new AbortController()
    setExportAbort(controller)

    // Set a timeout to prevent hanging exports (5 minutes)
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ useAdvancedSearchExport - export timeout, aborting')
      controller.abort()
    }, 300000)

    try {

      // Use the stored parameters from exportAllWithEstimate
      const params = exportParams

      // Stream the download and update progress
      const payload = {
        contractors: params.contractors,
        areas: params.areas,
        organizations: params.organizations,
        business_categories: params.businessCategories,
        keywords: params.keywords,
        time_ranges: params.timeRanges,
        include_flood_control: params.includeFloodControl
      }

      const response = await fetch('https://philgeps-api.simple-systems.dev/api/v1/contracts/chip-export/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      if (!response.body) {
        throw new Error('Streaming not supported in this browser')
      }

      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let received = 0
      let chunk_count = 0
      const headerLength = Number(response.headers.get('Content-Length') || 0)
      const total = headerLength || exportEstimate.bytes || 0

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            // Stream completed, set progress to 100%
            setExportProgress(100)
            break
          }
          
          if (value) {
            chunks.push(value)
            received += value.length
            chunk_count += 1
            if (total > 0) {
              const pct = Math.min(95, Math.round((received / total) * 100))
              setExportProgress(pct)
              if (chunk_count % 1000 === 0) { // Log every 1000 chunks
                console.log(`📊 Export progress: ${pct}% (${received.toLocaleString()} / ${total.toLocaleString()} bytes)`)
              }
            } else {
              // If we don't have total size, estimate progress based on data received
              // Assume average chunk size of 8KB and estimate based on received bytes
              const estimatedTotal = exportEstimate?.bytes || (received * 1.5) // Conservative estimate
              const estimatedProgress = Math.min(95, Math.round((received / estimatedTotal) * 100))
              setExportProgress(estimatedProgress)
              if (chunk_count % 1000 === 0) { // Log every 1000 chunks
                console.log(`📊 Export progress (estimated): ${estimatedProgress}% (${received.toLocaleString()} bytes, ~${estimatedTotal.toLocaleString()} estimated)`)
              }
            }
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          console.log('⚠️ useAdvancedSearchExport - download aborted')
          return
        }
        throw err
      }

      const blob = new Blob(chunks as BlobPart[], { type: 'text/csv;charset=utf-8;' })
      setExportProgress(100)
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      a.href = url
      a.download = `contracts_export_all_${ts}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setExportModalOpen(false)
      console.log('✅ useAdvancedSearchExport - download completed successfully')
    } catch (error) {
      console.error('🚨 useAdvancedSearchExport - download error:', error)
      throw error
    } finally {
      clearTimeout(timeoutId)
      setExportAbort(null)
      setExportDownloading(false)
    }
  }, [exportEstimate, exportParams])

  // Cancel export function
  const cancelExport = useCallback(() => {
    console.log('🚫 useAdvancedSearchExport - cancelExport called')
    if (exportAbort) {
      exportAbort.abort()
      setExportAbort(null)
    }
    setExportDownloading(false)
    setExportProgress(0)
  }, [exportAbort])

  // Clear export state function
  const clearExportState = useCallback(() => {
    console.log('🧹 useAdvancedSearchExport - clearExportState called')
    setExportModalOpen(false)
    setExportEstimate(null)
    setExportDownloading(false)
    setExportProgress(0)
    setExportParams(null)
    if (exportAbort) {
      exportAbort.abort()
      setExportAbort(null)
    }
  }, [exportAbort])

  // Utility functions
  const isExportReady = exportEstimate !== null && !exportDownloading

  const getFormattedFileSize = useCallback(() => {
    if (!exportEstimate) return '0 B'
    
    const bytes = exportEstimate.bytes
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }, [exportEstimate])

  const getFormattedProgress = useCallback(() => {
    return `${exportProgress}%`
  }, [exportProgress])

  return {
    // Export state
    exportModalOpen,
    exportEstimate,
    exportDownloading,
    exportProgress,
    exportAbort,
    
    // Export actions
    setExportModalOpen,
    exportAllWithEstimate,
    downloadExport,
    cancelExport,
    clearExportState,
    
    // Utility functions
    isExportReady,
    getFormattedFileSize,
    getFormattedProgress
  }
}
