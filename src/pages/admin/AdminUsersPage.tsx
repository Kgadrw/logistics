import * as React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/Table'
import { useStore } from '../../lib/store'
import type { Role, User } from '../../lib/types'
import { makeId } from '../../lib/id'

export function AdminUsersPage({ focus }: { focus: Extract<Role, 'client' | 'warehouse'> }) {
  const { users, adminToggleUser } = useStore()
  const items = users.filter(u => u.role === focus)

  const [name, setName] = React.useState('')
  const [localUsers, setLocalUsers] = React.useState<User[]>([])

  // In a real app, user creation would be server-side. For this UI prototype we keep it local-only.
  React.useEffect(() => {
    setLocalUsers(items)
  }, [items])

  return (
    <div className="pt-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">{focus === 'warehouse' ? 'Warehouses' : 'Clients'}</div>
        <div className="mt-1 text-sm text-slate-600">Create accounts and activate/deactivate users.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Create {focus} account</CardTitle>
            <div className="text-xs text-slate-500">Demo-only (local)</div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-600">Name</div>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={focus === 'warehouse' ? 'Warehouse B' : 'Client Co.'} />
              </div>
              <Button
                onClick={() => {
                  const trimmed = name.trim()
                  if (!trimmed) return
                  setLocalUsers(prev => [{ id: makeId(`u-${focus}`), role: focus, name: trimmed, active: true }, ...prev])
                  setName('')
                }}
              >
                Create account
              </Button>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                This prototype stores created users only in-memory for the current session. Activation toggles are fully wired.
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-7 overflow-hidden">
          <CardHeader>
            <CardTitle>User management</CardTitle>
            <div className="text-xs text-slate-500">{items.length} seeded users</div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Role</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {localUsers.map(u => (
                    <TR key={u.id}>
                      <TD className="whitespace-nowrap font-semibold text-slate-900">{u.name}</TD>
                      <TD className="whitespace-nowrap capitalize text-slate-700">{u.role}</TD>
                      <TD className="whitespace-nowrap">
                        <span
                          className={[
                            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
                            u.active ? 'bg-green-50 text-green-800 ring-green-200' : 'bg-red-50 text-red-800 ring-red-200',
                          ].join(' ')}
                        >
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </TD>
                      <TD className="text-right">
                        {u.id.startsWith('u-') && (u.id === 'u-client-1' || u.id === 'u-wh-1') ? (
                          <Button size="sm" variant="secondary" onClick={() => adminToggleUser(u.id, !u.active, 'Admin')}>
                            {u.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setLocalUsers(prev => prev.map(x => (x.id === u.id ? { ...x, active: !x.active } : x)))}
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </TD>
                    </TR>
                  ))}
                  {localUsers.length === 0 ? (
                    <TR>
                      <TD colSpan={4} className="px-4 py-8 text-center text-sm text-slate-600">
                        No users yet.
                      </TD>
                    </TR>
                  ) : null}
                </TBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

