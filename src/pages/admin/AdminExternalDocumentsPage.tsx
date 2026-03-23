import * as React from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, uploadAPI } from '../../lib/api'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { cn } from '../../lib/cn'

type ExternalDoc = {
  id: string
  createdAtIso: string
  companyName: string
  reference: string
  documentType: string
  notes: string
  folderPath: string
  documents: {
    documentUrl: string
    fileName: string
    mimeType: string
    uploadedAtIso: string
  }[]
}

const sanitizeFolderPart = (v: string) => v.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')

const toCSVCell = (value: any) => {
  const s = value === null || value === undefined ? '' : String(value)
  // Escape double-quotes for CSV
  const escaped = s.replace(/"/g, '""')
  return `"${escaped}"`
}

export function AdminExternalDocumentsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = React.useState(true)
  const [records, setRecords] = React.useState<ExternalDoc[]>([])

  const [companyName, setCompanyName] = React.useState('')
  const [reference, setReference] = React.useState('')
  const [documentType, setDocumentType] = React.useState('Shipment')
  const [notes, setNotes] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await adminAPI.getExternalDocuments()
        setRecords(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error(err)
        showToast(err.message || 'Failed to load external records', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const folderPath = React.useMemo(() => {
    if (!companyName.trim()) return 'external-docs'
    return `external-docs/${sanitizeFolderPart(companyName)}`
  }, [companyName])

  const handleAddFiles = (selected: FileList | null) => {
    if (!selected) return
    const next = Array.from(selected)
    setFiles(prev => [...prev, ...next])
  }

  const removeFileAt = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Created At',
      'Company',
      'Reference',
      'Document Type',
      'Folder',
      'Notes',
      'Documents Count',
      'Document URLs',
    ]

    const rows = records.map(r => [
      r.id,
      r.createdAtIso,
      r.companyName,
      r.reference,
      r.documentType,
      r.folderPath,
      r.notes,
      (r.documents || []).length,
      (r.documents || []).map(d => d.documentUrl).join(' | '),
    ])

    const csv = [headers.map(toCSVCell).join(','), ...rows.map(row => row.map(toCSVCell).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `external-documents-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  }

  const handleCreate = async () => {
    if (!companyName.trim()) {
      showToast('Company name is required', 'error')
      return
    }
    if (files.length === 0) {
      showToast('Please select at least one file', 'error')
      return
    }

    try {
      setUploading(true)

      // Upload files to Cloudinary using the same mechanism as shipments
      const uploadedDocuments = await Promise.all(
        files.map(async file => {
          const documentUrl = await uploadAPI.uploadDocument(file, folderPath)
          return {
            documentUrl,
            fileName: file.name,
            mimeType: file.type,
            uploadedAtIso: new Date().toISOString(),
          }
        })
      )

      const payload = {
        companyName: companyName.trim(),
        reference: reference.trim(),
        documentType,
        notes: notes.trim(),
        folderPath,
        documents: uploadedDocuments,
      }

      await adminAPI.createExternalDocument(payload)

      showToast('External record saved', 'success')
      setCompanyName('')
      setReference('')
      setDocumentType('Shipment')
      setNotes('')
      setFiles([])

      // Reload records
      const data = await adminAPI.getExternalDocuments()
      setRecords(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to save external record', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">External Documents (Excel)</div>
        <div className="mt-1 text-sm text-slate-600">
          Record documents/shipments provided outside the system. Upload files and export the log to a spreadsheet.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Records
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={exportToCSV} disabled={records.length === 0}>
                Export to Excel (.csv)
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <Table>
                <THead>
                  <TR>
                    <TH>Company</TH>
                    <TH>Reference</TH>
                    <TH>Type</TH>
                    <TH className="text-right">Docs</TH>
                    <TH>Created</TH>
                  </TR>
                </THead>
                <TBody>
                  {loading ? (
                    <TR>
                      <TD colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                        Loading...
                      </TD>
                    </TR>
                  ) : records.length === 0 ? (
                    <TR>
                      <TD colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                        No external records yet.
                      </TD>
                    </TR>
                  ) : (
                    records.map(r => (
                      <TR key={r.id} className="cursor-pointer" onClick={() => navigate(`/admin/external-docs?rid=${r.id}`)}>
                        <TD className="font-semibold text-slate-900 whitespace-nowrap">{r.companyName}</TD>
                        <TD className="whitespace-nowrap">{r.reference || '-'}</TD>
                        <TD className="whitespace-nowrap">{r.documentType || '-'}</TD>
                        <TD className="text-right font-semibold text-slate-900 whitespace-nowrap">{(r.documents || []).length}</TD>
                        <TD className="whitespace-nowrap text-slate-600">{r.createdAtIso ? r.createdAtIso.slice(0, 10) : '-'}</TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Create new record
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Company name *</div>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. ACME Trading Ltd" />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">External reference (optional)</div>
                <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Shipment # / Invoice # / BL #" />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Document type</div>
                <Select value={documentType} onChange={e => setDocumentType(e.target.value)}>
                  <option value="Shipment">Shipment</option>
                  <option value="Invoice">Invoice</option>
                  <option value="BL">BL</option>
                  <option value="Packing List">Packing List</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Folder path (auto)</div>
                <Input value={folderPath} disabled className="bg-slate-50" />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Upload files *</div>
                <label className="flex flex-col gap-2">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,application/pdf,.jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={e => handleAddFiles(e.target.files)}
                    disabled={uploading}
                  />
                  <div className={cn(
                    'flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors',
                    uploading && 'opacity-60 cursor-not-allowed'
                  )}
                  >
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <div className="text-sm font-medium text-slate-600">{uploading ? 'Uploading...' : 'Click to upload'}</div>
                    <div className="text-xs text-slate-500 mt-1">Saved into: {folderPath}</div>
                  </div>
                </label>

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((f, idx) => (
                      <div key={`${f.name}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">{f.name}</div>
                          <div className="text-[11px] text-slate-500">{Math.round(f.size / 1024)} KB</div>
                        </div>
                        <button type="button" onClick={() => removeFileAt(idx)} className="text-red-600 hover:text-red-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Notes (optional)</div>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any details about the external shipment/documents" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => {
                  setCompanyName('')
                  setReference('')
                  setDocumentType('Shipment')
                  setNotes('')
                  setFiles([])
                }}>
                  Clear
                </Button>
                <Button onClick={handleCreate} disabled={uploading}>
                  {uploading ? 'Saving...' : 'Save record'}
                </Button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-600">Tip</div>
                <div className="mt-1 text-xs text-slate-600">
                  Upload the documents you receive outside UZA Logistics. We’ll save them in Cloud storage under the folder shown above, and record their URLs here.
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

