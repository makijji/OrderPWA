import { useEffect, useState } from 'react'
import { useAppData } from './data-context'
import { useTheme } from '../shared/hooks/useTheme'
import type { ThemeMode } from '../domain/models'

export function ThemeBootstrap() {
  const data = useAppData()
  const [theme, setTheme] = useState<ThemeMode>('system')

  useTheme(theme)

  useEffect(() => {
    void (async () => {
      const settings = await data.settings.get()
      setTheme(settings.theme)
    })()
  }, [data.settings])

  return null
}
