import { cn } from '../../lib/cn'
import type { ShipmentStatus } from '../../lib/types'

type BadgeProps = {
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'slate'
  children: React.ReactNode
  className?: string
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  blue: 'bg-brand-50 text-brand-800 ring-brand-200',
  green: 'bg-green-50 text-green-800 ring-green-200',
  orange: 'bg-orange-50 text-orange-800 ring-orange-200',
  red: 'bg-red-50 text-red-800 ring-red-200',
  slate: 'bg-slate-50 text-slate-800 ring-slate-200',
}

export function Badge({ tone = 'slate', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1', toneClasses[tone], className)}>
      {children}
    </span>
  )
}

export function statusTone(status: ShipmentStatus): BadgeProps['tone'] {
  switch (status) {
    case 'Delivered':
      return 'green'
    case 'In Transit':
    case 'Left Warehouse':
      return 'orange'
    case 'Submitted':
    case 'Received':
      return 'blue'
    case 'Draft':
      return 'slate'
    default:
      return 'slate'
  }
}

