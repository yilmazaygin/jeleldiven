import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, LoginCredentials } from '@/api/auth'
import { usersApi } from '@/api/users'
import type { User } from '@/api/users'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials, rememberMe: boolean) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const userData = await usersApi.getMe()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials, rememberMe: boolean) => {
    const response = await authApi.login(credentials)
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    
    const userData = await usersApi.getMe()
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
