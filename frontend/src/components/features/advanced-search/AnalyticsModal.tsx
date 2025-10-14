import React from 'react'
import { AnalyticsExplorer } from '../shared/AnalyticsExplorer'

interface AnalyticsModalProps {
  open: boolean
  onClose: () => void
  isDark?: boolean
  currentFilters?: {
    contractors: string[]
    areas: string[]
    organizations: string[]
    business_categories: string[]
    keywords: string[]
    time_ranges: any[]
    includeFloodControl?: boolean
  }
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  open,
  onClose,
  isDark = false,
  currentFilters
}) => {
  return (
    <AnalyticsExplorer
      mode="analytics"
      open={open}
      onClose={onClose}
      currentFilters={currentFilters}
      showSearchFilters={false}
      showChips={false}
      showSummary={true}
      showCharts={true}
      isDark={isDark}
    />
  )
}
