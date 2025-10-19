import React from 'react'
import { LogoImg, TextWrapper } from '@/components/styled/App.styled'
import { ThemeToggle } from '@/components/features/shared/ThemeToggle'

const Header: React.FC<{ title?: string; subtitle?: string }> = ({
  title = 'Open PhilGEPS by BetterGov.ph',
  subtitle = 'PhilGEPS Contracts Award Data Explorer',
}) => {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Using a simple img tag since Vite app isn't Next.js */}
          <img src="/BetterGov_Icon-Primary.svg" alt="BetterGov logo" style={{ width: 72, height: 72 }} />
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold">{title}</h1>
            <h2 className="text-sm text-gray-600">{subtitle}</h2>
          </div>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
