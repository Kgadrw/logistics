import * as React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { Bell, History, LogOut, Package, User } from 'lucide-react'
import { Sidebar } from '../../components/Sidebar'
import { MobileMenuButton } from '../../components/MobileMenuButton'
import { NotificationPanel } from '../../components/NotificationPanel'
import { LogoutConfirmationModal } from '../../components/LogoutConfirmationModal'
import { useAuth } from '../../lib/authContext'
import { ClientShipmentsPage } from './ClientShipmentsPage'
import { ClientProfilePage } from './ClientProfilePage'
import { ClientShipmentDetailPage } from './ClientShipmentDetailPage'
import { ClientHistoryPage } from './ClientHistoryPage'

export function ClientDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  React.useEffect(() => {
    if (showNotifications) {
      navigate('/client/notifications')
      setShowNotifications(false)
    }
  }, [showNotifications, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <MobileMenuButton />
      <div className="flex flex-1 w-full overflow-hidden relative">
        <Sidebar
          title="Client"
          role="client"
          onOpenNotifications={() => setShowNotifications(true)}
          items={[
            { to: '/client', label: 'Shipments', icon: <Package className="h-4 w-4" /> },
            { to: '/client/history', label: 'History', icon: <History className="h-4 w-4" /> },
            { to: '/client/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
            { to: '/client/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
          ]}
          exitItem={{ to: '/', label: 'Exit', icon: <LogOut className="h-4 w-4" /> }}
          onLogout={() => setShowLogoutModal(true)}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-4 py-6 pt-16 sm:pt-6">
            <Routes>
              <Route path="/" element={<ClientShipmentsPage />} />
              <Route path="/shipment/:id" element={<ClientShipmentDetailPage />} />
              <Route path="/history" element={<ClientHistoryPage />} />
              <Route
                path="/notifications"
                element={
                  <div className="pt-4">
                    <NotificationPanel role="client" />
                  </div>
                }
              />
              <Route path="/profile" element={<ClientProfilePage />} />
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

