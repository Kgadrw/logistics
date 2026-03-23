import * as React from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { Bell, ClipboardList, History, LayoutDashboard, LogOut, PackageCheck, Truck } from 'lucide-react'
import { MobileMenuButton } from '../../components/MobileMenuButton'
import { NotificationPanel } from '../../components/NotificationPanel'
import { LogoutConfirmationModal } from '../../components/LogoutConfirmationModal'
import { useAuth } from '../../lib/authContext'
import { cn } from '../../lib/cn'
import { WarehouseHomePage } from './WarehouseHomePage'
import { WarehouseIncomingPage } from './WarehouseIncomingPage'
import { WarehouseOutgoingPage } from './WarehouseOutgoingPage'
import { WarehouseHistoryPage } from './WarehouseHistoryPage'
import { WarehouseProfilePage } from './WarehouseProfilePage'
import { WarehouseShipmentDetailPage } from './WarehouseShipmentDetailPage'

export function WarehouseDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/warehouse/login')
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-50 overflow-x-hidden">
      <MobileMenuButton />
      <div className="flex flex-1 flex-col w-full overflow-hidden relative overflow-x-hidden">
        <header className="hidden sm:block bg-blue-900 border-b border-blue-800">
          <div className="mx-auto w-full max-w-full px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white text-sm font-semibold">Warehouse</div>
              <nav className="flex items-center gap-1.5">
                {[
                  { to: '/warehouse', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
                  { to: '/warehouse/incoming', label: 'Incoming Shipments', icon: <PackageCheck className="h-4 w-4" /> },
                  { to: '/warehouse/outgoing', label: 'Outgoing Shipments', icon: <Truck className="h-4 w-4" /> },
                  { to: '/warehouse/history', label: 'History', icon: <History className="h-4 w-4" /> },
                  { to: '/warehouse/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
                  { to: '/warehouse/profile', label: 'Profile', icon: <ClipboardList className="h-4 w-4" /> },
                ].map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/warehouse'}
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
              <Route path="/" element={<WarehouseHomePage />} />
              <Route path="/incoming" element={<WarehouseIncomingPage />} />
              <Route path="/outgoing" element={<WarehouseOutgoingPage />} />
              <Route path="/history" element={<WarehouseHistoryPage />} />
              <Route path="/shipment/:id" element={<WarehouseShipmentDetailPage />} />
              <Route
                path="/notifications"
                element={
                  <div className="pt-4">
                    <NotificationPanel role="warehouse" />
                  </div>
                }
              />
              <Route path="/profile" element={<WarehouseProfilePage />} />
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

