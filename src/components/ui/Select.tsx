import * as React from 'react'
import { cn } from '../../lib/cn'

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 shadow-sm',
        'focus:ring-2 focus:ring-brand-200 focus:outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

