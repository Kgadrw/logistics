import * as React from 'react'
import { Bell } from 'lucide-react'
import type { Role } from '../lib/types'
import { cn } from '../lib/cn'
import { useStore } from '../lib/store'

export function NotificationBell({
  role,
  onClick,
  className,
}: {
  role: Role
  onClick: () => void
  className?: string
}) {
  const { notifications } = useStore()
  const unread = React.useMemo(() => {
    return notifications.filter(n => n.roleTargets.includes(role) && n.unreadBy[role]).length
  }, [notifications, role])

  return (
    <button
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-blue-800 transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
        className,
      )}
      onClick={onClick}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-blue-200" />
      {unread > 0 ? (
        <span className="absolute right-1 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      ) : null}
    </button>
  )
}

