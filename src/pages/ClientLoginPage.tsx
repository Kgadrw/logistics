import * as React from 'react'
import { LoginModal } from '../components/LoginModal'
import { RegistrationModal } from '../components/RegistrationModal'

export function ClientLoginPage() {
  const [loginModalOpen, setLoginModalOpen] = React.useState(true)
  const [registrationModalOpen, setRegistrationModalOpen] = React.useState(false)

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">UZA Logistics</h1>
          <p className="text-slate-600">Client Portal</p>
        </div>
        <LoginModal 
          open={loginModalOpen && !registrationModalOpen} 
          onClose={() => setLoginModalOpen(false)} 
          role="client"
          onShowRegistration={() => {
            setLoginModalOpen(false)
            setRegistrationModalOpen(true)
          }}
        />
        <RegistrationModal 
          open={registrationModalOpen} 
          onClose={() => {
            setRegistrationModalOpen(false)
            setLoginModalOpen(true)
          }} 
        />
      </div>
    </div>
  )
}
