import * as React from 'react'
import type { AuditEvent, Notification, PricingRules, Role, Shipment, ShipmentStatus, TransportMethod, User } from './types'
import { makeId, makeShipmentId } from './id'

type StoreState = {
  pricing: PricingRules
  users: User[]
  shipments: Shipment[]
  notifications: Notification[]
  audit: AuditEvent[]
}

type StoreApi = StoreState & {
  markNotificationsRead: (role: Role) => void
  createShipment: (input: {
    clientName: string
    warehouseName: string
    notes?: string
    products: {
      name: string
      quantity: number
      weightKg: number
      category: string
      imageUrl?: string
      packagingType?: string
      cbm?: number
      lengthCm?: number
      widthCm?: number
      heightCm?: number
      isFragile?: boolean
      isHazardous?: boolean
      specialInstructions?: string
    }[]
  }) => Shipment
  updateShipment: (shipmentId: string, input: {
    notes?: string
    products: {
      name: string
      quantity: number
      weightKg: number
      category: string
      imageUrl?: string
      packagingType?: string
      cbm?: number
      lengthCm?: number
      widthCm?: number
      heightCm?: number
      isFragile?: boolean
      isHazardous?: boolean
      specialInstructions?: string
    }[]
  }) => void
  submitShipment: (shipmentId: string) => void
  warehouseMarkReceived: (shipmentId: string, warehouseRemarks?: string) => void
  warehouseDispatch: (shipmentId: string, input: { method: TransportMethod; transportId: string; departureDateIso: string }) => void
  adminUpdatePricing: (pricing: PricingRules, actor?: string) => void
  adminToggleUser: (userId: string, active: boolean, actor?: string) => void
}

const LS_KEY = 'uza_logistics_demo_store_v1'

function nowIso() {
  return new Date().toISOString()
}

function estimateCostUsd(pricing: PricingRules, shipment: Pick<Shipment, 'products' | 'dispatch'>) {
  const kg = shipment.products.reduce((s, p) => s + p.weightKg * p.quantity, 0)
  const base = kg * pricing.pricePerKgUsd + pricing.warehouseHandlingFeeUsd
  const transport = shipment.dispatch ? pricing.transportPriceUsd[shipment.dispatch.method] : 0
  return Math.round(base + transport)
}

function pushNotification(state: StoreState, n: Omit<Notification, 'id' | 'createdAtIso' | 'unreadBy'>) {
  const unreadBy: Notification['unreadBy'] = {
    client: n.roleTargets.includes('client'),
    warehouse: n.roleTargets.includes('warehouse'),
    admin: n.roleTargets.includes('admin'),
  }
  state.notifications.unshift({
    id: makeId('ntf'),
    createdAtIso: nowIso(),
    unreadBy,
    ...n,
  })
}

function pushAudit(state: StoreState, event: Omit<AuditEvent, 'id' | 'createdAtIso'>) {
  state.audit.unshift({ id: makeId('aud'), createdAtIso: nowIso(), ...event })
}

function seedState(): StoreState {
  const pricing: PricingRules = {
    pricePerKgUsd: 4,
    transportPriceUsd: { Truck: 120, Air: 380, Bike: 35, Ship: 220 },
    warehouseHandlingFeeUsd: 25,
  }

  const users: User[] = [
    { id: 'u-client-1', role: 'client', name: 'Acme Retail', active: true },
    { id: 'u-wh-1', role: 'warehouse', name: 'Warehouse A', active: true },
    { id: 'u-admin-1', role: 'admin', name: 'Admin', active: true },
  ]

  const demoShipments: Shipment[] = [
    {
      id: 'SH-1023',
      clientName: 'Acme Retail',
      warehouseName: 'Warehouse A',
      status: 'In Transit',
      products: [
        { id: 'p1', name: 'Phone Cases', quantity: 200, weightKg: 0.2, category: 'Accessories' },
        { id: 'p2', name: 'Chargers', quantity: 80, weightKg: 0.35, category: 'Electronics' },
      ],
      notes: 'Please keep chargers in original cartons.',
      warehouseRemarks: 'Count verified. Packed on pallet 3.',
      createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updatedAtIso: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      dispatch: { method: 'Truck', transportId: 'TRK-77', departureDateIso: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
      estimatedCostUsd: 0,
    },
    {
      id: 'SH-1031',
      clientName: 'Acme Retail',
      warehouseName: 'Warehouse A',
      status: 'Submitted',
      products: [{ id: 'p3', name: 'T-Shirts', quantity: 150, weightKg: 0.25, category: 'Apparel' }],
      notes: 'Mix sizes evenly in boxes.',
      createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updatedAtIso: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      estimatedCostUsd: 0,
    },
    {
      id: 'SH-1044',
      clientName: 'Acme Retail',
      warehouseName: 'Warehouse A',
      status: 'Draft',
      products: [{ id: 'p4', name: 'Socks', quantity: 500, weightKg: 0.05, category: 'Apparel' }],
      notes: '',
      createdAtIso: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      updatedAtIso: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      estimatedCostUsd: 0,
    },
  ]

  for (const s of demoShipments) s.estimatedCostUsd = estimateCostUsd(pricing, s)

  const notifications: Notification[] = [
    {
      id: 'ntf-seed-1',
      createdAtIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      roleTargets: ['client', 'warehouse', 'admin'],
      unreadBy: { client: true, warehouse: false, admin: true },
      shipmentId: 'SH-1023',
      title: 'Shipment update',
      message: 'Your shipment #SH-1023 has left the warehouse via Truck.',
    },
    {
      id: 'ntf-seed-2',
      createdAtIso: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      roleTargets: ['client', 'admin'],
      unreadBy: { client: true, warehouse: false, admin: true },
      shipmentId: 'SH-1031',
      title: 'Shipment submitted',
      message: 'Shipment #SH-1031 was submitted and is awaiting warehouse receipt.',
    },
  ]

  const audit: AuditEvent[] = [
    {
      id: 'aud-seed-1',
      createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      actor: 'Admin',
      action: 'Pricing updated',
      detail: 'Price per kg set to $4; Truck transport set to $120.',
    },
  ]

  return { pricing, users, shipments: demoShipments, notifications, audit }
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return seedState()
    return JSON.parse(raw) as StoreState
  } catch {
    return seedState()
  }
}

function saveState(state: StoreState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

const StoreContext = React.createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<StoreState>(() => loadState())

  // Simulated "real-time" status progress for demo shipments
  React.useEffect(() => {
    const t = window.setInterval(() => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        const sh = next.shipments.find(s => s.status === 'In Transit')
        if (!sh) return prev
        // Occasionally deliver
        if (Math.random() < 0.18) {
          sh.status = 'Delivered'
          sh.updatedAtIso = nowIso()
          pushNotification(next, {
            roleTargets: ['client', 'admin'],
            shipmentId: sh.id,
            title: 'Delivered',
            message: `Your shipment #${sh.id} has been delivered.`,
          })
          pushAudit(next, { actor: 'System', action: 'Status update', detail: `${sh.id} auto-updated to Delivered.` })
          saveState(next)
          return next
        }
        return prev
      })
    }, 6500)
    return () => window.clearInterval(t)
  }, [])

  const api = React.useMemo<StoreApi>(() => {
    const markNotificationsRead = (role: Role) => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        for (const n of next.notifications) {
          if (n.roleTargets.includes(role)) n.unreadBy[role] = false
        }
        saveState(next)
        return next
      })
    }

    const createShipment: StoreApi['createShipment'] = input => {
      const s: Shipment = {
        id: makeShipmentId(),
        clientName: input.clientName,
        warehouseName: input.warehouseName,
        status: 'Draft',
        products: input.products.map(p => ({ id: makeId('prd'), ...p })),
        notes: input.notes,
        createdAtIso: nowIso(),
        updatedAtIso: nowIso(),
        estimatedCostUsd: 0,
      }

      setState(prev => {
        const next: StoreState = structuredClone(prev)
        s.estimatedCostUsd = estimateCostUsd(next.pricing, s)
        next.shipments.unshift(s)
        pushNotification(next, {
          roleTargets: ['client'],
          shipmentId: s.id,
          title: 'Draft created',
          message: `Draft shipment #${s.id} created. Add items and submit when ready.`,
        })
        saveState(next)
        return next
      })

      return s
    }

    const updateShipment: StoreApi['updateShipment'] = (shipmentId, input) => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        const sh = next.shipments.find(s => s.id === shipmentId)
        if (!sh) return prev
        if (sh.status !== 'Draft') return prev // Only allow editing drafts
        
        sh.products = input.products.map(p => ({ id: makeId('prd'), ...p }))
        sh.notes = input.notes
        sh.updatedAtIso = nowIso()
        sh.estimatedCostUsd = estimateCostUsd(next.pricing, sh)
        saveState(next)
        return next
      })
    }

    const setStatus = (shipmentId: string, status: ShipmentStatus) => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        const sh = next.shipments.find(s => s.id === shipmentId)
        if (!sh) return prev
        sh.status = status
        sh.updatedAtIso = nowIso()
        sh.estimatedCostUsd = estimateCostUsd(next.pricing, sh)
        saveState(next)
        return next
      })
    }

    const submitShipment = (shipmentId: string) => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        const sh = next.shipments.find(s => s.id === shipmentId)
        if (!sh) return prev
        if (sh.status !== 'Draft') return prev
        sh.status = 'Submitted'
        sh.updatedAtIso = nowIso()
        pushNotification(next, {
          roleTargets: ['warehouse', 'admin', 'client'],
          shipmentId,
          title: 'Shipment submitted',
          message: `Shipment #${shipmentId} was submitted and is awaiting warehouse receipt.`,
        })
        saveState(next)
        return next
      })
    }

    const warehouseMarkReceived = (shipmentId: string, warehouseRemarks?: string) => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        const sh = next.shipments.find(s => s.id === shipmentId)
        if (!sh) return prev
        sh.status = 'Received'
        sh.warehouseRemarks = warehouseRemarks
        sh.updatedAtIso = nowIso()
        pushNotification(next, {
          roleTargets: ['client', 'admin', 'warehouse'],
          shipmentId,
          title: 'Received',
          message: `Your shipment #${shipmentId} has been received by ${sh.warehouseName}.`,
        })
        saveState(next)
        return next
      })
    }

    const warehouseDispatch: StoreApi['warehouseDispatch'] = (shipmentId, input) => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        const sh = next.shipments.find(s => s.id === shipmentId)
        if (!sh) return prev
        sh.dispatch = input
        sh.status = 'In Transit'
        sh.updatedAtIso = nowIso()
        sh.estimatedCostUsd = estimateCostUsd(next.pricing, sh)
        pushNotification(next, {
          roleTargets: ['client', 'admin', 'warehouse'],
          shipmentId,
          title: 'Dispatched',
          message: `Your shipment has left the warehouse via ${input.method}. Transport ID: ${input.transportId}.`,
        })
        saveState(next)
        return next
      })
    }

    const adminUpdatePricing: StoreApi['adminUpdatePricing'] = (pricing, actor = 'Admin') => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        next.pricing = pricing
        for (const sh of next.shipments) sh.estimatedCostUsd = estimateCostUsd(pricing, sh)
        pushAudit(next, {
          actor,
          action: 'Pricing updated',
          detail: `Per kg: $${pricing.pricePerKgUsd}; handling: $${pricing.warehouseHandlingFeeUsd}.`,
        })
        saveState(next)
        return next
      })
    }

    const adminToggleUser: StoreApi['adminToggleUser'] = (userId, active, actor = 'Admin') => {
      setState(prev => {
        const next: StoreState = structuredClone(prev)
        const u = next.users.find(x => x.id === userId)
        if (!u) return prev
        u.active = active
        pushAudit(next, { actor, action: 'User status changed', detail: `${u.name} (${u.role}) set to ${active ? 'active' : 'inactive'}.` })
        saveState(next)
        return next
      })
    }

    return {
      ...state,
      markNotificationsRead,
      createShipment,
      updateShipment,
      submitShipment,
      warehouseMarkReceived,
      warehouseDispatch,
      adminUpdatePricing,
      adminToggleUser,
    }
  }, [state])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

