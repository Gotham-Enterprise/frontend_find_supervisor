'use client'

import { UserCircle, Users } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { SuperviseeForm } from './SuperviseeForm'
import { SupervisorForm } from './SupervisorForm'

type SignUpRole = 'supervisor' | 'supervisee'

export function SignUpForm() {
  const [role, setRole] = useState<SignUpRole>('supervisor')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setRole('supervisor')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            role === 'supervisor'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <UserCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Supervisor</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('supervisee')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            role === 'supervisee'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Supervisee</span>
        </button>
      </div>

      {role === 'supervisor' ? <SupervisorForm /> : <SuperviseeForm />}
    </div>
  )
}
