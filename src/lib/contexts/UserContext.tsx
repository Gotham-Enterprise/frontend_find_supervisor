'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { getMe } from '@/lib/api/auth'
import type { User } from '@/types'

interface UserContextValue {
  user: User | null
  setUser: (user: User | null) => void
  /** Re-fetch GET /supervision/me and replace context (e.g. after subscription updates permissions). */
  refreshUser: () => Promise<void>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  clearUser: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const clearUser = useCallback(() => setUser(null), [])

  const refreshUser = useCallback(async () => {
    try {
      const next = await getMe()
      setUser(next)
    } catch {
      // 401 is handled by apiClient interceptor; keep existing user on other failures
    }
  }, [])

  const value = useMemo(
    () => ({ user, setUser, refreshUser, isLoading, setIsLoading, clearUser }),
    [user, isLoading, clearUser, refreshUser],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}
