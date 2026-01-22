import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { ShipmentTimeline } from '../../components/Timeline'
import { useStore } from '../../lib/store'
import { formatDateTime, formatMoneyUsd } from '../../lib/format'

export function AdminShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { shipments } = useStore()

  const shipment = React.useMemo(() => {
    return shipments.find(s => s.id === id) ?? null
  }, [shipments, id])

  if (!shipment) {
    return (
      <div className="pt-4">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardBody>
            <div className="text-center py-8 text-slate-600">Shipment not found.</div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{shipment.id}</h1>
            <div className="mt-1 text-sm text-slate-600">
              {shipment.clientName} • {shipment.warehouseName}
            </div>
          </div>
          <Badge tone={statusTone(shipment.status)} className="text-sm">
            {shipment.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Timeline</CardTitle>
            </CardHeader>
            <CardBody>
              <ShipmentTimeline status={shipment.status} />
            </CardBody>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <div className="text-xs text-slate-500">{shipment.products.length} items</div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {shipment.products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex gap-4">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-24 w-24 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-lg font-semibold text-slate-900">{product.name}</div>
                            <div className="mt-1 space-y-1 text-sm text-slate-600">
                              <div>Quantity: {product.quantity}</div>
                              <div>Category: {product.category}</div>
                              <div>Weight: {product.weightKg} kg</div>
                              {product.packagingType && (
                                <div>Packaging: {product.packagingType}</div>
                              )}
                              {product.cbm && (
                                <div>CBM: {product.cbm.toFixed(3)} m³</div>
                              )}
                              {(product.lengthCm || product.widthCm || product.heightCm) && (
                                <div>
                                  Dimensions: {product.lengthCm || '—'} × {product.widthCm || '—'} ×{' '}
                                  {product.heightCm || '—'} cm
                                </div>
                              )}
                              {(product.isFragile || product.isHazardous) && (
                                <div className="flex gap-2 mt-2">
                                  {product.isFragile && (
                                    <Badge tone="orange" className="text-xs">Fragile</Badge>
                                  )}
                                  {product.isHazardous && (
                                    <Badge tone="red" className="text-xs">Hazardous</Badge>
                                  )}
                                </div>
                              )}
                              {product.specialInstructions && (
                                <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                                  <div className="text-xs font-semibold text-amber-900">Special Instructions:</div>
                                  <div className="text-xs text-amber-800 mt-1">{product.specialInstructions}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Notes */}
          {(shipment.notes || shipment.warehouseRemarks) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes & Remarks</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {shipment.notes && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">Client Notes</div>
                      <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        {shipment.notes}
                      </div>
                    </div>
                  )}
                  {shipment.warehouseRemarks && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">Warehouse Remarks</div>
                      <div className="text-sm text-slate-700 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        {shipment.warehouseRemarks}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Information</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600">Shipment ID</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{shipment.id}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Client</div>
                  <div className="mt-1 text-sm text-slate-700">{shipment.clientName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Warehouse</div>
                  <div className="mt-1 text-sm text-slate-700">{shipment.warehouseName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Status</div>
                  <div className="mt-1">
                    <Badge tone={statusTone(shipment.status)}>{shipment.status}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Estimated Cost</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {formatMoneyUsd(shipment.estimatedCostUsd)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Created</div>
                  <div className="mt-1 text-sm text-slate-700">{formatDateTime(shipment.createdAtIso)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Last Updated</div>
                  <div className="mt-1 text-sm text-slate-700">{formatDateTime(shipment.updatedAtIso)}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Dispatch Information */}
          {shipment.dispatch && (
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Information</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Transport Method</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{shipment.dispatch.method}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Transport ID</div>
                    <div className="mt-1 text-sm text-slate-700">{shipment.dispatch.transportId}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Departure Date</div>
                    <div className="mt-1 text-sm text-slate-700">
                      {formatDateTime(shipment.dispatch.departureDateIso)}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Products</span>
                  <span className="text-sm font-semibold text-slate-900">{shipment.products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Weight</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {shipment.products.reduce((sum, p) => sum + p.weightKg * p.quantity, 0).toFixed(2)} kg
                  </span>
                </div>
                {shipment.products.some(p => p.cbm) && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total CBM</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {shipment.products
                        .reduce((sum, p) => sum + (p.cbm || 0) * p.quantity, 0)
                        .toFixed(3)}{' '}
                      m³
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Total Cost</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatMoneyUsd(shipment.estimatedCostUsd)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
