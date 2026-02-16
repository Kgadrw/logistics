import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { ShipmentTimeline } from '../../components/Timeline'
import { ImageViewer } from '../../components/ImageViewer'
import { PDFViewer } from '../../components/PDFViewer'
import { clientAPI } from '../../lib/api'
import { formatDateTime, formatMoneyUsd } from '../../lib/format'

export function ClientShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [shipment, setShipment] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [markingDelivered, setMarkingDelivered] = React.useState(false)
  const [viewingImage, setViewingImage] = React.useState<string | null>(null)
  const [viewingDraftBL, setViewingDraftBL] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchShipment = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await clientAPI.getShipment(id)
        setShipment(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load shipment')
        console.error('Failed to fetch shipment:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchShipment()
  }, [id])

  const handleMarkDelivered = async () => {
    if (!id) return
    try {
      setMarkingDelivered(true)
      await clientAPI.markDelivered(id)
      // Refresh shipment data
      const data = await clientAPI.getShipment(id)
      setShipment(data)
    } catch (err: any) {
      console.error('Failed to mark as delivered:', err)
      alert(err.message || 'Failed to mark as delivered')
    } finally {
      setMarkingDelivered(false)
    }
  }

  if (loading) {
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
            <div className="text-center py-8 text-slate-600">Loading shipment...</div>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (error || !shipment) {
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
            <div className="text-center py-8 text-slate-600">{error || 'Shipment not found.'}</div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-600 hover:text-slate-900 text-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{shipment.id}</h1>
            <div className="mt-1 text-sm text-slate-600">
              Warehouse: {shipment.warehouseName || shipment.warehouse?.name || 'Unknown'}
            </div>
          </div>
          <Badge tone={statusTone(shipment.status)} className="text-sm">
            {shipment.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Timeline</CardTitle>
            </CardHeader>
            <CardBody>
              <ShipmentTimeline status={shipment.status} />
              {shipment.status === 'In Transit' && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleMarkDelivered}
                    disabled={markingDelivered}
                    className="w-full"
                  >
                    {markingDelivered ? 'Marking...' : 'Mark as Delivered'}
                  </Button>
                  <div className="mt-2 text-xs text-slate-600 text-center">
                    Confirm that you have received the shipment
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <div className="text-xs text-slate-500">{shipment.products?.length || 0} items</div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {shipment.products?.map((product: any) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex gap-4">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-24 w-24 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setViewingImage(product.imageUrl)}
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

          {/* Warehouse Updates */}
          {(shipment.warehouseRemarks || (shipment.receivedProductImages && shipment.receivedProductImages.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Updates</CardTitle>
                <div className="text-xs text-slate-500">Messages and images from the warehouse</div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {shipment.warehouseRemarks && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">Warehouse Message</div>
                      <div className="text-sm text-slate-700 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        {shipment.warehouseRemarks}
                      </div>
                    </div>
                  )}
                  {shipment.receivedProductImages && shipment.receivedProductImages.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">Received Product Images</div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {shipment.receivedProductImages.map((imageUrl: string, index: number) => (
                          <div 
                            key={index} 
                            className="relative bg-slate-50 rounded-lg border border-slate-200 p-2 flex items-center justify-center min-h-[200px] cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => setViewingImage(imageUrl)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Received product ${index + 1}`}
                              className="max-w-full max-h-[400px] rounded-lg object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Client Notes */}
          {shipment.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Your Notes</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  {shipment.notes}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 order-1 lg:order-2">
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
                  <div className="text-xs font-semibold text-slate-600">Warehouse</div>
                  <div className="mt-1 text-sm text-slate-700">{shipment.warehouseName || shipment.warehouse?.name || 'Unknown'}</div>
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
                    {formatMoneyUsd(shipment.estimatedCostUsd || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Created</div>
                  <div className="mt-1 text-sm text-slate-700">{formatDateTime(shipment.createdAtIso || shipment.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">Last Updated</div>
                  <div className="mt-1 text-sm text-slate-700">{formatDateTime(shipment.updatedAtIso || shipment.updatedAt || shipment.createdAtIso || shipment.createdAt)}</div>
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
                  {shipment.dispatch.packagingList && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Packaging List</div>
                      <div className="mt-1 text-sm text-slate-700">{shipment.dispatch.packagingList}</div>
                    </div>
                  )}
                  {shipment.dispatch.packageNumber && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Package Number</div>
                      <div className="mt-1 text-sm text-slate-700">{shipment.dispatch.packageNumber}</div>
                    </div>
                  )}
                  {shipment.dispatch.consigneeNumber && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Consignee Number</div>
                      <div className="mt-1 text-sm text-slate-700">{shipment.dispatch.consigneeNumber}</div>
                    </div>
                  )}
                  {shipment.dispatch.shippingMark && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Shipping Mark</div>
                      <div className="mt-1 text-sm text-slate-700">{shipment.dispatch.shippingMark}</div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Documents */}
          {shipment.draftBL && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {shipment.draftBL.startsWith('http') ? (
                    <button
                      type="button"
                      onClick={() => setViewingDraftBL(shipment.draftBL)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-900">Draft BL (Bill of Lading)</span>
                      </div>
                      <span className="text-xs text-slate-500">View</span>
                    </button>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">Draft BL (Bill of Lading)</div>
                      <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        {shipment.draftBL}
                      </div>
                    </div>
                  )}
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
                  <span className="text-sm font-semibold text-slate-900">{shipment.products?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Weight</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {shipment.products?.reduce((sum: number, p: any) => sum + (p.weightKg || 0) * (p.quantity || 0), 0).toFixed(2) || '0.00'} kg
                  </span>
                </div>
                {shipment.products?.some((p: any) => p.cbm) && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total CBM</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {shipment.products
                        .reduce((sum: number, p: any) => sum + (p.cbm || 0) * (p.quantity || 0), 0)
                        .toFixed(3)}{' '}
                      m³
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Total Cost</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatMoneyUsd(shipment.estimatedCostUsd || 0)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      
      <ImageViewer 
        imageUrl={viewingImage}
        open={!!viewingImage}
        onClose={() => setViewingImage(null)}
      />
      
      <PDFViewer 
        pdfUrl={viewingDraftBL}
        open={!!viewingDraftBL}
        onClose={() => setViewingDraftBL(null)}
        title="Draft BL (Bill of Lading)"
      />
    </div>
  )
}
