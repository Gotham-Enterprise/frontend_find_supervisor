'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import { toast } from 'sonner'

export interface SnackbarOptions {
  duration?: number
  description?: string
}

interface UserSnackbarContextValue {
  showSuccess: (message: string, options?: SnackbarOptions) => void
  showError: (message: string, options?: SnackbarOptions) => void
  showInfo: (message: string, options?: SnackbarOptions) => void
  showWarning: (message: string, options?: SnackbarOptions) => void
}

const UserSnackbarContext = createContext<UserSnackbarContextValue | null>(null)

export function UserSnackbarProvider({ children }: { children: React.ReactNode }) {
  const showSuccess = useCallback((message: string, options?: SnackbarOptions) => {
    toast.success(message, {
      duration: options?.duration ?? 5000,
      description: options?.description,
    })
  }, [])

  const showError = useCallback((message: string, options?: SnackbarOptions) => {
    toast.error(message, {
      duration: options?.duration ?? 6000,
      description: options?.description,
    })
  }, [])

  const showInfo = useCallback((message: string, options?: SnackbarOptions) => {
    toast.info(message, {
      duration: options?.duration ?? 5000,
      description: options?.description,
    })
  }, [])

  const showWarning = useCallback((message: string, options?: SnackbarOptions) => {
    toast.warning(message, {
      duration: options?.duration ?? 5000,
      description: options?.description,
    })
  }, [])

  const value = useMemo(
    () => ({ showSuccess, showError, showInfo, showWarning }),
    [showSuccess, showError, showInfo, showWarning],
  )

  return <UserSnackbarContext.Provider value={value}>{children}</UserSnackbarContext.Provider>
}

export function useUserSnackbar(): UserSnackbarContextValue {
  const ctx = useContext(UserSnackbarContext)
  if (!ctx) {
    throw new Error('useUserSnackbar must be used within UserSnackbarProvider')
  }
  return ctx
}
