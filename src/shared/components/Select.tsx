import clsx from 'clsx'
import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
}

export function Select({ label, options, error, className, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <select
        className={clsx(
          'min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50',
          error && 'border-rose-500 ring-rose-400',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}
