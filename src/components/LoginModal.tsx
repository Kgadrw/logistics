import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { cn } from '../lib/cn'
import type { Role } from '../lib/types'
import { Package, Warehouse, Shield, Lock, Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/authContext'

type LoginModalProps = {
  open: boolean
  onClose: () => void
  role: Role
}

const roleConfig = {
  client: {
    title: 'Welcome Back',
    subtitle: 'Client Portal',
    description: 'Access your shipment dashboard and track your orders',
    icon: <Package className="h-5 w-5" />,
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100 text-blue-600',
    route: '/client',
    placeholder: {
      email: 'client@example.com',
      password: 'Enter your password',
    },
  },
  warehouse: {
    title: 'Welcome Back',
    subtitle: 'Warehouse Portal',
    description: 'Manage incoming and outgoing shipments efficiently',
    icon: <Warehouse className="h-5 w-5" />,
    gradient: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-100 text-orange-600',
    route: '/warehouse',
    placeholder: {
      email: 'warehouse@example.com',
      password: 'Enter your password',
    },
  },
  admin: {
    title: 'Welcome Back',
    subtitle: 'Admin Portal',
    description: 'System administration and comprehensive monitoring',
    icon: <Shield className="h-5 w-5" />,
    gradient: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100 text-purple-600',
    route: '/admin',
    placeholder: {
      email: 'admin@example.com',
      password: 'Enter your password',
    },
  },
}

export function LoginModal({ open, onClose, role }: LoginModalProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const config = roleConfig[role]

  React.useEffect(() => {
    if (open) {
      setEmail('')
      setPassword('')
      setError('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simple validation
    if (!email.trim()) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Please enter your password')
      setIsLoading(false)
      return
    }

    try {
      // Call backend API
      const response = await fetch('https://new-logistics.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Save user data to auth context
      if (data.user) {
        login({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        })
      }

      // Success - navigate to dashboard
      navigate(config.route)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      description=""
      className="max-w-md"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500 hidden sm:block">
            Enter your credentials to login
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading} 
              type="submit" 
              form="login-form"
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                'Logging in...'
              ) : (
                <>
                  Login
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div className={cn('rounded-2xl p-4', config.iconBg)}>
              {config.icon}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">{config.subtitle}</p>
            <p className="text-sm text-slate-600 mt-2">{config.description}</p>
          </div>
        </div>

        <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 animate-in fade-in slide-in-from-top-2">
              <div className="text-sm font-medium text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={config.placeholder.email}
                className="pl-10 h-11 transition-all focus:ring-2 focus:ring-brand-500"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={config.placeholder.password}
                className="pl-10 h-11 transition-all focus:ring-2 focus:ring-brand-500"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="pt-2 sm:hidden">
            <div className="text-xs text-slate-500 text-center">
              Enter your credentials to access your dashboard.
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
