'use client'

import { Check, GraduationCap, Stethoscope, Users } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { cn } from '@/lib/utils'

import type { SignupRole } from '../types'

/**
 * Six signup roles are three services × two sides. Picking them in two steps
 * (service, then "I offer / I need") keeps the choice to three cards plus a
 * two-way toggle instead of a six-button grid.
 */
type ServiceKey = 'supervision' | 'medical-director' | 'preceptorship'
type Side = 'provider' | 'seeker'

type ServiceOption = {
  key: ServiceKey
  title: string
  description: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  roles: Record<Side, { value: SignupRole; label: string; hint: string }>
}

const SERVICES: ServiceOption[] = [
  {
    key: 'supervision',
    title: 'Supervision',
    description: 'Licensure supervision for counselors, NPs and PAs.',
    Icon: Users,
    roles: {
      provider: {
        value: 'supervisor',
        label: "I'm a Supervisor",
        hint: 'I provide supervision',
      },
      seeker: {
        value: 'supervisee',
        label: "I'm a Supervisee",
        hint: 'I need a supervisor',
      },
    },
  },
  {
    key: 'medical-director',
    title: 'Medical Director',
    description: 'Physician oversight for practices and clinics.',
    Icon: Stethoscope,
    roles: {
      provider: {
        value: 'medical-director',
        label: "I'm a Medical Director",
        hint: 'I serve as a medical director',
      },
      seeker: {
        value: 'need-medical-director',
        label: 'I need a Medical Director',
        hint: 'My practice needs oversight',
      },
    },
  },
  {
    key: 'preceptorship',
    title: 'Preceptorship',
    description: 'Rotations for students completing program hours.',
    Icon: GraduationCap,
    roles: {
      provider: {
        value: 'preceptor',
        label: "I'm a Preceptor",
        hint: 'I host students for rotations',
      },
      seeker: {
        value: 'preceptee',
        label: "I'm a Preceptee",
        hint: "I'm a student who needs a placement",
      },
    },
  },
]

function findSelection(role: SignupRole): { service: ServiceOption; side: Side } {
  for (const service of SERVICES) {
    for (const side of ['provider', 'seeker'] as const) {
      if (service.roles[side].value === role) return { service, side }
    }
  }
  return { service: SERVICES[0], side: 'provider' }
}

type AccountTypeSelectorProps = {
  value: SignupRole
  onChange: (role: SignupRole) => void
}

export function AccountTypeSelector({ value, onChange }: AccountTypeSelectorProps) {
  const { service: selectedService, side: selectedSide } = findSelection(value)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">What are you here for?</p>
        <div
          role="radiogroup"
          aria-label="Service"
          className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {SERVICES.map((service) => {
            const active = service.key === selectedService.key
            return (
              <button
                key={service.key}
                type="button"
                role="radio"
                aria-checked={active}
                // Switching service keeps the same side (offer / need).
                onClick={() => onChange(service.roles[selectedSide].value)}
                className={cn(
                  'relative flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <service.Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block text-sm font-semibold',
                      active ? 'text-foreground' : 'text-foreground/90',
                    )}
                  >
                    {service.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {service.description}
                  </span>
                </span>
                {active && (
                  <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">I am signing up as</p>
        <div
          role="radiogroup"
          aria-label="Your role"
          className="mt-2 grid grid-cols-1 gap-1 rounded-xl border border-border bg-muted/40 p-1 sm:grid-cols-2"
        >
          {(['provider', 'seeker'] as const).map((side) => {
            const role = selectedService.roles[side]
            const active = role.value === value
            return (
              <button
                key={role.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(role.value)}
                className={cn(
                  'flex flex-col items-center rounded-lg px-4 py-2.5 text-center transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="text-sm font-semibold">{role.label}</span>
                <span
                  className={cn(
                    'text-[11px] leading-tight',
                    active ? 'text-white/80' : 'text-muted-foreground/80',
                  )}
                >
                  {role.hint}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
