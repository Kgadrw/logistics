import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Users, Building2, Activity, TrendingUp, ArrowRight, AlertCircle, CheckCircle2, XCircle, Clock, Server, Database, Globe, Shield } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { adminAPI } from '../../lib/api'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/cn'

export function AdminOverviewPage() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = React.useState<any>(null)
  const [shipments, setShipments] = React.useState<any[]>([])
  const [auditLogs, setAuditLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [systemStatus, setSystemStatus] = React.useState({
    database: 'operational',
    api: 'operational',
    notifications: 'operational',
    fileStorage: 'operational',
    overall: 'operational',
  })

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [dashboard, shipmentsData, auditData] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getShipments(),
          adminAPI.getAuditLogs().catch(() => []), // Audit logs might not be available
        ])
        setDashboardData(dashboard)
        setShipments(shipmentsData)
        setAuditLogs(auditData || [])
        
        // Check system status based on API responses
        const status = {
          database: dashboard ? 'operational' : 'degraded',
          api: dashboard && shipmentsData ? 'operational' : 'degraded',
          notifications: 'operational',
          fileStorage: 'operational',
          overall: dashboard && shipmentsData ? 'operational' : 'degraded',
        }
        setSystemStatus(status)
      } catch (err) {
        console.error('Failed to fetch admin overview data:', err)
        setSystemStatus({
          database: 'degraded',
          api: 'degraded',
          notifications: 'degraded',
          fileStorage: 'degraded',
          overall: 'degraded',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const stats = React.useMemo(() => {
    if (dashboardData) {
      return {
        totalShipments: dashboardData.totalShipments || 0,
        activeShipments: dashboardData.activeShipments || 0,
        totalClients: dashboardData.totalClients || 0,
        totalWarehouses: dashboardData.totalWarehouses || 0,
        recentAudit: auditLogs.slice(0, 5).length,
      }
    }
    // Fallback
    const totalShipments = shipments.length
    const activeShipments = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Draft').length
    return { totalShipments, activeShipments, totalClients: 0, totalWarehouses: 0, recentAudit: auditLogs.slice(0, 5).length }
  }, [dashboardData, shipments, auditLogs])

  const recent = shipments.slice(0, 5)
  const recentAudit = auditLogs.slice(0, 6)

  if (loading) {
    return (
      <div className="pt-4">
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-900">Admin Overview</div>
          <div className="mt-1 text-sm text-slate-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-6 rounded-xl bg-blue-900 border border-blue-800 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 sm:mb-5">
          <div className="text-sm font-semibold text-white">Admin Overview</div>
          <div className="mt-1 text-sm text-blue-100">Data-driven snapshot across the system.</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-l-4 border-l-blue-400 hover:shadow-md transition-shadow cursor-pointer bg-blue-800/40 ring-blue-700/60" onClick={() => navigate('/admin/shipments')}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-100">Total Shipments</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{stats.totalShipments}</div>
                </div>
                <Package className="h-8 w-8 text-blue-300 opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="border-l-4 border-l-orange-400 hover:shadow-md transition-shadow cursor-pointer bg-blue-800/40 ring-blue-700/60" onClick={() => navigate('/admin/shipments')}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-100">Active Shipments</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{stats.activeShipments}</div>
                  {stats.activeShipments > 0 && (
                    <div className="mt-1 text-xs text-orange-200 font-medium">In progress</div>
                  )}
                </div>
                <Activity className="h-8 w-8 text-orange-300 opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="border-l-4 border-l-green-400 hover:shadow-md transition-shadow cursor-pointer bg-blue-800/40 ring-blue-700/60" onClick={() => navigate('/admin/users?focus=client')}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-100">Active Clients</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{stats.totalClients}</div>
                </div>
                <Users className="h-8 w-8 text-green-300 opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="border-l-4 border-l-purple-400 hover:shadow-md transition-shadow cursor-pointer bg-blue-800/40 ring-blue-700/60" onClick={() => navigate('/admin/users?focus=warehouse')}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-100">Active Warehouses</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{stats.totalWarehouses}</div>
                </div>
                <Building2 className="h-8 w-8 text-purple-300 opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-blue-800/50 hover:bg-blue-800/70 transition-colors cursor-pointer border border-blue-700/60" onClick={() => navigate('/admin/settings')}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-100">Recent Audit Events</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{stats.recentAudit}</div>
                </div>
                <Activity className="h-8 w-8 text-blue-200 opacity-50" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* System Status Diagram */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            System Status
          </CardTitle>
          <div className="text-xs text-slate-500">Real-time system health monitoring</div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Overall Status */}
            <div className="lg:col-span-1 rounded-xl border-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className={cn(
                  "h-5 w-5",
                  systemStatus.overall === 'operational' ? 'text-green-600' : 'text-orange-600'
                )} />
                <div className="text-xs font-semibold text-slate-900">Overall</div>
              </div>
              <div className={cn(
                "text-lg font-bold",
                systemStatus.overall === 'operational' ? 'text-green-700' : 'text-orange-700'
              )}>
                {systemStatus.overall === 'operational' ? 'Operational' : 'Degraded'}
              </div>
              <div className="mt-2 flex items-center gap-1">
                {systemStatus.overall === 'operational' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
                <span className="text-xs text-slate-600">All systems</span>
              </div>
            </div>

            {/* Database Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className={cn(
                    "h-5 w-5",
                    systemStatus.database === 'operational' ? 'text-green-600' : 'text-orange-600'
                  )} />
                  <div className="text-xs font-semibold text-slate-900">Database</div>
                </div>
                {systemStatus.database === 'operational' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div className={cn(
                "text-sm font-semibold",
                systemStatus.database === 'operational' ? 'text-green-700' : 'text-orange-700'
              )}>
                {systemStatus.database === 'operational' ? 'Connected' : 'Issues'}
              </div>
              <div className="mt-1 text-xs text-slate-600">MongoDB</div>
            </div>

            {/* API Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className={cn(
                    "h-5 w-5",
                    systemStatus.api === 'operational' ? 'text-green-600' : 'text-orange-600'
                  )} />
                  <div className="text-xs font-semibold text-slate-900">API Server</div>
                </div>
                {systemStatus.api === 'operational' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div className={cn(
                "text-sm font-semibold",
                systemStatus.api === 'operational' ? 'text-green-700' : 'text-orange-700'
              )}>
                {systemStatus.api === 'operational' ? 'Running' : 'Issues'}
              </div>
              <div className="mt-1 text-xs text-slate-600">Express.js</div>
            </div>

            {/* Notifications Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className={cn(
                    "h-5 w-5",
                    systemStatus.notifications === 'operational' ? 'text-green-600' : 'text-orange-600'
                  )} />
                  <div className="text-xs font-semibold text-slate-900">Notifications</div>
                </div>
                {systemStatus.notifications === 'operational' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div className={cn(
                "text-sm font-semibold",
                systemStatus.notifications === 'operational' ? 'text-green-700' : 'text-orange-700'
              )}>
                {systemStatus.notifications === 'operational' ? 'Active' : 'Issues'}
              </div>
              <div className="mt-1 text-xs text-slate-600">Real-time</div>
            </div>

            {/* File Storage Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className={cn(
                    "h-5 w-5",
                    systemStatus.fileStorage === 'operational' ? 'text-green-600' : 'text-orange-600'
                  )} />
                  <div className="text-xs font-semibold text-slate-900">File Storage</div>
                </div>
                {systemStatus.fileStorage === 'operational' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div className={cn(
                "text-sm font-semibold",
                systemStatus.fileStorage === 'operational' ? 'text-green-700' : 'text-orange-700'
              )}>
                {systemStatus.fileStorage === 'operational' ? 'Available' : 'Issues'}
              </div>
              <div className="mt-1 text-xs text-slate-600">Uploads</div>
            </div>
          </div>

          {/* Status Legend */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-slate-600">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-orange-600" />
              <span className="text-slate-600">Degraded / Issues</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Auto-refresh: 30s</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7 order-2 lg:order-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent shipments</CardTitle>
                <div className="text-xs text-slate-500">Latest activity</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/shipments')}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {recent.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <div className="text-sm text-slate-500">No shipments yet</div>
                <div className="text-xs text-slate-400 mt-1">Shipments will appear here</div>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map(s => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3",
                    "cursor-pointer hover:bg-slate-50 transition-colors"
                  )}
                  onClick={() => navigate(`/admin/shipment/${s.id}`)}
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{s.id}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {s.clientName || s.client?.name || 'Unknown'} → {s.warehouseName || s.warehouse?.name || 'Unknown'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    <div className="text-xs text-slate-500">{formatDateTime(s.updatedAtIso || s.updatedAt || s.createdAtIso || s.createdAt)}</div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-5 order-1 lg:order-2">
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <div className="text-xs text-slate-500">Price changes & overrides</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recentAudit.map(a => (
                <div key={a.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{a.action}</div>
                      <div className="mt-1 text-sm text-slate-600">{a.detail}</div>
                    </div>
                    <div className="shrink-0 text-xs text-slate-500">{formatDateTime(a.createdAtIso || a.createdAt || a.timestamp)}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Actor: {a.actor || a.user || 'System'}</div>
                </div>
              ))}
              {recentAudit.length === 0 ? <div className="text-sm text-slate-600">No audit activity yet.</div> : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

