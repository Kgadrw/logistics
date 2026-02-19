import * as React from 'react'
import { Edit, PackagePlus, Send, Truck, Search, Filter, Package, TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { ShipmentTimeline } from '../../components/Timeline'
import { NotificationPanel } from '../../components/NotificationPanel'
import { ImageViewer } from '../../components/ImageViewer'
import { formatMoneyUsd } from '../../lib/format'
import { useClientAPI } from '../../lib/useAPI'
import { useAuth } from '../../lib/authContext'
import { clientAPI } from '../../lib/api'
import { CreateShipmentModal } from './CreateShipmentModal'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

export function ClientShipmentsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { shipments, createShipment, updateShipment, submitShipment, loading, refresh } = useClientAPI(user?.id)
  const clientShipments = React.useMemo(() => shipments, [shipments])
  const [markingDelivered, setMarkingDelivered] = React.useState<string | null>(null)

  const [selectedId, setSelectedId] = React.useState<string | null>(clientShipments[0]?.id ?? null)
  const selected = clientShipments.find(s => s.id === selectedId) ?? clientShipments[0]

  React.useEffect(() => {
    if (!selectedId && clientShipments[0]?.id) setSelectedId(clientShipments[0].id)
  }, [clientShipments, selectedId])

  const [open, setOpen] = React.useState(false)
  const [editingShipment, setEditingShipment] = React.useState<string | null>(null)
  const [viewingImage, setViewingImage] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)

  const stats = React.useMemo(() => {
    const total = clientShipments.length
    const active = clientShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Draft').length
    const delivered = clientShipments.filter(s => s.status === 'Delivered').length
    const totalSpent = clientShipments.reduce((sum, s) => sum + (s.estimatedCostUsd || 0), 0)
    return { total, active, delivered, totalSpent }
  }, [clientShipments])

  // Filter shipments based on search and status
  const filteredShipments = React.useMemo(() => {
    let filtered = clientShipments

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s => 
        s.id.toLowerCase().includes(query) ||
        s.warehouseName?.toLowerCase().includes(query) ||
        s.products.some((p: any) => p.name.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    return filtered
  }, [clientShipments, searchQuery, statusFilter])

  const statusOptions = React.useMemo(() => {
    const statuses = new Set(clientShipments.map((s: any) => s.status))
    return Array.from(statuses).sort()
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

      {/* Quick Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
            <div className="text-xs font-semibold text-slate-600">Total Shipments</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.total}</div>
              </div>
              <Package className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
            <div className="text-xs font-semibold text-slate-600">Active Shipments</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.active}</div>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
            <div className="text-xs font-semibold text-slate-600">Delivered</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.delivered}</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-purple-700">Total Spent</div>
                <div className="mt-1 text-2xl font-semibold text-purple-900">${stats.totalSpent.toLocaleString()}</div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search shipments by ID, warehouse, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={statusFilter === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter(null)}
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-1" />
            All
          </Button>
          {statusOptions.map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              className="whitespace-nowrap"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 order-2 lg:order-1">
          {filteredShipments.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <div className="text-sm font-semibold text-slate-900 mb-1">
                  {searchQuery || statusFilter ? 'No shipments match your filters' : 'No shipments yet'}
                </div>
                <div className="text-sm text-slate-600 mb-4">
                  {searchQuery || statusFilter 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first shipment to get started'}
                </div>
                {!searchQuery && !statusFilter && (
                  <Button onClick={() => setOpen(true)}>
                    <PackagePlus className="h-4 w-4 mr-2" />
                    Create New Shipment
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
          <div className="grid gap-3">
              {filteredShipments.map(s => (
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
          )}
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
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
                              className="h-16 w-16 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => p.imageUrl && setViewingImage(p.imageUrl)}
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

                  {/* Warehouse Updates */}
                  {(selected.warehouseRemarks || (selected.receivedProductImages && selected.receivedProductImages.length > 0)) && (
                    <div className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-200 border border-blue-200">
                      <div className="text-xs font-semibold text-blue-900 mb-2">Warehouse Updates</div>
                      {selected.warehouseRemarks && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-blue-700 mb-1">Message from Warehouse</div>
                          <div className="text-sm text-blue-900">{selected.warehouseRemarks}</div>
                        </div>
                      )}
                      {selected.receivedProductImages && selected.receivedProductImages.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-blue-700 mb-2">Received Product Images</div>
                          <div className="grid grid-cols-2 gap-2">
                            {selected.receivedProductImages.map((imageUrl: string, index: number) => (
                              <div 
                                key={index} 
                                className="relative bg-blue-50 rounded-lg border border-blue-300 p-1 flex items-center justify-center min-h-[100px] cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => setViewingImage(imageUrl)}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Received product ${index + 1}`}
                                  className="max-w-full max-h-[150px] rounded-lg object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selected.status === 'Draft' ? (
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setEditingShipment(selected.id)} className="flex-1">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button onClick={async () => {
                        try {
                          await submitShipment(selected.id)
                          showToast('Shipment submitted successfully', 'success')
                        } catch (error: any) {
                          showToast(error.message || 'Failed to submit shipment', 'error')
                        }
                      }} className="flex-1">
                        <Send className="h-4 w-4" />
                        Submit
                      </Button>
                    </div>
                  ) : selected.status === 'In Transit' ? (
                    <Button
                      onClick={async () => {
                        if (!selected.id) return
                        try {
                          setMarkingDelivered(selected.id)
                          await clientAPI.markDelivered(selected.id)
                          await refresh()
                          showToast('Shipment marked as delivered', 'success')
                        } catch (error: any) {
                          showToast(error.message || 'Failed to mark as delivered', 'error')
                        } finally {
                          setMarkingDelivered(null)
                        }
                      }}
                      disabled={markingDelivered === selected.id}
                      className="w-full"
                    >
                      {markingDelivered === selected.id ? 'Marking...' : 'Mark as Delivered'}
                    </Button>
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
        onSubmit={async (data) => {
          try {
            if (editingShipment) {
              // Update existing shipment
              await updateShipment(editingShipment, {
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
              const created = await createShipment({
                clientName: user?.name || 'Client',
                warehouseName: data.warehouseName || 'Warehouse A',
                warehouseId: data.warehouseId || null,
                clientId: user?.id || '',
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
              if (created) setSelectedId(created.id)
            }
            setOpen(false)
          } catch (error: any) {
            showToast(error.message || 'Failed to save shipment', 'error')
          }
        }}
      />
      
      <ImageViewer 
        imageUrl={viewingImage}
        open={!!viewingImage}
        onClose={() => setViewingImage(null)}
      />
    </div>
  )
}

