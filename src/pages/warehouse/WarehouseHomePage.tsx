import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageCheck, Truck, History, ArrowRight, Clock, CheckCircle2, Bell, Zap, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useWarehouseAPI, useNotificationsAPI } from '../../lib/useAPI'
import { warehouseAPI } from '../../lib/api'
import { useAuth } from '../../lib/authContext'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/cn'

export function WarehouseHomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { incoming, outgoing, history, loading } = useWarehouseAPI(user?.id)
  const { notifications, loading: loadingNotifications } = useNotificationsAPI('warehouse')
  const [dashboardStats, setDashboardStats] = React.useState<any>(null)
  
  // Debug: Log warehouse info
  React.useEffect(() => {
    if (user?.id) {
      console.log(`[WarehouseHomePage] Warehouse user ID: ${user.id}, Incoming shipments: ${incoming.length}`)
    }
  }, [user?.id, incoming.length])
  
  React.useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return
      try {
        const stats = await warehouseAPI.getDashboard(user.id)
        setDashboardStats(stats)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      }
    }
    fetchDashboard()
  }, [user?.id])

  const stats = React.useMemo(() => {
    if (dashboardStats) {
      return {
        pending: dashboardStats.pendingReceipt || 0,
        received: dashboardStats.receivedToday || 0,
        inTransit: dashboardStats.inTransit || 0,
        processed: dashboardStats.processed || 0,
      }
    }
    // Fallback to calculating from shipments
    const received = incoming.filter(s => s.status === 'Received').length
    const inTransit = history.filter(s => s.status === 'In Transit' || s.status === 'Left Warehouse').length
    const processed = history.filter(s => s.status === 'Delivered').length
    const pending = incoming.length
    return { received, inTransit, processed, pending }
  }, [dashboardStats, incoming, history])

  const incomingPreview = React.useMemo(() => incoming.slice(0, 5), [incoming])
  const outgoingPreview = React.useMemo(() => outgoing.slice(0, 5), [outgoing])
  const recentHistory = React.useMemo(() => 
    history
      .sort((a, b) => new Date(b.updatedAtIso || b.createdAtIso || '').getTime() - new Date(a.updatedAtIso || a.createdAtIso || '').getTime())
      .slice(0, 5),
    [history]
  )

  // Filter shipment-related notifications and get recent ones
  const shipmentNotifications = React.useMemo(() => {
    return notifications
      .filter(n => n.shipmentId)
      .sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime())
      .slice(0, 5)
  }, [notifications])

  if (loading && !dashboardStats) {
    return (
      <div className="pt-4">
        <div className="mb-6">
          <div className="text-sm font-semibold text-slate-900">Warehouse Dashboard</div>
          <div className="mt-1 text-sm text-slate-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Warehouse Dashboard</div>
            <div className="mt-1 text-sm text-slate-600">Operational overview — focus on speed and accuracy.</div>
          </div>
          {stats.pending > 0 && (
            <Button
              onClick={() => navigate('/warehouse/incoming')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              {stats.pending} Pending Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={cn(
          "border-l-4 border-l-orange-500 hover:shadow-md transition-shadow cursor-pointer",
          stats.pending > 0 && "ring-2 ring-orange-100"
        )} onClick={() => navigate('/warehouse/incoming')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Pending Receipt</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.pending}</div>
                {stats.pending > 0 && (
                  <div className="mt-1 text-xs text-orange-600 font-medium">Action required</div>
                )}
              </div>
              <PackageCheck className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/warehouse/incoming')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Received Today</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.received}</div>
                {stats.received > 0 && (
                  <div className="mt-1 text-xs text-blue-600 font-medium">Ready to dispatch</div>
                )}
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/warehouse/outgoing')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">In Transit</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.inTransit}</div>
                {stats.inTransit > 0 && (
                  <div className="mt-1 text-xs text-purple-600 font-medium">Tracking active</div>
                )}
              </div>
              <Truck className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/warehouse/history')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-green-700">Processed</div>
                <div className="mt-1 text-2xl font-semibold text-green-900">{stats.processed}</div>
                <div className="mt-1 text-xs text-green-600 font-medium">Completed</div>
              </div>
              <History className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick View Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incoming Shipments Quick View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-orange-600" />
                <CardTitle>Incoming Shipments</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/warehouse/incoming')}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="text-xs text-slate-500">{stats.pending} pending receipt</div>
          </CardHeader>
          <CardBody>
            {incomingPreview.length === 0 ? (
              <div className="text-center py-8">
                <PackageCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <div className="text-sm text-slate-500">No incoming shipments</div>
                <div className="text-xs text-slate-400 mt-1">New shipments will appear here</div>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingPreview.map(shipment => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/warehouse/shipment/${shipment.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-slate-900">{shipment.id}</div>
                        <Badge tone={statusTone(shipment.status)} className="text-xs">
                          {shipment.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {shipment.clientName || shipment.client?.name || 'Unknown'} • {shipment.products?.length || 0} products
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Outgoing Shipments Quick View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <CardTitle>Outgoing Shipments</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/warehouse/outgoing')}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="text-xs text-slate-500">{stats.received} ready to dispatch</div>
          </CardHeader>
          <CardBody>
            {outgoingPreview.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <div className="text-sm text-slate-500">No outgoing shipments</div>
                <div className="text-xs text-slate-400 mt-1">Received shipments ready to dispatch</div>
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingPreview.map(shipment => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/warehouse/shipment/${shipment.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-slate-900">{shipment.id}</div>
                        <Badge tone={statusTone(shipment.status)} className="text-xs">
                          {shipment.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {shipment.clientName || shipment.client?.name || 'Unknown'} • {shipment.products?.length || 0} products
                      </div>
                    </div>
                    <Truck className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent History Quick View */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-purple-600" />
              <CardTitle>Recent History</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/warehouse/history')}
              className="text-xs"
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="text-xs text-slate-500">Recently dispatched and delivered shipments</div>
        </CardHeader>
        <CardBody>
          {recentHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <div className="text-sm text-slate-500">No history yet</div>
              <div className="text-xs text-slate-400 mt-1">Completed shipments will appear here</div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentHistory.map(shipment => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/warehouse/shipment/${shipment.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm text-slate-900">{shipment.id}</div>
                      <Badge tone={statusTone(shipment.status)} className="text-xs">
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {shipment.clientName || shipment.client?.name || 'Unknown'}
                      {shipment.dispatch && ` • ${shipment.dispatch.method} ${shipment.dispatch.transportId}`}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0 ml-2">
                    {formatDateTime(shipment.updatedAtIso || shipment.createdAtIso)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Shipment Notifications */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <CardTitle>Shipment Notifications</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/warehouse/notifications')}
              className="text-xs"
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="text-xs text-slate-500">Recent updates about shipments</div>
        </CardHeader>
        <CardBody>
          {loadingNotifications ? (
            <div className="text-sm text-slate-500 text-center py-4">Loading notifications...</div>
          ) : shipmentNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <div className="text-sm text-slate-500">No shipment notifications</div>
              <div className="text-xs text-slate-400 mt-1">You'll be notified of shipment updates</div>
            </div>
          ) : (
            <div className="space-y-3">
              {shipmentNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors',
                    notification.unreadBy?.warehouse ? 'ring-2 ring-blue-100 bg-blue-50/50' : 'bg-white'
                  )}
                  onClick={() => {
                    if (notification.shipmentId) {
                      navigate(`/warehouse/shipment/${notification.shipmentId}`)
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm text-slate-900">{notification.title}</div>
                      {notification.unreadBy?.warehouse && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{notification.message}</div>
                    {notification.shipmentId && (
                      <div className="text-xs text-slate-500 mt-1">Shipment: {notification.shipmentId}</div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">
                    {formatDateTime(notification.createdAtIso)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

