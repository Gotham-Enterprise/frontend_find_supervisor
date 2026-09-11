'use client'

import { useState } from 'react'

import { AccountTypeSelector } from '../AccountTypeSelector'
import { SuperviseeSignupForm } from '../SuperviseeSignupForm'
import { SupervisorSignupForm } from '../SupervisorSignupForm'
import type { SignupRole } from '../types'

type SignupCardProps = {
  initialRole?: SignupRole
}

export function SignupCard({ initialRole = 'supervisor' }: SignupCardProps) {
  const [role, setRole] = useState<SignupRole>(initialRole)

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <AccountTypeSelector value={role} onChange={setRole} />
      </div>

      {role === 'supervisee' || role === 'need-medical-director' ? (
        // key={role}: variant switches must remount so the shared useForm
        // instance never carries stale needsMedicalDirector/supervisorType state.
        <SuperviseeSignupForm
          key={role}
          variant={role === 'need-medical-director' ? 'need-medical-director' : 'supervisee'}
        />
      ) : (
        <SupervisorSignupForm
          key={role}
          variant={role === 'medical-director' ? 'medical-director' : 'supervisor'}
        />
      )}
    </div>
  )
}
