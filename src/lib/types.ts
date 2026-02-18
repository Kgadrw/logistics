export type Role = 'client' | 'warehouse' | 'admin'

export type ShipmentStatus =
  | 'Draft'
  | 'Submitted'
  | 'Received'
  | 'Left Warehouse'
  | 'In Transit'
  | 'Delivered'

export type TransportMethod = 'Truck' | 'Air' | 'Bike' | 'Ship'

export type Product = {
  id: string
  name: string
  quantity: number
  weightKg: number
  category: string
  imageUrl?: string // Base64 or URL for product image
  packagingType?: string // Box, Pallet, Crate, Bag, etc.
  cbm?: number // Cubic meters
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  isFragile?: boolean
  isHazardous?: boolean
  specialInstructions?: string
}

export type Shipment = {
  id: string // e.g. SH-1023
  clientName: string
  warehouseName: string
  warehouseId?: string
  status: ShipmentStatus
  products: Product[]
  notes?: string
  warehouseRemarks?: string
  receivedProductImages?: string[]
  createdAtIso: string
  updatedAtIso: string
  estimatedCostUsd: number
  dispatch?: {
    method: TransportMethod
    transportId: string
    departureDateIso: string
    packagingList?: string
    packageNumber?: string
    consigneeNumber?: string
    shippingMark?: string
  }
  draftBL?: string // Draft Bill of Lading
  consumerNumber?: string // Consumer number for warehouse
  // Optional nested objects for API responses
  client?: {
    id: string
    name: string
  }
  warehouse?: {
    id: string
    name: string
  }
}

export type Notification = {
  id: string
  createdAtIso: string
  roleTargets: Role[]
  unreadBy: Record<Role, boolean>
  shipmentId?: string
  title: string
  message: string
}

export type PricingRules = {
  pricePerKgUsd: number
  warehouseHandlingFeeUsd: number
}

export type User = {
  id: string
  role: Role
  name: string
  active: boolean
}

export type AuditEvent = {
  id: string
  createdAtIso: string
  actor: string
  action: string
  detail: string
}

