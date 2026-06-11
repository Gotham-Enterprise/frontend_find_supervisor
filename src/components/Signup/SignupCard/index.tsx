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

      {role === 'supervisor' ? <SupervisorSignupForm /> : <SuperviseeSignupForm />}
    </div>
  )
}
