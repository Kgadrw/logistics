import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/authContext'

type ProtectedRouteProps = {
  children: React.ReactNode
  requiredRole?: 'client' | 'warehouse' | 'admin'
}

function getLoginPath(role?: 'client' | 'warehouse' | 'admin'): string {
  switch (role) {
    case 'client':
      return '/client/login'
    case 'warehouse':
      return '/warehouse/login'
    case 'admin':
      return '/admin/login'
    default:
      return '/client/login'
  }
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // If not authenticated, redirect to appropriate login page
  if (!isAuthenticated) {
    const loginPath = getLoginPath(requiredRole)
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  // If role is required and doesn't match, redirect to appropriate login page
  if (requiredRole && user?.role !== requiredRole) {
    const loginPath = getLoginPath(requiredRole)
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  return <>{children}</>
}
