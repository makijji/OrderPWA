import { useEffect, useState } from 'react'

export function OfflineBadge() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/70 dark:bg-amber-500/10 dark:text-amber-200">
      Offline mode: changes are stored locally and will remain available without internet.
    </div>
  )
}
