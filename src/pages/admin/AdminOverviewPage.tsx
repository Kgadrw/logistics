import * as React from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { useStore } from '../../lib/store'
import { Badge, statusTone } from '../../components/ui/Badge'
import { formatDateTime } from '../../lib/format'

export function AdminOverviewPage() {
  const { shipments, audit, users } = useStore()

  const stats = React.useMemo(() => {
    const totalShipments = shipments.length
    const activeShipments = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Draft').length
    const totalClients = users.filter(u => u.role === 'client' && u.active).length
    const totalWarehouses = users.filter(u => u.role === 'warehouse' && u.active).length
    const recentAudit = audit.slice(0, 5).length
    return { totalShipments, activeShipments, totalClients, totalWarehouses, recentAudit }
  }, [shipments, users, audit])

  const recent = shipments.slice(0, 5)
  const recentAudit = audit.slice(0, 6)

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Admin Overview</div>
        <div className="mt-1 text-sm text-slate-600">Data-driven snapshot across the system.</div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-slate-600">Total Shipments</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalShipments}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-slate-600">Active Shipments</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.activeShipments}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-slate-600">Active Clients</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalClients}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-slate-600">Active Warehouses</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalWarehouses}</div>
          </CardBody>
        </Card>
        <Card className="bg-slate-800">
          <CardBody>
            <div className="text-xs font-semibold text-slate-300">Recent Audit Events</div>
            <div className="mt-1 text-2xl font-semibold text-white">{stats.recentAudit}</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Recent shipments</CardTitle>
            <div className="text-xs text-slate-500">Latest activity</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recent.map(s => (
                <div key={s.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{s.id}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {s.clientName} → {s.warehouseName}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    <div className="text-xs text-slate-500">{formatDateTime(s.updatedAtIso)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
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
                    <div className="shrink-0 text-xs text-slate-500">{formatDateTime(a.createdAtIso)}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Actor: {a.actor}</div>
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

