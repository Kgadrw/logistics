import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Input'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { ImageViewer } from '../../components/ImageViewer'
import { useWarehouseAPI, useNotificationsAPI } from '../../lib/useAPI'
import { warehouseAPI, uploadAPI } from '../../lib/api'
import { useAuth } from '../../lib/authContext'
import { formatDateTime } from '../../lib/format'
import { Bell, ArrowRight, Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

export function WarehouseIncomingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { incoming, refresh, loading: loadingShipments } = useWarehouseAPI(user?.id)
  const { notifications, loading: loadingNotifications } = useNotificationsAPI('warehouse')

  // Debug: Log incoming shipments
  React.useEffect(() => {
    console.log(`[WarehouseIncomingPage] User: ${user?.id}, Incoming shipments: ${incoming.length}`, incoming)
  }, [user?.id, incoming])

  const [selectedId, setSelectedId] = React.useState<string | null>(incoming[0]?.id ?? null)
  const selected = incoming.find(s => s.id === selectedId) ?? incoming[0]

  const [remarks, setRemarks] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [receivedImages, setReceivedImages] = React.useState<string[]>([])
  const [uploadingImages, setUploadingImages] = React.useState(false)
  const [viewingImage, setViewingImage] = React.useState<string | null>(null)
  const [draftBL, setDraftBL] = React.useState('')
  const [draftBLFile, setDraftBLFile] = React.useState<string | null>(null)
  const [uploadingDraftBL, setUploadingDraftBL] = React.useState(false)
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
      setDraftBL(selected.draftBL ?? '')
      setDraftBLFile(selected.draftBL && selected.draftBL.startsWith('http') ? selected.draftBL : null)
      setConsumerNumber(selected.consumerNumber ?? '')
    }
  }, [selected?.id])

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

  const handleMarkReceived = async (id: string, remarksText?: string) => {
    try {
      setLoading(true)
      await warehouseAPI.receiveShipment(id, {
        receivedProductImages: receivedImages.length > 0 ? receivedImages : undefined,
        draftBL: draftBL.trim() || undefined,
        consumerNumber: consumerNumber.trim() || undefined,
      })
      if (remarksText) {
        await warehouseAPI.addRemarks(id, remarksText)
      }
      await refresh()
      setRemarks('')
      setReceivedImages([])
      setDraftBL('')
      setDraftBLFile(null)
      setConsumerNumber('')
    } catch (err: any) {
      console.error('Failed to mark shipment as received:', err)
      alert(err.message || 'Failed to mark shipment as received')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Incoming Shipments</div>
        <div className="mt-1 text-sm text-slate-600">Confirm receipt quickly — clients get notified automatically.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
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
                    <TH>Products</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Action</TH>
                  </TR>
                </THead>
                <TBody>
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
                      <TD className="min-w-64">
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
                            {loading && s.id === selected?.id ? 'Processing...' : 'Mark as Received'}
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
                  {incoming.length === 0 ? (
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
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600">Full product breakdown</div>
                  <div className="mt-2 space-y-2">
                    {selected.products?.map(p => (
                      <div key={p.id} className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                          <div className="text-sm text-slate-600">
                            Qty {p.quantity} • {p.weightKg}kg • {p.category}
                          </div>
                        </div>
                      </div>
                    )) || <div className="text-sm text-slate-600">No products</div>}
                  </div>
                </div>

                {selected.notes ? (
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Client notes</div>
                    <div className="mt-1 text-sm text-slate-700">{selected.notes}</div>
                  </div>
                ) : null}

                <div>
                  <div className="text-xs font-semibold text-slate-600">Warehouse remarks</div>
                  <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Condition, packaging, discrepancies..." />
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Draft BL (Bill of Lading)</div>
                  {draftBLFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <a
                          href={draftBLFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          View Draft BL Document
                        </a>
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
                  <div className="text-xs font-semibold text-slate-600">Consumer Number</div>
                  <Input value={consumerNumber} onChange={e => setConsumerNumber(e.target.value)} placeholder="Enter consumer number" />
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
                    setDraftBL('')
                    setDraftBLFile(null)
                    setConsumerNumber('')
                  }}>
                    Clear
                  </Button>
                  <Button 
                    onClick={() => handleMarkReceived(selected.id, remarks.trim() ? remarks.trim() : undefined)}
                    disabled={loading || uploadingImages || uploadingDraftBL}
                  >
                    {loading ? 'Processing...' : 'Confirm Received'}
                  </Button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-600">Auto-notification</div>
                  <div className="mt-1 text-sm text-slate-600">
                    On receipt confirmation, the client and admin are notified: "Your shipment #{selected.id} has been received by {selected.warehouseName || 'warehouse'}".
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
    </div>
  )
}

