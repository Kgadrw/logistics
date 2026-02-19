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
        'shrink-0 flex flex-col bg-blue-900 transition-all duration-300 ease-in-out',
        // Mobile: fixed bottom bar with top border only
        'fixed bottom-0 left-0 right-0 z-40 border-t border-blue-800',
        'sm:translate-y-0',
        // Desktop: normal sidebar with all borders, rounded corners and margin
        'sm:relative sm:inset-y-auto sm:left-auto sm:right-auto sm:bottom-auto',
        'sm:border sm:border-blue-800 sm:rounded-2xl sm:m-2',
        // Width: full on mobile, collapsed/expanded on desktop
        isCollapsed ? 'w-full sm:w-20' : 'w-full sm:w-64',
        // Shadow
        'shadow-xl sm:shadow-none'
      )}
      data-collapsed={isCollapsed}
      id="sidebar"
    >
      {/* Header - hidden on mobile, visible on desktop */}
      <div className={cn('px-4 py-4 hidden sm:block', isCollapsed && 'px-2')}>
        <div className="flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div>
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="mt-1 text-xs text-blue-200">Operational view</div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {role && onOpenNotifications && !isCollapsed ? (
              <NotificationBell role={role} onClick={onOpenNotifications} />
            ) : null}
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
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
      </div>
      <nav className={cn(
        'flex overflow-auto gap-1.5',
        // Mobile: horizontal layout
        'flex-row px-2 py-2 sm:px-2 sm:py-0',
        // Desktop: vertical layout
        'sm:flex-col sm:flex-1'
      )}>
        {items.map(i => {
          const isActive = checkIsActive(i.to)
          return (
            <NavLink
              key={i.to}
              to={i.to}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                // Mobile: compact horizontal items
                'flex-col sm:flex-row',
                'justify-center sm:justify-start',
                // Desktop: handle collapsed state
                isCollapsed && 'sm:justify-center sm:px-2',
                isActive
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white',
              )}
              title={isCollapsed ? i.label : undefined}
            >
              {i.icon ? (
                <span className={cn('transition-colors shrink-0', isActive ? 'text-white' : 'text-blue-200')}>
                  {i.icon}
                </span>
              ) : null}
              <span className={cn(
                'truncate text-xs sm:text-sm',
                // Mobile: always show label below icon
                'block',
                // Desktop: hide when collapsed
                isCollapsed && 'sm:hidden'
              )}>
                {i.label}
              </span>
            </NavLink>
          )
        })}
      </nav>
      {exitItem ? (
        <div className={cn(
          'border-t border-blue-800 px-2 pt-2',
          // Mobile: no bottom padding, desktop: pb-4
          'pb-2 sm:pb-4',
          // Mobile: hide exit item (or show in nav if needed)
          'hidden sm:block'
        )}>
          {onLogout ? (
            <button
              onClick={() => {
                handleLinkClick()
                onLogout()
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isCollapsed && 'justify-center px-2',
                'text-blue-100 hover:bg-blue-800 hover:text-white',
              )}
              title={isCollapsed ? exitItem.label : undefined}
            >
              {exitItem.icon ? (
                <span className="shrink-0 transition-colors text-blue-200">
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
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isCollapsed && 'justify-center px-2',
                'text-blue-100 hover:bg-blue-800 hover:text-white',
              )}
              title={isCollapsed ? exitItem.label : undefined}
            >
              {exitItem.icon ? (
                <span className="shrink-0 transition-colors text-blue-200">
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

