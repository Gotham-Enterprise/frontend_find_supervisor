'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import type { SuperviseeFormValues } from '@/components/Signup/schema'
import {
  registerSupervisee,
  registerSupervisor,
  type SupervisorRegisterValues,
} from '@/lib/api/signup'
import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'

export function useSupervisorSignup() {
  const router = useRouter()

  return useMutation({
    mutationFn: (values: SupervisorRegisterValues) => registerSupervisor(values),
    onSuccess: (data, values) => {
      const params = new URLSearchParams({
        fullName: data.data.user.fullName,
        email: data.data.user.email,
        role:
          values.supervisorType === MEDICAL_DIRECTOR_TYPE_NAME ? 'Medical Director' : 'Supervisor',
        activationToken: data.data.activationToken,
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
        activationToken: data.data.activationToken,
      })
      router.push(`/email-verification?${params.toString()}`)
    },
  })
}
