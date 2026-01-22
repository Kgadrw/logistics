import * as React from 'react'
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoginModal } from '../components/LoginModal'
import { Package, Shield, Warehouse } from 'lucide-react'
import type { Role } from '../lib/types'

export function RoleSwitch() {
  const [loginModalOpen, setLoginModalOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)

  const handleOpenLogin = (role: Role) => {
    setSelectedRole(role)
    setLoginModalOpen(true)
  }

  const handleCloseLogin = () => {
    setLoginModalOpen(false)
    setSelectedRole(null)
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="text-sm font-semibold text-brand-700">UZA Logistics</div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">Shipment Communication System</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Modern, responsive dashboards for Client, Warehouse, and Admin — optimized for clarity, real-time status visibility, and simple
              communication.
            </p>
          </div>
          <div className="hidden text-sm text-slate-600 sm:block">Light mode • Mobile-first • Minimal clutter</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
              <Package className="h-5 w-5 text-brand-600" />
            </CardHeader>
            <CardBody>
              <p className="text-sm text-slate-600">Create shipments, add products, track status, and receive notifications.</p>
              <div className="mt-4">
                <Button className="w-full" onClick={() => handleOpenLogin('client')}>
                  Login as Client
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Warehouse</CardTitle>
              <Warehouse className="h-5 w-5 text-brand-600" />
            </CardHeader>
            <CardBody>
              <p className="text-sm text-slate-600">Manage incoming shipments, confirm receipt, dispatch, and notify clients.</p>
              <div className="mt-4">
                <Button className="w-full" variant="secondary" onClick={() => handleOpenLogin('warehouse')}>
                  Login as Warehouse
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <Shield className="h-5 w-5 text-brand-600" />
            </CardHeader>
            <CardBody>
              <p className="text-sm text-slate-600">Set pricing rules, manage users, monitor shipments, and audit activity.</p>
              <div className="mt-4">
                <Button className="w-full" variant="ghost" onClick={() => handleOpenLogin('admin')}>
                  Login as Admin
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {selectedRole && (
        <LoginModal open={loginModalOpen} onClose={handleCloseLogin} role={selectedRole} />
      )}
    </div>
  )
}

