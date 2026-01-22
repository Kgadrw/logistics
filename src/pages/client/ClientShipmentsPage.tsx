import * as React from 'react'
import { Edit, PackagePlus, Send, Truck } from 'lucide-react'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { ShipmentTimeline } from '../../components/Timeline'
import { NotificationPanel } from '../../components/NotificationPanel'
import { formatMoneyUsd } from '../../lib/format'
import { useStore } from '../../lib/store'
import { CreateShipmentModal } from './CreateShipmentModal'

export function ClientShipmentsPage() {
  const { shipments, createShipment, updateShipment, submitShipment } = useStore()
  const clientShipments = React.useMemo(() => shipments.filter(s => s.clientName === 'Acme Retail'), [shipments])

  const [selectedId, setSelectedId] = React.useState<string | null>(clientShipments[0]?.id ?? null)
  const selected = clientShipments.find(s => s.id === selectedId) ?? clientShipments[0]

  React.useEffect(() => {
    if (!selectedId && clientShipments[0]?.id) setSelectedId(clientShipments[0].id)
  }, [clientShipments, selectedId])

  const [open, setOpen] = React.useState(false)
  const [editingShipment, setEditingShipment] = React.useState<string | null>(null)

  const stats = React.useMemo(() => {
    const total = clientShipments.length
    const active = clientShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Draft').length
    const delivered = clientShipments.filter(s => s.status === 'Delivered').length
    const totalSpent = clientShipments.reduce((sum, s) => sum + (s.estimatedCostUsd || 0), 0)
    return { total, active, delivered, totalSpent }
  }, [clientShipments])

  return (
    <div className="w-full px-4 pt-6 pb-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Shipments</div>
          <div className="mt-1 text-sm text-slate-600">Create new shipments, track status, and communicate with the warehouse.</div>
        </div>
        <Button onClick={() => setOpen(true)}>
          <PackagePlus className="h-4 w-4" />
          Create New Shipment
        </Button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-slate-600">Total Shipments</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.total}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-slate-600">Active Shipments</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.active}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-slate-600">Delivered</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.delivered}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs font-semibold text-brand-700">Total Spent</div>
            <div className="mt-1 text-2xl font-semibold text-brand-900">${stats.totalSpent.toLocaleString()}</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="grid gap-3">
            {clientShipments.map(s => (
              <button
                key={s.id}
                className={[
                  'text-left rounded-2xl shadow-card ring-1 px-5 py-4 transition-all duration-300 ease-in-out',
                  selected?.id === s.id
                    ? 'bg-blue-900 ring-2 ring-blue-800 text-white'
                    : 'bg-white ring-slate-200/70 hover:ring-blue-200',
                ].join(' ')}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        selected?.id === s.id ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {s.id}
                    </div>
                    <div
                      className={`mt-1 flex flex-wrap items-center gap-2 text-sm transition-colors duration-300 ${
                        selected?.id === s.id ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Truck
                          className={`h-4 w-4 transition-colors duration-300 ${
                            selected?.id === s.id ? 'text-white' : 'text-slate-500'
                          }`}
                        />
                        {s.products.length} products
                      </span>
                      <span
                        className={`transition-colors duration-300 ${
                          selected?.id === s.id ? 'text-white/70' : 'text-slate-300'
                        }`}
                      >
                        •
                      </span>
                      <span>Estimated {formatMoneyUsd(s.estimatedCostUsd)}</span>
                    </div>
                  </div>
                  <div className="transition-transform duration-300">
                    <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                  </div>
                </div>
                <div className="mt-4 transition-opacity duration-300">
                  <ShipmentTimeline status={s.status} darkMode={selected?.id === s.id} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Shipment details</CardTitle>
              {selected ? <Badge tone={statusTone(selected.status)}>{selected.status}</Badge> : null}
            </CardHeader>
            <CardBody>
              {!selected ? (
                <div className="text-sm text-slate-600">Select a shipment to view details.</div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-600">Products</div>
                    <div className="mt-2 space-y-3">
                      {selected.products.map(p => (
                        <div key={p.id} className="flex items-start gap-3">
                          {p.imageUrl && (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-16 w-16 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                            <div className="text-sm text-slate-600 mt-1">
                              Qty {p.quantity} • {p.weightKg}kg • {p.category}
                              {p.packagingType && ` • ${p.packagingType}`}
                              {p.cbm && ` • ${p.cbm.toFixed(4)} m³`}
                            </div>
                            {(p.lengthCm || p.widthCm || p.heightCm) && (
                              <div className="text-xs text-slate-500 mt-1">
                                Dimensions: {p.lengthCm || '-'} × {p.widthCm || '-'} × {p.heightCm || '-'} cm
                              </div>
                            )}
                            {(p.isFragile || p.isHazardous) && (
                              <div className="flex gap-2 mt-1">
                                {p.isFragile && (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                    Fragile
                                  </span>
                                )}
                                {p.isHazardous && (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                    Hazardous
                                  </span>
                                )}
                              </div>
                            )}
                            {p.specialInstructions && (
                              <div className="text-xs text-slate-600 mt-1 italic">
                                {p.specialInstructions}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selected.notes ? (
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Notes to warehouse</div>
                      <div className="mt-1 text-sm text-slate-700">{selected.notes}</div>
                    </div>
                  ) : null}

                  {selected.status === 'Draft' ? (
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setEditingShipment(selected.id)} className="flex-1">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button onClick={() => submitShipment(selected.id)} className="flex-1">
                        <Send className="h-4 w-4" />
                        Submit
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">Tracking is active. You'll receive real-time updates here.</div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          <div className="mt-4 hidden lg:block">
            <NotificationPanel role="client" />
          </div>
        </div>
      </div>

      <CreateShipmentModal
        open={open || editingShipment !== null}
        onClose={() => {
          setOpen(false)
          setEditingShipment(null)
        }}
        shipment={editingShipment ? shipments.find(s => s.id === editingShipment) : undefined}
        onSubmit={(data) => {
          if (editingShipment) {
            // Update existing shipment
            updateShipment(editingShipment, {
              notes: data.notes,
              products: data.products.map(p => ({
                name: p.name.trim(),
                quantity: p.quantity,
                weightKg: p.weightKg,
                category: p.category === 'Other' && p.customCategory ? p.customCategory.trim() : p.category,
                imageUrl: p.imageUrl,
                packagingType: p.packagingType,
                cbm: p.cbm,
                lengthCm: p.lengthCm,
                widthCm: p.widthCm,
                heightCm: p.heightCm,
                isFragile: p.isFragile,
                isHazardous: p.isHazardous,
                specialInstructions: p.specialInstructions,
              })),
            })
            setEditingShipment(null)
          } else {
            // Create new shipment
            const created = createShipment({
              clientName: 'Acme Retail',
              warehouseName: 'Warehouse A',
              notes: data.notes,
              products: data.products.map(p => ({
                name: p.name.trim(),
                quantity: p.quantity,
                weightKg: p.weightKg,
                category: p.category === 'Other' && p.customCategory ? p.customCategory.trim() : p.category,
                imageUrl: p.imageUrl,
                packagingType: p.packagingType,
                cbm: p.cbm,
                lengthCm: p.lengthCm,
                widthCm: p.widthCm,
                heightCm: p.heightCm,
                isFragile: p.isFragile,
                isHazardous: p.isHazardous,
                specialInstructions: p.specialInstructions,
              })),
            })
            setSelectedId(created.id)
          }
          setOpen(false)
        }}
      />
    </div>
  )
}

