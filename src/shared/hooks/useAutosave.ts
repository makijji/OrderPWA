import { useEffect, useRef } from 'react'

export function useAutosave<T>(value: T, onSave: (value: T) => Promise<void>, delay = 800): void {
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    const timeout = window.setTimeout(() => {
      void onSave(value)
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [delay, onSave, value])
}
