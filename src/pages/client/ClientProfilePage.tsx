import * as React from 'react'
import { Building2, Check, Mail, MapPin, Pencil, Phone, User, X } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { clientAPI } from '../../lib/api'
import { useAuth } from '../../lib/authContext'

export function ClientProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = React.useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    warehouse: 'Warehouse A',
  })
  const [editingField, setEditingField] = React.useState<string | null>(null)
  const [tempValues, setTempValues] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch profile from backend
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const profile = await clientAPI.getProfile(user.id)
        
        setFormData({
          companyName: profile.company || '',
          contactName: profile.name || '',
          email: profile.email || user?.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          warehouse: 'Warehouse A', // This might not be in backend
        })
      } catch (err: any) {
        // Handle 404 - client doesn't exist yet, show empty form
        // Backend now returns empty profile instead of 404, but handle both cases
        if (err.is404 || err.status === 404 || err.message?.includes('404') || err.message?.includes('not found')) {
          setError(null) // Don't show error for new clients
          setFormData({
            companyName: '',
            contactName: '',
            email: user?.email || '',
            phone: '',
            address: '',
            warehouse: 'Warehouse A',
          })
        } else {
          setError(err.message || 'Failed to load profile')
          console.error('Failed to fetch profile:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleEdit = (field: string, currentValue: string) => {
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
        companyName: 'company',
        contactName: 'name',
        email: 'email',
        phone: 'phone',
        address: 'address',
      }

      const backendField = fieldMapping[field] || field
      const updateData: any = {}
      
      // Get the value to save
      const valueToSave = tempValues[field]?.trim() || ''
      
      // Only update the field being saved
      if (backendField === 'company') {
        updateData.company = valueToSave
      } else if (backendField === 'name') {
        updateData.name = valueToSave
      } else {
        updateData[backendField] = valueToSave
      }

      // Save to backend
      const result = await clientAPI.updateProfile(updateData, user.id)
      
      // Refresh profile from backend to ensure sync
      if (result?.user) {
        setFormData({
          companyName: result.user.company || '',
          contactName: result.user.name || '',
          email: result.user.email || user.email || '',
          phone: result.user.phone || '',
          address: result.user.address || '',
          warehouse: 'Warehouse A',
        })
      } else {
        // Fallback: update local state with saved value
        setFormData(d => ({ ...d, [field]: valueToSave }))
      }
      
      setEditingField(null)
      setTempValues({})
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(null)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValues({})
    setError(null)
  }

  if (loading) {
    return (
      <div className="pt-4">
        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-900">Profile</div>
        </div>
        <Card>
          <CardBody>
            <div className="text-sm text-slate-600 text-center py-8">Loading profile...</div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Profile</div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="h-16 w-16 rounded-full bg-brand-600 text-white grid place-items-center text-xl font-semibold">
                  {(formData.companyName || formData.contactName || user?.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formData.companyName || formData.contactName || user?.name || 'Client Account'}
                  </div>
                  <div className="text-sm text-slate-600">Client Account</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Company Name</div>
                  {editingField === 'companyName' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.companyName || formData.companyName}
                        onChange={e => setTempValues({ ...tempValues, companyName: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('companyName')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'companyName'}
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
                      <span className="flex-1">{formData.companyName || 'Not set'}</span>
                      <button
                        onClick={() => handleEdit('companyName', formData.companyName)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit company name'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Contact Name</div>
                  {editingField === 'contactName' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.contactName || formData.contactName}
                        onChange={e => setTempValues({ ...tempValues, contactName: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('contactName')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'contactName'}
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
                      <span className="flex-1">{formData.contactName || 'Not set'}</span>
                      <button
                        onClick={() => handleEdit('contactName', formData.contactName)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit contact name'}
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
                      <span className="flex-1">{formData.email || user?.email || 'Not set'}</span>
                      <button
                        onClick={() => handleEdit('email', formData.email || user?.email || '')}
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
                      <span className="flex-1">{formData.phone || 'Not set'}</span>
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
                  <div className="text-xs font-semibold text-slate-600 mb-1">Address</div>
                  {editingField === 'address' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.address || formData.address}
                        onChange={e => setTempValues({ ...tempValues, address: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('address')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'address'}
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
                      <span className="flex-1">{formData.address || 'Not set'}</span>
                      <button
                        onClick={() => handleEdit('address', formData.address)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit address'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Primary Warehouse</div>
                  {editingField === 'warehouse' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.warehouse || formData.warehouse}
                        onChange={e => setTempValues({ ...tempValues, warehouse: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('warehouse')}
                        className="h-8 w-8 p-0"
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
                      <span className="flex-1">{formData.warehouse || 'Not set'}</span>
                      <button
                        onClick={() => handleEdit('warehouse', formData.warehouse)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit warehouse'}
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
      </div>
    </div>
  )
}
