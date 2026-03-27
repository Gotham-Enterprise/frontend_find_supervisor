'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import type { User } from '@/types'

interface UserContextValue {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  clearUser: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const clearUser = useCallback(() => setUser(null), [])

  const value = useMemo(
    () => ({ user, setUser, isLoading, setIsLoading, clearUser }),
    [user, isLoading, clearUser],
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
