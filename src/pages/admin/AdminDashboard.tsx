import * as React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { Bell, Building2, Coins, LayoutDashboard, LogOut, MapPinned, Settings, Shield, Truck, Users } from 'lucide-react'
import { Sidebar } from '../../components/Sidebar'
import { MobileMenuButton } from '../../components/MobileMenuButton'
import { NotificationPanel } from '../../components/NotificationPanel'
import { LogoutConfirmationModal } from '../../components/LogoutConfirmationModal'
import { useAuth } from '../../lib/authContext'
import { AdminOverviewPage } from './AdminOverviewPage'
import { AdminShipmentsPage } from './AdminShipmentsPage'
import { AdminPricingPage } from './AdminPricingPage'
import { AdminUsersPage } from './AdminUsersPage'
import { AdminSettingsPage } from './AdminSettingsPage'
import { AdminProfilePage } from './AdminProfilePage'
import { AdminShipmentDetailPage } from './AdminShipmentDetailPage'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  React.useEffect(() => {
    if (showNotifications) {
      navigate('/admin/notifications')
      setShowNotifications(false)
    }
  }, [showNotifications, navigate])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-50 overflow-x-hidden">
      <MobileMenuButton />
      <div className="flex flex-1 w-full overflow-hidden relative overflow-x-hidden">
        <Sidebar
          title="Admin"
          role="admin"
          onOpenNotifications={() => setShowNotifications(true)}
          items={[
            { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
            { to: '/admin/shipments', label: 'Shipments', icon: <Truck className="h-4 w-4" /> },
            { to: '/admin/pricing', label: 'Pricing', icon: <Coins className="h-4 w-4" /> },
            { to: '/admin/warehouses', label: 'Warehouses', icon: <Building2 className="h-4 w-4" /> },
            { to: '/admin/clients', label: 'Clients', icon: <Users className="h-4 w-4" /> },
            { to: '/admin/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
            { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
          ]}
          exitItem={{ to: '/admin/login', label: 'Exit', icon: <LogOut className="h-4 w-4" /> }}
          onLogout={() => setShowLogoutModal(true)}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-4 py-6 pt-16 pb-20 sm:pt-6 sm:pb-6">
            <Routes>
              <Route path="/" element={<AdminOverviewPage />} />
              <Route path="/shipments" element={<AdminShipmentsPage />} />
              <Route path="/shipment/:id" element={<AdminShipmentDetailPage />} />
              <Route path="/pricing" element={<AdminPricingPage />} />
              <Route path="/warehouses" element={<AdminUsersPage focus="warehouse" />} />
              <Route path="/clients" element={<AdminUsersPage focus="client" />} />
              <Route path="/settings" element={<AdminSettingsPage />} />
              <Route
                path="/notifications"
                element={
                  <div className="pt-4">
                    <NotificationPanel role="admin" />
                  </div>
                }
              />
              <Route
                path="/map"
                element={
                  <div className="pt-4">
                    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <MapPinned className="h-4 w-4 text-brand-600" />
                        Shipment monitoring map (placeholder)
                      </div>
                      <div className="mt-2 text-sm text-slate-600">For this UI prototype we show a list-based monitor on the Shipments page.</div>
                    </div>
                  </div>
                }
              />
              <Route path="/profile" element={<AdminProfilePage />} />
            </Routes>
          </div>
        </main>
      </div>
      <LogoutConfirmationModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  )
}

