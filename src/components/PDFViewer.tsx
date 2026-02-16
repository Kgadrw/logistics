import * as React from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import { cn } from '../lib/cn'

export function PDFViewer({ 
  pdfUrl, 
  open, 
  onClose,
  title = 'Document Viewer'
}: { 
  pdfUrl: string | null
  open: boolean
  onClose: () => void
  title?: string
}) {
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !pdfUrl) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-6xl h-full max-h-[95vh] bg-white rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </a>
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            className="w-full h-full border-0"
            title="PDF Viewer"
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>
    </div>
  )
}
