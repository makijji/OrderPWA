import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <input
        className={clsx(
          'min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50',
          error && 'border-rose-500 ring-rose-400',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}
