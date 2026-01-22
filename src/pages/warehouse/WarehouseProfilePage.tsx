import * as React from 'react'
import { Building2, Check, Mail, MapPin, Pencil, Phone, User, X } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function WarehouseProfilePage() {
  const [formData, setFormData] = React.useState({
    warehouseName: 'Warehouse A',
    managerName: 'Sarah Johnson',
    email: 'sarah.johnson@warehousea.com',
    phone: '+1 (555) 987-6543',
    address: '456 Industrial Blvd, Los Angeles, CA 90001',
    capacity: '50,000 sq ft',
    operatingHours: 'Mon-Fri: 6:00 AM - 10:00 PM',
  })
  const [editingField, setEditingField] = React.useState<string | null>(null)
  const [tempValues, setTempValues] = React.useState<Record<string, string>>({})

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setTempValues({ ...tempValues, [field]: currentValue })
  }

  const handleSave = (field: string) => {
    setFormData(d => ({ ...d, [field]: tempValues[field] }))
    setEditingField(null)
    // In a real app, save to backend here
  }

  const handleCancel = () => {
    setEditingField(null)
    setTempValues({})
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Warehouse Profile</div>
      </div>

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
                      <span>{formData.address}</span>
                      <button
                        onClick={() => handleEdit('address', formData.address)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
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
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Operating Hours</div>
                  {editingField === 'operatingHours' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempValues.operatingHours || formData.operatingHours}
                        onChange={e => setTempValues({ ...tempValues, operatingHours: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave('operatingHours')}
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
                      <span>{formData.operatingHours}</span>
                      <button
                        onClick={() => handleEdit('operatingHours', formData.operatingHours)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
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
