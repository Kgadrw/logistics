import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientDashboard } from './pages/client/ClientDashboard'
import { WarehouseDashboard } from './pages/warehouse/WarehouseDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { RoleSwitch } from './pages/RoleSwitch'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSwitch />} />
      <Route path="/client/*" element={<ClientDashboard />} />
      <Route path="/warehouse/*" element={<WarehouseDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

