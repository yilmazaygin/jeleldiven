import apiClient from './client'

export interface Product {
  id: number
  name: string
  category: string
  is_active: boolean
  cost_metadata: string | null
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  name: string
  category: string
  is_active?: boolean
  cost_metadata?: string
}

export interface ProductUpdate {
  name?: string
  category?: string
  is_active?: boolean
  cost_metadata?: string
}

export const productsApi = {
  getAll: async (isActive?: boolean): Promise<Product[]> => {
    const params = isActive !== undefined ? { is_active: isActive } : {}
    const response = await apiClient.get('/products/', { params })
    return response.data
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  create: async (data: ProductCreate): Promise<Product> => {
    const response = await apiClient.post('/products/', data)
    return response.data
  },

  update: async (id: number, data: ProductUpdate): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}`, data)
    return response.data
  },
}
