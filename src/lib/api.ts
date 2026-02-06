// API service for backend communication
const API_BASE_URL = 'https://new-logistics.onrender.com/api'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    const errorMessage = error.error || `HTTP error! status: ${response.status}`
    const apiError = new Error(errorMessage) as any
    apiError.status = response.status
    apiError.is404 = response.status === 404
    throw apiError
  }

  return response.json()
}

// Auth API
export const authAPI = {
  login: (email: string, password: string, role: string) =>
    fetchAPI<{ success: boolean; user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  register: (data: any) =>
    fetchAPI<{ success: boolean; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Client API
export const clientAPI = {
  getDashboard: (clientId?: string) => 
    fetchAPI<any>(`/client/dashboard${clientId ? `?clientId=${clientId}` : ''}`),
  getProfile: (clientId?: string) => 
    fetchAPI<any>(`/client/profile${clientId ? `?clientId=${clientId}` : ''}`),
  updateProfile: (data: any, clientId?: string) =>
    fetchAPI<any>(`/client/profile${clientId ? `?clientId=${clientId}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getWarehouses: () => fetchAPI<any[]>('/client/warehouses'),
  getShipments: (clientId?: string) => 
    fetchAPI<any[]>(`/client/shipments${clientId ? `?clientId=${clientId}` : ''}`),
  getShipment: (id: string) => fetchAPI<any>(`/client/shipments/${id}`),
  createShipment: (data: any) =>
    fetchAPI<any>('/client/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateShipment: (id: string, data: any) =>
    fetchAPI<any>(`/client/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteShipment: (id: string) =>
    fetchAPI<any>(`/client/shipments/${id}`, {
      method: 'DELETE',
    }),
  submitShipment: (id: string) =>
    fetchAPI<any>(`/client/shipments/${id}/submit`, {
      method: 'POST',
    }),
  markDelivered: (id: string) =>
    fetchAPI<any>(`/client/shipments/${id}/mark-delivered`, {
      method: 'POST',
    }),
}

// Upload API
const UPLOAD_BASE_URL = 'https://new-logistics.onrender.com/api'

export const uploadAPI = {
  uploadImage: async (file: File, folder?: string): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    if (folder) {
      formData.append('folder', folder)
    }
    
    const response = await fetch(`${UPLOAD_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || 'Failed to upload image')
    }
    
    const data = await response.json()
    return data.imageUrl
  },
  
  uploadBase64: async (base64: string, folder?: string): Promise<string> => {
    const response = await fetch(`${UPLOAD_BASE_URL}/upload/image/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64, folder }),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || 'Failed to upload image')
    }
    
    const data = await response.json()
    return data.imageUrl
  },
}

// Warehouse API
export const warehouseAPI = {
  getDashboard: (warehouseId?: string) => 
    fetchAPI<any>(`/warehouse/dashboard${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  getProfile: (warehouseId?: string) => 
    fetchAPI<any>(`/warehouse/profile${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  updateProfile: (data: any, warehouseId?: string) =>
    fetchAPI<any>(`/warehouse/profile${warehouseId ? `?warehouseId=${warehouseId}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getIncoming: (warehouseId?: string) => 
    fetchAPI<any[]>(`/warehouse/incoming${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  getOutgoing: (warehouseId?: string) => 
    fetchAPI<any[]>(`/warehouse/outgoing${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  getHistory: (warehouseId?: string) => 
    fetchAPI<any[]>(`/warehouse/history${warehouseId ? `?warehouseId=${warehouseId}` : ''}`),
  getShipment: (id: string) => fetchAPI<any>(`/warehouse/shipments/${id}`),
  receiveShipment: (id: string, receivedProductImages?: string[]) =>
    fetchAPI<any>(`/warehouse/shipments/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ receivedProductImages }),
    }),
  dispatchShipment: (id: string, data: any) =>
    fetchAPI<any>(`/warehouse/shipments/${id}/dispatch`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  markInTransit: (id: string) =>
    fetchAPI<any>(`/warehouse/shipments/${id}/in-transit`, {
      method: 'POST',
    }),
  updateShipmentStatus: (id: string, status: string) =>
    fetchAPI<any>(`/warehouse/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  addRemarks: (id: string, remarks: string) =>
    fetchAPI<any>(`/warehouse/shipments/${id}/remarks`, {
      method: 'PUT',
      body: JSON.stringify({ remarks }),
    }),
}

// Admin API
export const adminAPI = {
  getDashboard: () => fetchAPI<any>('/admin/dashboard'),
  getStatistics: () => fetchAPI<any>('/admin/statistics'),
  getProfile: () => fetchAPI<any>('/admin/profile'),
  updateProfile: (data: any) =>
    fetchAPI<any>('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getShipments: () => fetchAPI<any[]>('/admin/shipments'),
  getShipment: (id: string) => fetchAPI<any>(`/admin/shipments/${id}`),
  updateShipment: (id: string, data: any) =>
    fetchAPI<any>(`/admin/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteShipment: (id: string) =>
    fetchAPI<any>(`/admin/shipments/${id}`, {
      method: 'DELETE',
    }),
  getUsers: (role?: string) =>
    fetchAPI<any[]>(`/admin/users${role ? `?role=${role}` : ''}`),
  getUser: (id: string) => fetchAPI<any>(`/admin/users/${id}`),
  createUser: (data: any) =>
    fetchAPI<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: any) =>
    fetchAPI<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    fetchAPI<any>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  getPricing: () => fetchAPI<any>('/admin/pricing'),
  updatePricing: (data: any) =>
    fetchAPI<any>('/admin/pricing', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getAuditLogs: () => fetchAPI<any[]>('/admin/audit'),
}

// Notifications API (shared)
export const notificationsAPI = {
  getNotifications: (role: string) => fetchAPI<any[]>(`/notifications?role=${role}`),
  markRead: (role: string, notificationIds?: string[]) =>
    fetchAPI<any>('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ role, notificationIds }),
    }),
}
