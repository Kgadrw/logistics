import * as React from 'react'
import { Check, Mail, Phone, Pencil, Shield, User, X } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { adminAPI } from '../../lib/api'
import { useAuth } from '../../lib/authContext'

export function AdminProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: 'System Administrator',
  })
  const [editingField, setEditingField] = React.useState<string | null>(null)
  const [tempValues, setTempValues] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const profile = await adminAPI.getProfile()
        
        setFormData({
          name: profile.name || user?.name || 'Admin User',
          email: profile.email || user?.email || '',
          phone: profile.phone || '',
          role: 'System Administrator',
        })
      } catch (err: any) {
        if (err.is404 || err.status === 404 || err.message?.includes('404') || err.message?.includes('not found')) {
          setError(null)
          setFormData({
            name: user?.name || 'Admin User',
            email: user?.email || '',
            phone: '',
            role: 'System Administrator',
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

      const updateData: any = {}
      const valueToSave = tempValues[field]?.trim() || ''
      updateData[field] = valueToSave

      const result = await adminAPI.updateProfile(updateData)
      
      if (result?.user) {
        setFormData({
          name: result.user.name || formData.name,
          email: result.user.email || formData.email,
          phone: result.user.phone || formData.phone,
          role: 'System Administrator',
        })
      } else {
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
          <div className="text-sm font-semibold text-slate-900">Admin Profile</div>
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
        <div className="text-sm font-semibold text-slate-900">Admin Profile</div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle>Administrator Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="h-16 w-16 rounded-full bg-slate-800 text-white grid place-items-center text-xl font-semibold">
                  {formData.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{formData.name}</div>
                  <div className="text-sm text-slate-600">{formData.role}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Full Name</div>
                  {editingField === 'name' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.name || formData.name}
                        onChange={e => setTempValues({ ...tempValues, name: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('name')}
                        className="h-8 w-8 p-0"
                        disabled={saving === 'name'}
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
                      <span>{formData.name}</span>
                      <button
                        onClick={() => handleEdit('name', formData.name)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        disabled={!user}
                        title={!user ? 'Please log in to edit' : 'Edit name'}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Role</div>
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <span>{formData.role}</span>
                  </div>
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
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-600 mb-2">Permissions</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Full system access
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Pricing management
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    User management
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Shipment monitoring
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Audit log access
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
