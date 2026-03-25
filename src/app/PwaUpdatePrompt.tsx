import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '../shared/components/Button'

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_, registration) {
      if (!registration) return
      setInterval(() => {
        void registration.update()
      }, 60_000)
    },
  })

  if (!needRefresh) {
    return null
  }

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 rounded-xl border border-cyan-500 bg-cyan-50 p-3 text-sm shadow-lg dark:bg-cyan-900/90 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      <p className="font-medium text-cyan-950 dark:text-cyan-100">A new version is available.</p>
      <div className="mt-2 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setNeedRefresh(false)
          }}
        >
          Later
        </Button>
        <Button
          onClick={() => {
            void updateServiceWorker(true)
          }}
        >
          Update now
        </Button>
      </div>
    </div>
  )
}
