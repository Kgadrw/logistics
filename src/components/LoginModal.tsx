import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import type { Role } from '../lib/types'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../lib/authContext'

type LoginModalProps = {
  open: boolean
  onClose: () => void
  role: Role
  onShowRegistration?: () => void
}

const roleConfig = {
  client: {
    route: '/client',
    title: 'Client Login',
  },
  warehouse: {
    route: '/warehouse',
    title: 'Warehouse Login',
  },
  admin: {
    route: '/admin',
    title: 'Admin Login',
  },
}

export function LoginModal({ open, onClose, role, onShowRegistration }: LoginModalProps) {
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
      title={config.title}
      description=""
      className="max-w-sm rounded-none"
      hideCloseButton={true}
      footer={
        <div className="space-y-3">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            type="submit" 
            form="login-form"
            className="w-full"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          {role === 'client' && onShowRegistration && (
            <div className="text-center">
              <button
                type="button"
                onClick={onShowRegistration}
                className="text-sm text-slate-600 hover:text-slate-900 underline"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      }
    >
      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 p-3">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="pl-10 h-11 rounded-none"
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="pl-10 h-11 rounded-none"
              disabled={isLoading}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
