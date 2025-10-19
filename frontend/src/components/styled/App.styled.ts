import styled from 'styled-components'
import { getThemeColors } from '../../design-system/theme'

interface StyledProps {
  $isDark: boolean
}

export const AppContainer = styled.div<StyledProps>`
  min-height: 100vh;
  background-color: ${props => getThemeColors(props.$isDark).background.secondary};
  font-family: ${props => getThemeColors(props.$isDark).fontFamily?.sans?.join(', ') || 'system-ui, sans-serif'};
  color: ${props => getThemeColors(props.$isDark).text.primary};
`

export const Header = styled.header<StyledProps>`
  background-color: ${props => getThemeColors(props.$isDark).background.primary};
  border-bottom: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
`

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const Title = styled.h1<StyledProps>`
  font-size: 1.875rem;
  font-weight: 700;
  color: ${props => getThemeColors(props.$isDark).text.primary};
  margin: 0;
  line-height: 1.2;
`

export const Subtitle = styled.h2<StyledProps>`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  color: ${props => getThemeColors(props.$isDark).text.secondary};
  margin-top: 0.25rem;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

export const Version = styled.div<StyledProps>`
  font-size: 0.875rem;
  color: ${props => getThemeColors(props.$isDark).text.secondary};
`

export const Navigation = styled.nav<StyledProps>`
  background-color: ${props => getThemeColors(props.$isDark).background.primary};
  border-bottom: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  padding: 0 1.5rem;
`

export const NavigationContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
`

export const TabButton = styled.button<StyledProps & { $isActive: boolean }>`
  padding: 0.75rem 1rem;
  border: none;
  background-color: ${props => 
    props.$isActive 
      ? getThemeColors(props.$isDark).primary[600] 
      : 'transparent'
  };
  color: ${props => 
    props.$isActive 
      ? getThemeColors(props.$isDark).text.inverse 
      : getThemeColors(props.$isDark).text.primary
  };
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.25rem 0.25rem 0 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  &:hover {
    background-color: ${props => 
      props.$isActive 
        ? getThemeColors(props.$isDark).primary[600]
        : getThemeColors(props.$isDark).primary[50]
    };
  }

  &:focus {
    outline: 2px solid ${props => getThemeColors(props.$isDark).primary[500]};
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &[aria-current="page"] {
    background-color: ${props => getThemeColors(props.$isDark).primary[600]};
    color: ${props => getThemeColors(props.$isDark).text.inverse};
  }
`

export const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
`

export const Footer = styled.footer<StyledProps>`
  background-color: ${props => getThemeColors(props.$isDark).background.primary};
  border-top: 1px solid ${props => getThemeColors(props.$isDark).border.light};
  padding: 1.5rem;
  margin-top: 3rem;
  text-align: center;
  color: ${props => getThemeColors(props.$isDark).text.secondary};
  font-size: 0.875rem;

  p {
    margin: 0;
  }
`

export const TabIcon = styled.span`
  font-size: 1rem;
  line-height: 1;
`

export const TabLabel = styled.span`
  font-weight: inherit;
`
