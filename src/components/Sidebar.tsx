import * as React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'
import { NotificationBell } from './NotificationBell'
import type { Role } from '../lib/types'

export function Sidebar({
  title,
  items,
  role,
  onOpenNotifications,
  exitItem,
  onLogout,
}: {
  title: string
  items: { to: string; label: string; icon?: React.ReactNode }[]
  role?: Role
  onOpenNotifications?: () => void
  exitItem?: { to: string; label: string; icon?: React.ReactNode }
  onLogout?: () => void
}) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(`sidebar-collapsed-${role || 'default'}`)
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem(`sidebar-collapsed-${role || 'default'}`, JSON.stringify(isCollapsed))
  }, [isCollapsed, role])

  // Find the most specific matching route (longest path match)
  // Only one route should be active at a time
  const findActiveRoute = React.useMemo(() => {
    if (!location?.pathname) return null
    
    const currentPath = location.pathname.replace(/\/$/, '') || '/'
    const currentSegments = currentPath.split('/').filter(Boolean)
    
    // Check if current path is a detail page (contains /shipment/:id)
    const isDetailPage = currentSegments.length >= 3 && currentSegments[currentSegments.length - 2] === 'shipment'
    
    // For detail pages, determine which parent route should be active
    if (isDetailPage) {
      const baseRoute = '/' + currentSegments[0]
      
      // Find the most specific parent route that matches
      let bestMatch: string | null = null
      let bestMatchLength = 0
      
      items.forEach(item => {
        const targetPath = item.to.replace(/\/$/, '') || '/'
        const targetSegments = targetPath.split('/').filter(Boolean)
        
        // Only consider routes that start with the base route
        if (targetPath.startsWith(baseRoute)) {
          // For detail pages, prefer routes that are children of the base route
          // This ensures we match the most specific parent (e.g., /warehouse/incoming over /warehouse)
          if (targetSegments.length > bestMatchLength) {
            bestMatch = targetPath
            bestMatchLength = targetSegments.length
          }
        }
      })
      
      // If no specific match found, use defaults
      if (!bestMatch) {
        if (baseRoute === '/warehouse') {
          return '/warehouse/incoming'
        } else if (baseRoute === '/client') {
          return '/client'
        } else if (baseRoute === '/admin') {
          return '/admin/shipments'
        }
      }
      
      return bestMatch
    }
    
    // For non-detail pages, find the most specific match
    let bestMatch: string | null = null
    let bestMatchLength = 0
    
    items.forEach(item => {
      const targetPath = item.to.replace(/\/$/, '') || '/'
      const targetSegments = targetPath.split('/').filter(Boolean)
      
      // Exact match is always best
      if (currentPath === targetPath) {
        bestMatch = targetPath
        bestMatchLength = targetSegments.length
        return
      }
      
      // Check if current path starts with target path
      if (currentPath.startsWith(targetPath + '/')) {
        // Prefer longer (more specific) matches
        if (targetSegments.length > bestMatchLength) {
          bestMatch = targetPath
          bestMatchLength = targetSegments.length
        }
      }
    })
    
    return bestMatch
  }, [location, items])

  const checkIsActive = (to: string) => {
    if (!location?.pathname) return false
    
    const targetPath = to.replace(/\/$/, '') || '/'
    
    // Only the most specific matching route is active
    return findActiveRoute === targetPath
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // No need to close mobile menu since it's always visible as bottom bar
  const handleLinkClick = () => {
    // Sidebar is always visible on mobile now, so no action needed
  }

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col',
        // Mobile: fixed bottom bar - truly fixed, no movement
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white border-t border-slate-200',
        'w-full h-auto',
        // Safe area for devices with home indicator
        'pb-[env(safe-area-inset-bottom)] sm:pb-0',
        // Prevent any transform or movement on mobile
        'transform-none will-change-auto',
        // Desktop: modern sidebar card
        'sm:relative sm:inset-y-auto sm:left-auto sm:right-auto sm:bottom-auto',
        'sm:bg-slate-900/70 sm:backdrop-blur-sm',
        'sm:border sm:border-white/10 sm:rounded-2xl sm:m-2',
        'sm:transition-[width] sm:duration-300 sm:ease-in-out',
        // Desktop width: w-72 expanded, w-20 collapsed
        isCollapsed ? 'sm:w-20' : 'sm:w-72',
        // Shadow
        'shadow-xl sm:shadow-lg'
      )}
      data-collapsed={isCollapsed}
      id="sidebar"
    >
      {/* Header - hidden on mobile, visible on desktop */}
      <div className={cn(
        'hidden sm:flex sm:items-center sm:justify-between',
        'h-16 px-4 border-b border-white/10',
        isCollapsed && 'sm:justify-center sm:px-2'
      )}>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{title}</div>
            <div className="text-xs text-slate-400 mt-0.5">Operational view</div>
          </div>
        )}
        <div className="flex items-center gap-2">
          {role && onOpenNotifications && !isCollapsed && (
            <NotificationBell role={role} onClick={onOpenNotifications} />
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <nav className={cn(
        'flex',
        // Mobile: horizontal layout with no overflow, evenly distributed
        'flex-row justify-around items-center',
        'px-1 py-2.5 min-h-[72px]',
        'overflow-x-hidden overflow-y-hidden',
        // Desktop: vertical layout with proper spacing
        'sm:flex-col sm:justify-start sm:items-stretch',
        'sm:px-2 sm:py-2 sm:min-h-0 sm:flex-1 sm:overflow-auto sm:space-y-1.5'
      )}>
        {items.map(i => {
          const isActive = checkIsActive(i.to)
          return (
            <NavLink
              key={i.to}
              to={i.to}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center transition-all duration-200',
                // Mobile: vertical stack (icon on top, label below)
                'flex-col justify-center',
                'flex-1 min-w-0 px-2 py-2',
                'rounded-lg',
                // Desktop: horizontal layout with proper sizing
                'sm:flex-row sm:h-10 sm:px-3 sm:rounded-xl',
                'sm:gap-3 sm:text-sm sm:font-medium',
                // Desktop: handle collapsed state
                isCollapsed && 'sm:justify-center sm:px-2',
                // Active state: pill highlight
                isActive
                  ? 'bg-white/10 text-white ring-1 ring-white/10'
                  : 'text-slate-200 active:bg-white/5 sm:hover:bg-white/5 sm:hover:text-white',
                // Mobile active state
                isActive && 'bg-blue-600 text-white'
              )}
              title={isCollapsed ? i.label : undefined}
            >
              {i.icon ? (
                <span className={cn(
                  'shrink-0 transition-colors',
                  'flex items-center justify-center',
                  // Mobile: icon size - larger for visibility
                  'h-6 w-6 mb-1',
                  // Desktop: proper icon size
                  'sm:h-5 sm:w-5 sm:mb-0',
                  isActive ? 'text-white' : 'text-slate-400'
                )}>
                  {i.icon}
                </span>
              ) : null}
              <span className={cn(
                'truncate text-center',
                // Mobile: larger label for better visibility
                'text-xs leading-tight font-medium',
                // Desktop: proper text size
                'sm:text-sm sm:text-left sm:font-medium',
                // Desktop: hide when collapsed
                isCollapsed && 'sm:hidden',
                isActive ? 'text-white' : 'text-slate-200'
              )}>
                {i.label}
              </span>
            </NavLink>
          )
        })}
      </nav>
      {exitItem ? (
        <div className={cn(
          'border-t border-white/10',
          'px-2 pt-2 pb-2',
          // Mobile: hide exit item
          'hidden sm:block'
        )}>
          {onLogout ? (
            <button
              onClick={() => {
                handleLinkClick()
                onLogout()
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl h-10 px-3',
                'text-sm font-medium transition-all duration-200',
                'text-slate-300 hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? exitItem.label : undefined}
            >
              {exitItem.icon ? (
                <span className="shrink-0 text-slate-400 h-5 w-5 flex items-center justify-center">
                  {exitItem.icon}
                </span>
              ) : null}
              {!isCollapsed && <span className="truncate">{exitItem.label}</span>}
            </button>
          ) : (
            <NavLink
              to={exitItem.to}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-xl h-10 px-3',
                'text-sm font-medium transition-all duration-200',
                'text-slate-300 hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? exitItem.label : undefined}
            >
              {exitItem.icon ? (
                <span className="shrink-0 text-slate-400 h-5 w-5 flex items-center justify-center">
                  {exitItem.icon}
                </span>
              ) : null}
              {!isCollapsed && <span className="truncate">{exitItem.label}</span>}
            </NavLink>
          )}
        </div>
      ) : null}
    </aside>
  )
}

