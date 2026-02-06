import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Users, Building2, Activity, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'
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
      } catch (err) {
        console.error('Failed to fetch admin overview data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Admin Overview</div>
        <div className="mt-1 text-sm text-slate-600">Data-driven snapshot across the system.</div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/shipments')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Total Shipments</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalShipments}</div>
              </div>
              <Package className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/shipments')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Active Shipments</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.activeShipments}</div>
                {stats.activeShipments > 0 && (
                  <div className="mt-1 text-xs text-orange-600 font-medium">In progress</div>
                )}
              </div>
              <Activity className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/users?focus=client')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Active Clients</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalClients}</div>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/users?focus=warehouse')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Active Warehouses</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalWarehouses}</div>
              </div>
              <Building2 className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => navigate('/admin/settings')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-300">Recent Audit Events</div>
                <div className="mt-1 text-2xl font-semibold text-white">{stats.recentAudit}</div>
              </div>
              <Activity className="h-8 w-8 text-slate-400 opacity-20" />
            </div>
          </CardBody>
        </Card>
      </div>

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

