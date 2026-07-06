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
  logout: (redirectToLogin?: boolean) => void
  fetchWallet: (token?: string) => Promise<number>
  setError: (err: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'https://node.rglabs.net/api/v1'
const APP_KEY = import.meta.env.VITE_AUTH_API_KEY || 'c326d53a97bc32972cc7de9d4f03d27845efc9a81d8f1e7af347f3da42cbd52e'
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please log in again.'

function clearStoredAuth() {
  localStorage.removeItem('fortune_user')
  localStorage.removeItem('fortune_access_token')
  localStorage.removeItem('fortune_refresh_token')
}

function redirectToLogin(message = SESSION_EXPIRED_MESSAGE) {
  sessionStorage.setItem('fortune_auth_error', message)
  if (window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

function requestHasAuthorization(input: RequestInfo | URL, init?: RequestInit) {
  const initHeaders = new Headers(init?.headers)
  if (initHeaders.has('Authorization')) return true

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.headers.has('Authorization')
  }

  return false
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const clearSession = (shouldRedirect = false, message = SESSION_EXPIRED_MESSAGE) => {
    setUser(null)
    setAccessToken(null)
    setWalletBalance(0)
    clearStoredAuth()
    if (shouldRedirect) {
      redirectToLogin(message)
    }
  }

  useEffect(() => {
    let active = true

    const bootstrapAuth = async () => {
      // Check query parameters for token or accessToken (e.g. from the app redirect)
      const params = new URLSearchParams(window.location.search)
      const urlToken = params.get('token') || params.get('accessToken')

      let tokenToUse = urlToken
      let userToUse = null

      if (urlToken) {
        try {
          const res = await fetch(`${BASE_URL}/auth/me`, {
            headers: {
              'X-App-Key': APP_KEY,
              'Authorization': `Bearer ${urlToken}`,
            }
          })
          if (res.ok) {
            const resData = await res.json()
            if (resData.success && resData.data) {
              userToUse = resData.data
              localStorage.setItem('fortune_user', JSON.stringify(userToUse))
              localStorage.setItem('fortune_access_token', urlToken)
            }
          }
        } catch (err) {
          console.error('Error fetching user info using URL token:', err)
        }

        // Clean URL parameter so token doesn't leak or stay in address bar
        try {
          const cleanSearch = window.location.search
            .replace(/[?&](token|accessToken)=[^&]+/g, '')
            .replace(/^&/, '?')
          const cleanUrl = window.location.pathname + (cleanSearch === '?' ? '' : cleanSearch) + window.location.hash
          window.history.replaceState({}, document.title, cleanUrl)
        } catch (e) {
          console.error('Failed to clean token from URL:', e)
        }
      }

      // If no valid URL token was processed, fallback to localStorage
      if (!userToUse || !tokenToUse) {
        const storedUser = localStorage.getItem('fortune_user')
        const storedToken = localStorage.getItem('fortune_access_token')
        if (storedUser && storedToken) {
          try {
            userToUse = JSON.parse(storedUser)
            tokenToUse = storedToken
          } catch (e) {
            clearSession(false)
          }
        }
      }

      if (active && userToUse && tokenToUse) {
        setUser(userToUse)
        setAccessToken(tokenToUse)
        await fetchWallet(tokenToUse)
      }

      if (active) {
        setLoading(false)
      }
    }

    void bootstrapAuth()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const originalFetch = window.fetch.bind(window)

    window.fetch = (async (...args: Parameters<typeof fetch>) => {
      const response = await originalFetch(...args)
      const [input, init] = args

      if (accessToken && requestHasAuthorization(input, init) && (response.status === 401 || response.status === 403)) {
        clearSession(true)
      }

      return response
    }) as typeof fetch

    return () => {
      window.fetch = originalFetch
    }
  }, [accessToken])

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
      if (res.status === 401 || res.status === 403) {
        clearSession(true)
        return 0
      }
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

    setWalletBalance(0)
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

  const logout = (redirectToLogin = false) => {
    clearSession(redirectToLogin)
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
