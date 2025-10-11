import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from './Modal'
import { AccessibleButton } from './AccessibleButton'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeColors } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'

interface ExportCSVModalProps {
  open: boolean
  onClose: () => void
  onExport: (startRank: number, endRank: number) => Promise<void>
  onCancel?: () => void
  totalCount: number
  dataType: string // e.g., "Analytics", "Contract Details", "Search Results"
  isDark?: boolean
  loading?: boolean
  progress?: number
}

export const ExportCSVModal: React.FC<ExportCSVModalProps> = ({
  open,
  onClose,
  onExport,
  onCancel,
  totalCount,
  dataType,
  isDark = false,
  loading = false,
  progress: realProgress
}) => {
  const { isDark: themeIsDark } = useTheme()
  const darkMode = isDark !== undefined ? isDark : themeIsDark
  const theme = getThemeColors(darkMode)
  
  const [startRank, setStartRank] = useState(1)
  const [endRank, setEndRank] = useState(totalCount)
  const [error, setError] = useState<string | null>(null)
  const [simulatedProgress, setSimulatedProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  
  // Use real progress if available, otherwise use simulated progress
  const progress = realProgress !== undefined ? realProgress : simulatedProgress

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStartRank(1)
      setEndRank(totalCount)
      setError(null)
      setSimulatedProgress(0)
      setIsExporting(false)
    }
  }, [open, totalCount])

  const handleStartRankChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setStartRank(isNaN(value) ? 1 : value)
    setError(null)
  }, [])

  const handleEndRankChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setEndRank(isNaN(value) ? totalCount : value)
    setError(null)
  }, [totalCount])

  const validateInputs = useCallback(() => {
    if (startRank <= 0 || endRank <= 0) {
      setError('Rank values must be greater than 0.')
      return false
    }
    if (startRank > endRank) {
      setError('Start rank cannot be greater than end rank.')
      return false
    }
    if (startRank > totalCount || endRank > totalCount) {
      setError(`Rank range cannot exceed total available entries (${totalCount}).`)
      return false
    }
    setError(null)
    return true
  }, [startRank, endRank, totalCount])

  const handleExport = useCallback(async () => {
    if (!validateInputs()) return

    setIsExporting(true)
    setSimulatedProgress(0)

    try {
      // Only simulate progress if real progress is not available
      let progressInterval: NodeJS.Timeout | null = null
      if (realProgress === undefined) {
        progressInterval = setInterval(() => {
          setSimulatedProgress(prev => {
            if (prev >= 85) {
              if (progressInterval) clearInterval(progressInterval)
              return prev
            }
            return prev + Math.random() * 8
          })
        }, 300)
      }

      await onExport(startRank, endRank)
      
      // Complete progress (only if using simulated progress)
      if (realProgress === undefined) {
        setSimulatedProgress(100)
        if (progressInterval) clearInterval(progressInterval)
      }
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (error) {
      console.error('Export failed:', error)
      setError('Export failed. Please try again.')
      setSimulatedProgress(0)
    } finally {
      setIsExporting(false)
    }
  }, [startRank, endRank, onExport, onClose, validateInputs, realProgress])

  const entriesToExport = Math.max(0, endRank - startRank + 1)
  // More accurate estimate based on data type
  // Aggregated data (contractors, organizations, etc.): ~60 bytes per row
  // Individual contracts (Search Results): ~350 bytes per row
  // DataExplorer exports aggregated data, Advanced Search exports individual contracts
  const bytesPerEntry = dataType.toLowerCase().includes('search') ? 350 : 60
  const estimatedSize = Math.round(entriesToExport * bytesPerEntry)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Export ${dataType} Data`}
      isDark={darkMode}
      size="medium"
    >
      <div style={{ padding: spacing[4], color: theme.text.primary }}>
        <p style={{ marginBottom: spacing[4], fontSize: typography.fontSize.sm }}>
          Select the range of entries you wish to export as CSV.
        </p>

        {/* Range Inputs */}
        <div style={{ display: 'flex', gap: spacing[4], marginBottom: spacing[4] }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="startRank" style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.xs, color: theme.text.secondary }}>
              Start Rank (1 to {totalCount})
            </label>
            <input
              id="startRank"
              type="number"
              min={1}
              max={totalCount}
              value={startRank}
              onChange={handleStartRankChange}
              disabled={isExporting}
              style={{
                width: '100%',
                padding: spacing[2],
                borderRadius: spacing[1],
                border: `1px solid ${theme.border.light}`,
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                fontSize: typography.fontSize.sm,
                opacity: isExporting ? 0.6 : 1
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="endRank" style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.xs, color: theme.text.secondary }}>
              End Rank (1 to {totalCount})
            </label>
            <input
              id="endRank"
              type="number"
              min={1}
              max={totalCount}
              value={endRank}
              onChange={handleEndRankChange}
              disabled={isExporting}
              style={{
                width: '100%',
                padding: spacing[2],
                borderRadius: spacing[1],
                border: `1px solid ${theme.border.light}`,
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                fontSize: typography.fontSize.sm,
                opacity: isExporting ? 0.6 : 1
              }}
            />
          </div>
        </div>

        {/* Export Info */}
        <div style={{ 
          marginBottom: spacing[4], 
          padding: spacing[3], 
          backgroundColor: theme.background.secondary, 
          borderRadius: spacing[1],
          border: `1px solid ${theme.border.light}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[2] }}>
            <span style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
              Entries to export:
            </span>
            <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
              {entriesToExport.toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
              Estimated file size:
            </span>
            <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
              {formatFileSize(estimatedSize)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            marginBottom: spacing[4], 
            padding: spacing[2], 
            backgroundColor: theme.error[500] + '20', 
            border: `1px solid ${theme.error[500]}`,
            borderRadius: spacing[1],
            color: theme.error[500], 
            fontSize: typography.fontSize.sm 
          }}>
            {error}
          </div>
        )}

        {/* Progress Bar */}
        {isExporting && (
          <div style={{ marginBottom: spacing[4] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[1] }}>
              <span style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
                Exporting...
              </span>
              <span style={{ fontSize: typography.fontSize.sm, color: theme.text.primary, fontWeight: typography.fontWeight.semibold }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: theme.background.secondary,
              borderRadius: spacing[1],
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: theme.primary[500],
                borderRadius: spacing[1],
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing[2] }}>
          <AccessibleButton
            variant="secondary"
            onClick={onCancel || onClose}
            announceOnClick
            announceText="Cancel export"
            disabled={isExporting}
          >
            Cancel
          </AccessibleButton>
          <AccessibleButton
            variant="primary"
            onClick={handleExport}
            announceOnClick
            announceText={`Export ${entriesToExport} entries`}
            disabled={isExporting || !!error || entriesToExport <= 0}
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </AccessibleButton>
        </div>
      </div>
    </Modal>
  )
}
