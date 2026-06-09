import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string | null
  status: string
  role: string
  device_id: string | null
  refer_code: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  walletBalance: number
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string, referCode?: string) => Promise<boolean>
  logout: () => void
  fetchWallet: (token?: string) => Promise<number>
  setError: (err: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://node.rglabs.net:3603/api/v1'
const APP_KEY = import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('fortune_user')
    const storedToken = localStorage.getItem('fortune_access_token')

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setAccessToken(storedToken)
        fetchWallet(storedToken)
      } catch (e) {
        // clear corrupted data
        localStorage.removeItem('fortune_user')
        localStorage.removeItem('fortune_access_token')
        localStorage.removeItem('fortune_refresh_token')
      }
    }
    setLoading(false)
  }, [])

  const fetchWallet = async (token?: string): Promise<number> => {
    const activeToken = token || accessToken
    if (!activeToken) return 0
    try {
      const res = await fetch(`${BASE_URL}/wallet`, {
        method: 'GET',
        headers: {
          'X-App-Key': APP_KEY,
          'Authorization': `Bearer ${activeToken}`,
        },
      })
      if (res.ok) {
        const resData = await res.json()
        if (resData.success && resData.data) {
          // resilient check if balance is nested or direct
          const rawBalance = resData.data.balance !== undefined ? resData.data.balance : resData.data.wallet?.balance
          const balance = Number(rawBalance)
          if (!isNaN(balance)) {
            setWalletBalance(balance)
            return balance
          }
        }
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err)
    }
    return 0
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY,
        },
        body: JSON.stringify({
          username,
          password,
          deviceId: 'web_device_' + Date.now(),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        // Validation fails or unauthorized
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          setError(data.errors.map((e: any) => e.message).join(', '))
        } else {
          setError(data.message || 'Login failed. Please check credentials.')
        }
        return false
      }

      const { user: userData, accessToken: token, refreshToken } = data.data
      setUser(userData)
      setAccessToken(token)

      localStorage.setItem('fortune_user', JSON.stringify(userData))
      localStorage.setItem('fortune_access_token', token)
      if (refreshToken) {
        localStorage.setItem('fortune_refresh_token', refreshToken)
      }

      // Fetch wallet balance
      await fetchWallet(token)
      return true
    } catch (err: any) {
      setError('Network error. Please try again.')
      return false
    }
  }

  const register = async (username: string, password: string, referCode?: string): Promise<boolean> => {
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY,
        },
        body: JSON.stringify({
          username,
          password,
          deviceId: 'web_device_' + Date.now(),
          referCode: referCode || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          setError(data.errors.map((e: any) => e.message).join(', '))
        } else {
          setError(data.message || 'Registration failed.')
        }
        return false
      }

      const { user: userData, accessToken: token, refreshToken, wallet } = data.data
      setUser(userData)
      setAccessToken(token)

      localStorage.setItem('fortune_user', JSON.stringify(userData))
      localStorage.setItem('fortune_access_token', token)
      if (refreshToken) {
        localStorage.setItem('fortune_refresh_token', refreshToken)
      }

      if (wallet && wallet.balance !== undefined) {
        setWalletBalance(Number(wallet.balance))
      } else {
        await fetchWallet(token)
      }
      return true
    } catch (err: any) {
      setError('Network error. Please try again.')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    setWalletBalance(0)
    localStorage.removeItem('fortune_user')
    localStorage.removeItem('fortune_access_token')
    localStorage.removeItem('fortune_refresh_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        walletBalance,
        loading,
        error,
        login,
        register,
        logout,
        fetchWallet,
        setError,
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
