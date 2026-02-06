import * as React from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

type LogoutConfirmationModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutConfirmationModal({ open, onClose, onConfirm }: LogoutConfirmationModalProps) {
  return (
    <Modal
      open={open}
      title="Confirm Logout"
      description="Are you sure you want to logout? You will need to login again to access your dashboard."
      onClose={onClose}
      footer={
        <div className="flex gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Logout
          </Button>
        </div>
      }
    >
      <div></div>
    </Modal>
  )
}
