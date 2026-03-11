import type { ReactNode } from 'react'
import { cn } from '../lib/utils/cn'

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  hint?: string
}

export const ProgressChecklist = ({
  title,
  items,
  className,
}: {
  title: string
  items: ChecklistItem[]
  className?: string
}) => (
  <section className={cn('rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40', className)}>
    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{title}</h4>
    <ul className="mt-2 space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-2">
          <StatusDot done={item.done} />
          <div>
            <p className={item.done ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}>{item.label}</p>
            {!item.done && item.hint ? <p className="text-xs text-amber-700 dark:text-amber-300">{item.hint}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  </section>
)

const StatusDot = ({ done }: { done: boolean }): ReactNode => (
  <span
    className={cn(
      'mt-1 inline-block h-2.5 w-2.5 rounded-full',
      done ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]' : 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]',
    )}
    aria-hidden="true"
  />
)
