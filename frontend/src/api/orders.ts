import apiClient from './client'

export interface OrderItem {
  id: number
  product_id: number
  product_name_snapshot: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface OrderNote {
  id: number
  note: string
  created_by: number
  created_at: string
}

export interface Payment {
  id: number
  amount: number
  payment_type: string
  received_by: number
  created_at: string
}

export interface Order {
  id: number
  customer_id: number
  created_by: number
  updated_by: number | null
  cancelled_by: number | null
  cancellation_reason: string | null
  delivered_at: string | null
  delivered_by: number | null
  is_cancelled: boolean
  created_at: string
  updated_at: string
  items: OrderItem[]
  payments: Payment[]
  notes: OrderNote[]
  total_amount: number
  paid_amount: number
  remaining_amount: number
  is_fully_paid: boolean
  is_delivered: boolean
  is_fully_completed: boolean
}

export interface OrderItemCreate {
  product_id: number
  quantity: number
  unit_price: number
}

export interface OrderCreate {
  customer_id: number
  items: OrderItemCreate[]
}

export interface PaymentCreate {
  amount: number
  payment_type: string
}

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders/')
    return response.data
  },

  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  create: async (data: OrderCreate): Promise<Order> => {
    const response = await apiClient.post('/orders/', data)
    return response.data
  },

  deliver: async (id: number): Promise<Order> => {
    const response = await apiClient.post(`/orders/${id}/deliver`)
    return response.data
  },

  cancel: async (id: number, reason: string): Promise<Order> => {
    const response = await apiClient.post(`/orders/${id}/cancel`, {
      cancellation_reason: reason,
    })
    return response.data
  },

  addPayment: async (orderId: number, data: PaymentCreate): Promise<void> => {
    await apiClient.post(`/orders/${orderId}/payments`, data)
  },

  addNote: async (orderId: number, note: string): Promise<void> => {
    await apiClient.post(`/orders/${orderId}/notes`, { note })
  },

  deleteNote: async (orderId: number, noteId: number): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}/notes/${noteId}`)
  },
}
