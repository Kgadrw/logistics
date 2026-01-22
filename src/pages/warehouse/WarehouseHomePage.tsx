import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageCheck, Truck, History, ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useStore } from '../../lib/store'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/cn'

export function WarehouseHomePage() {
  const navigate = useNavigate()
  const { shipments } = useStore()
  const warehouseShipments = React.useMemo(() => shipments.filter(s => s.warehouseName === 'Warehouse A'), [shipments])
  
  const stats = React.useMemo(() => {
    const received = warehouseShipments.filter(s => s.status === 'Received').length
    const inTransit = warehouseShipments.filter(s => s.status === 'In Transit' || s.status === 'Left Warehouse').length
    const processed = warehouseShipments.filter(s => s.status === 'Delivered').length
    const pending = warehouseShipments.filter(s => s.status === 'Submitted').length
    return { received, inTransit, processed, pending }
  }, [warehouseShipments])

  const incoming = React.useMemo(() => 
    warehouseShipments.filter(s => s.status === 'Submitted').slice(0, 5),
    [warehouseShipments]
  )

  const outgoing = React.useMemo(() => 
    warehouseShipments.filter(s => s.status === 'Received').slice(0, 5),
    [warehouseShipments]
  )

  const recentHistory = React.useMemo(() => 
    warehouseShipments
      .filter(s => s.status === 'Delivered' || s.status === 'In Transit' || s.status === 'Left Warehouse')
      .sort((a, b) => new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime())
      .slice(0, 5),
    [warehouseShipments]
  )

  return (
    <div className="pt-4">
      <div className="mb-6">
        <div className="text-sm font-semibold text-slate-900">Warehouse Dashboard</div>
        <div className="mt-1 text-sm text-slate-600">Operational overview — focus on speed and accuracy.</div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Pending Receipt</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.pending}</div>
              </div>
              <PackageCheck className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Received Today</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.received}</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">In Transit</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.inTransit}</div>
              </div>
              <Truck className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-green-700">Processed</div>
                <div className="mt-1 text-2xl font-semibold text-green-900">{stats.processed}</div>
              </div>
              <History className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick View Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incoming Shipments Quick View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-orange-600" />
                <CardTitle>Incoming Shipments</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/warehouse/incoming')}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="text-xs text-slate-500">{stats.pending} pending receipt</div>
          </CardHeader>
          <CardBody>
            {incoming.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">No incoming shipments</div>
            ) : (
              <div className="space-y-3">
                {incoming.map(shipment => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/warehouse/shipment/${shipment.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-slate-900">{shipment.id}</div>
                        <Badge tone={statusTone(shipment.status)} className="text-xs">
                          {shipment.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {shipment.clientName} • {shipment.products.length} products
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Outgoing Shipments Quick View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <CardTitle>Outgoing Shipments</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/warehouse/outgoing')}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="text-xs text-slate-500">{stats.received} ready to dispatch</div>
          </CardHeader>
          <CardBody>
            {outgoing.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">No outgoing shipments</div>
            ) : (
              <div className="space-y-3">
                {outgoing.map(shipment => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/warehouse/shipment/${shipment.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-slate-900">{shipment.id}</div>
                        <Badge tone={statusTone(shipment.status)} className="text-xs">
                          {shipment.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {shipment.clientName} • {shipment.products.length} products
                      </div>
                    </div>
                    <Truck className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent History Quick View */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-purple-600" />
              <CardTitle>Recent History</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/warehouse/history')}
              className="text-xs"
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="text-xs text-slate-500">Recently dispatched and delivered shipments</div>
        </CardHeader>
        <CardBody>
          {recentHistory.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">No history yet</div>
          ) : (
            <div className="space-y-3">
              {recentHistory.map(shipment => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/warehouse/shipment/${shipment.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm text-slate-900">{shipment.id}</div>
                      <Badge tone={statusTone(shipment.status)} className="text-xs">
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {shipment.clientName}
                      {shipment.dispatch && ` • ${shipment.dispatch.method} ${shipment.dispatch.transportId}`}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0 ml-2">
                    {formatDateTime(shipment.updatedAtIso)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

