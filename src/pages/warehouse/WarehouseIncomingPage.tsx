import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { Input, Textarea } from '../../components/ui/Input'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { ImageViewer } from '../../components/ImageViewer'
import { PDFViewer } from '../../components/PDFViewer'
import { useWarehouseAPI, useNotificationsAPI } from '../../lib/useAPI'
import { warehouseAPI, uploadAPI } from '../../lib/api'
import { useAuth } from '../../lib/authContext'
import { formatDateTime } from '../../lib/format'
import { Bell, ArrowRight, Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'

export function WarehouseIncomingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { incoming, refresh, loading: loadingShipments } = useWarehouseAPI(user?.id)
  const { notifications, loading: loadingNotifications } = useNotificationsAPI('warehouse')


  const [selectedId, setSelectedId] = React.useState<string | null>(incoming[0]?.id ?? null)
  const selected = incoming.find(s => s.id === selectedId) ?? incoming[0]

  const [remarks, setRemarks] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [receivedImages, setReceivedImages] = React.useState<string[]>([])
  const [uploadingImages, setUploadingImages] = React.useState(false)
  const [viewingImage, setViewingImage] = React.useState<string | null>(null)
  const [deliveryNote, setDeliveryNote] = React.useState<string | null>(null)
  const [deliveryNoteFile, setDeliveryNoteFile] = React.useState<string | null>(null)
  const [uploadingDeliveryNote, setUploadingDeliveryNote] = React.useState(false)
  const [viewingDeliveryNote, setViewingDeliveryNote] = React.useState<string | null>(null)
  const [consumerNumber, setConsumerNumber] = React.useState('')

  // Filter shipment-related notifications for incoming shipments
  const incomingNotifications = React.useMemo(() => {
    return notifications
      .filter(n => {
        // Show notifications for shipments that are in the incoming list
        if (!n.shipmentId) return false
        return incoming.some(s => s.id === n.shipmentId)
      })
      .sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime())
      .slice(0, 5)
  }, [notifications, incoming])

  React.useEffect(() => {
    if (selected?.id) {
      setRemarks(selected.warehouseRemarks ?? '')
      setReceivedImages(selected.receivedProductImages || [])
      setConsumerNumber(selected.consumerNumber ?? '')
      setDeliveryNote(selected.deliveryNote ?? '')
      setDeliveryNoteFile(selected.deliveryNote && selected.deliveryNote.startsWith('http') ? selected.deliveryNote : null)
    }
  }, [selected?.id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'warning')
      return
    }

    try {
      setUploadingImages(true)
      const imageUrl = await uploadAPI.uploadImage(file, 'uzalogistics/received')
      setReceivedImages(prev => [...prev, imageUrl])
      showToast('Image uploaded successfully', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to upload image. Please try again.', 'error')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setReceivedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeliveryNoteUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'warning')
      return
    }

    try {
      setUploadingDeliveryNote(true)
      const documentUrl = await uploadAPI.uploadDocument(file, 'uzalogistics/delivery-notes')
      setDeliveryNoteFile(documentUrl)
      setDeliveryNote(documentUrl)
      showToast('Delivery note uploaded successfully', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to upload delivery note. Please try again.', 'error')
    } finally {
      setUploadingDeliveryNote(false)
    }
  }

  const removeDeliveryNote = () => {
    setDeliveryNoteFile(null)
    setDeliveryNote('')
  }

  const handleMarkReceived = async (id: string, remarksText?: string) => {
    try {
      setLoading(true)
      await warehouseAPI.receiveShipment(id, {
        receivedProductImages: receivedImages.length > 0 ? receivedImages : undefined,
        deliveryNote: deliveryNote || undefined,
        consumerNumber: consumerNumber.trim() || undefined,
      })
      if (remarksText) {
        await warehouseAPI.addRemarks(id, remarksText)
      }
      await refresh()
      setRemarks('')
      setReceivedImages([])
      setDeliveryNote('')
      setDeliveryNoteFile(null)
      setConsumerNumber('')
      showToast('Shipment marked as delivered', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to mark shipment as delivered', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-3 pt-2 pb-2 sm:px-0 sm:pt-4">
      <div className="mb-3 sm:mb-4">
        <div className="text-xs sm:text-sm font-semibold text-slate-900">Incoming Shipments</div>
        <div className="mt-1 text-xs sm:text-sm text-slate-600">Confirm receipt quickly — clients get notified automatically.</div>
      </div>

      <div className="grid gap-2 sm:gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7 overflow-hidden order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Incoming table</CardTitle>
            <div className="text-xs text-slate-500">
              {loadingShipments ? 'Loading...' : `${incoming.filter(s => s.status === 'Submitted').length} awaiting receipt`}
            </div>
          </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                <THead>
                  <TR>
                    <TH>Client</TH>
                    <TH>Shipment ID</TH>
                    <TH className="hidden sm:table-cell">Products</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Action</TH>
                  </TR>
                </THead>
                <TBody>
                  {loadingShipments
                    ? Array.from({ length: 5 }).map((_, idx) => (
                        <TR key={`skeleton-${idx}`}>
                          <TD className="whitespace-nowrap"><Skeleton className="h-4 w-24" /></TD>
                          <TD className="whitespace-nowrap"><Skeleton className="h-4 w-24" /></TD>
                          <TD className="hidden sm:table-cell min-w-64"><Skeleton className="h-4 w-48" /></TD>
                          <TD><Skeleton className="h-6 w-24 rounded-full" /></TD>
                          <TD className="text-right"><Skeleton className="ml-auto h-8 w-28" /></TD>
                        </TR>
                      ))
                    : null}
                  {incoming.map(s => (
                    <TR
                      key={s.id}
                      className={cn(
                        selected?.id === s.id ? 'bg-slate-50/70' : undefined,
                        'cursor-pointer hover:bg-slate-50 transition-colors'
                      )}
                      onClick={(e) => {
                        // Only navigate if clicking on the row, not the button
                        if ((e.target as HTMLElement).closest('button')) return
                        navigate(`/warehouse/shipment/${s.id}`)
                      }}
                    >
                      <TD className="whitespace-nowrap">
                        <button
                          className="font-semibold text-slate-900 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedId(s.id)
                          }}
                        >
                          {s.clientName || s.client?.name || 'Unknown'}
                        </button>
                      </TD>
                      <TD className="whitespace-nowrap">{s.id}</TD>
                      <TD className="hidden sm:table-cell min-w-64">
                        <div className="text-slate-700">
                          {s.products?.slice(0, 2).map(p => p.name).join(', ') || 'No products'}
                          {s.products && s.products.length > 2 ? ` +${s.products.length - 2} more` : ''}
                        </div>
                      </TD>
                      <TD>
                        <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                      </TD>
                      <TD className="text-right">
                        {s.status === 'Submitted' ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (s.id === selected?.id) {
                                handleMarkReceived(s.id, remarks.trim() ? remarks.trim() : undefined)
                              } else {
                                setSelectedId(s.id)
                              }
                            }}
                            disabled={loading || uploadingImages}
                          >
                            {loading && s.id === selected?.id ? 'Processing...' : 'Mark as Delivered'}
                          </Button>
                        ) : s.status === 'Received' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/warehouse/shipment/${s.id}`)
                            }}
                          >
                            View Details
                          </Button>
                        ) : null}
                      </TD>
                    </TR>
                  ))}
                  {incoming.length === 0 && !loadingShipments ? (
                    <TR>
                      <TD colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                        No incoming shipments right now.
                      </TD>
                    </TR>
                  ) : null}
                </TBody>
              </Table>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5 order-1 lg:order-2">
          <CardHeader>
            <CardTitle>Shipment detail</CardTitle>
            {selected ? <Badge tone={statusTone(selected.status)}>{selected.status}</Badge> : null}
          </CardHeader>
          <CardBody>
            {!selected ? (
              <div className="text-sm text-slate-600">Select a shipment to view details.</div>
            ) : (
              <div className="space-y-4">
                {/* Shipping Status Section */}
                <div className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-200">
                  <div className="text-xs font-semibold text-blue-900 mb-2">Shipping Status</div>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(selected.status)} className="text-sm">
                      {selected.status}
                    </Badge>
                    <div className="text-xs text-blue-700">
                      {selected.status === 'Submitted' && 'Awaiting warehouse receipt confirmation'}
                      {selected.status === 'Received' && 'Shipment received at warehouse'}
                      {selected.status === 'Left Warehouse' && 'Shipment has left the warehouse'}
                      {selected.status === 'In Transit' && 'Shipment is in transit'}
                      {selected.status === 'Delivered' && 'Shipment has been delivered'}
                    </div>
                  </div>
                  {selected.updatedAtIso && (
                    <div className="text-xs text-blue-600 mt-2">
                      Last updated: {formatDateTime(selected.updatedAtIso)}
                    </div>
                  )}
                </div>

                {/* Client Information Section */}
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600 mb-3">Client Information</div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-slate-700">Client:</span>{' '}
                      <span className="text-slate-600">{selected.clientName || selected.client?.name || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Shipment ID:</span>{' '}
                      <span className="text-slate-600 font-mono">{selected.id}</span>
                    </div>
                    {selected.createdAtIso && (
                      <div>
                        <span className="font-semibold text-slate-700">Created:</span>{' '}
                        <span className="text-slate-600">{formatDateTime(selected.createdAtIso)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Product Breakdown */}
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600 mb-3">Full Product Breakdown (from Client)</div>
                  <div className="mt-2 space-y-4">
                    {selected.products?.map(p => (
                      <div key={p.id} className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex gap-3">
                          {p.imageUrl && (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-16 w-16 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setViewingImage(p.imageUrl)}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                            <div className="mt-1 space-y-1 text-xs text-slate-600">
                              <div>Quantity: {p.quantity} • Weight: {p.weightKg} kg</div>
                              <div>Category: {p.category}</div>
                              {p.packagingType && <div>Packaging: {p.packagingType}</div>}
                              {(p.lengthCm || p.widthCm || p.heightCm) && (
                        <div>
                                  Dimensions: {p.lengthCm || '—'} × {p.widthCm || '—'} × {p.heightCm || '—'} cm
                                </div>
                              )}
                              {p.cbm && <div>CBM: {p.cbm.toFixed(3)} m³</div>}
                              {(p.isFragile || p.isHazardous) && (
                                <div className="flex gap-2 mt-1">
                                  {p.isFragile && <Badge tone="orange" className="text-xs">Fragile</Badge>}
                                  {p.isHazardous && <Badge tone="red" className="text-xs">Hazardous</Badge>}
                                </div>
                              )}
                              {p.specialInstructions && (
                                <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200">
                                  <div className="text-xs font-semibold text-amber-900">Special Instructions:</div>
                                  <div className="text-xs text-amber-800 mt-0.5">{p.specialInstructions}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || <div className="text-sm text-slate-600">No products</div>}
                  </div>
                </div>

                {/* Client Notes */}
                {selected.notes ? (
                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Client Notes</div>
                    <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{selected.notes}</div>
                  </div>
                ) : null}

                <div>
                  <div className="text-xs font-semibold text-slate-600">Warehouse remarks</div>
                  <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Condition, packaging, discrepancies..." />
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600">Consumer Number</div>
                  <Input value={consumerNumber} onChange={e => setConsumerNumber(e.target.value)} placeholder="Enter consumer number" />
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Delivery Note *</div>
                  {deliveryNoteFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setViewingDeliveryNote(deliveryNoteFile)}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          View Delivery Note
                        </button>
                        <button
                          type="button"
                          onClick={removeDeliveryNote}
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
                        accept=".pdf,application/pdf,.jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleDeliveryNoteUpload}
                        disabled={uploadingDeliveryNote}
                      />
                      {uploadingDeliveryNote ? (
                        <div className="text-sm text-slate-600">Uploading document...</div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-slate-400 mb-2" />
                          <div className="text-sm font-medium text-slate-600">Click to upload Delivery Note</div>
                          <div className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, GIF, WEBP (Max 10MB)</div>
                        </>
                      )}
                    </label>
                  )}
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

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button variant="secondary" onClick={() => {
                    setRemarks('')
                    setReceivedImages([])
                    setDeliveryNote('')
                    setDeliveryNoteFile(null)
                    setConsumerNumber('')
                  }}>
                    Clear
                  </Button>
                  <Button 
                    onClick={() => handleMarkReceived(selected.id, remarks.trim() ? remarks.trim() : undefined)}
                    disabled={loading || uploadingImages || uploadingDeliveryNote || !deliveryNote}
                  >
                    {loading ? 'Processing...' : 'Confirm Delivered'}
                  </Button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-600">Auto-notification</div>
                  <div className="mt-1 text-sm text-slate-600">
                    On delivery confirmation, the client and admin are notified: "Your shipment #{selected.id} has been delivered to {selected.warehouseName || 'warehouse'}".
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Shipment Notifications Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <CardTitle>Shipment Notifications</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/warehouse/notifications')}
              className="text-xs"
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="text-xs text-slate-500">Recent updates about incoming shipments</div>
        </CardHeader>
        <CardBody>
          {loadingNotifications ? (
            <div className="text-sm text-slate-500 text-center py-4">Loading notifications...</div>
          ) : incomingNotifications.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">No notifications for incoming shipments</div>
          ) : (
            <div className="space-y-3">
              {incomingNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors',
                    notification.unreadBy?.warehouse ? 'ring-2 ring-blue-100 bg-blue-50/50' : 'bg-white'
                  )}
                  onClick={() => {
                    if (notification.shipmentId) {
                      navigate(`/warehouse/shipment/${notification.shipmentId}`)
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm text-slate-900">{notification.title}</div>
                      {notification.unreadBy?.warehouse && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{notification.message}</div>
                    {notification.shipmentId && (
                      <div className="text-xs text-slate-500 mt-1">Shipment: {notification.shipmentId}</div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">
                    {formatDateTime(notification.createdAtIso)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
      
      <ImageViewer 
        imageUrl={viewingImage}
        open={!!viewingImage}
        onClose={() => setViewingImage(null)}
      />
      
      <PDFViewer 
        pdfUrl={viewingDeliveryNote}
        open={!!viewingDeliveryNote}
        onClose={() => setViewingDeliveryNote(null)}
        title="Delivery Note"
      />
    </div>
  )
}

