import { useEffect } from 'react'
import type { ThemeMode } from '../../domain/models'

export function useTheme(theme: ThemeMode): void {
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'dark' : 'light')
      return
    }

    root.classList.add(theme)
  }, [theme])
}
