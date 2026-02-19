import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { useWarehouseAPI } from '../../lib/useAPI'
import { warehouseAPI } from '../../lib/api'
import { useAuth } from '../../lib/authContext'
import { useToast } from '../../components/ui/Toast'
import type { TransportMethod } from '../../lib/types'

const methods: TransportMethod[] = ['Truck', 'Air', 'Bike', 'Ship']

export function WarehouseOutgoingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { outgoing, refresh, loading: loadingShipments } = useWarehouseAPI(user?.id)

  const [open, setOpen] = React.useState(false)
  const [shipmentId, setShipmentId] = React.useState<string | null>(null)
  const [method, setMethod] = React.useState<TransportMethod>('Truck')
  const [transportId, setTransportId] = React.useState('TRK-')
  const [departureDateIso, setDepartureDateIso] = React.useState<string>(() => new Date().toISOString().slice(0, 10))
  const [packagingList, setPackagingList] = React.useState('')
  const [packageNumber, setPackageNumber] = React.useState('')
  const [consigneeNumber, setConsigneeNumber] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [markingInTransit, setMarkingInTransit] = React.useState<string | null>(null)

  const selected = outgoing.find(s => s.id === shipmentId) ?? null

  const handleDispatch = async () => {
    if (!shipmentId) return
    try {
      setLoading(true)
      await warehouseAPI.dispatchShipment(shipmentId, {
        method,
        transportId: transportId.trim() || 'N/A',
        departureDateIso: new Date(departureDateIso).toISOString(),
        packagingList: packagingList.trim() || undefined,
        packageNumber: packageNumber.trim() || undefined,
        consigneeNumber: consigneeNumber.trim() || undefined,
        shippingMark: 'UZA Solutions',
      })
      await refresh()
      setOpen(false)
      setTransportId('TRK-')
      setPackagingList('')
      setPackageNumber('')
      setConsigneeNumber('')
      showToast('Shipment dispatched successfully', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch shipment', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkInTransit = async (id: string) => {
    try {
      setMarkingInTransit(id)
      await warehouseAPI.markInTransit(id)
      await refresh()
      showToast('Shipment marked as in transit', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to mark as in transit', 'error')
    } finally {
      setMarkingInTransit(null)
    }
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Outgoing Shipments</div>
        <div className="mt-1 text-sm text-slate-600">Dispatch with transport details — clients are notified automatically.</div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Outgoing Shipments</CardTitle>
          <div className="text-xs text-slate-500">
            {loadingShipments ? 'Loading...' : `${outgoing.length} ${outgoing.length === 1 ? 'shipment' : 'shipments'}`}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Client</TH>
                  <TH>Shipment ID</TH>
                  <TH>Products</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Action</TH>
                </TR>
              </THead>
              <TBody>
                {outgoing.map(s => (
                  <TR
                    key={s.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={(e) => {
                      // Only navigate if clicking on the row, not the button
                      if ((e.target as HTMLElement).closest('button')) return
                      navigate(`/warehouse/shipment/${s.id}`)
                    }}
                  >
                    <TD className="whitespace-nowrap font-semibold text-slate-900">{s.clientName || s.client?.name || 'Unknown'}</TD>
                    <TD className="whitespace-nowrap">{s.id}</TD>
                    <TD className="min-w-64 text-slate-700">
                      {s.products?.slice(0, 2).map(p => p.name).join(', ') || 'No products'}
                      {s.products && s.products.length > 2 ? ` +${s.products.length - 2} more` : ''}
                    </TD>
                    <TD>
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {s.status === 'Left Warehouse' ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkInTransit(s.id)
                            }}
                            disabled={markingInTransit === s.id}
                          >
                            {markingInTransit === s.id ? 'Marking...' : 'Mark In Transit'}
                          </Button>
                        ) : s.status === 'Received' ? (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShipmentId(s.id)
                              setOpen(true)
                            }}
                          >
                            Dispatch
                          </Button>
                        ) : null}
                      </div>
                    </TD>
                  </TR>
                ))}
                {outgoing.length === 0 && !loadingShipments ? (
                  <TR>
                    <TD colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                      {loadingShipments ? 'Loading shipments...' : 'No outgoing shipments at this time.'}
                    </TD>
                  </TR>
                ) : null}
                {loadingShipments && (
                  <TR>
                    <TD colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                      Loading shipments...
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <Modal
        open={open}
        title="Dispatch shipment"
        description={selected ? `Shipment ${selected.id} • ${selected.clientName}` : 'Add transport details to dispatch.'}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">Client will be notified automatically.</div>
            <Button
              onClick={handleDispatch}
              disabled={!shipmentId || loading}
            >
              Confirm dispatch
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-slate-600">Transport method</div>
            <Select value={method} onChange={e => setMethod(e.target.value as TransportMethod)}>
              {methods.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Driver / transport ID</div>
            <Input value={transportId} onChange={e => setTransportId(e.target.value)} placeholder="e.g. TRK-77" />
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-semibold text-slate-600">Departure date</div>
            <Input type="date" value={departureDateIso} onChange={e => setDepartureDateIso(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-semibold text-slate-600">Packaging List</div>
            <Input value={packagingList} onChange={e => setPackagingList(e.target.value)} placeholder="Enter packaging list" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Package Number</div>
            <Input value={packageNumber} onChange={e => setPackageNumber(e.target.value)} placeholder="Enter package number" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Consignee Number</div>
            <Input value={consigneeNumber} onChange={e => setConsigneeNumber(e.target.value)} placeholder="Enter consignee number" />
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-semibold text-slate-600">Shipping Mark</div>
            <Input value="UZA Solutions" disabled className="bg-slate-50" />
          </div>

          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-600">Auto notification message</div>
            <div className="mt-1 text-sm text-slate-600">
              "Your shipment has left the warehouse via <span className="font-semibold">{method}</span>".
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

