import * as React from 'react'
import { LoginModal } from '../components/LoginModal'

export function AdminLoginPage() {
  const [loginModalOpen, setLoginModalOpen] = React.useState(true)

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">UZA Logistics</h1>
          <p className="text-slate-600">Admin Portal</p>
        </div>
        <LoginModal 
          open={loginModalOpen} 
          onClose={() => setLoginModalOpen(false)} 
          role="admin" 
        />
      </div>
    </div>
  )
}
