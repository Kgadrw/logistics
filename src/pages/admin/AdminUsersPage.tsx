import * as React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { adminAPI } from '../../lib/api'
import type { Role, User } from '../../lib/types'
import { Building, Mail, Lock, MapPin, Package, User as UserIcon, Phone, Trash2, Power } from 'lucide-react'

export function AdminUsersPage({ focus }: { focus: Extract<Role, 'client' | 'warehouse'> }) {

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    ...(focus === 'warehouse' ? {
      location: '',
      capacity: '',
      manager: '',
      contact: '',
    } : {
      phone: '',
      address: '',
      company: '',
    }),
  })
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [backendUsers, setBackendUsers] = React.useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [confirmModal, setConfirmModal] = React.useState<{
    open: boolean
    type: 'deactivate' | 'activate' | 'delete' | null
    user: User | null
  }>({ open: false, type: null, user: null })

  // Fetch users from backend
  const fetchUsers = React.useCallback(async () => {
    setIsLoadingUsers(true)
    try {
      const data = await adminAPI.getUsers(focus)
      setBackendUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }, [focus])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Use only backend users (no local store users)
  const allUsers = React.useMemo(() => {
    return backendUsers
  }, [backendUsers])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.password.trim()) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    setError('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await adminAPI.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: focus,
        ...(focus === 'warehouse' ? {
          location: (formData as any).location,
          capacity: (formData as any).capacity,
          manager: (formData as any).manager,
          contact: (formData as any).contact,
        } : {
          phone: (formData as any).phone,
          address: (formData as any).address,
          company: (formData as any).company,
        }),
      })

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        ...(focus === 'warehouse' ? {
          location: '',
          capacity: '',
          manager: '',
          contact: '',
        } : {
          phone: '',
          address: '',
          company: '',
        }),
      })

      // Hide form after successful creation
      setShowForm(false)

      // Refresh users list
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleUser = async (user: User) => {
    setConfirmModal({
      open: true,
      type: user.active ? 'deactivate' : 'activate',
      user,
    })
  }

  const handleDeleteUser = async (user: User) => {
    setConfirmModal({
      open: true,
      type: 'delete',
      user,
    })
  }

  const confirmAction = async () => {
    if (!confirmModal.user || !confirmModal.type) return

    const { user, type } = confirmModal
    setActionLoading(user.id)
    setError('')

    try {
      if (type === 'delete') {
        await adminAPI.deleteUser(user.id)
      } else {
        await adminAPI.updateUser(user.id, {
          active: type === 'activate',
        })
      }

      setConfirmModal({ open: false, type: null, user: null })
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || `Failed to ${type} user. Please try again.`)
      setActionLoading(null)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">{focus === 'warehouse' ? 'Warehouses' : 'Clients'}</div>
        <div className="mt-1 text-sm text-slate-600">Create accounts and activate/deactivate users.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5 order-1 lg:order-1">
          <CardHeader>
            <CardTitle>Create {focus} account</CardTitle>
          </CardHeader>
          <CardBody>
            {!showForm ? (
              <div className="space-y-4">
                <div className="text-sm text-slate-600">
                  Create a new {focus === 'warehouse' ? 'warehouse' : 'client'} account to manage shipments and logistics.
                </div>
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1.5">Name <span className="text-red-500">*</span></div>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder={focus === 'warehouse' ? 'Main Warehouse' : 'John Doe'}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1.5">Email <span className="text-red-500">*</span></div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="warehouse@example.com"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1.5">Password <span className="text-red-500">*</span></div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder="Min. 6 characters"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {focus === 'warehouse' ? (
                  <>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">Location</div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={(formData as any).location}
                          onChange={e => handleChange('location', e.target.value)}
                          placeholder="New York, NY"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">Capacity</div>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={(formData as any).capacity}
                          onChange={e => handleChange('capacity', e.target.value)}
                          placeholder="10000 sq ft"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">Manager</div>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={(formData as any).manager}
                          onChange={e => handleChange('manager', e.target.value)}
                          placeholder="Jane Smith"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">Contact</div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={(formData as any).contact}
                          onChange={e => handleChange('contact', e.target.value)}
                          placeholder="+1234567890"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">Phone</div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={(formData as any).phone}
                          onChange={e => handleChange('phone', e.target.value)}
                          placeholder="+1234567890"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">Address</div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={(formData as any).address}
                          onChange={e => handleChange('address', e.target.value)}
                          placeholder="123 Main St, City"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">Company</div>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={(formData as any).company}
                          onChange={e => handleChange('company', e.target.value)}
                          placeholder="ABC Corp"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false)
                      setError('')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Creating...' : `Create ${focus} account`}
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-7 overflow-hidden order-2 lg:order-1">
          <CardHeader>
            <CardTitle>User management</CardTitle>
            <div className="text-xs text-slate-500">
              {isLoadingUsers ? 'Loading...' : `${allUsers.length} ${allUsers.length === 1 ? 'user' : 'users'}`}
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Email</TH>
                    <TH>Role</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {allUsers.map(u => (
                    <TR key={u.id}>
                      <TD className="whitespace-nowrap font-semibold text-slate-900">{u.name}</TD>
                      <TD className="whitespace-nowrap text-slate-600 text-sm">{(u as any).email || '-'}</TD>
                      <TD className="whitespace-nowrap capitalize text-slate-700">{u.role}</TD>
                      <TD className="whitespace-nowrap">
                        <span
                          className={[
                            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                            u.active ? 'bg-white text-green-800 ring-green-200' : 'bg-red-50 text-red-800 ring-red-200',
                          ].join(' ')}
                        >
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </TD>
                      <TD className="text-right ">
                      <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleToggleUser(u)}
                            disabled={actionLoading === u.id}
                            className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                          >
                            <Power className="h-3.5 w-3.5 mr-1" />
                            {u.active ? 'Deactivate' : 'Activate'}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(u)}
                            disabled={actionLoading === u.id}
                            className="bg-white text-red-600 ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                      </TD>
                    </TR>
                  ))}
                  {allUsers.length === 0 && !isLoadingUsers ? (
                    <TR>
                      <TD colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                        No users yet. Create one to get started.
                      </TD>
                    </TR>
                  ) : null}
                </TBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={confirmModal.open}
        title={
          confirmModal.type === 'delete'
            ? 'Delete User'
            : confirmModal.type === 'deactivate'
            ? 'Deactivate User'
            : 'Activate User'
        }
        description={
          confirmModal.user && confirmModal.type === 'delete'
            ? `Are you sure you want to permanently delete ${confirmModal.user.name}? This action cannot be undone.`
            : confirmModal.user && confirmModal.type === 'deactivate'
            ? `Are you sure you want to deactivate ${confirmModal.user.name}? They will not be able to access their account.`
            : confirmModal.user
            ? `Are you sure you want to activate ${confirmModal.user.name}? They will be able to access their account.`
            : ''
        }
        onClose={() => setConfirmModal({ open: false, type: null, user: null })}
        footer={
          <div className="flex gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setConfirmModal({ open: false, type: null, user: null })}
              disabled={!!actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmModal.type === 'delete' ? 'primary' : 'primary'}
              onClick={confirmAction}
              disabled={!!actionLoading}
              className={confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {actionLoading ? 'Processing...' : confirmModal.type === 'delete' ? 'Delete' : confirmModal.type === 'deactivate' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        }
      >
        <div></div>
      </Modal>
    </div>
  )
}
