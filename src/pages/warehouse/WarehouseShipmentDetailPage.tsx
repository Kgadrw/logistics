import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Input'
import { ShipmentTimeline } from '../../components/Timeline'
import { ImageViewer } from '../../components/ImageViewer'
import { PDFViewer } from '../../components/PDFViewer'
import { warehouseAPI, uploadAPI } from '../../lib/api'
import { formatDateTime, formatMoneyUsd } from '../../lib/format'

export function WarehouseShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [shipment, setShipment] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [markingInTransit, setMarkingInTransit] = React.useState(false)
  const [markingReceived, setMarkingReceived] = React.useState(false)
  const [markingLeftWarehouse, setMarkingLeftWarehouse] = React.useState(false)
  const [remarks, setRemarks] = React.useState('')
  const [receivedImages, setReceivedImages] = React.useState<string[]>([])
  const [uploadingImages, setUploadingImages] = React.useState(false)
  const [viewingImage, setViewingImage] = React.useState<string | null>(null)
  const [draftBL, setDraftBL] = React.useState('')
  const [draftBLFile, setDraftBLFile] = React.useState<string | null>(null)
  const [uploadingDraftBL, setUploadingDraftBL] = React.useState(false)
  const [viewingDraftBL, setViewingDraftBL] = React.useState<string | null>(null)
  const [consumerNumber, setConsumerNumber] = React.useState('')

  React.useEffect(() => {
    const fetchShipment = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await warehouseAPI.getShipment(id)
        setShipment(data)
        setRemarks(data.warehouseRemarks || '')
        setReceivedImages(data.receivedProductImages || [])
        setDraftBL(data.draftBL || '')
        setDraftBLFile(data.draftBL && data.draftBL.startsWith('http') ? data.draftBL : null)
        setConsumerNumber(data.consumerNumber || '')
      } catch (err: any) {
        setError(err.message || 'Failed to load shipment')
        console.error('Failed to fetch shipment:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchShipment()
  }, [id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingImages(true)
      const imageUrl = await uploadAPI.uploadImage(file, 'uzalogistics/received')
      setReceivedImages(prev => [...prev, imageUrl])
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      alert(error.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setReceivedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleDraftBLUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    try {
      setUploadingDraftBL(true)
      const documentUrl = await uploadAPI.uploadDocument(file, 'uzalogistics/draft-bl')
      setDraftBLFile(documentUrl)
      setDraftBL(documentUrl)
    } catch (error: any) {
      console.error('Failed to upload draft BL:', error)
      alert(error.message || 'Failed to upload draft BL. Please try again.')
    } finally {
      setUploadingDraftBL(false)
    }
  }

  const removeDraftBL = () => {
    setDraftBLFile(null)
    setDraftBL('')
  }

  const handleMarkReceived = async () => {
    if (!id) return
    try {
      setMarkingReceived(true)
      await warehouseAPI.receiveShipment(id, {
        receivedProductImages: receivedImages.length > 0 ? receivedImages : undefined,
        draftBL: draftBL.trim() || undefined,
        consumerNumber: consumerNumber.trim() || undefined,
      })
      if (remarks.trim()) {
        await warehouseAPI.addRemarks(id, remarks.trim())
      }
      // Refresh shipment data
      const data = await warehouseAPI.getShipment(id)
      setShipment(data)
      setRemarks(data.warehouseRemarks || '')
      setReceivedImages(data.receivedProductImages || [])
      setDraftBL(data.draftBL || '')
      setDraftBLFile(data.draftBL && data.draftBL.startsWith('http') ? data.draftBL : null)
      setConsumerNumber(data.consumerNumber || '')
    } catch (err: any) {
      console.error('Failed to mark as received:', err)
      alert(err.message || 'Failed to mark as received')
    } finally {
      setMarkingReceived(false)
    }
  }

  const handleMarkLeftWarehouse = async () => {
    if (!id) return
    try {
      setMarkingLeftWarehouse(true)
      await warehouseAPI.updateShipmentStatus(id, 'Left Warehouse')
      // Refresh shipment data
      const data = await warehouseAPI.getShipment(id)
      setShipment(data)
    } catch (err: any) {
      console.error('Failed to mark as left warehouse:', err)
      alert(err.message || 'Failed to mark as left warehouse')
    } finally {
      setMarkingLeftWarehouse(false)
    }
  }

  const handleMarkInTransit = async () => {
    if (!id) return
    try {
      setMarkingInTransit(true)
      await warehouseAPI.markInTransit(id)
      // Refresh shipment data
      const data = await warehouseAPI.getShipment(id)
      setShipment(data)
    } catch (err: any) {
      console.error('Failed to mark as in transit:', err)
      alert(err.message || 'Failed to mark as in transit')
    } finally {
      setMarkingInTransit(false)
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
              {shipment.clientName || shipment.client?.name || 'Unknown'} • {shipment.warehouseName || shipment.warehouse?.name || 'Unknown'}
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
              {shipment.status === 'Submitted' && (
                <ShipmentTimeline 
                  status={shipment.status}
                  onAction={handleMarkReceived}
                  actionLabel="Confirm Received"
                  actionDisabled={markingReceived || uploadingImages}
                  actionLoading={markingReceived}
                />
              )}
              {shipment.status === 'Received' && (
                <ShipmentTimeline 
                  status={shipment.status}
                  onAction={handleMarkLeftWarehouse}
                  actionLabel="Mark as Left Warehouse"
                  actionDisabled={markingLeftWarehouse}
                  actionLoading={markingLeftWarehouse}
                />
              )}
              {shipment.status === 'Left Warehouse' && (
                <ShipmentTimeline 
                  status={shipment.status}
                  onAction={handleMarkInTransit}
                  actionLabel="Mark as In Transit"
                  actionDisabled={markingInTransit}
                  actionLoading={markingInTransit}
                />
              )}
              {(shipment.status === 'In Transit' || shipment.status === 'Delivered' || shipment.status === 'Draft') && (
                <ShipmentTimeline status={shipment.status} />
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
                {shipment.products?.map((product: any, index: number) => (
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

          {/* Received Product Images */}
          {shipment.receivedProductImages && shipment.receivedProductImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Received Product Images</CardTitle>
              </CardHeader>
              <CardBody>
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
              </CardBody>
            </Card>
          )}

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
                  {shipment.draftBL && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">Draft BL (Bill of Lading)</div>
                      {shipment.draftBL.startsWith('http') ? (
                        <button
                          type="button"
                          onClick={() => setViewingDraftBL(shipment.draftBL)}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors w-full text-left"
                        >
                          <ImageIcon className="h-4 w-4" />
                          View Draft BL Document
                        </button>
                      ) : (
                        <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          {shipment.draftBL}
                        </div>
                      )}
                    </div>
                  )}
                  {shipment.consumerNumber && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">Consumer Number</div>
                      <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        {shipment.consumerNumber}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Warehouse Actions */}
          {shipment.status === 'Submitted' && (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Received</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Warehouse Remarks (Optional)</div>
                    <Textarea
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      placeholder="Condition, packaging, discrepancies..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Draft BL (Bill of Lading)</div>
                    {draftBLFile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => setViewingDraftBL(draftBLFile)}
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                          >
                            <ImageIcon className="h-4 w-4" />
                            View Draft BL Document
                          </button>
                          <button
                            type="button"
                            onClick={removeDraftBL}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                          className="hidden"
                          onChange={handleDraftBLUpload}
                          disabled={uploadingDraftBL}
                        />
                        {uploadingDraftBL ? (
                          <div className="text-sm text-slate-600">Uploading document...</div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-slate-400 mb-2" />
                            <div className="text-sm font-medium text-slate-600">Click to upload Draft BL</div>
                            <div className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 10MB)</div>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Consumer Number</div>
                    <Input
                      value={consumerNumber}
                      onChange={e => setConsumerNumber(e.target.value)}
                      placeholder="Enter consumer number"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Received Product Images (Optional)</div>
                    <div className="space-y-2">
                      {receivedImages.map((imageUrl, index) => (
                        <div key={index} className="relative bg-slate-50 rounded-lg border border-slate-200 p-2 flex items-center justify-center min-h-[150px]">
                          <img
                            src={imageUrl}
                            alt={`Received product ${index + 1}`}
                            className="max-w-full max-h-[200px] rounded-lg object-contain cursor-pointer"
                            onClick={() => setViewingImage(imageUrl)}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index)
                            }}
                            className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors shadow-md z-10"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {uploadingImages ? (
                        <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                          <div className="text-sm text-slate-600">Uploading image...</div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <Upload className="h-6 w-6 text-slate-400 mb-2" />
                          <div className="text-sm font-medium text-slate-600">Click to upload received product image</div>
                          <div className="text-xs text-slate-500 mt-1">Max 5MB, JPG/PNG/GIF/WEBP</div>
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 text-center">
                    Use the button in the timeline above to confirm receipt
                  </div>
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
                  <div className="text-xs font-semibold text-slate-600">Client</div>
                  <div className="mt-1 text-sm text-slate-700">{shipment.clientName || shipment.client?.name || 'Unknown'}</div>
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
