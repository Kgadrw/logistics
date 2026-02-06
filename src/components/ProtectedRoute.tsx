import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/authContext'

type ProtectedRouteProps = {
  children: React.ReactNode
  requiredRole?: 'client' | 'warehouse' | 'admin'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  // If role is required and doesn't match, redirect to home
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <>{children}</>
}
