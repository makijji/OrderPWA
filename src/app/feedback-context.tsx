import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface FeedbackContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const FeedbackContext = createContext<FeedbackContextValue>({
  showToast: () => undefined,
})

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setMessages((current) => [...current, { id, message, type }])
    window.setTimeout(() => {
      setMessages((current) => current.filter((entry) => entry.id !== id))
    }, 2600)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {messages.map((toast) => (
          <div
            key={toast.id}
            className={`w-full max-w-md rounded-xl px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === 'error'
                ? 'bg-rose-600'
                : toast.type === 'success'
                  ? 'bg-emerald-600'
                  : 'bg-slate-700'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  )
}

export function useFeedback(): FeedbackContextValue {
  return useContext(FeedbackContext)
}
