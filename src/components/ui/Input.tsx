import * as React from 'react'
import { cn } from '../../lib/cn'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 shadow-sm',
        'placeholder:text-slate-400 focus:ring-2 focus:ring-brand-200 focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 shadow-sm',
        'placeholder:text-slate-400 focus:ring-2 focus:ring-brand-200 focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}

