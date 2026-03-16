'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import type { SuperviseeFormValues, SupervisorFormValues } from '@/components/Signup/schema'
import { registerSupervisee, registerSupervisor } from '@/lib/api/signup'

export function useSupervisorSignup() {
  const router = useRouter()

  return useMutation({
    mutationFn: (values: SupervisorFormValues) => registerSupervisor(values),
    onSuccess: () => {
      router.push('/login?registered=supervisor')
    },
  })
}

export function useSuperviseeSignup() {
  const router = useRouter()

  return useMutation({
    mutationFn: (values: SuperviseeFormValues) => registerSupervisee(values),
    onSuccess: () => {
      router.push('/login?registered=supervisee')
    },
  })
}
