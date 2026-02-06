import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { cn } from '../lib/cn'
import { Package, Mail, Lock, User, Phone, MapPin, Building, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/authContext'

type RegistrationModalProps = {
  open: boolean
  onClose: () => void
}

export function RegistrationModal({ open, onClose }: RegistrationModalProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    company: '',
  })
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        company: '',
      })
      setError('')
    }
  }, [open])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return false
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!formData.password.trim()) {
      setError('Please enter a password')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Call backend API
      const response = await fetch('https://new-logistics.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          company: formData.company,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Save user data to auth context
      if (data.user) {
        login({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: 'client',
        })
      }

      // Success - navigate to client dashboard
      navigate('/client')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
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
            Already have an account? <button onClick={onClose} className="text-blue-600 hover:underline">Login</button>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading} 
              type="submit" 
              form="register-form"
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                'Creating Account...'
              ) : (
                <>
                  Create Account
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
            <div className={cn('rounded-2xl p-4 bg-blue-100 text-blue-600')}>
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">Client Portal</p>
            <p className="text-sm text-slate-600 mt-2">Sign up to start managing your shipments</p>
          </div>
        </div>

        <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 animate-in fade-in slide-in-from-top-2">
              <div className="text-sm font-medium text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
                className="pl-10 h-11"
                disabled={isLoading}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className="pl-10 h-11"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="pl-10 h-11"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  className="pl-10 h-11"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1234567890"
                className="pl-10 h-11"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-sm font-semibold text-slate-700">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, City, Country"
                className="pl-10 h-11"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="company" className="block text-sm font-semibold text-slate-700">
              Company Name
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="ABC Corp"
                className="pl-10 h-11"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="pt-2 sm:hidden">
            <div className="text-xs text-slate-500 text-center">
              Already have an account? <button onClick={onClose} className="text-blue-600 hover:underline">Login</button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
