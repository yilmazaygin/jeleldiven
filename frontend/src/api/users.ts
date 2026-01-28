import apiClient from './client'

export interface User {
  id: number
  username: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserCreate {
  username: string
  full_name: string
  password: string
}

export interface UserUpdate {
  full_name?: string
  password?: string
  is_active?: boolean
}

export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/users/me/profile')
    return response.data
  },

  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/users/')
    return response.data
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  create: async (data: UserCreate): Promise<User> => {
    const response = await apiClient.post('/users/', data)
    return response.data
  },

  update: async (id: number, data: UserUpdate): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data)
    return response.data
  },
}
