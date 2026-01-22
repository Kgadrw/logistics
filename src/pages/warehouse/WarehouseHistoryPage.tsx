import { useNavigate } from 'react-router-dom'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { useStore } from '../../lib/store'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/cn'

export function WarehouseHistoryPage() {
  const navigate = useNavigate()
  const { shipments } = useStore()
  const history = shipments.filter(s => s.status === 'Delivered' || s.status === 'In Transit' || s.status === 'Left Warehouse')

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">History</div>
        <div className="mt-1 text-sm text-slate-600">Recently dispatched and delivered shipments.</div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Shipment history</CardTitle>
          <div className="text-xs text-slate-500">{history.length} records</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Shipment</TH>
                  <TH>Client</TH>
                  <TH>Status</TH>
                  <TH>Transport</TH>
                  <TH>Updated</TH>
                </TR>
              </THead>
              <TBody>
                {history.map(s => (
                  <TR
                    key={s.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => navigate(`/warehouse/shipment/${s.id}`)}
                  >
                    <TD className="whitespace-nowrap font-semibold text-slate-900">{s.id}</TD>
                    <TD className="whitespace-nowrap">{s.clientName}</TD>
                    <TD>
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    </TD>
                    <TD className="whitespace-nowrap text-slate-700">
                      {s.dispatch ? `${s.dispatch.method} • ${s.dispatch.transportId}` : '—'}
                    </TD>
                    <TD className="whitespace-nowrap text-slate-600">{formatDateTime(s.updatedAtIso)}</TD>
                  </TR>
                ))}
                {history.length === 0 ? (
                  <TR>
                    <TD colSpan={5} className="px-4 py-8 text-center text-sm text-slate-600">
                      No history yet.
                    </TD>
                  </TR>
                ) : null}
              </TBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

