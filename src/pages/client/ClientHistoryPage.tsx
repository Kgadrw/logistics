import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { useClientAPI } from '../../lib/useAPI'
import { useAuth } from '../../lib/authContext'
import { formatDateTime, formatMoneyUsd } from '../../lib/format'

export function ClientHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { shipments, loading } = useClientAPI(user?.id)

  // Show all shipments (all statuses) sorted by most recent first
  const allShipments = React.useMemo(() => {
    return [...shipments].sort((a, b) => {
      const dateA = new Date(a.updatedAtIso || a.createdAtIso || 0).getTime()
      const dateB = new Date(b.updatedAtIso || b.createdAtIso || 0).getTime()
      return dateB - dateA
    })
  }, [shipments])

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Shipment History</div>
        <div className="mt-1 text-sm text-slate-600">Complete history of all your shipments with all statuses.</div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
          <div className="text-xs text-slate-500">{loading ? 'Loading...' : `${allShipments.length} shipments`}</div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Shipment ID</TH>
                  <TH>Warehouse</TH>
                  <TH>Status</TH>
                  <TH>Products</TH>
                  <TH>Cost</TH>
                  <TH>Updated</TH>
                </TR>
              </THead>
              <TBody>
                {allShipments.map(s => (
                  <TR
                    key={s.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => navigate(`/client/shipment/${s.id}`)}
                  >
                    <TD className="whitespace-nowrap font-semibold text-slate-900">{s.id}</TD>
                    <TD className="whitespace-nowrap">{s.warehouseName || s.warehouse?.name || 'Unknown'}</TD>
                    <TD>
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    </TD>
                    <TD className="text-slate-700">
                      {s.products?.length || 0} {s.products?.length === 1 ? 'item' : 'items'}
                    </TD>
                    <TD className="whitespace-nowrap font-semibold text-slate-900">
                      {formatMoneyUsd(s.estimatedCostUsd || 0)}
                    </TD>
                    <TD className="whitespace-nowrap text-slate-600">{formatDateTime(s.updatedAtIso || s.createdAtIso)}</TD>
                  </TR>
                ))}
                {allShipments.length === 0 && !loading ? (
                  <TR>
                    <TD colSpan={6} className="px-4 py-8 text-center text-sm text-slate-600">
                      No shipments yet.
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
