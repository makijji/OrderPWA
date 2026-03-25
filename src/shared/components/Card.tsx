import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900',
        className,
      )}
    >
      {children}
    </section>
  )
}
