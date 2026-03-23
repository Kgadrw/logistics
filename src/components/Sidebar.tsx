import * as React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Waves } from 'lucide-react'
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
  items: { to: string; label: string; icon?: React.ReactNode; badge?: number }[]
  role?: Role
  onOpenNotifications?: () => void
  exitItem?: { to: string; label: string; icon?: React.ReactNode }
  onLogout?: () => void
}) {
  const location = useLocation()
  const isClientRole = role === 'client'
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
        // Mobile: fixed bottom bar
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-blue-900 border-t border-blue-800',
        'w-full h-auto',
        'pb-[env(safe-area-inset-bottom)] sm:pb-0',
        'transform-none will-change-auto',
        // Desktop: sidebar with modern design
        'sm:relative sm:inset-y-auto sm:left-auto sm:right-auto sm:bottom-auto',
        'sm:bg-blue-900 sm:border sm:border-blue-800 sm:rounded-xl sm:m-2',
        'sm:transition-all sm:duration-300 sm:ease-in-out',
        'sm:shadow-sm',
        // Desktop width
        isCollapsed ? 'sm:w-16' : 'sm:w-64',
        // Mobile shadow
        'shadow-lg sm:shadow-sm'
      )}
      data-collapsed={isCollapsed}
      id="sidebar"
    >
      {/* Header with Logo and Title - Desktop only */}
      <div className={cn(
        'hidden sm:flex sm:items-center sm:gap-3',
        'px-4 py-4 border-b border-blue-800',
        isCollapsed && 'sm:justify-center sm:px-2'
      )}>
        {!isCollapsed ? (
          <>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
            </div>
          </>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Waves className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        'flex',
        // Mobile: horizontal layout
        'flex-row justify-around items-center',
        'px-2 py-3 min-h-[72px]',
        'overflow-x-hidden overflow-y-hidden',
        // Desktop: vertical layout
        'sm:flex-col sm:justify-start sm:items-stretch',
        'sm:px-3 sm:py-2 sm:min-h-0 sm:flex-1 sm:overflow-auto',
        isClientRole ? 'sm:gap-0' : 'sm:gap-0.5'
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
                // Mobile: vertical stack
                'flex-col justify-center',
                'flex-1 min-w-0 px-2 py-2',
                'rounded-lg',
                // Desktop: horizontal layout
                'sm:flex-row sm:gap-3',
                'sm:rounded-lg sm:px-3',
                isClientRole ? 'sm:py-2' : 'sm:py-2.5',
                'sm:text-sm sm:font-medium',
                // Desktop: handle collapsed state
                isCollapsed && 'sm:justify-center sm:px-2',
                // Active state
                isActive
                  ? 'bg-blue-800/60 text-white'
                  : 'text-blue-100 bg-transparent hover:bg-blue-800/40 active:bg-blue-800/50',
                // Mobile active state
                isActive && 'bg-blue-600 text-white'
              )}
              title={isCollapsed ? i.label : undefined}
            >
              {i.icon ? (
                <span className={cn(
                  'shrink-0 flex items-center justify-center transition-colors',
                  // Mobile: icon size
                  'h-5 w-5 mb-1',
                  // Desktop: icon size
                  'sm:h-5 sm:w-5 sm:mb-0',
                  isActive 
                    ? 'text-white' 
                    : 'text-blue-200',
                  // Mobile active
                  isActive && 'text-white'
                )}>
                  {i.icon}
                </span>
              ) : null}
              {!isCollapsed && (
                <span className={cn(
                  'truncate flex-1',
                  // Mobile: label
                  'text-xs font-medium leading-tight text-center',
                  // Desktop: label
                  'sm:text-sm sm:text-left sm:font-medium',
                  isActive ? 'text-white' : 'text-blue-100',
                  // Mobile active
                  isActive && 'text-white'
                )}>
                  {i.label}
                </span>
              )}
              {!isCollapsed && i.badge !== undefined && (
                <span className={cn(
                  'shrink-0 h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center text-xs font-medium',
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-800/60 text-blue-100'
                )}>
                  {i.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer with Settings and User Profile - Desktop only */}
      <div className={cn(
        'hidden sm:flex sm:flex-col',
        'border-t border-blue-800 px-3 py-3 gap-2'
      )}>
        {/* Exit/Logout */}
        {exitItem && (
          <div className="pt-2 border-t border-blue-800">
            {onLogout ? (
              <button
                onClick={() => {
                  handleLinkClick()
                  onLogout()
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-blue-100 hover:bg-blue-800/40 active:bg-blue-800/50',
                  'transition-colors duration-200',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? exitItem.label : undefined}
              >
                {exitItem.icon ? (
                  <span className="shrink-0 text-blue-200 h-5 w-5 flex items-center justify-center">
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-blue-100 hover:bg-blue-800/40 active:bg-blue-800/50',
                  'transition-colors duration-200',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? exitItem.label : undefined}
              >
                {exitItem.icon ? (
                  <span className="shrink-0 text-blue-200 h-5 w-5 flex items-center justify-center">
                    {exitItem.icon}
                  </span>
                ) : null}
                {!isCollapsed && <span className="truncate">{exitItem.label}</span>}
              </NavLink>
            )}
          </div>
        )}
      </div>

      {/* Collapse Button - Desktop only */}
      <div className="hidden sm:block border-t border-blue-800 px-3 py-2">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-blue-200 hover:bg-blue-800/40 hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
