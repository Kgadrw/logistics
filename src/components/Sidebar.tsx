import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../lib/cn'
import { NotificationBell } from './NotificationBell'
import type { Role } from '../lib/types'

export function Sidebar({
  title,
  items,
  role,
  onOpenNotifications,
  exitItem,
}: {
  title: string
  items: { to: string; label: string; icon?: React.ReactNode }[]
  role?: Role
  onOpenNotifications?: () => void
  exitItem?: { to: string; label: string; icon?: React.ReactNode }
}) {
  const location = useLocation()

  const checkIsActive = (to: string, loc: { pathname: string }) => {
    if (!loc || !loc.pathname) return false
    
    const currentPath = loc.pathname.replace(/\/$/, '') || '/'
    const targetPath = to.replace(/\/$/, '') || '/'
    
    // Exact match
    if (currentPath === targetPath) return true
    
    // Count path segments
    const targetSegments = targetPath.split('/').filter(Boolean)
    
    // For parent routes (like /warehouse, /admin, /client), require exact match
    // This prevents /warehouse from being active when on /warehouse/incoming
    if (targetSegments.length <= 2) {
      return currentPath === targetPath
    }
    
    // For deeper routes, allow prefix matching
    return currentPath.startsWith(targetPath + '/') || currentPath === targetPath
  }

  return (
    <aside className="hidden w-64 shrink-0 flex flex-col border border-blue-800 bg-blue-900 rounded-2xl m-2 sm:flex">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="mt-1 text-xs text-blue-200">Operational view</div>
          </div>
          {role && onOpenNotifications ? (
            <NotificationBell role={role} onClick={onOpenNotifications} />
          ) : null}
        </div>
      </div>
      <nav className="flex flex-1 flex-col overflow-auto px-2 gap-1.5">
        {items.map(i => {
          const isActive = checkIsActive(i.to, location)
          return (
            <NavLink
              key={i.to}
              to={i.to}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white',
              )}
            >
              {i.icon ? (
                <span className={cn('transition-colors', isActive ? 'text-white' : 'text-blue-200')}>
                  {i.icon}
                </span>
              ) : null}
              <span>{i.label}</span>
            </NavLink>
          )
        })}
      </nav>
      {exitItem ? (
        <div className="border-t border-blue-800 px-2 pt-2 pb-4">
          <NavLink
            to={exitItem.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white',
              )
            }
          >
            {exitItem.icon ? <span className="text-blue-200">{exitItem.icon}</span> : null}
            <span>{exitItem.label}</span>
          </NavLink>
        </div>
      ) : null}
    </aside>
  )
}

