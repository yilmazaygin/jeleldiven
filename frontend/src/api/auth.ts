import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {},
      {
        auth: {
          username: credentials.username,
          password: credentials.password,
        },
      }
    )
    return response.data
  },

  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    })
    return response.data
  },
}
