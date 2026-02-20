import * as React from 'react'
import { Building2, Check, Mail, MapPin, Pencil, Phone, User, X } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { warehouseAPI } from '../../lib/api'
import { useAuth } from '../../lib/authContext'
import { useToast } from '../../components/ui/Toast'

export function WarehouseProfilePage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = React.useState({
    warehouseName: '',
    managerName: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    capacity: '',
    contact: '',
    pricePerKgUsd: 0,
    warehouseHandlingFeeUsd: 0,
    transportPriceAir: 0,
    transportPriceShip: 0,
    logisticsMethods: [] as string[],
  })
  const [editingField, setEditingField] = React.useState<string | null>(null)
  const [tempValues, setTempValues] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [editingPricing, setEditingPricing] = React.useState(false)
  const [pricingTempValues, setPricingTempValues] = React.useState({
    pricePerKgUsd: 0,
    warehouseHandlingFeeUsd: 0,
    transportPriceAir: 0,
    transportPriceShip: 0,
    logisticsMethods: [] as string[],
  })

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const profile = await warehouseAPI.getProfile(user.id)
        
        // Map all backend fields to frontend form data
        setFormData({
          warehouseName: profile.name || profile.warehouseName || '',
          managerName: profile.manager || profile.managerName || '',
          email: profile.email || user?.email || '',
          phone: profile.contact || profile.phone || '',
          address: profile.location || profile.address || '',
          location: profile.location || '',
          capacity: profile.capacity || '',
          contact: profile.contact || '',
          pricePerKgUsd: profile.pricePerKgUsd || 0,
          warehouseHandlingFeeUsd: profile.warehouseHandlingFeeUsd || 0,
          transportPriceAir: profile.transportPriceUsd?.Air || 0,
          transportPriceShip: profile.transportPriceUsd?.Ship || 0,
          logisticsMethods: profile.logisticsMethods || [],
        })
      } catch (err: any) {
        if (err.is404 || err.status === 404 || err.message?.includes('404') || err.message?.includes('not found')) {
          setError(null)
          setFormData({
            warehouseName: '',
            managerName: '',
            email: user?.email || '',
            phone: '',
            address: '',
            location: '',
            capacity: '',
            contact: '',
          })
        } else {
          const errorMessage = err.message || 'Failed to load profile'
          setError(errorMessage)
          showToast(errorMessage, 'error')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleEdit = (field: string, currentValue: string | string[]) => {
    setEditingField(field)
    setTempValues({ ...tempValues, [field]: currentValue })
    setError(null)
  }

  const handleSave = async (field: string) => {
    if (!user?.id) {
      setError('You must be logged in to update your profile')
      return
    }

    try {
      setSaving(field)
      setError(null)

      // Map frontend field names to backend field names
      const fieldMapping: Record<string, string> = {
        warehouseName: 'name',
        managerName: 'manager',
        email: 'email',
        phone: 'contact',
        address: 'location',
        location: 'location',
        capacity: 'capacity',
        contact: 'contact',
      }

      const backendField = fieldMapping[field] || field
      const updateData: any = {}
      let valueToSave: any = tempValues[field]?.trim() || ''
      
      // Handle special fields
      if (field === 'pricePerKgUsd' || field === 'warehouseHandlingFeeUsd') {
        valueToSave = Number(valueToSave) || 0
        updateData[backendField] = valueToSave
      } else if (field === 'transportPriceAir' || field === 'transportPriceShip') {
        valueToSave = Number(valueToSave) || 0
        // Update transport prices - preserve the other method's price
        updateData.transportPriceUsd = {
          Air: field === 'transportPriceAir' ? valueToSave : (formData.transportPriceAir || 0),
          Ship: field === 'transportPriceShip' ? valueToSave : (formData.transportPriceShip || 0),
        }
      } else if (field === 'logisticsMethods') {
        // Handle logistics methods as array
        valueToSave = Array.isArray(tempValues[field]) ? tempValues[field] : []
        updateData.logisticsMethods = valueToSave
      } else {
        updateData[backendField] = valueToSave
      }

      const result = await warehouseAPI.updateProfile(updateData, user?.id)
      
      if (result?.user) {
        // Update form data with all fields from backend response
        setFormData({
          warehouseName: result.user.name || result.user.warehouseName || '',
          managerName: result.user.manager || result.user.managerName || '',
          email: result.user.email || user.email || '',
          phone: result.user.contact || result.user.phone || '',
          address: result.user.location || result.user.address || '',
          location: result.user.location || '',
          capacity: result.user.capacity || '',
          contact: result.user.contact || '',
          pricePerKgUsd: result.user.pricePerKgUsd || 0,
          warehouseHandlingFeeUsd: result.user.warehouseHandlingFeeUsd || 0,
          transportPriceAir: result.user.transportPriceUsd?.Air || 0,
          transportPriceShip: result.user.transportPriceUsd?.Ship || 0,
          logisticsMethods: result.user.logisticsMethods || [],
        })
      } else {
        setFormData(d => ({ ...d, [field]: valueToSave }))
      }
      
      setEditingField(null)
      setTempValues({})
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save profile'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setSaving(null)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValues({})
    setError(null)
  }

  const handleEditPricing = () => {
    setEditingPricing(true)
    setPricingTempValues({
      pricePerKgUsd: formData.pricePerKgUsd,
      warehouseHandlingFeeUsd: formData.warehouseHandlingFeeUsd,
      transportPriceAir: formData.transportPriceAir,
      transportPriceShip: formData.transportPriceShip,
      logisticsMethods: [...formData.logisticsMethods],
    })
  }

  const handleSaveAllPricing = async () => {
    if (!user?.id) {
      setError('You must be logged in to update your profile')
      return
    }

    try {
      setSaving('pricing')
      setError(null)

      const updateData: any = {
        pricePerKgUsd: Number(pricingTempValues.pricePerKgUsd) || 0,
        warehouseHandlingFeeUsd: Number(pricingTempValues.warehouseHandlingFeeUsd) || 0,
        transportPriceUsd: {
          Air: Number(pricingTempValues.transportPriceAir) || 0,
          Ship: Number(pricingTempValues.transportPriceShip) || 0,
        },
        logisticsMethods: Array.isArray(pricingTempValues.logisticsMethods) ? pricingTempValues.logisticsMethods : [],
      }

      const result = await warehouseAPI.updateProfile(updateData, user?.id)
      
      // Use the result from update if available, otherwise refresh
      let updatedData = result?.user
      
      if (!updatedData) {
        // Small delay to ensure backend has saved
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Refresh profile data from server
        updatedData = await warehouseAPI.getProfile(user?.id)
      }
      
      if (updatedData) {
        const updatedFormData = {
          warehouseName: updatedData.name || updatedData.warehouseName || formData.warehouseName,
          managerName: updatedData.manager || updatedData.managerName || formData.managerName,
          email: updatedData.email || user?.email || formData.email,
          phone: updatedData.contact || updatedData.phone || formData.phone,
          address: updatedData.location || updatedData.address || formData.address,
          location: updatedData.location || formData.location,
          capacity: updatedData.capacity || formData.capacity,
          contact: updatedData.contact || formData.contact,
          pricePerKgUsd: Number(updatedData.pricePerKgUsd) || 0,
          warehouseHandlingFeeUsd: Number(updatedData.warehouseHandlingFeeUsd) || 0,
          transportPriceAir: Number(updatedData.transportPriceUsd?.Air) || 0,
          transportPriceShip: Number(updatedData.transportPriceUsd?.Ship) || 0,
          logisticsMethods: Array.isArray(updatedData.logisticsMethods) ? updatedData.logisticsMethods : [],
        }
        setFormData(updatedFormData)
      } else {
        // Fallback: update from temp values if refresh fails
        setFormData(d => ({
          ...d,
          pricePerKgUsd: pricingTempValues.pricePerKgUsd,
          warehouseHandlingFeeUsd: pricingTempValues.warehouseHandlingFeeUsd,
          transportPriceAir: pricingTempValues.transportPriceAir,
          transportPriceShip: pricingTempValues.transportPriceShip,
          logisticsMethods: pricingTempValues.logisticsMethods,
        }))
      }
      
      setEditingPricing(false)
      setPricingTempValues({
        pricePerKgUsd: 0,
        warehouseHandlingFeeUsd: 0,
        transportPriceAir: 0,
        transportPriceShip: 0,
        logisticsMethods: [],
      })
      
      showToast('Pricing updated successfully', 'success')
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save pricing'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setSaving(null)
    }
  }

  const handleCancelPricing = () => {
    setEditingPricing(false)
    setPricingTempValues({
      pricePerKgUsd: 0,
      warehouseHandlingFeeUsd: 0,
      transportPriceAir: 0,
      transportPriceShip: 0,
      logisticsMethods: [],
    })
  }

  if (loading) {
    return (
      <div className="px-3 pt-2 pb-2 sm:px-0 sm:pt-4">
        <div className="mb-3 sm:mb-4">
          <div className="text-xs sm:text-sm font-semibold text-slate-900">Warehouse Profile</div>
        </div>
        <Card>
          <CardBody>
            <div className="text-xs sm:text-sm text-slate-600 text-center py-8">Loading profile...</div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-3 pt-2 pb-2 sm:px-0 sm:pt-4">
      <div className="mb-3 sm:mb-4">
        <div className="text-xs sm:text-sm font-semibold text-slate-900">Warehouse Profile</div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle>Warehouse Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white grid place-items-center text-xl font-semibold">
                  {formData.warehouseName.charAt(formData.warehouseName.length - 1)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{formData.warehouseName}</div>
                  <div className="text-sm text-slate-600">Warehouse Facility</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Warehouse Name</div>
                  {editingField === 'warehouseName' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.warehouseName || formData.warehouseName}
                        onChange={e => setTempValues({ ...tempValues, warehouseName: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('warehouseName')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'warehouseName'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>{formData.warehouseName}</span>
                      <button
                        onClick={() => handleEdit('warehouseName', formData.warehouseName)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit warehouse name'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Manager Name</div>
                  {editingField === 'managerName' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.managerName || formData.managerName}
                        onChange={e => setTempValues({ ...tempValues, managerName: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('managerName')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'managerName'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <User className="h-4 w-4 text-slate-500" />
                      <span>{formData.managerName}</span>
                      <button
                        onClick={() => handleEdit('managerName', formData.managerName)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit manager name'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Email</div>
                  {editingField === 'email' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        value={tempValues.email || formData.email}
                        onChange={e => setTempValues({ ...tempValues, email: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('email')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'email'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{formData.email}</span>
                      <button
                        onClick={() => handleEdit('email', formData.email)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit email'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Phone</div>
                  {editingField === 'phone' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="tel"
                        value={tempValues.phone || formData.phone}
                        onChange={e => setTempValues({ ...tempValues, phone: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('phone')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'phone'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{formData.phone}</span>
                      <button
                        onClick={() => handleEdit('phone', formData.phone)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit phone'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Location/Address</div>
                  {editingField === 'address' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.address || formData.address || formData.location}
                        onChange={e => setTempValues({ ...tempValues, address: e.target.value, location: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          handleSave('location')
                          if (tempValues.address) {
                            setTempValues({ ...tempValues, location: tempValues.address })
                          }
                        }}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'address' || saving === 'location'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{formData.location || formData.address || 'Not set'}</span>
                      <button
                        onClick={() => handleEdit('address', formData.location || formData.address)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit location/address'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Capacity</div>
                  {editingField === 'capacity' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.capacity || formData.capacity}
                        onChange={e => setTempValues({ ...tempValues, capacity: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('capacity')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'capacity'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <span>{formData.capacity}</span>
                      <button
                        onClick={() => handleEdit('capacity', formData.capacity)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit capacity'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Location</div>
                  {editingField === 'location' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.location || formData.location}
                        onChange={e => setTempValues({ ...tempValues, location: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('location')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'location'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{formData.location || formData.address || 'Not set'}</span>
                      <button
                        onClick={() => handleEdit('location', formData.location || formData.address)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit location'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Contact</div>
                  {editingField === 'contact' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.contact || formData.contact}
                        onChange={e => setTempValues({ ...tempValues, contact: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('contact')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'contact'}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{formData.contact || formData.phone || 'Not set'}</span>
                      <button
                        onClick={() => handleEdit('contact', formData.contact || formData.phone)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit contact'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pricing & Logistics */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pricing & Logistics Methods</span>
              {!editingPricing ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEditPricing}
                  disabled={!user}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAllPricing}
                    disabled={saving === 'pricing'}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {saving === 'pricing' ? 'Saving...' : 'Save All'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelPricing}
                    disabled={saving === 'pricing'}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
            <div className="text-xs text-slate-500">Set your warehouse pricing and available transport methods</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {/* Pricing Fields - Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Price per kg (USD)</div>
                  {editingPricing ? (
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={pricingTempValues.pricePerKgUsd || ''}
                      onChange={e => setPricingTempValues({ ...pricingTempValues, pricePerKgUsd: Number(e.target.value) || 0 })}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-sm text-slate-900">
                      ${formData.pricePerKgUsd.toFixed(2)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Handling Fee (USD)</div>
                  {editingPricing ? (
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={pricingTempValues.warehouseHandlingFeeUsd || ''}
                      onChange={e => setPricingTempValues({ ...pricingTempValues, warehouseHandlingFeeUsd: Number(e.target.value) || 0 })}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-sm text-slate-900">
                      ${formData.warehouseHandlingFeeUsd.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Transport Pricing - Grid Layout */}
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Transport Pricing (USD)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Air</div>
                    {editingPricing ? (
                      <Input
                        type="number"
                        min={0}
                        step={5}
                        value={pricingTempValues.transportPriceAir || ''}
                        onChange={e => setPricingTempValues({ ...pricingTempValues, transportPriceAir: Number(e.target.value) || 0 })}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm text-slate-900">
                        ${formData.transportPriceAir.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Ship</div>
                    {editingPricing ? (
                      <Input
                        type="number"
                        min={0}
                        step={5}
                        value={pricingTempValues.transportPriceShip || ''}
                        onChange={e => setPricingTempValues({ ...pricingTempValues, transportPriceShip: Number(e.target.value) || 0 })}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm text-slate-900">
                        ${formData.transportPriceShip.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Logistics Methods - Compact Layout */}
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Available Logistics Methods</div>
                {editingPricing ? (
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pricingTempValues.logisticsMethods.includes('Air')}
                        onChange={e => {
                          const updated = e.target.checked
                            ? [...pricingTempValues.logisticsMethods.filter((m: string) => m !== 'Air'), 'Air']
                            : pricingTempValues.logisticsMethods.filter((m: string) => m !== 'Air')
                          setPricingTempValues({ ...pricingTempValues, logisticsMethods: updated })
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">Air</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pricingTempValues.logisticsMethods.includes('Ship')}
                        onChange={e => {
                          const updated = e.target.checked
                            ? [...pricingTempValues.logisticsMethods.filter((m: string) => m !== 'Ship'), 'Ship']
                            : pricingTempValues.logisticsMethods.filter((m: string) => m !== 'Ship')
                          setPricingTempValues({ ...pricingTempValues, logisticsMethods: updated })
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">Ship</span>
                    </label>
                  </div>
                ) : (
                  <div className="text-sm text-slate-900">
                    {formData.logisticsMethods.length > 0
                      ? formData.logisticsMethods.join(', ')
                      : 'None selected'}
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
