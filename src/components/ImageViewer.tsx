import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'

export function ImageViewer({ 
  imageUrl, 
  open, 
  onClose 
}: { 
  imageUrl: string | null
  open: boolean
  onClose: () => void
}) {
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !imageUrl) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button
        className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Full size view"
          className="max-w-full max-h-[95vh] object-contain rounded-lg"
        />
      </div>
    </div>
  )
}
