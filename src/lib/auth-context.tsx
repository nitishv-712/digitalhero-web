'use client'
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { api } from '@/lib/api'
import { cache } from '@/lib/cache'

const USER_CACHE_KEYS = ['dashboard:sub', 'dashboard:winners', 'dashboard:entries']

interface User { id: string; email: string }
interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function init() {
      try {
        const token = localStorage.getItem('dh_token')
        const refresh = localStorage.getItem('dh_refresh')
        const stored = localStorage.getItem('dh_user')
        if (!token || !stored) return

        // Check token expiry from JWT payload
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expiresIn = payload.exp - Math.floor(Date.now() / 1000)

        if (expiresIn <= 60 && refresh) {
          // Expired or about to — refresh silently
          const data = await api.auth.refresh(refresh)
          localStorage.setItem('dh_token', data.session.access_token)
          localStorage.setItem('dh_refresh', data.session.refresh_token)
          localStorage.setItem('dh_user', JSON.stringify(data.user))
          setUser(data.user)
        } else if (expiresIn > 60) {
          setUser(JSON.parse(stored))
        } else {
          // No refresh token and expired — clear
          localStorage.removeItem('dh_token')
          localStorage.removeItem('dh_refresh')
          localStorage.removeItem('dh_user')
        }
      } catch {
        localStorage.removeItem('dh_token')
        localStorage.removeItem('dh_refresh')
        localStorage.removeItem('dh_user')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  async function login(email: string, password: string) {
    const data = await api.auth.login({ email, password })
    localStorage.setItem('dh_token', data.session.access_token)
    localStorage.setItem('dh_refresh', data.session.refresh_token)
    localStorage.setItem('dh_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  async function logout() {
    await api.auth.logout()
    localStorage.removeItem('dh_token')
    localStorage.removeItem('dh_refresh')
    localStorage.removeItem('dh_user')
    USER_CACHE_KEYS.forEach(key => cache.invalidate(key))
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
