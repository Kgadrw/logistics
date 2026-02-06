import * as React from 'react'
import { clientAPI, warehouseAPI, adminAPI, notificationsAPI } from './api'
import type { Shipment, Notification, User, PricingRules } from './types'

// Hook for client API
export function useClientAPI(clientId?: string) {
  const [shipments, setShipments] = React.useState<Shipment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchShipments = React.useCallback(async () => {
    if (!clientId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await clientAPI.getShipments(clientId)
      setShipments(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  React.useEffect(() => {
    fetchShipments()
  }, [fetchShipments])

  const createShipment = async (data: any) => {
    try {
      const result = await clientAPI.createShipment(data)
      await fetchShipments()
      return result.shipment
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateShipment = async (id: string, data: any) => {
    try {
      await clientAPI.updateShipment(id, data)
      await fetchShipments()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const submitShipment = async (id: string) => {
    try {
      await clientAPI.submitShipment(id)
      await fetchShipments()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  return {
    shipments,
    loading,
    error,
    createShipment,
    updateShipment,
    submitShipment,
    refresh: fetchShipments,
  }
}

// Hook for warehouse API
export function useWarehouseAPI(warehouseId?: string) {
  const [incoming, setIncoming] = React.useState<Shipment[]>([])
  const [outgoing, setOutgoing] = React.useState<Shipment[]>([])
  const [history, setHistory] = React.useState<Shipment[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchIncoming = React.useCallback(async () => {
    try {
      if (!warehouseId) {
        console.warn('[useWarehouseAPI] No warehouseId provided, skipping fetch')
        setIncoming([])
        return
      }
      console.log(`[useWarehouseAPI] Fetching incoming shipments for warehouse: ${warehouseId}`)
      const data = await warehouseAPI.getIncoming(warehouseId)
      console.log(`[useWarehouseAPI] Fetched ${data?.length || 0} incoming shipments for warehouse ${warehouseId}`, data)
      setIncoming(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Failed to fetch incoming:', err)
      console.error('Error details:', err.message, err.status)
      setIncoming([])
    }
  }, [warehouseId])

  const fetchOutgoing = React.useCallback(async () => {
    try {
      if (!warehouseId) {
        console.warn('[useWarehouseAPI] No warehouseId provided for outgoing, skipping fetch')
        setOutgoing([])
        return
      }
      console.log(`[useWarehouseAPI] Fetching outgoing shipments for warehouse: ${warehouseId}`)
      const data = await warehouseAPI.getOutgoing(warehouseId)
      console.log(`[useWarehouseAPI] Fetched ${data?.length || 0} outgoing shipments for warehouse ${warehouseId}`)
      setOutgoing(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Failed to fetch outgoing:', err)
      console.error('Error details:', err.message, err.status)
      setOutgoing([])
    }
  }, [warehouseId])

  const fetchHistory = React.useCallback(async () => {
    try {
      const data = await warehouseAPI.getHistory(warehouseId)
      setHistory(data)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }, [warehouseId])

  React.useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchIncoming(), fetchOutgoing(), fetchHistory()])
      setLoading(false)
    }
    loadAll()
  }, [fetchIncoming, fetchOutgoing, fetchHistory])

  return {
    incoming,
    outgoing,
    history,
    loading,
    refresh: () => Promise.all([fetchIncoming(), fetchOutgoing(), fetchHistory()]),
  }
}

// Hook for admin API
export function useAdminAPI() {
  const [shipments, setShipments] = React.useState<Shipment[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [pricing, setPricing] = React.useState<PricingRules | null>(null)
  const [loading, setLoading] = React.useState(true)

  const fetchShipments = React.useCallback(async () => {
    try {
      const data = await adminAPI.getShipments()
      setShipments(data)
    } catch (err) {
      console.error('Failed to fetch shipments:', err)
    }
  }, [])

  const fetchUsers = React.useCallback(async (role?: string) => {
    try {
      const data = await adminAPI.getUsers(role)
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }, [])

  const fetchPricing = React.useCallback(async () => {
    try {
      const data = await adminAPI.getPricing()
      setPricing(data)
    } catch (err) {
      console.error('Failed to fetch pricing:', err)
    }
  }, [])

  React.useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchShipments(), fetchUsers(), fetchPricing()])
      setLoading(false)
    }
    loadAll()
  }, [fetchShipments, fetchUsers, fetchPricing])

  return {
    shipments,
    users,
    pricing,
    loading,
    refreshShipments: fetchShipments,
    refreshUsers: fetchUsers,
    refreshPricing: fetchPricing,
  }
}

// Hook for notifications
export function useNotificationsAPI(role: 'client' | 'warehouse' | 'admin') {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await notificationsAPI.getNotifications(role)
      setNotifications(data)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [role])

  React.useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markRead = async (notificationIds?: string[]) => {
    try {
      await notificationsAPI.markRead(role, notificationIds)
      await fetchNotifications()
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
    }
  }

  return {
    notifications,
    loading,
    markRead,
    refresh: fetchNotifications,
  }
}
