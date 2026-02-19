import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X, Image as ImageIcon, Edit, Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Input'
import { ShipmentTimeline } from '../../components/Timeline'
import { ImageViewer } from '../../components/ImageViewer'
import { PDFViewer } from '../../components/PDFViewer'
import { warehouseAPI, uploadAPI } from '../../lib/api'
import { formatDateTime, formatMoneyUsd } from '../../lib/format'
import { useToast } from '../../components/ui/Toast'

export function WarehouseShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
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
  const [isEditing, setIsEditing] = React.useState(false)
  const [reversingStatus, setReversingStatus] = React.useState(false)
  const [savingDetails, setSavingDetails] = React.useState(false)
  const [showReverseConfirm, setShowReverseConfirm] = React.useState<string | null>(null)
  const [packagingList, setPackagingList] = React.useState('')
  const [packageNumber, setPackageNumber] = React.useState('')
  const [consigneeNumber, setConsigneeNumber] = React.useState('')
  const [shippingMark, setShippingMark] = React.useState('UZA Solutions')
  const [clientNotes, setClientNotes] = React.useState('')

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
        setPackagingList(data.dispatch?.packagingList || '')
        setPackageNumber(data.dispatch?.packageNumber || '')
        setConsigneeNumber(data.dispatch?.consigneeNumber || '')
        setShippingMark(data.dispatch?.shippingMark || 'UZA Solutions')
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load shipment'
        setError(errorMessage)
        showToast(errorMessage, 'error')
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

  const handleDraftBLUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'warning')
      return
    }

    try {
      setUploadingDraftBL(true)
      const documentUrl = await uploadAPI.uploadDocument(file, 'uzalogistics/draft-bl')
      setDraftBLFile(documentUrl)
      setDraftBL(documentUrl)
      showToast('Draft BL uploaded successfully', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to upload draft BL. Please try again.', 'error')
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
      showToast('Shipment marked as received', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to mark as received', 'error')
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
      showToast('Shipment marked as left warehouse', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to mark as left warehouse', 'error')
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
      showToast('Shipment marked as in transit', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to mark as in transit', 'error')
    } finally {
      setMarkingInTransit(false)
    }
  }

  const handleReverseStatus = async (newStatus: string) => {
    if (!id) return
    try {
      setReversingStatus(true)
      await warehouseAPI.updateShipmentStatus(id, newStatus)
      // Refresh shipment data
      const data = await warehouseAPI.getShipment(id)
      setShipment(data)
      setShowReverseConfirm(null)
      showToast(`Status reversed to ${newStatus} successfully`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to reverse status', 'error')
    } finally {
      setReversingStatus(false)
    }
  }

  const handleSaveDetails = async () => {
    if (!id) return
    try {
      setSavingDetails(true)
      await warehouseAPI.updateShipmentDetails(id, {
        receivedProductImages: receivedImages.length > 0 ? receivedImages : undefined,
        draftBL: draftBL.trim() || undefined,
        consumerNumber: consumerNumber.trim() || undefined,
        packagingList: packagingList.trim() || undefined,
        packageNumber: packageNumber.trim() || undefined,
        consigneeNumber: consigneeNumber.trim() || undefined,
        shippingMark: shippingMark.trim() || undefined,
        notes: clientNotes.trim() || undefined,
      })
      if (remarks.trim()) {
        await warehouseAPI.addRemarks(id, remarks.trim())
      }
      // Refresh shipment data
      const data = await warehouseAPI.getShipment(id)
      setShipment(data)
      setIsEditing(false)
      showToast('Shipment details updated successfully', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to save details', 'error')
    } finally {
      setSavingDetails(false)
    }
  }

  const getPreviousStatus = (currentStatus: string): string | null => {
    const statusMap: Record<string, string> = {
      'Received': 'Submitted',
      'Left Warehouse': 'Received',
      'In Transit': 'Left Warehouse',
    }
    return statusMap[currentStatus] || null
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

          {/* Status Reversal */}
          {getPreviousStatus(shipment.status) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-orange-600" />
                  Reverse Status
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-orange-900 mb-1">Warning</div>
                        <div className="text-xs text-orange-800">
                          Reversing status will change the shipment from <strong>{shipment.status}</strong> back to <strong>{getPreviousStatus(shipment.status)}</strong>. 
                          This action will clear dispatch information if reversing from "Left Warehouse" or "In Transit".
                        </div>
                      </div>
                    </div>
                  </div>
                  {showReverseConfirm === shipment.status ? (
                    <div className="space-y-3">
                      <div className="text-sm text-slate-700">
                        Are you sure you want to reverse the status from <strong>{shipment.status}</strong> to <strong>{getPreviousStatus(shipment.status)}</strong>?
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReverseStatus(getPreviousStatus(shipment.status)!)}
                          disabled={reversingStatus}
                        >
                          {reversingStatus ? 'Reversing...' : 'Confirm Reverse'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowReverseConfirm(null)}
                          disabled={reversingStatus}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowReverseConfirm(shipment.status)}
                      disabled={reversingStatus}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reverse to {getPreviousStatus(shipment.status)}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Edit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  Shipment Details
                </span>
                {!isEditing ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveDetails}
                      disabled={savingDetails}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingDetails ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        // Reset to original values
                        const data = shipment
                        setReceivedImages(data.receivedProductImages || [])
                        setDraftBL(data.draftBL || '')
                        setDraftBLFile(data.draftBL && data.draftBL.startsWith('http') ? data.draftBL : null)
                        setConsumerNumber(data.consumerNumber || '')
                        setPackagingList(data.dispatch?.packagingList || '')
                        setPackageNumber(data.dispatch?.packageNumber || '')
                        setConsigneeNumber(data.dispatch?.consigneeNumber || '')
                        setShippingMark(data.dispatch?.shippingMark || 'UZA Solutions')
                        setRemarks(data.warehouseRemarks || '')
                        setClientNotes(data.notes || '')
                      }}
                      disabled={savingDetails}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Client Notes */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Client Notes</div>
                  {isEditing ? (
                    <Textarea
                      value={clientNotes}
                      onChange={e => setClientNotes(e.target.value)}
                      placeholder="Add or edit client notes..."
                      rows={4}
                    />
                  ) : (
                    <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200 min-h-[80px]">
                      {shipment.notes || <span className="text-slate-400 italic">No notes added</span>}
                    </div>
                  )}
                </div>

                {/* Draft BL */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Draft BL (Bill of Lading)</div>
                  {isEditing ? (
                    <>
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
                            accept=".pdf,application/pdf"
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
                              <div className="text-xs text-slate-500 mt-1">PDF (Max 10MB)</div>
                            </>
                          )}
                        </label>
                      )}
                    </>
                  ) : (
                    shipment.draftBL ? (
                      shipment.draftBL.startsWith('http') ? (
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
                      )
                    ) : (
                      <div className="text-sm text-slate-500 italic">No Draft BL uploaded</div>
                    )
                  )}
                </div>

                {/* Consumer Number */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Consumer Number</div>
                  {isEditing ? (
                    <Input
                      value={consumerNumber}
                      onChange={e => setConsumerNumber(e.target.value)}
                      placeholder="Enter consumer number"
                    />
                  ) : (
                    <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      {shipment.consumerNumber || <span className="text-slate-400 italic">Not set</span>}
                    </div>
                  )}
                </div>

                {/* Warehouse Remarks */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Warehouse Remarks</div>
                  {isEditing ? (
                    <Textarea
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      placeholder="Condition, packaging, discrepancies..."
                      rows={4}
                    />
                  ) : (
                    <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                      {shipment.warehouseRemarks || <span className="text-slate-400 italic">No remarks</span>}
                    </div>
                  )}
                </div>

                {/* Received Product Images */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Received Product Images</div>
                  {isEditing ? (
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
                  ) : (
                    shipment.receivedProductImages && shipment.receivedProductImages.length > 0 ? (
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
                    ) : (
                      <div className="text-sm text-slate-500 italic">No images uploaded</div>
                    )
                  )}
                </div>

                {/* Dispatch Details (if exists) */}
                {shipment.dispatch && (
                  <>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">Packaging List</div>
                      {isEditing ? (
                        <Input
                          value={packagingList}
                          onChange={e => setPackagingList(e.target.value)}
                          placeholder="Enter packaging list"
                        />
                      ) : (
                        <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          {shipment.dispatch.packagingList || <span className="text-slate-400 italic">Not set</span>}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">Package Number</div>
                      {isEditing ? (
                        <Input
                          value={packageNumber}
                          onChange={e => setPackageNumber(e.target.value)}
                          placeholder="Enter package number"
                        />
                      ) : (
                        <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          {shipment.dispatch.packageNumber || <span className="text-slate-400 italic">Not set</span>}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">Consignee Number</div>
                      {isEditing ? (
                        <Input
                          value={consigneeNumber}
                          onChange={e => setConsigneeNumber(e.target.value)}
                          placeholder="Enter consignee number"
                        />
                      ) : (
                        <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          {shipment.dispatch.consigneeNumber || <span className="text-slate-400 italic">Not set</span>}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">Shipping Mark</div>
                      {isEditing ? (
                        <Input
                          value={shippingMark}
                          onChange={e => setShippingMark(e.target.value)}
                          placeholder="Enter shipping mark"
                        />
                      ) : (
                        <div className="text-sm text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          {shipment.dispatch.shippingMark || 'UZA Solutions'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
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
