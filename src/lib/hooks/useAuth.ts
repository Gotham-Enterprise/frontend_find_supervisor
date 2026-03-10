'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { login, logout } from '@/lib/api/auth'
import { TOKEN_KEY } from '@/lib/api/client'
import type { LoginCredentials } from '@/types'

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (token) => {
      localStorage.setItem(TOKEN_KEY, token.accessToken)
      router.push('/dashboard')
    },
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    },
  })
}
