import * as React from 'react'
import { X, Download, ExternalLink, FileText } from 'lucide-react'
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
  const [pdfError, setPdfError] = React.useState(false)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    if (!open) {
      setPdfError(false)
      return
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  React.useEffect(() => {
    setPdfError(false)
  }, [pdfUrl])

  if (!open || !pdfUrl) return null

  // Ensure PDF URL is properly formatted for viewing
  // Cloudinary raw resources are already PDFs, so use as-is
  const pdfViewerUrl = pdfUrl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-6xl h-full max-h-[95vh] bg-white rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
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
        <div className="flex-1 overflow-hidden bg-slate-100 relative">
          {pdfError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50">
              <FileText className="h-16 w-16 text-slate-400 mb-4" />
              <div className="text-sm font-semibold text-slate-900 mb-2">Unable to display PDF in browser</div>
              <div className="text-xs text-slate-600 mb-4 text-center">
                The PDF document may need to be opened in a new tab or downloaded.
              </div>
              <div className="flex gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </a>
                <a
                  href={pdfUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={`${pdfViewerUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              title="PDF Viewer"
              style={{ minHeight: '600px' }}
              onError={() => setPdfError(true)}
              onLoad={() => {
                // Check if iframe loaded successfully
                try {
                  const iframe = iframeRef.current
                  if (iframe && iframe.contentWindow) {
                    // If we can access contentWindow, PDF likely loaded
                    setPdfError(false)
                  }
                } catch (e) {
                  // Cross-origin or other error - PDF might still be loading
                  // Don't set error immediately
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
