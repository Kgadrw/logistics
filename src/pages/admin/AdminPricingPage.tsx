import * as React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAdminAPI } from '../../lib/useAPI'
import { adminAPI } from '../../lib/api'
import type { PricingRules, TransportMethod } from '../../lib/types'

const transportMethods: TransportMethod[] = ['Truck', 'Air', 'Bike', 'Ship']

function normalizePricingRules(pricing: Partial<PricingRules>): PricingRules {
  return {
    pricePerKgUsd: Number(pricing.pricePerKgUsd) || 0,
    warehouseHandlingFeeUsd: Number(pricing.warehouseHandlingFeeUsd) || 0,
    transportPriceUsd: {
      Truck: Number(pricing.transportPriceUsd?.Truck) || 0,
      Air: Number(pricing.transportPriceUsd?.Air) || 0,
      Bike: Number(pricing.transportPriceUsd?.Bike) || 0,
      Ship: Number(pricing.transportPriceUsd?.Ship) || 0,
    },
    logisticsMethods: Array.isArray(pricing.logisticsMethods) && pricing.logisticsMethods.length > 0
      ? pricing.logisticsMethods
      : ['Truck', 'Air', 'Bike', 'Ship'],
  }
}

export function AdminPricingPage() {
  const { pricing, refreshPricing } = useAdminAPI()
  const [draft, setDraft] = React.useState<PricingRules | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (pricing) {
      setDraft(normalizePricingRules(structuredClone(pricing)))
    }
  }, [pricing])

  const handleSave = async () => {
    if (!draft) return
    try {
      setLoading(true)
      setError(null)
      await adminAPI.updatePricing(normalizePricingRules(draft))
      await refreshPricing()
    } catch (err: any) {
      setError(err.message || 'Failed to update pricing')
      console.error('Failed to update pricing:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!draft) {
    return (
      <div className="pt-4">
        <div className="mb-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-72" />
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-7 order-2 lg:order-1">
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-64" />
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={`base-${idx}`} className="space-y-2">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <Skeleton className="h-3 w-48" />
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`method-${idx}`} className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <Skeleton className="h-3 w-44" />
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={`check-${idx}`} className="h-10 w-full" />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-36" />
              </div>
            </CardBody>
          </Card>

          <Card className="lg:col-span-5 order-1 lg:order-2">
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Pricing Management</div>
        <div className="mt-1 text-sm text-slate-600">Set all global pricing options and rules used to regulate shipment pricing.</div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7 order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Rules</CardTitle>
            <div className="text-xs text-slate-500">Price per kg, transport, and handling fees</div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-600">Price per kg (USD)</div>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={draft.pricePerKgUsd || ''}
                  onChange={e => setDraft(d => d ? { ...d, pricePerKgUsd: Number(e.target.value) } : null)}
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Warehouse handling fee (USD)</div>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.warehouseHandlingFeeUsd || ''}
                  onChange={e => setDraft(d => d ? { ...d, warehouseHandlingFeeUsd: Number(e.target.value) } : null)}
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs font-semibold text-slate-600">Transport price by method (USD)</div>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                {transportMethods.map(method => (
                  <div key={method}>
                    <div className="text-xs text-slate-500">{method}</div>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={draft.transportPriceUsd?.[method] || ''}
                      onChange={e =>
                        setDraft(d =>
                          d
                            ? {
                                ...d,
                                transportPriceUsd: {
                                  ...d.transportPriceUsd,
                                  [method]: Number(e.target.value) || 0,
                                },
                              }
                            : null
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs font-semibold text-slate-600">Enabled logistics methods</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {transportMethods.map(method => (
                  <label key={method} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <input
                      type="checkbox"
                      checked={draft.logisticsMethods.includes(method)}
                      onChange={e =>
                        setDraft(d => {
                          if (!d) return d
                          const next = e.target.checked
                            ? Array.from(new Set([...d.logisticsMethods, method]))
                            : d.logisticsMethods.filter(m => m !== method)
                          return { ...d, logisticsMethods: next }
                        })
                      }
                    />
                    <span className="text-sm text-slate-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>


            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="secondary" onClick={() => pricing && setDraft(normalizePricingRules(structuredClone(pricing)))}>
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                Save pricing rules
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5 order-1 lg:order-2">
          <CardHeader>
            <CardTitle>Policy notes</CardTitle>
            <div className="text-xs text-slate-500">How pricing is applied</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-600">Formula</div>
                <div className="mt-1">
                  \(estimated = (total\_kg × price\_per\_kg) + handling + warehouse\_transport\_fee\)
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Pricing hierarchy</div>
                <div className="mt-1">Global admin pricing is the baseline. Warehouse-specific pricing overrides admin values when defined for that warehouse.</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Regulation scope</div>
                <div className="mt-1">Changes apply to all pricing options (per kg, handling, method prices, and enabled methods) and recalculate shipment estimates.</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Audit trail</div>
                <div className="mt-1">All pricing changes are recorded on the Overview page audit log.</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

