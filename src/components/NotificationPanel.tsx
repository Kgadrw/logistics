import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle } from './ui/Card'
import { Input } from './ui/Input'
import { Search, X } from 'lucide-react'
import { Button } from './ui/Button'
import type { Role } from '../lib/types'
import { useNotificationsAPI } from '../lib/useAPI'
import { formatDateTime } from '../lib/format'
import { cn } from '../lib/cn'

function groupKey(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

type FilterType = 'all' | 'unread' | 'read'

export function NotificationPanel({ role, className }: { role: Role; className?: string }) {
  const navigate = useNavigate()
  const { notifications, loading, markRead } = useNotificationsAPI(role)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterType, setFilterType] = React.useState<FilterType>('all')

  const getShipmentDetailPath = (shipmentId: string) => {
    switch (role) {
      case 'client':
        return `/client/shipment/${shipmentId}`
      case 'warehouse':
        return `/warehouse/shipment/${shipmentId}`
      case 'admin':
        return `/admin/shipment/${shipmentId}`
      default:
        return '#'
    }
  }

  const items = React.useMemo(() => {
    // Notifications are already filtered by role from the API
    return notifications || []
  }, [notifications])

  const filteredItems = React.useMemo(() => {
    let filtered = items

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        n =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          (n.shipmentId && n.shipmentId.toLowerCase().includes(query)),
      )
    }

    // Apply read/unread filter
    if (filterType === 'unread') {
      filtered = filtered.filter(n => n.unreadBy?.[role])
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => !n.unreadBy?.[role])
    }

    return filtered
  }, [items, searchQuery, filterType, role])

  const groups = React.useMemo(() => {
    const m = new Map<string, typeof filteredItems>()
    for (const n of filteredItems) {
      const k = groupKey(n.createdAtIso)
      m.set(k, [...(m.get(k) ?? []), n])
    }
    return Array.from(m.entries())
  }, [filteredItems])


  const hasActiveFilters = searchQuery.trim().length > 0 || filterType !== 'all'

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div>
          <CardTitle>Notifications</CardTitle>
          <div className="text-xs text-slate-500">Real-time updates & grouped by day</div>
        </div>
      </CardHeader>
      <CardBody>
        {/* Search and Filter Section */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, message, or shipment ID..."
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'unread' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterType('unread')}
            >
              Unread
            </Button>
            <Button
              variant={filterType === 'read' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilterType('read')}
            >
              Read
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setFilterType('all')
                }}
                className="ml-auto text-white"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {hasActiveFilters && (
          <div className="mb-4 text-xs text-slate-600">
            Showing {filteredItems.length} of {items.length} notifications
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="text-sm text-slate-600 text-center py-8">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-slate-600">No notifications yet.</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-sm text-slate-600 text-center py-8">
            No notifications match your search criteria.
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(([day, ns]) => (
              <div key={day}>
                <div className="mb-2 text-xs font-semibold text-slate-600">{day}</div>
                <div className="space-y-2">
                  {ns.map(n => (
                    <div
                      key={n.id}
                      className={cn(
                        'rounded-xl border border-slate-200 bg-white px-4 py-3',
                        n.unreadBy?.[role] ? 'ring-2 ring-brand-100' : null,
                        n.shipmentId ? 'cursor-pointer hover:bg-slate-50 transition-colors' : null,
                      )}
                      onClick={async () => {
                        // Mark notification as read when clicked
                        if (n.unreadBy?.[role]) {
                          try {
                            await markRead([n.id])
                          } catch (error) {
                            console.error('Failed to mark notification as read:', error)
                          }
                        }
                        
                        if (n.shipmentId) {
                          navigate(getShipmentDetailPath(n.shipmentId))
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                            {n.unreadBy?.[role] && (
                              <span className="inline-flex h-2 w-2 rounded-full bg-blue-600" title="Unread" />
                            )}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">{n.message}</div>
                          {n.shipmentId && (
                            <div className="mt-1 text-xs text-slate-500">Shipment: {n.shipmentId}</div>
                          )}
                        </div>
                        <div className="shrink-0 text-xs text-slate-500">{formatDateTime(n.createdAtIso)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

