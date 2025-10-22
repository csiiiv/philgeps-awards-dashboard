import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing, commonStyles } from '../../../design-system'

export interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  icon: string
  isDark?: boolean
  disabled?: boolean
  // Optional remote fetching support
  typeKey?: 'contractor' | 'area' | 'organization' | 'category'
  exactWord?: boolean
  // Support for AND logic in keywords
  supportAndLogic?: boolean
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  isDark = false,
  disabled = false,
  typeKey,
  exactWord = false,
  supportAndLogic = false
}) => {
  const vars = getThemeVars(isDark)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [remoteOptions, setRemoteOptions] = useState<string[] | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to parse AND keywords
  const parseAndKeywords = (keywordString: string): string[] => {
    if (!keywordString || !keywordString.trim()) return []
    return keywordString.split('&&').map(kw => kw.trim()).filter(kw => kw.length > 0)
  }

  // Debounce search term with 300ms delay
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // Remote fetch when typeKey is provided
  useEffect(() => {
    const fetchRemote = async () => {
      if (!typeKey || !debouncedSearchTerm.trim()) {
        setRemoteOptions(null)
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        // Map typeKey to endpoint path
        const path = (
          typeKey === 'contractor' ? 'contractors' :
          typeKey === 'organization' ? 'organizations' :
          typeKey === 'category' ? 'business-categories' :
          'areas-of-delivery'
        )
        const param = exactWord ? 'word' : 'search'
        const res = await fetch(`/api/v1/${path}/?${param}=${encodeURIComponent(debouncedSearchTerm)}&page_size=20`, {
          headers: { 'Accept': 'application/json' }
        })
        const data = await res.json().catch(() => null)
        // DRF may return list or {results}
        let names: string[] = []
        if (Array.isArray(data)) {
          names = data.map((row: any) => row?.name || row)
        } else if (data && Array.isArray(data.results)) {
          names = data.results.map((row: any) => row?.name || row)
        }
        setRemoteOptions(names.filter(Boolean))
      } catch (e) {
        setRemoteOptions([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchRemote()
  }, [debouncedSearchTerm, typeKey, exactWord])

  // Filter options based on search term when not using remote
  const localFiltered = (options || []).filter(option => {
    if (!option || typeof option !== 'string') return false
    // If no search term, show all options (for data explorer)
    if (!debouncedSearchTerm) return true
    const candidate = option.toLowerCase()
    const term = debouncedSearchTerm.toLowerCase()
    if (!exactWord) return candidate.includes(term)
    // whole-word match on non-word boundaries
    try {
      const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`(^|\\W)${escapeRegExp(term)}($|\\W)`, 'i')
      return re.test(option)
    } catch {
      return candidate.includes(term)
    }
  }).slice(0, 50)


  const filteredOptions = (() => {
    if (remoteOptions === null) return localFiltered
    // Merge remote and local as fallback and de-duplicate
    const set = new Set<string>()
    const merged: string[] = []
    for (const o of [...remoteOptions, ...localFiltered]) {
      if (o && !set.has(o)) { set.add(o); merged.push(o) }
    }
    return merged
  })()


  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearchTerm('')
      }
    }
  }

  const containerStyle = {
    position: 'relative' as const,
    width: '100%',
    minWidth: '200px'
  }

  const triggerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: `${spacing[2]} ${spacing[3]}`,
    border: `1px solid ${vars.border.medium}`,
    borderRadius: commonStyles.borderRadius.sm,
    backgroundColor: disabled ? vars.background.tertiary : vars.background.primary,
    color: disabled ? vars.text.tertiary : vars.text.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: typography.fontSize.sm,
    transition: commonStyles.transition.base,
    minHeight: '40px'
  }

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: vars.background.primary,
    border: `1px solid ${vars.border.medium}`,
    borderRadius: commonStyles.borderRadius.sm,
    boxShadow: commonStyles.shadow.lg,
    zIndex: commonStyles.zIndex.dropdown,
    maxHeight: '300px',
    overflow: 'hidden'
  }

  const searchInputStyle = {
    width: '100%',
    padding: `${spacing[2]} ${spacing[3]}`,
    border: 'none',
    borderBottom: `1px solid ${vars.border.light}`,
    backgroundColor: 'transparent',
    color: vars.text.primary,
    fontSize: typography.fontSize.sm,
    outline: 'none'
  }

  const optionStyle = {
    padding: `${spacing[2]} ${spacing[3]}`,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    color: vars.text.primary,
    backgroundColor: vars.background.primary,
    borderBottom: `1px solid ${vars.border.light}`,
    transition: commonStyles.transition.fast
  }

  const optionHoverStyle = {
    backgroundColor: vars.background.secondary
  }

  const noResultsStyle = {
    padding: `${spacing[3]}`,
    textAlign: 'center' as const,
    color: vars.text.secondary,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic'
  }

  const addRowStyle = {
    padding: `${spacing[2]} ${spacing[3]}`,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    color: vars.primary[700]
  }

  const andLogicHintStyle = {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: typography.fontSize.xs,
    color: vars.text.secondary,
    fontStyle: 'italic',
    backgroundColor: vars.background.secondary,
    borderTop: `1px solid ${vars.border.light}`
  }

  const keywordChipStyle = {
    display: 'inline-block',
    padding: `${spacing[1]} ${spacing[2]}`,
    margin: `${spacing[1]} ${spacing[1]} 0 0`,
    backgroundColor: vars.primary[100],
    color: vars.primary[800],
    borderRadius: commonStyles.borderRadius.sm,
    fontSize: typography.fontSize.xs,
    border: `1px solid ${vars.primary[300]}`
  }

  return (
    <div style={containerStyle} ref={dropdownRef}>
      <div style={triggerStyle} onClick={handleToggle}>
        <span style={{ marginRight: spacing[2] }}>{icon}</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        <span style={{ marginLeft: spacing[2] }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <div style={dropdownStyle}>
          <input
            type="text"
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                e.preventDefault()
                handleSelect(searchTerm.trim())
              }
            }}
            style={searchInputStyle}
            autoFocus
          />
          
          {/* Show AND logic keywords if supportAndLogic is enabled and searchTerm contains && */}
          {supportAndLogic && searchTerm.includes('&&') && (
            <div style={{ padding: `${spacing[2]} ${spacing[3]}` }}>
              <div style={{ fontSize: typography.fontSize.xs, color: vars.text.secondary, marginBottom: spacing[1] }}>
                AND Logic Keywords:
              </div>
              {parseAndKeywords(searchTerm).map((keyword, index) => (
                <span key={`and-keyword-${keyword}-${index}`} style={keywordChipStyle}>
                  {keyword}
                </span>
              ))}
            </div>
          )}
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {searchTerm && (
              <div
                style={addRowStyle}
                onClick={() => handleSelect(searchTerm)}
              >
                Add "{searchTerm}"
              </div>
            )}
            {isLoading ? (
              <div style={noResultsStyle}>Loading...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`option-${option}-${index}`}
                  style={optionStyle}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, optionHoverStyle)
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, { backgroundColor: 'transparent' })
                  }}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div style={noResultsStyle}>No options available</div>
            )}
          </div>
          
          {/* Show AND logic hint at the bottom */}
          {supportAndLogic && (
            <div style={andLogicHintStyle}>
              💡 Use && to combine keywords (e.g., "public works" && "dist")
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { SearchableSelect }
