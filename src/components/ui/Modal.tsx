import * as React from 'react'
import { cn } from '../../lib/cn'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({ open, title, description, onClose, children, footer, className }: ModalProps) {
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-0 flex items-end justify-center p-2 sm:items-center sm:p-4">
        <div className={cn('w-full max-w-4xl rounded-2xl bg-white shadow-soft ring-1 ring-slate-200 max-h-[95vh] overflow-hidden flex flex-col', className)}>
          {title && (
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">{title}</div>
                {description ? <div className="mt-1 text-sm text-slate-600">{description}</div> : null}
              </div>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          )}
          {!title && (
            <button
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          )}
          <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
          {footer ? <div className="border-t border-slate-100 px-5 py-4 shrink-0">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

