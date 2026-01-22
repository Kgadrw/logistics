import * as React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Package, User } from 'lucide-react'
import { Sidebar } from '../../components/Sidebar'
import { NotificationPanel } from '../../components/NotificationPanel'
import { ClientShipmentsPage } from './ClientShipmentsPage'
import { ClientProfilePage } from './ClientProfilePage'
import { ClientShipmentDetailPage } from './ClientShipmentDetailPage'

export function ClientDashboard() {
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = React.useState(false)

  React.useEffect(() => {
    if (showNotifications) {
      navigate('/client/notifications')
      setShowNotifications(false)
    }
  }, [showNotifications, navigate])

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar
          title="Client"
          role="client"
          onOpenNotifications={() => setShowNotifications(true)}
          items={[
            { to: '/client', label: 'Shipments', icon: <Package className="h-4 w-4" /> },
            { to: '/client/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
            { to: '/client/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
          ]}
          exitItem={{ to: '/', label: 'Exit', icon: <LogOut className="h-4 w-4" /> }}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<ClientShipmentsPage />} />
              <Route path="/shipment/:id" element={<ClientShipmentDetailPage />} />
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
    </div>
  )
}

