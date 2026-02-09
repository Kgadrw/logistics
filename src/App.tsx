import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientDashboard } from './pages/client/ClientDashboard'
import { WarehouseDashboard } from './pages/warehouse/WarehouseDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ClientLoginPage } from './pages/ClientLoginPage'
import { WarehouseLoginPage } from './pages/WarehouseLoginPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/client/login" replace />} />
      <Route path="/client/login" element={<ClientLoginPage />} />
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
      <Route path="*" element={<Navigate to="/client/login" replace />} />
    </Routes>
  )
}

