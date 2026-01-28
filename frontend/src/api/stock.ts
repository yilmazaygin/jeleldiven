import apiClient from './client'

export interface StockMovement {
  id: number
  product_id: number
  movement_type: string
  quantity: number
  total_cost: number | null
  average_unit_cost: number | null
  order_id: number | null
  customer_id: number | null
  description: string | null
  created_by: number
  created_at: string
}

export interface StockMovementCreate {
  product_id: number
  movement_type: string
  quantity: number
  total_cost?: number
  order_id?: number
  customer_id?: number
  description?: string
}

export const stockApi = {
  getAll: async (productId?: number): Promise<StockMovement[]> => {
    const params = productId !== undefined ? { product_id: productId } : {}
    const response = await apiClient.get('/stock-movements/', { params })
    return response.data
  },

  create: async (data: StockMovementCreate): Promise<StockMovement> => {
    const response = await apiClient.post('/stock-movements/', data)
    return response.data
  },
}
