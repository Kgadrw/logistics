import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { formatDateTime, formatMoneyUsd } from '../../lib/format'
import { useAdminAPI } from '../../lib/useAPI'
import { cn } from '../../lib/cn'
import type { ShipmentStatus } from '../../lib/types'

const statusOptions: ShipmentStatus[] = ['Draft', 'Submitted', 'Received', 'Left Warehouse', 'In Transit', 'Delivered']

export function AdminShipmentsPage() {
  const navigate = useNavigate()
  const { shipments, loading } = useAdminAPI()
  const [q, setQ] = React.useState('')
  const [status, setStatus] = React.useState<ShipmentStatus | 'All'>('All')
  const [warehouse, setWarehouse] = React.useState<'All' | string>('All')
  const [client, setClient] = React.useState<'All' | string>('All')

  const warehouses = React.useMemo(() => Array.from(new Set(shipments.map(s => s.warehouseName || s.warehouse?.name).filter(Boolean))), [shipments])
  const clients = React.useMemo(() => Array.from(new Set(shipments.map(s => s.clientName || s.client?.name).filter(Boolean))), [shipments])

  const filtered = React.useMemo(() => {
    return shipments.filter(s => {
      const clientName = s.clientName || s.client?.name || ''
      const warehouseName = s.warehouseName || s.warehouse?.name || ''
      const matchesQ = q.trim()
        ? [s.id, clientName, warehouseName].some(v => v.toLowerCase().includes(q.trim().toLowerCase()))
        : true
      const matchesStatus = status === 'All' ? true : s.status === status
      const matchesWarehouse = warehouse === 'All' ? true : warehouseName === warehouse
      const matchesClient = client === 'All' ? true : clientName === client
      return matchesQ && matchesStatus && matchesWarehouse && matchesClient
    })
  }, [shipments, q, status, warehouse, client])

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Shipment Monitoring</div>
        <div className="mt-1 text-sm text-slate-600">System-wide visibility with filters (map view can be added later).</div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>All shipments</CardTitle>
          <div className="text-xs text-slate-500">{loading ? 'Loading...' : `${filtered.length} results`}</div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="text-xs font-semibold text-slate-600">Search</div>
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Shipment ID, client, warehouse..." />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Status</div>
              <Select value={status} onChange={e => setStatus(e.target.value as ShipmentStatus | 'All')}>
                <option value="All">All</option>
                {statusOptions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Warehouse</div>
              <Select value={warehouse} onChange={e => setWarehouse(e.target.value)}>
                <option value="All">All</option>
                {warehouses.map(w => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Client</div>
              <Select value={client} onChange={e => setClient(e.target.value)}>
                <option value="All">All</option>
                {clients.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <Table>
              <THead>
                <TR>
                  <TH>Shipment</TH>
                  <TH>Client</TH>
                  <TH>Warehouse</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Est. cost</TH>
                  <TH>Updated</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map(s => (
                  <TR
                    key={s.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => navigate(`/admin/shipment/${s.id}`)}
                  >
                    <TD className="whitespace-nowrap font-semibold text-slate-900">{s.id}</TD>
                    <TD className="whitespace-nowrap">{s.clientName || s.client?.name || 'Unknown'}</TD>
                    <TD className="whitespace-nowrap">{s.warehouseName || s.warehouse?.name || 'Unknown'}</TD>
                    <TD>
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    </TD>
                    <TD className="whitespace-nowrap text-right font-semibold text-slate-900">{formatMoneyUsd(s.estimatedCostUsd || 0)}</TD>
                    <TD className="whitespace-nowrap text-slate-600">{formatDateTime(s.updatedAtIso || s.updatedAt || s.createdAtIso || s.createdAt)}</TD>
                  </TR>
                ))}
                {filtered.length === 0 ? (
                  <TR>
                    <TD colSpan={6} className="px-4 py-8 text-center text-sm text-slate-600">
                      No matching shipments.
                    </TD>
                  </TR>
                ) : null}
              </TBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

