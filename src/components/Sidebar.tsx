import * as React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Search, Settings, Waves } from 'lucide-react'
import { cn } from '../lib/cn'
import { NotificationBell } from './NotificationBell'
import { useAuth } from '../lib/authContext'
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
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(`sidebar-collapsed-${role || 'default'}`)
    return saved ? JSON.parse(saved) : false
  })
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => 
      item.label.toLowerCase().includes(query)
    )
  }, [items, searchQuery])

  // No need to close mobile menu since it's always visible as bottom bar
  const handleLinkClick = () => {
    // Sidebar is always visible on mobile now, so no action needed
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    const names = user.name.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase()
    }
    return user.name[0].toUpperCase()
  }

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col',
        // Mobile: fixed bottom bar
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white border-t border-slate-200',
        'w-full h-auto',
        'pb-[env(safe-area-inset-bottom)] sm:pb-0',
        'transform-none will-change-auto',
        // Desktop: sidebar with modern design
        'sm:relative sm:inset-y-auto sm:left-auto sm:right-auto sm:bottom-auto',
        'sm:bg-white sm:border sm:border-slate-200 sm:rounded-xl sm:m-2',
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
        'px-4 py-4 border-b border-slate-200',
        isCollapsed && 'sm:justify-center sm:px-2'
      )}>
        {!isCollapsed ? (
          <>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 truncate">{title}</h2>
            </div>
          </>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Waves className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Search Bar - Desktop only */}
      {!isCollapsed && (
        <div className="hidden sm:block px-4 py-3 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        'flex',
        // Mobile: horizontal layout
        'flex-row justify-around items-center',
        'px-2 py-3 min-h-[72px]',
        'overflow-x-hidden overflow-y-hidden',
        // Desktop: vertical layout
        'sm:flex-col sm:justify-start sm:items-stretch',
        'sm:px-3 sm:py-2 sm:min-h-0 sm:flex-1 sm:overflow-auto sm:gap-0.5'
      )}>
        {filteredItems.map(i => {
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
                'sm:rounded-lg sm:px-3 sm:py-2.5',
                'sm:text-sm sm:font-medium',
                // Desktop: handle collapsed state
                isCollapsed && 'sm:justify-center sm:px-2',
                // Active state
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 bg-transparent hover:bg-slate-50 active:bg-slate-100',
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
                    ? 'text-slate-900 sm:text-slate-700' 
                    : 'text-slate-500 sm:text-slate-500',
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
                  isActive ? 'text-slate-900' : 'text-slate-600',
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
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-700'
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
        'border-t border-slate-200 px-3 py-3 gap-2'
      )}>
        {/* Settings */}
        <button
          onClick={() => {
            // Navigate to settings/profile page if available
            const settingsItem = items.find(item => 
              item.label.toLowerCase().includes('settings') || 
              item.label.toLowerCase().includes('profile')
            )
            if (settingsItem) {
              handleLinkClick()
              window.location.href = settingsItem.to
            }
          }}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
            'text-slate-600 hover:bg-slate-50 active:bg-slate-100',
            'transition-colors duration-200',
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 text-slate-500 shrink-0" />
          {!isCollapsed && <span className="truncate">Settings</span>}
        </button>

        {/* User Profile */}
        <div className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2',
          isCollapsed && 'justify-center px-2'
        )}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {getUserInitials()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {user?.email || ''}
              </div>
            </div>
          )}
        </div>

        {/* Exit/Logout */}
        {exitItem && (
          <div className="pt-2 border-t border-slate-200">
            {onLogout ? (
              <button
                onClick={() => {
                  handleLinkClick()
                  onLogout()
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'text-slate-600 hover:bg-slate-50 active:bg-slate-100',
                  'transition-colors duration-200',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? exitItem.label : undefined}
              >
                {exitItem.icon ? (
                  <span className="shrink-0 text-slate-500 h-5 w-5 flex items-center justify-center">
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
                  'text-slate-600 hover:bg-slate-50 active:bg-slate-100',
                  'transition-colors duration-200',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? exitItem.label : undefined}
              >
                {exitItem.icon ? (
                  <span className="shrink-0 text-slate-500 h-5 w-5 flex items-center justify-center">
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
      <div className="hidden sm:block border-t border-slate-200 px-3 py-2">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
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
