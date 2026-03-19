'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import type { SuperviseeFormValues, SupervisorFormValues } from '@/components/Signup/schema'
import { registerSupervisee, registerSupervisor } from '@/lib/api/signup'

export function useSupervisorSignup() {
  const router = useRouter()

  return useMutation({
    mutationFn: (values: SupervisorFormValues) => registerSupervisor(values),
    onSuccess: (data) => {
      const params = new URLSearchParams({
        fullName: data.data.user.fullName,
        email: data.data.user.email,
        role: 'Supervisor',
      })
      router.push(`/email-verification?${params.toString()}`)
    },
  })
}

export function useSuperviseeSignup() {
  const router = useRouter()

  return useMutation({
    mutationFn: (values: SuperviseeFormValues) => registerSupervisee(values),
    onSuccess: (data) => {
      const params = new URLSearchParams({
        fullName: data.data.user.fullName,
        email: data.data.user.email,
        role: 'Supervisee',
      })
      router.push(`/email-verification?${params.toString()}`)
    },
  })
}
