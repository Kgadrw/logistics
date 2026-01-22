import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Input'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { useStore } from '../../lib/store'
import { cn } from '../../lib/cn'

export function WarehouseIncomingPage() {
  const navigate = useNavigate()
  const { shipments, warehouseMarkReceived } = useStore()
  const incoming = React.useMemo(() => shipments.filter(s => s.status === 'Submitted'), [shipments])

  const [selectedId, setSelectedId] = React.useState<string | null>(incoming[0]?.id ?? null)
  const selected = incoming.find(s => s.id === selectedId) ?? incoming[0]

  const [remarks, setRemarks] = React.useState('')

  React.useEffect(() => {
    if (selected?.id) setRemarks(selected.warehouseRemarks ?? '')
  }, [selected?.id])

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Incoming Shipments</div>
        <div className="mt-1 text-sm text-slate-600">Confirm receipt quickly — clients get notified automatically.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7 overflow-hidden">
          <CardHeader>
            <CardTitle>Incoming table</CardTitle>
            <div className="text-xs text-slate-500">{incoming.length} awaiting receipt</div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Client</TH>
                    <TH>Shipment ID</TH>
                    <TH>Products</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Action</TH>
                  </TR>
                </THead>
                <TBody>
                  {incoming.map(s => (
                    <TR
                      key={s.id}
                      className={cn(
                        selected?.id === s.id ? 'bg-slate-50/70' : undefined,
                        'cursor-pointer hover:bg-slate-50 transition-colors'
                      )}
                      onClick={(e) => {
                        // Only navigate if clicking on the row, not the button
                        if ((e.target as HTMLElement).closest('button')) return
                        navigate(`/warehouse/shipment/${s.id}`)
                      }}
                    >
                      <TD className="whitespace-nowrap">
                        <button
                          className="font-semibold text-slate-900 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedId(s.id)
                          }}
                        >
                          {s.clientName}
                        </button>
                      </TD>
                      <TD className="whitespace-nowrap">{s.id}</TD>
                      <TD className="min-w-64">
                        <div className="text-slate-700">
                          {s.products.slice(0, 2).map(p => p.name).join(', ')}
                          {s.products.length > 2 ? ` +${s.products.length - 2} more` : ''}
                        </div>
                      </TD>
                      <TD>
                        <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                      </TD>
                      <TD className="text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            warehouseMarkReceived(s.id, s.id === selected?.id ? remarks.trim() : undefined)
                          }}
                        >
                          Mark as Received
                        </Button>
                      </TD>
                    </TR>
                  ))}
                  {incoming.length === 0 ? (
                    <TR>
                      <TD colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                        No incoming shipments right now.
                      </TD>
                    </TR>
                  ) : null}
                </TBody>
              </Table>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Shipment detail</CardTitle>
            {selected ? <Badge tone={statusTone(selected.status)}>{selected.status}</Badge> : null}
          </CardHeader>
          <CardBody>
            {!selected ? (
              <div className="text-sm text-slate-600">Select a shipment to view details.</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600">Full product breakdown</div>
                  <div className="mt-2 space-y-2">
                    {selected.products.map(p => (
                      <div key={p.id} className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                          <div className="text-sm text-slate-600">
                            Qty {p.quantity} • {p.weightKg}kg • {p.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.notes ? (
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Client notes</div>
                    <div className="mt-1 text-sm text-slate-700">{selected.notes}</div>
                  </div>
                ) : null}

                <div>
                  <div className="text-xs font-semibold text-slate-600">Warehouse remarks</div>
                  <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Condition, packaging, discrepancies..." />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button variant="secondary" onClick={() => setRemarks('')}>
                    Clear
                  </Button>
                  <Button onClick={() => warehouseMarkReceived(selected.id, remarks.trim() ? remarks.trim() : undefined)}>Confirm Received</Button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-600">Auto-notification</div>
                  <div className="mt-1 text-sm text-slate-600">
                    On receipt confirmation, the client and admin are notified: “Your shipment #{selected.id} has been received by {selected.warehouseName}”.
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

