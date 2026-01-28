import apiClient from './client'

export interface CustomerStatus {
  id: number
  status: string
  assigned_at: string
  assigned_by: number
}

export interface CustomerNote {
  id: number
  note: string
  created_by: number
  created_at: string
}

export interface Customer {
  id: number
  name: string
  primary_phone: string
  additional_phones: string | null
  created_at: string
  updated_at: string
  statuses: CustomerStatus[]
  notes: CustomerNote[]
}

export interface CustomerCreate {
  name: string
  primary_phone: string
  additional_phones?: string
}

export interface CustomerUpdate {
  name?: string
  primary_phone?: string
  additional_phones?: string
}

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get('/customers/')
    return response.data
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`)
    return response.data
  },

  create: async (data: CustomerCreate): Promise<Customer> => {
    const response = await apiClient.post('/customers/', data)
    return response.data
  },

  update: async (id: number, data: CustomerUpdate): Promise<Customer> => {
    const response = await apiClient.patch(`/customers/${id}`, data)
    return response.data
  },

  addStatus: async (customerId: number, status: string): Promise<void> => {
    await apiClient.post(`/customers/${customerId}/statuses`, { status })
  },

  removeStatus: async (customerId: number, statusId: number): Promise<void> => {
    await apiClient.delete(`/customers/${customerId}/statuses/${statusId}`)
  },

  addNote: async (customerId: number, note: string): Promise<void> => {
    await apiClient.post(`/customers/${customerId}/notes`, { note })
  },

  deleteNote: async (customerId: number, noteId: number): Promise<void> => {
    await apiClient.delete(`/customers/${customerId}/notes/${noteId}`)
  },
}
