import * as React from 'react'
import { ArrowLeft, ArrowRight, Check, Image as ImageIcon, Package, Upload, X, Building2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { clientAPI, uploadAPI } from '../../lib/api'
import { cn } from '../../lib/cn'
import type { Shipment } from '../../lib/types'

const categories = ['Electronics', 'Apparel', 'Accessories', 'Fragile', 'Food', 'Other']
const packagingTypes = ['Box', 'Pallet', 'Crate', 'Bag', 'Envelope', 'Tube', 'Other']

type ProductDraft = {
  name: string
  quantity: number
  category: string
  customCategory?: string
  weightKg: number
  imageUrl?: string
  packagingType?: string
  cbm?: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  isFragile?: boolean
  isHazardous?: boolean
  specialInstructions?: string
}

type Step = 1 | 2 | 3 | 4

export function CreateShipmentModal({
  open,
  onClose,
  onSubmit,
  shipment,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: { products: ProductDraft[]; notes?: string; warehouseId?: string; warehouseName?: string }) => void
  shipment?: Shipment
}) {
  const [currentStep, setCurrentStep] = React.useState<Step>(1)
  const [products, setProducts] = React.useState<ProductDraft[]>([
    {
      name: '',
      quantity: 1,
      category: 'Electronics',
      weightKg: 1,
      packagingType: 'Box',
      isFragile: false,
      isHazardous: false,
    },
  ])
  const [notes, setNotes] = React.useState('')
  const [currentProductIndex, setCurrentProductIndex] = React.useState(0)
  const [warehouses, setWarehouses] = React.useState<any[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<string>('')
  const [loadingWarehouses, setLoadingWarehouses] = React.useState(false)

  // Fetch warehouses when modal opens
  React.useEffect(() => {
    if (open) {
      const fetchWarehouses = async () => {
        try {
          setLoadingWarehouses(true)
          const data = await clientAPI.getWarehouses()
          setWarehouses(data)
          // Set default warehouse if available and not already set
          if (data.length > 0 && !selectedWarehouseId) {
            setSelectedWarehouseId(data[0].id)
          }
        } catch (err) {
          console.error('Failed to fetch warehouses:', err)
        } finally {
          setLoadingWarehouses(false)
        }
      }
      fetchWarehouses()
    }
  }, [open])

  // Initialize form with shipment data when editing
  React.useEffect(() => {
    if (open) {
      if (shipment) {
        // Edit mode - load shipment data
        const mappedProducts = shipment.products.map(p => {
          const isCustomCategory = !categories.includes(p.category)
          return {
            name: p.name,
            quantity: p.quantity,
            category: isCustomCategory ? 'Other' : p.category,
            customCategory: isCustomCategory ? p.category : undefined,
            weightKg: p.weightKg,
            imageUrl: p.imageUrl,
            packagingType: p.packagingType || 'Box',
            cbm: p.cbm,
            lengthCm: p.lengthCm,
            widthCm: p.widthCm,
            heightCm: p.heightCm,
            isFragile: p.isFragile || false,
            isHazardous: p.isHazardous || false,
            specialInstructions: p.specialInstructions,
          }
        })
        setProducts(mappedProducts.length > 0 ? mappedProducts : [
          {
            name: '',
            quantity: 1,
            category: 'Electronics',
            weightKg: 1,
            packagingType: 'Box',
            isFragile: false,
            isHazardous: false,
          },
        ])
        setNotes(shipment.notes || '')
        setCurrentProductIndex(0)
        setCurrentStep(1)
        // Set warehouse from shipment if available
        if (shipment.warehouseId) {
          setSelectedWarehouseId(shipment.warehouseId)
        } else if (shipment.warehouseName && warehouses.length > 0) {
          const warehouse = warehouses.find((w: any) => w.name === shipment.warehouseName)
          if (warehouse) {
            setSelectedWarehouseId(warehouse.id)
          }
        }
      } else {
        // Create mode - reset to defaults
        setProducts([
          {
            name: '',
            quantity: 1,
            category: 'Electronics',
            weightKg: 1,
            packagingType: 'Box',
            isFragile: false,
            isHazardous: false,
          },
        ])
        setNotes('')
        setCurrentProductIndex(0)
        setCurrentStep(1)
        // Reset warehouse selection to first available
        if (warehouses.length > 0) {
          setSelectedWarehouseId(warehouses[0].id)
        }
      }
    }
  }, [open, shipment, warehouses])

  const currentProduct = products[currentProductIndex] || products[0]

  const [uploadingImages, setUploadingImages] = React.useState<Record<number, boolean>>({})

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingImages(prev => ({ ...prev, [productIndex]: true }))
      
      // Upload to Cloudinary
      const imageUrl = await uploadAPI.uploadImage(file, 'uzalogistics/products')
      
      setProducts(ps =>
        ps.map((p, i) => (i === productIndex ? { ...p, imageUrl } : p)),
      )
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      alert(error.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploadingImages(prev => ({ ...prev, [productIndex]: false }))
    }
  }

  const removeImage = (productIndex: number) => {
    setProducts(ps => ps.map((p, i) => (i === productIndex ? { ...p, imageUrl: undefined } : p)))
  }

  const calculateCBM = (product: ProductDraft) => {
    if (product.lengthCm && product.widthCm && product.heightCm) {
      return (product.lengthCm * product.widthCm * product.heightCm) / 1000000 // Convert to m³
    }
    return undefined
  }

  React.useEffect(() => {
    const product = products[currentProductIndex]
    if (product && product.lengthCm && product.widthCm && product.heightCm) {
      const cbm = calculateCBM(product)
      setProducts(ps =>
        ps.map((p, i) => (i === currentProductIndex ? { ...p, cbm } : p)),
      )
    }
  }, [products, currentProductIndex])

  const updateProduct = (field: keyof ProductDraft, value: any) => {
    setProducts(ps =>
      ps.map((p, i) => (i === currentProductIndex ? { ...p, [field]: value } : p)),
    )
  }

  const addProduct = () => {
    setProducts(p => [
      ...p,
      {
        name: '',
        quantity: 1,
        category: 'Electronics',
        weightKg: 1,
        packagingType: 'Box',
        isFragile: false,
        isHazardous: false,
      },
    ])
    setCurrentProductIndex(products.length)
  }

  const removeProduct = (index: number) => {
    if (products.length === 1) return
    setProducts(p => p.filter((_, i) => i !== index))
    if (currentProductIndex >= products.length - 1) {
      setCurrentProductIndex(Math.max(0, currentProductIndex - 1))
    }
  }

  const canProceedStep1 =
    selectedWarehouseId &&
    currentProduct?.name.trim().length > 0 &&
    currentProduct?.quantity > 0 &&
    (currentProduct?.category !== 'Other' || (currentProduct?.customCategory && currentProduct.customCategory.trim().length > 0))
  const canProceedStep2 =
    currentProduct?.weightKg > 0 &&
    currentProduct?.packagingType &&
    (currentProduct?.lengthCm || currentProduct?.widthCm || currentProduct?.heightCm || true)
  const canProceedStep3 = true // Step 3 is optional
  const canSubmit = 
    selectedWarehouseId &&
    products.every(
      p =>
        p.name.trim().length > 0 &&
        p.quantity > 0 &&
        p.weightKg > 0 &&
        p.packagingType &&
        p.category &&
        (p.category !== 'Other' || (p.customCategory && p.customCategory.trim().length > 0)),
    )

  const resetForm = () => {
    setCurrentStep(1)
    setProducts([
      {
        name: '',
        quantity: 1,
        category: 'Electronics',
        weightKg: 1,
        packagingType: 'Box',
        isFragile: false,
        isHazardous: false,
      },
    ])
    setCurrentProductIndex(0)
    setNotes('')
    if (warehouses.length > 0) {
      setSelectedWarehouseId(warehouses[0].id)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    const selectedWarehouse = warehouses.find((w: any) => w.id === selectedWarehouseId)
    onSubmit({
      products,
      notes: notes.trim() || undefined,
      warehouseId: selectedWarehouseId,
      warehouseName: selectedWarehouse?.name || '',
    })
    resetForm()
    onClose()
  }

  const nextStep = () => {
    if (currentStep < 4) {
      if (currentStep === 1 && !canProceedStep1) return
      if (currentStep === 2 && !canProceedStep2) return
      setCurrentStep((s) => (s + 1) as Step)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as Step)
    }
  }

  return (
    <Modal
      open={open}
      title={shipment ? 'Edit Shipment' : 'Create New Shipment'}
      description={`Step ${currentStep} of 4: ${['Basic Information', 'Physical Details', 'Images & Special Instructions', 'Review'][currentStep - 1]}`}
      onClose={handleClose}
      footer={
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 1 ? (
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            ) : null}
            {currentStep < 4 ? (
              <Button onClick={nextStep} disabled={currentStep === 1 && !canProceedStep1 || currentStep === 2 && !canProceedStep2}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                <Check className="h-4 w-4" />
                {shipment ? 'Save Changes' : 'Create Shipment'}
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  step === currentStep
                    ? 'bg-brand-600'
                    : step < currentStep
                      ? 'bg-brand-300'
                      : 'bg-slate-200',
                )}
              />
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Product Selector */}
        {products.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <div className="flex gap-2 min-w-max">
              {products.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentProductIndex(idx)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                    currentProductIndex === idx
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  )}
                >
                  Product {idx + 1} {p.name ? `: ${p.name.substring(0, 15)}` : ''}
                </button>
              ))}
              {currentStep !== 4 && (
                <Button variant="ghost" size="sm" onClick={addProduct} className="shrink-0 whitespace-nowrap">
                  + Add Product
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Select Warehouse *</div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="pl-10"
                  disabled={loadingWarehouses || warehouses.length === 0}
                >
                  {loadingWarehouses ? (
                    <option value="">Loading warehouses...</option>
                  ) : warehouses.length === 0 ? (
                    <option value="">No warehouses available</option>
                  ) : (
                    warehouses.map((warehouse: any) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} {warehouse.location ? `- ${warehouse.location}` : ''}
                      </option>
                    ))
                  )}
                </Select>
              </div>
              {warehouses.length === 0 && !loadingWarehouses && (
                <div className="mt-1 text-xs text-slate-500">No active warehouses found. Please contact admin.</div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Product Name *</div>
              <Input
                value={currentProduct?.name || ''}
                onChange={(e) => updateProduct('name', e.target.value)}
                placeholder="e.g. Wireless Headphones"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Quantity *</div>
                <Input
                  type="number"
                  min={1}
                  value={currentProduct?.quantity || 1}
                  onChange={(e) => updateProduct('quantity', Number(e.target.value) || 1)}
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Category *</div>
                <select
                  className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 shadow-sm focus:ring-2 focus:ring-brand-200 focus:outline-none"
                  value={currentProduct?.category || 'Electronics'}
                  onChange={(e) => {
                    updateProduct('category', e.target.value)
                    if (e.target.value !== 'Other') {
                      updateProduct('customCategory', undefined)
                    }
                  }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {currentProduct?.category === 'Other' && (
                  <div className="mt-2">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Specify Category *</div>
                    <Input
                      value={currentProduct?.customCategory || ''}
                      onChange={(e) => updateProduct('customCategory', e.target.value)}
                      placeholder="Enter custom category name"
                    />
                  </div>
                )}
              </div>
            </div>
            {products.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeProduct(currentProductIndex)}>
                Remove this product
              </Button>
            )}
            {products.length === 1 && (
              <Button variant="ghost" size="sm" onClick={addProduct}>
                + Add Another Product
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Physical Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Weight (kg) *</div>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={currentProduct?.weightKg || 0}
                onChange={(e) => updateProduct('weightKg', Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Packaging Type *</div>
              <select
                className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 shadow-sm focus:ring-2 focus:ring-brand-200 focus:outline-none"
                value={currentProduct?.packagingType || 'Box'}
                onChange={(e) => updateProduct('packagingType', e.target.value)}
              >
                {packagingTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Length (cm)</div>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={currentProduct?.lengthCm || ''}
                  onChange={(e) => updateProduct('lengthCm', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Width (cm)</div>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={currentProduct?.widthCm || ''}
                  onChange={(e) => updateProduct('widthCm', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Height (cm)</div>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={currentProduct?.heightCm || ''}
                  onChange={(e) => updateProduct('heightCm', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Optional"
                />
              </div>
            </div>
            {currentProduct?.cbm && (
              <div className="rounded-lg bg-brand-50 p-3">
                <div className="text-xs font-semibold text-brand-700">Calculated CBM</div>
                <div className="text-sm font-semibold text-brand-900">{currentProduct.cbm.toFixed(4)} m³</div>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">CBM (Cubic Meters) - Optional</div>
              <Input
                type="number"
                min={0}
                step={0.0001}
                value={currentProduct?.cbm || ''}
                onChange={(e) => updateProduct('cbm', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Auto-calculated from dimensions or enter manually"
              />
            </div>
          </div>
        )}

        {/* Step 3: Images & Special Instructions */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Product Image (Optional)</div>
              {uploadingImages[currentProductIndex] ? (
                <div className="flex items-center justify-center h-48 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                  <div className="text-sm text-slate-600">Uploading image...</div>
                </div>
              ) : currentProduct?.imageUrl ? (
                <div className="relative">
                  <img
                    src={currentProduct.imageUrl}
                    alt={currentProduct?.name || 'Product'}
                    className="h-48 w-full rounded-lg object-cover border border-slate-200"
                  />
                  <button
                    onClick={() => removeImage(currentProductIndex)}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, currentProductIndex)}
                  />
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <div className="text-sm font-medium text-slate-600">Click to upload image</div>
                  <div className="text-xs text-slate-500 mt-1">Max 5MB, JPG/PNG/GIF/WEBP</div>
                </label>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentProduct?.isFragile || false}
                  onChange={(e) => updateProduct('isFragile', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
                />
                <div className="text-sm text-slate-700">Fragile Item</div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentProduct?.isHazardous || false}
                  onChange={(e) => updateProduct('isHazardous', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
                />
                <div className="text-sm text-slate-700">Hazardous Material</div>
              </label>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Special Instructions (Optional)</div>
              <Textarea
                value={currentProduct?.specialInstructions || ''}
                onChange={(e) => updateProduct('specialInstructions', e.target.value)}
                placeholder="Any special handling requirements, storage conditions, etc."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Current Product Review */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Product {currentProductIndex + 1}</div>
                  <div className="text-lg font-semibold text-slate-900 mt-1">{currentProduct?.name}</div>
                </div>
                {currentProduct?.imageUrl && (
                  <img
                    src={currentProduct.imageUrl}
                    alt={currentProduct.name}
                    className="h-16 w-16 rounded-lg object-cover border border-slate-200"
                  />
                )}
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Quantity:</span>
                  <span className="font-medium text-slate-900">{currentProduct?.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Category:</span>
                  <span className="font-medium text-slate-900">
                    {currentProduct?.category === 'Other' && currentProduct?.customCategory ? currentProduct.customCategory : currentProduct?.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Weight:</span>
                  <span className="font-medium text-slate-900">{currentProduct?.weightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Packaging:</span>
                  <span className="font-medium text-slate-900">{currentProduct?.packagingType}</span>
                </div>
                {currentProduct?.cbm && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">CBM:</span>
                    <span className="font-medium text-slate-900">{currentProduct.cbm.toFixed(4)} m³</span>
                  </div>
                )}
                {(currentProduct?.lengthCm || currentProduct?.widthCm || currentProduct?.heightCm) && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dimensions:</span>
                    <span className="font-medium text-slate-900">
                      {currentProduct.lengthCm || '-'} × {currentProduct.widthCm || '-'} × {currentProduct.heightCm || '-'} cm
                    </span>
                  </div>
                )}
                {(currentProduct?.isFragile || currentProduct?.isHazardous) && (
                  <div className="flex gap-2 mt-2">
                    {currentProduct.isFragile && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                        Fragile
                      </span>
                    )}
                    {currentProduct.isHazardous && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        Hazardous
                      </span>
                    )}
                  </div>
                )}
                {currentProduct?.specialInstructions && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Special Instructions:</div>
                    <div className="text-sm text-slate-700">{currentProduct.specialInstructions}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation arrows for multiple products */}
            {products.length > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                  disabled={currentProductIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous Product
                </Button>
                <div className="text-sm text-slate-600">
                  {currentProductIndex + 1} of {products.length}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentProductIndex(Math.min(products.length - 1, currentProductIndex + 1))}
                  disabled={currentProductIndex === products.length - 1}
                >
                  Next Product
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {selectedWarehouseId && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Selected Warehouse</div>
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {warehouses.find((w: any) => w.id === selectedWarehouseId)?.name || 'Unknown Warehouse'}
                </div>
              </div>
            )}
            {notes && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-1">Notes for Warehouse</div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{notes}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Additional Notes (Optional)</div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Packaging instructions, timing constraints, etc."
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
