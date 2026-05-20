'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { getMe, login, logout } from '@/lib/api/auth'
import { TOKEN_KEY } from '@/lib/api/client'
import { useUser } from '@/lib/contexts/UserContext'
import { disconnectSupervisionSocket } from '@/lib/socket/supervisionSocket'
import type { LoginCredentials } from '@/types'

export function useLogin() {
  const router = useRouter()
  const { setUser } = useUser()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: async () => {
      // Store a flag so ShellLayout knows the session is active before context hydration
      localStorage.setItem(TOKEN_KEY, 'true')
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
      localStorage.removeItem(TOKEN_KEY)
      disconnectSupervisionSocket()
      clearUser()
      window.location.href = '/login'
    },
  })
}
