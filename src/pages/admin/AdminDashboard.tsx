import * as React from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { Bell, Building2, Coins, FileText, LayoutDashboard, LogOut, MapPinned, Settings, Truck, Users } from 'lucide-react'
import { MobileMenuButton } from '../../components/MobileMenuButton'
import { NotificationPanel } from '../../components/NotificationPanel'
import { LogoutConfirmationModal } from '../../components/LogoutConfirmationModal'
import { useAuth } from '../../lib/authContext'
import { cn } from '../../lib/cn'
import { AdminOverviewPage } from './AdminOverviewPage'
import { AdminShipmentsPage } from './AdminShipmentsPage'
import { AdminPricingPage } from './AdminPricingPage'
import { AdminUsersPage } from './AdminUsersPage'
import { AdminSettingsPage } from './AdminSettingsPage'
import { AdminProfilePage } from './AdminProfilePage'
import { AdminShipmentDetailPage } from './AdminShipmentDetailPage'
import { AdminExternalDocumentsPage } from './AdminExternalDocumentsPage'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-50 overflow-x-hidden">
      <MobileMenuButton />
      <div className="flex flex-1 flex-col w-full overflow-hidden relative overflow-x-hidden">
        <header className="hidden sm:block bg-blue-900 border-b border-blue-800">
          <div className="mx-auto w-full max-w-full px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <img
                  src="/logo.png"
                  alt="UZA Logistics"
                    className="h-8 w-8 rounded-lg object-contain"
                />
                <div className="text-blue-100 text-xs font-semibold">( admin )</div>
              </div>
              <nav className="flex items-center gap-1.5">
                {[
                  { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
                  { to: '/admin/shipments', label: 'Shipments', icon: <Truck className="h-4 w-4" /> },
                  { to: '/admin/pricing', label: 'Pricing', icon: <Coins className="h-4 w-4" /> },
                  { to: '/admin/warehouses', label: 'Warehouses', icon: <Building2 className="h-4 w-4" /> },
                  { to: '/admin/clients', label: 'Clients', icon: <Users className="h-4 w-4" /> },
                  { to: '/admin/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
                  { to: '/admin/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
                  { to: '/admin/external-docs', label: 'External Docs', icon: <FileText className="h-4 w-4" /> },
                ].map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-800/70 text-white'
                          : 'text-blue-100 hover:bg-blue-800/40 active:bg-blue-800/50'
                      )
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-800/40 active:bg-blue-800/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden overflow-x-hidden w-full max-w-full">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-0 py-0 pt-0 pb-[72px] sm:px-4 sm:py-6 sm:pt-6 sm:pb-6 w-full max-w-full mx-auto">
            <Routes>
              <Route path="/" element={<AdminOverviewPage />} />
              <Route path="/shipments" element={<AdminShipmentsPage />} />
              <Route path="/shipment/:id" element={<AdminShipmentDetailPage />} />
              <Route path="/shipping-page/:id" element={<AdminShipmentDetailPage />} />
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
              <Route path="/external-docs" element={<AdminExternalDocumentsPage />} />
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

