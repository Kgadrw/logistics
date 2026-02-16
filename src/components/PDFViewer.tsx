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
  const [loading, setLoading] = React.useState(true)
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)
  const objectRef = React.useRef<HTMLObjectElement>(null)

  React.useEffect(() => {
    if (!open) {
      setPdfError(false)
      setLoading(true)
      return
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Fetch PDF as blob to ensure proper content-type
  React.useEffect(() => {
    if (!open || !pdfUrl) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
      }
      return
    }

    setLoading(true)
    setPdfError(false)

    // Fetch PDF as blob to ensure proper content-type handling
    fetch(pdfUrl)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch PDF')
        return response.blob()
      })
      .then(blob => {
        // Verify it's a PDF
        if (blob.type === 'application/pdf' || pdfUrl.toLowerCase().endsWith('.pdf')) {
          const url = URL.createObjectURL(blob)
          setBlobUrl(url)
          setLoading(false)
        } else {
          throw new Error('File is not a PDF')
        }
      })
      .catch(error => {
        console.error('Error loading PDF:', error)
        setPdfError(true)
        setLoading(false)
      })

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [open, pdfUrl])

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
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <div className="text-sm text-slate-600">Loading PDF...</div>
            </div>
          ) : pdfError ? (
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
          ) : blobUrl ? (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              title="PDF Viewer"
              style={{ minHeight: '600px' }}
              onError={() => {
                // Fallback to object/embed if iframe fails
                setPdfError(false)
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
