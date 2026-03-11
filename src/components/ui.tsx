import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '../lib/utils/cn'

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section
    className={cn(
      'rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/75',
      className,
    )}
  >
    {children}
  </section>
)

export const Button = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45',
      'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500',
      className,
    )}
    {...props}
  />
)

export const GhostButton = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-xl border border-slate-300 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      className,
    )}
    {...props}
  />
)

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

export const Badge = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) => {
  const toneClass = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
  }[tone]

  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', toneClass)}>{children}</span>
}

export const Label = ({ children, className }: { children: ReactNode; className?: string }) => (
  <label className={cn('mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400', className)}>
    {children}
  </label>
)
