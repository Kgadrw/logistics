import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { useWarehouseAPI } from '../../lib/useAPI'
import { useAuth } from '../../lib/authContext'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/cn'

export function WarehouseHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { history, loading } = useWarehouseAPI(user?.id)

  return (
    <div className="px-3 pt-2 pb-2 sm:px-0 sm:pt-4">
      <div className="mb-3 sm:mb-4">
        <div className="text-xs sm:text-sm font-semibold text-slate-900">History</div>
        <div className="mt-1 text-xs sm:text-sm text-slate-600">Recently dispatched and delivered shipments.</div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Shipment history</CardTitle>
          <div className="text-xs text-slate-500">{loading ? 'Loading...' : `${history.length} records`}</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Shipment</TH>
                  <TH className="hidden sm:table-cell">Client</TH>
                  <TH>Status</TH>
                  <TH className="hidden md:table-cell">Transport</TH>
                  <TH className="hidden md:table-cell">Updated</TH>
                </TR>
              </THead>
              <TBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <TR key={`skeleton-${idx}`}>
                        <TD className="whitespace-nowrap"><Skeleton className="h-4 w-24" /></TD>
                        <TD className="hidden sm:table-cell whitespace-nowrap"><Skeleton className="h-4 w-28" /></TD>
                        <TD><Skeleton className="h-6 w-24 rounded-full" /></TD>
                        <TD className="hidden md:table-cell whitespace-nowrap"><Skeleton className="h-4 w-28" /></TD>
                        <TD className="hidden md:table-cell whitespace-nowrap"><Skeleton className="h-4 w-28" /></TD>
                      </TR>
                    ))
                  : null}
                {history.map(s => (
                  <TR
                    key={s.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => navigate(`/warehouse/shipment/${s.id}`)}
                  >
                    <TD className="whitespace-nowrap font-semibold text-slate-900">{s.id}</TD>
                    <TD className="hidden sm:table-cell whitespace-nowrap">{s.clientName || s.client?.name || 'Unknown'}</TD>
                    <TD>
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    </TD>
                    <TD className="hidden md:table-cell whitespace-nowrap text-slate-700">
                      {s.dispatch ? `${s.dispatch.method} • ${s.dispatch.transportId}` : '—'}
                    </TD>
                    <TD className="hidden md:table-cell whitespace-nowrap text-slate-600">{formatDateTime(s.updatedAtIso || s.createdAtIso)}</TD>
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

