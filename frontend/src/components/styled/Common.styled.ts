import styled from 'styled-components'
import { getThemeColors } from '../../design-system/theme'
import { spacing, typography, commonStyles } from '../../design-system'

interface StyledProps {
  $isDark: boolean
}

// Layout Components
export const PageContainer = styled.div<StyledProps>`
  min-height: 100vh;
  background-color: ${props => getThemeColors(props.$isDark).background.primary};
  color: ${props => getThemeColors(props.$isDark).text.primary};
  font-family: ${props => getThemeColors(props.$isDark).fontFamily?.sans?.join(', ') || 'system-ui, sans-serif'};
`

export const ContentContainer = styled.div<StyledProps>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing[6]};
  background-color: ${props => getThemeColors(props.$isDark).background.primary};
`

// Card Components
export const Card = styled.div<StyledProps>`
  background-color: ${props => getThemeColors(props.$isDark).background.secondary};
  border-radius: ${commonStyles.borderRadius.lg};
  border: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  padding: ${spacing[6]};
  margin-bottom: ${spacing[6]};
  box-shadow: ${commonStyles.shadow.sm};
`

export const CardHeader = styled.div<StyledProps>`
  padding: ${spacing[6]} ${spacing[6]} ${spacing[4]} ${spacing[6]};
  border-bottom: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  margin-bottom: ${spacing[4]};
`

export const CardBody = styled.div<StyledProps>`
  padding: ${spacing[4]} ${spacing[6]};
`

export const CardFooter = styled.div<StyledProps>`
  padding: ${spacing[4]} ${spacing[6]} ${spacing[6]} ${spacing[6]};
  border-top: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  background-color: ${props => getThemeColors(props.$isDark).background.tertiary};
  border-radius: 0 0 ${commonStyles.borderRadius.lg} ${commonStyles.borderRadius.lg};
`

// Typography Components
export const PageTitle = styled.h1<StyledProps>`
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${props => getThemeColors(props.$isDark).text.primary};
  margin-bottom: ${spacing[4]};
  text-align: center;
`

export const PageSubtitle = styled.p<StyledProps>`
  font-size: ${typography.fontSize.xl};
  color: ${props => getThemeColors(props.$isDark).text.secondary};
  margin-bottom: ${spacing[8]};
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`

export const SectionTitle = styled.h2<StyledProps>`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${props => getThemeColors(props.$isDark).text.primary};
  margin-bottom: ${spacing[4]};
`

export const SubsectionTitle = styled.h3<StyledProps>`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  color: ${props => getThemeColors(props.$isDark).text.primary};
  margin-bottom: ${spacing[3]};
  margin-top: ${spacing[6]};
`

export const BodyText = styled.p<StyledProps>`
  font-size: ${typography.fontSize.base};
  color: ${props => getThemeColors(props.$isDark).text.secondary};
  line-height: 1.6;
  margin-bottom: ${spacing[3]};
`

export const SmallText = styled.p<StyledProps>`
  font-size: ${typography.fontSize.sm};
  color: ${props => getThemeColors(props.$isDark).text.tertiary};
  margin-bottom: ${spacing[2]};
`

// List Components
export const List = styled.ul<StyledProps>`
  margin-left: ${spacing[4]};
  margin-bottom: ${spacing[3]};
`

export const ListItem = styled.li<StyledProps>`
  font-size: ${typography.fontSize.base};
  color: ${props => getThemeColors(props.$isDark).text.secondary};
  line-height: 1.6;
  margin-bottom: ${spacing[2]};
`

export const OrderedList = styled.ol<StyledProps>`
  margin-left: ${spacing[4]};
  margin-bottom: ${spacing[3]};
`

// Code Components
export const CodeBlock = styled.pre<StyledProps>`
  background-color: ${props => getThemeColors(props.$isDark).background.tertiary};
  border: 1px solid ${props => getThemeColors(props.$isDark).border.medium};
  border-radius: ${commonStyles.borderRadius.sm};
  padding: ${spacing[3]};
  font-family: 'monospace', monospace;
  font-size: ${typography.fontSize.sm};
  color: ${props => getThemeColors(props.$isDark).text.primary};
  margin-bottom: ${spacing[3]};
  overflow: auto;
`

// Alert Components
export const Alert = styled.div<StyledProps & { $variant?: 'info' | 'warning' | 'success' | 'error' }>`
  border-radius: ${commonStyles.borderRadius.sm};
  padding: ${spacing[4]};
  margin-bottom: ${spacing[4]};
  border: 1px solid;
  
  ${props => {
    const colors = getThemeColors(props.$isDark)
    switch (props.$variant) {
      case 'warning':
        return `
          background-color: ${colors.warning[50]};
          border-color: ${colors.warning[200]};
          color: ${colors.warning[800]};
        `
      case 'error':
        return `
          background-color: ${colors.accent.red}20;
          border-color: ${colors.accent.red};
          color: ${colors.accent.red};
        `
      case 'success':
        return `
          background-color: ${colors.accent.green}20;
          border-color: ${colors.accent.green};
          color: ${colors.accent.green};
        `
      default:
        return `
          background-color: ${colors.primary[50]};
          border-color: ${colors.primary[200]};
          color: ${colors.primary[800]};
        `
    }
  }}
`

// Grid Components
export const Grid = styled.div<{ $cols?: number; $gap?: keyof typeof spacing }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$cols || 1}, 1fr);
  gap: ${props => spacing[props.$gap || 4]};
`

export const GridItem = styled.div`
  display: flex;
  flex-direction: column;
`

// Flex Components
export const Flex = styled.div<{ $direction?: 'row' | 'column'; $gap?: keyof typeof spacing; $align?: string; $justify?: string }>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  gap: ${props => spacing[props.$gap || 4]};
  align-items: ${props => props.$align || 'stretch'};
  justify-content: ${props => props.$justify || 'flex-start'};
`

// Spacing Components
export const Spacer = styled.div<{ $size?: keyof typeof spacing }>`
  height: ${props => spacing[props.$size || 4]};
`

// Divider
export const Divider = styled.hr<StyledProps>`
  border: none;
  height: 1px;
  background-color: ${props => getThemeColors(props.$isDark).border.light};
  margin: ${spacing[6]} 0;
`

// Analytics/Data Explorer Components (moved from archived DataExplorer.styled.ts)
export const AppContainer = styled.div<StyledProps & { $isHighContrast?: boolean }>`
  padding: 1.5rem;
  background-color: ${props => getThemeColors(props.$isDark).background.secondary};
  color: ${props => getThemeColors(props.$isDark).text.primary};
  min-height: 100vh;
  
  ${props => props.$isHighContrast && `
    background-color: ${props.$isDark ? '#000000' : '#ffffff'};
    color: ${props.$isDark ? '#ffffff' : '#000000'};
    border: 2px solid ${props.$isDark ? '#ffffff' : '#000000'};
  `}
`

export const HeaderContainer = styled.div<StyledProps & { $isHighContrast?: boolean }>`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${props => getThemeColors(props.$isDark).background.primary};
  border-radius: 0.75rem;
  border: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  
  ${props => props.$isHighContrast && `
    border: 2px solid ${props.$isDark ? '#ffffff' : '#000000'};
  `}
`

export const SummaryContainer = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const SummaryCard = styled.div<StyledProps & { $isHighContrast?: boolean }>`
  padding: 1rem;
  background-color: ${props => getThemeColors(props.$isDark).background.secondary};
  border: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  border-radius: 0.5rem;
  text-align: center;
  
  ${props => props.$isHighContrast && `
    border: 2px solid ${props.$isDark ? '#ffffff' : '#000000'};
  `}
`

export const SummaryValue = styled.div<StyledProps & { $isHighContrast?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => getThemeColors(props.$isDark).primary[600]};
  margin-bottom: 0.5rem;
  
  ${props => props.$isHighContrast && `
    color: ${props.$isDark ? '#00ffff' : '#0000ff'};
  `}
`

export const SummaryLabel = styled.div<StyledProps & { $isHighContrast?: boolean }>`
  font-size: 0.875rem;
  color: ${props => getThemeColors(props.$isDark).text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => props.$isHighContrast && `
    color: ${props.$isDark ? '#ffffff' : '#000000'};
  `}
`

// Filter Components (moved from archived DataExplorer.styled.ts)
export const FiltersContainer = styled.div<StyledProps>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${props => getThemeColors(props.$isDark).background.primary};
  border-radius: 0.75rem;
  border: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  
  ${props => props.$isHighContrast && `
    border: 2px solid ${props.$isDark ? '#ffffff' : '#000000'};
  `}
`

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const FilterLabel = styled.label<StyledProps & { $isHighContrast?: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => getThemeColors(props.$isDark).text.primary};
  
  ${props => props.$isHighContrast && `
    color: ${props.$isDark ? '#ffffff' : '#000000'};
  `}
`

export const FilterSelect = styled.select<StyledProps & { $isHighContrast?: boolean }>`
  padding: 0.5rem;
  border: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  border-radius: 0.375rem;
  background-color: ${props => getThemeColors(props.$isDark).background.secondary};
  color: ${props => getThemeColors(props.$isDark).text.primary};
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${props => getThemeColors(props.$isDark).primary[500]};
    box-shadow: 0 0 0 3px ${props => getThemeColors(props.$isDark).primary[100]};
  }
  
  ${props => props.$isHighContrast && `
    border: 2px solid ${props.$isDark ? '#ffffff' : '#000000'};
    background-color: ${props.$isDark ? '#000000' : '#ffffff'};
    color: ${props.$isDark ? '#ffffff' : '#000000'};
  `}
`
