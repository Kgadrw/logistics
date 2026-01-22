import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'

export function AdminSettingsPage() {
  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Settings</div>
        <div className="mt-1 text-sm text-slate-600">Permission-based controls would be configured here.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>System</CardTitle>
            <div className="text-xs text-slate-500">Defaults for this UI prototype</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Roles</div>
                <div className="mt-1">Client, Warehouse, Admin (visibility is role-based via routes in this prototype).</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Notifications</div>
                <div className="mt-1">Unified bell + timeline-grouped panel, shared across all roles.</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Real-time</div>
                <div className="mt-1">Simulated status updates (demo) using an interval in the store.</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Design system</CardTitle>
            <div className="text-xs text-slate-500">Clean logistics SaaS</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-600">Palette</div>
                <div className="mt-1">Blue (trust), Green (success), Orange (in-progress), Red (alerts).</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Typography</div>
                <div className="mt-1">Inter (Google Fonts) for a modern, readable UI.</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-600">Components</div>
                <div className="mt-1">Rounded cards, subtle shadows, accessible focus rings, mobile-first grid.</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

