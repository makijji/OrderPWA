import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  block?: boolean
}

export function Button({ variant = 'primary', block, className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        {
          'bg-cyan-700 text-white hover:bg-cyan-800': variant === 'primary',
          'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600':
            variant === 'secondary',
          'bg-rose-600 text-white hover:bg-rose-700': variant === 'danger',
          'bg-transparent text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700':
            variant === 'ghost',
          'w-full': block,
        },
        className,
      )}
      {...props}
    />
  )
}
