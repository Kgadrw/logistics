import * as React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useStore } from '../../lib/store'
import type { PricingRules, TransportMethod } from '../../lib/types'

const methods: TransportMethod[] = ['Truck', 'Air', 'Bike', 'Ship']

export function AdminPricingPage() {
  const { pricing, adminUpdatePricing } = useStore()

  const [draft, setDraft] = React.useState<PricingRules>(() => structuredClone(pricing))

  React.useEffect(() => {
    setDraft(structuredClone(pricing))
  }, [pricing])

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Pricing Management</div>
        <div className="mt-1 text-sm text-slate-600">Set global pricing rules. Changes are recorded in the audit log.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
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
                  value={draft.pricePerKgUsd}
                  onChange={e => setDraft(d => ({ ...d, pricePerKgUsd: Number(e.target.value) }))}
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Warehouse handling fee (USD)</div>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.warehouseHandlingFeeUsd}
                  onChange={e => setDraft(d => ({ ...d, warehouseHandlingFeeUsd: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs font-semibold text-slate-600">Price per transport method (USD)</div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {methods.map(m => (
                  <div key={m} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">{m}</div>
                      <div className="w-32">
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={draft.transportPriceUsd[m]}
                          onChange={e =>
                            setDraft(d => ({
                              ...d,
                              transportPriceUsd: { ...d.transportPriceUsd, [m]: Number(e.target.value) },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="secondary" onClick={() => setDraft(structuredClone(pricing))}>
                Reset
              </Button>
              <Button
                onClick={() => {
                  adminUpdatePricing(draft, 'Admin')
                }}
              >
                Save pricing rules
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Policy notes</CardTitle>
            <div className="text-xs text-slate-500">How pricing is applied</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-600">Formula</div>
                <div className="mt-1">
                  \(estimated = (total\_kg × price\_per\_kg) + handling + transport\_method\_fee\)
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Transport pricing rules</div>
                <div className="mt-1">Dispatching via a method adds its fee. Drafts have no transport fee until dispatched.</div>
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

