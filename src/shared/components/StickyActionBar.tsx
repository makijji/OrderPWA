import type { PropsWithChildren } from 'react'

export function StickyActionBar({ children }: PropsWithChildren) {
  return (
    <div className="sticky bottom-0 z-20 -mx-3 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:-mx-4 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}
