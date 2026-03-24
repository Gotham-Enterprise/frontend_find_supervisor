import { SUPERVISOR_SIGNUP_STEP_META } from '@/components/Signup/schema'
import { cn } from '@/lib/utils'

import type { SupervisorSignupStepIndex } from './validateSupervisorStep'

type SupervisorStepIndicatorProps = {
  currentStep: SupervisorSignupStepIndex
}

export function SupervisorStepIndicator({ currentStep }: SupervisorStepIndicatorProps) {
  return (
    <div className="mb-8">
      <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {SUPERVISOR_SIGNUP_STEP_META[currentStep].stepLabel} of 3
      </p>
      <h2 className="text-lg font-semibold text-foreground">
        {SUPERVISOR_SIGNUP_STEP_META[currentStep].title}
      </h2>
      <ol
        className="mt-4 flex items-start justify-center gap-2 sm:gap-4"
        aria-label="Signup progress"
      >
        {SUPERVISOR_SIGNUP_STEP_META.map((meta, index) => {
          const done = index < currentStep
          const active = index === currentStep
          return (
            <li key={meta.title} className="flex flex-1 flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  active && 'border-primary bg-primary text-primary-foreground',
                  done && !active && 'border-primary bg-primary/10 text-primary',
                  !active && !done && 'border-border bg-muted/40 text-muted-foreground',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase leading-tight tracking-wide sm:text-xs',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {meta.title}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
