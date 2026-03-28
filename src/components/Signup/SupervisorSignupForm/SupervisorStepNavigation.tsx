'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { SupervisorSignupStepIndex } from './validateSupervisorStep'

type SupervisorStepNavigationProps = {
  step: SupervisorSignupStepIndex
  onBack: () => void
  onNext: () => void
  isAdvancing: boolean
  isPending: boolean
  /** RHF submitting and/or signup mutation in flight — disables nav and fields consistently. */
  isSubmitting: boolean
  isValidatingAddress: boolean
  canSubmit: boolean
}

export function SupervisorStepNavigation({
  step,
  onBack,
  onNext,
  isAdvancing,
  isPending,
  isSubmitting,
  isValidatingAddress,
  canSubmit,
}: SupervisorStepNavigationProps) {
  const busy = isAdvancing || isSubmitting

  return (
    <div className={cn('flex flex-col gap-4', step === 2 ? 'mt-4' : 'border-t border-border pt-6')}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onBack()
          }}
          disabled={step === 0 || busy || isValidatingAddress}
          className="sm:min-w-[120px]"
        >
          Back
        </Button>
        {step < 2 ? (
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onNext()
            }}
            disabled={busy || isValidatingAddress}
            className="sm:min-w-[120px]"
          >
            {isValidatingAddress ? 'Verifying address…' : isAdvancing ? 'Please wait…' : 'Next'}
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto sm:min-w-[200px]"
            disabled={!canSubmit || isAdvancing || isSubmitting}
          >
            {isPending ? 'Creating your account…' : 'Sign Up as Supervisor →'}
          </Button>
        )}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
