import { Link, NavLink } from 'react-router-dom'
import { cn } from '../lib/cn'
import { NotificationBell } from './NotificationBell'
import type { Role } from '../lib/types'

export function TopNav({
  role,
  links,
  onOpenNotifications,
}: {
  role: Role
  links: { to: string; label: string }[]
  onOpenNotifications: () => void
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center text-sm font-bold">UZA</div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-900">UZA Logistics</div>
              <div className="text-xs text-slate-500 capitalize">{role} portal</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    isActive ? 'bg-slate-100 text-slate-900' : null,
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell role={role} onClick={onOpenNotifications} />
          <div className="h-10 w-10 rounded-xl bg-slate-100 grid place-items-center text-sm font-semibold text-slate-700" aria-label="Profile">
            P
          </div>
        </div>
      </div>
    </div>
  )
}

