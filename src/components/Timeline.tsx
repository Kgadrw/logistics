import { CheckCircle2, Circle, Truck } from 'lucide-react'
import { cn } from '../lib/cn'
import type { ShipmentStatus } from '../lib/types'

const steps = ['Submitted', 'Received', 'Left Warehouse', 'In Transit', 'Delivered'] as const

function statusIndex(status: ShipmentStatus) {
  if (status === 'Draft') return -1
  return steps.indexOf(status as (typeof steps)[number])
}

type TimelineAction = {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export function ShipmentTimeline({ 
  status, 
  darkMode,
  onAction,
  actionLabel,
  actionDisabled,
  actionLoading
}: { 
  status: ShipmentStatus
  darkMode?: boolean
  onAction?: () => void
  actionLabel?: string
  actionDisabled?: boolean
  actionLoading?: boolean
}) {
  const idx = statusIndex(status)
  const nextStepIndex = idx + 1
  const hasNextStep = nextStepIndex < steps.length

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const done = i <= idx
          const active = i === idx
          const isNextStep = i === nextStepIndex && hasNextStep
          const Icon = s === 'In Transit' ? Truck : done ? CheckCircle2 : Circle
          return (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full ring-1 transition-all duration-300 ease-in-out',
                    darkMode
                      ? done
                        ? 'bg-green-500/20 text-green-300 ring-green-400/50'
                        : 'bg-white/10 text-white/50 ring-white/20'
                      : done
                        ? 'bg-green-50 text-green-700 ring-green-200'
                        : 'bg-white text-slate-400 ring-slate-200',
                    active && !darkMode ? 'ring-2 ring-brand-200' : null,
                    active && darkMode ? 'ring-2 ring-white/50' : null,
                    isNextStep && !darkMode ? 'ring-2 ring-blue-300 bg-blue-50' : null,
                    isNextStep && darkMode ? 'ring-2 ring-blue-400/50 bg-blue-500/20' : null,
                  )}
                >
                  <Icon className="h-5 w-5 transition-colors duration-300" />
                </div>
                <div
                  className={cn(
                    'text-[11px] font-medium transition-colors duration-300 text-center',
                    darkMode ? (done ? 'text-white' : 'text-white/60') : done ? 'text-slate-800' : 'text-slate-500',
                  )}
                >
                  {s}
                </div>
                {isNextStep && onAction && (
                  <button
                    onClick={onAction}
                    disabled={actionDisabled || actionLoading}
                    className={cn(
                      'mt-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                      'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed',
                      'shadow-sm hover:shadow-md',
                      actionLoading && 'opacity-70'
                    )}
                  >
                    {actionLoading ? 'Processing...' : actionLabel || `Mark as ${s}`}
                  </button>
                )}
              </div>
              {i < steps.length - 1 ? (
                <div
                  className={cn(
                    'mx-2 h-[2px] flex-1 rounded transition-colors duration-300',
                    darkMode ? 'bg-white/20' : 'bg-slate-200',
                  )}
                >
                  <div
                    className={cn(
                      'h-[2px] rounded transition-all duration-300 ease-in-out',
                      darkMode ? 'bg-green-400' : 'bg-green-500',
                      done ? 'w-full' : 'w-0',
                    )}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      {status === 'Draft' ? (
        <div className={cn('mt-2 text-sm transition-colors duration-300', darkMode ? 'text-white/80' : 'text-slate-600')}>
          Submit your shipment to start tracking.
        </div>
      ) : null}
    </div>
  )
}

