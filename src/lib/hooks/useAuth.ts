'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { getMe, login, logout } from '@/lib/api/auth'
import { clearStoredAuthToken, setStoredAuthToken } from '@/lib/api/client'
import { useUser } from '@/lib/contexts/UserContext'
import { disconnectSupervisionSocket } from '@/lib/socket/supervisionSocket'
import type { LoginCredentials } from '@/types'

export function useLogin() {
  const router = useRouter()
  const { setUser } = useUser()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: async ({ token }) => {
      setStoredAuthToken(token)
      // Fetch the full user profile (includes profilePhotoUrl) rather than using
      // the login response, which only returns the raw supervisionUser row.
      const fullUser = await getMe()
      setUser(fullUser)
      router.push('/dashboard')
    },
  })
}

export function useLogout() {
  const { clearUser } = useUser()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearStoredAuthToken()
      disconnectSupervisionSocket()
      clearUser()
      window.location.href = '/login'
    },
  })
}
