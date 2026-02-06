import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientDashboard } from './pages/client/ClientDashboard'
import { WarehouseDashboard } from './pages/warehouse/WarehouseDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { RoleSwitch } from './pages/RoleSwitch'
import { WarehouseLoginPage } from './pages/WarehouseLoginPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSwitch />} />
      <Route path="/warehouse/login" element={<WarehouseLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/client/*"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/*"
        element={
          <ProtectedRoute requiredRole="warehouse">
            <WarehouseDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

