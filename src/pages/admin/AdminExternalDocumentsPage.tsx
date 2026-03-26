import * as React from 'react'
import { Eye, FileText, FolderOpen, Trash2, Upload, X } from 'lucide-react'
import { adminAPI, uploadAPI } from '../../lib/api'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { Select } from '../../components/ui/Select'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
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
  const { showToast } = useToast()

  const [loading, setLoading] = React.useState(true)
  const [records, setRecords] = React.useState<ExternalDoc[]>([])

  type Mode = 'create' | 'view' | 'edit'
  const [mode, setMode] = React.useState<Mode>('create')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const selected = React.useMemo(() => records.find(r => r.id === selectedId) || null, [records, selectedId])
  const [replaceDocuments, setReplaceDocuments] = React.useState(true)
  const [modalOpen, setModalOpen] = React.useState(false)

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

      const result = await adminAPI.createExternalDocument(payload)
      const createdId = result?.record?.id

      showToast('External record saved', 'success')

      // Reload records
      const data = await adminAPI.getExternalDocuments()
      setRecords(Array.isArray(data) ? data : [])

      if (createdId) {
        setSelectedId(createdId)
        setMode('view')
      } else {
        resetEditor()
      }
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to save external record', 'error')
    } finally {
      setUploading(false)
    }
  }

  const resetEditor = () => {
    setMode('create')
    setSelectedId(null)
    setCompanyName('')
    setReference('')
    setDocumentType('Shipment')
    setNotes('')
    setFiles([])
    setReplaceDocuments(true)
  }

  const syncEditorFromRecord = (r: ExternalDoc) => {
    setSelectedId(r.id)
    setCompanyName(r.companyName)
    setReference(r.reference || '')
    setDocumentType(r.documentType || 'Shipment')
    setNotes(r.notes || '')
    setFiles([])
    setReplaceDocuments(true)
  }

  const openRecordModal = (r: ExternalDoc, nextMode: Exclude<Mode, 'create'>) => {
    syncEditorFromRecord(r)
    setMode(nextMode)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this external record? This cannot be undone.')
    if (!ok) return
    try {
      await adminAPI.deleteExternalDocument(id)
      showToast('Record deleted', 'success')

      const data = await adminAPI.getExternalDocuments()
      setRecords(Array.isArray(data) ? data : [])
      resetEditor()
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to delete record', 'error')
    }
  }

  const handleSaveEdit = async () => {
    if (!selected) return
    if (!companyName.trim()) {
      showToast('Company name is required', 'error')
      return
    }

    try {
      setUploading(true)

      // Upload new documents only if admin selected new files
      const uploadedNewDocuments =
        files.length > 0
          ? await Promise.all(
              files.map(async file => {
                const documentUrl = await uploadAPI.uploadDocument(file, folderPath)
                return {
                  documentUrl,
                  fileName: file.name,
                  mimeType: file.type,
                  uploadedAtIso: new Date().toISOString(),
                }
              }),
            )
          : []

      if (replaceDocuments && uploadedNewDocuments.length === 0) {
        showToast('Select new files to replace documents', 'error')
        return
      }

      const payload: any = {
        companyName: companyName.trim(),
        reference: reference.trim(),
        documentType,
        notes: notes.trim(),
        folderPath,
        appendDocuments: !replaceDocuments,
      }

      // If there are new docs, send them. Otherwise (append mode), backend will keep existing.
      if (uploadedNewDocuments.length > 0) {
        payload.documents = uploadedNewDocuments
      }

      const result = await adminAPI.updateExternalDocument(selected.id, payload)
      const updatedId = result?.record?.id || selected.id

      showToast('External record updated', 'success')

      const data = await adminAPI.getExternalDocuments()
      setRecords(Array.isArray(data) ? data : [])

      setSelectedId(updatedId)
      setMode('view')
      setFiles([])
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to update record', 'error')
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

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Create new record
          </CardTitle>
          <div className="text-xs text-slate-500">
            This storage path is where uploaded external documents are kept.
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</div>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" disabled={uploading} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Reference</div>
              <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Reference (optional)" disabled={uploading} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Type</div>
              <Select value={documentType} onChange={e => setDocumentType(e.target.value)} disabled={uploading}>
                <option value="Shipment">Shipment</option>
                <option value="Invoice">Invoice</option>
                <option value="BL">BL</option>
                <option value="Packing List">Packing List</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2 xl:col-span-1">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</div>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" rows={2} disabled={uploading} />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <FolderOpen className="h-4 w-4 text-blue-700 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-blue-800">Document storage folder</div>
                <div className="mt-1 text-xs text-blue-700 break-all">{folderPath}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
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
                'flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors',
                uploading && 'opacity-60 cursor-not-allowed'
              )}>
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <div className="text-sm font-medium text-slate-600">{uploading ? 'Uploading...' : 'Click to upload'}</div>
                <div className="text-xs text-slate-500 mt-1">{folderPath}</div>
              </div>
            </label>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{f.name}</div>
                      <div className="text-[11px] text-slate-500">{Math.round(f.size / 1024)} KB</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFileAt(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              onClick={() => {
                resetEditor()
                setFiles([])
              }}
              disabled={uploading}
            >
              Clear
            </Button>
            <Button onClick={handleCreate} disabled={uploading}>
              {uploading ? 'Saving...' : 'Save record'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Records
            </CardTitle>
            <div className="flex items-center gap-2 sm:justify-end">
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
                    <TH className="hidden sm:table-cell">Reference</TH>
                    <TH className="hidden sm:table-cell">Type</TH>
                    <TH className="text-right">Docs</TH>
                    <TH className="hidden md:table-cell">Created</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TR key={`skeleton-${idx}`}>
                        <TD><Skeleton className="h-4 w-28" /></TD>
                        <TD className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TD>
                        <TD className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TD>
                        <TD className="text-right"><Skeleton className="ml-auto h-4 w-6" /></TD>
                        <TD className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TD>
                        <TD className="text-right"><Skeleton className="ml-auto h-8 w-24" /></TD>
                      </TR>
                    ))
                  ) : records.length === 0 ? (
                    <TR>
                      <TD colSpan={6} className="px-4 py-8 text-center text-sm text-slate-600">
                        No external records yet.
                      </TD>
                    </TR>
                  ) : (
                    records.map(r => (
                      <TR key={r.id}>
                        <TD className="font-semibold text-slate-900 whitespace-nowrap">{r.companyName}</TD>
                        <TD className="hidden sm:table-cell whitespace-nowrap">{r.reference || '-'}</TD>
                        <TD className="hidden sm:table-cell whitespace-nowrap">{r.documentType || '-'}</TD>
                        <TD className="text-right font-semibold text-slate-900 whitespace-nowrap">{(r.documents || []).length}</TD>
                        <TD className="hidden md:table-cell whitespace-nowrap text-slate-600">{r.createdAtIso ? r.createdAtIso.slice(0, 10) : '-'}</TD>
                        <TD className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRecordModal(r, 'view')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openRecordModal(r, 'edit')}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(r.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'edit' ? 'Edit external record' : 'View external record'}
        description={selected ? `${selected.companyName} • ${selected.id}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Company</div>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={mode === 'view' || uploading} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Reference</div>
                <Input value={reference} onChange={e => setReference(e.target.value)} disabled={mode === 'view' || uploading} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Type</div>
                <Select value={documentType} onChange={e => setDocumentType(e.target.value)} disabled={mode === 'view' || uploading}>
                  <option value="Shipment">Shipment</option>
                  <option value="Invoice">Invoice</option>
                  <option value="BL">BL</option>
                  <option value="Packing List">Packing List</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</div>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} disabled={mode === 'view' || uploading} />
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <FolderOpen className="h-4 w-4 text-blue-700 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-blue-800">Document storage folder</div>
                  <div className="mt-1 text-xs text-blue-700 break-all">{folderPath}</div>
                </div>
              </div>
            </div>

            {mode === 'edit' && (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={replaceDocuments}
                      onChange={e => setReplaceDocuments(e.target.checked)}
                      disabled={uploading}
                    />
                    Replace documents
                  </label>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Upload files (optional)</div>
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
                      'flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors',
                      uploading && 'opacity-60 cursor-not-allowed'
                    )}>
                      <Upload className="h-6 w-6 text-slate-400 mb-1" />
                      <div className="text-sm font-medium text-slate-600">{uploading ? 'Uploading...' : 'Click to upload'}</div>
                      <div className="text-xs text-slate-500 mt-1">{folderPath}</div>
                    </div>
                  </label>
                </div>
              </>
            )}

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Saved documents</div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <Table>
                  <THead>
                    <TR>
                      <TH>File</TH>
                      <TH className="hidden sm:table-cell">Uploaded</TH>
                      <TH className="text-right">Link</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {(selected.documents || []).length === 0 ? (
                      <TR>
                        <TD colSpan={3} className="px-4 py-6 text-center text-sm text-slate-600">
                          No documents
                        </TD>
                      </TR>
                    ) : (
                      (selected.documents || []).map((d, idx) => (
                        <TR key={`${d.documentUrl}-${idx}`}>
                          <TD className="whitespace-nowrap">{d.fileName || 'Document'}</TD>
                          <TD className="hidden sm:table-cell whitespace-nowrap text-slate-600">{d.uploadedAtIso ? d.uploadedAtIso.slice(0, 10) : '-'}</TD>
                          <TD className="text-right whitespace-nowrap">
                            <a
                              href={d.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline text-sm"
                            >
                              Open
                            </a>
                          </TD>
                        </TR>
                      ))
                    )}
                  </TBody>
                </Table>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={uploading}>
                Close
              </Button>
              {mode === 'view' ? (
                <Button onClick={() => setMode('edit')} disabled={uploading}>
                  Edit
                </Button>
              ) : (
                <Button onClick={handleSaveEdit} disabled={uploading}>
                  {uploading ? 'Saving...' : 'Save changes'}
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

