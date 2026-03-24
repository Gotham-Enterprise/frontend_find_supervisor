'use client'

import { Clock, LogIn, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Button, buttonVariants } from '@/components/ui/button'
import { useResendVerificationEmail } from '@/lib/hooks/useResendVerificationEmail'
import { cn } from '@/lib/utils'

interface Props {
  email: string
  token?: string
}

export function VerificationActions({ email: _email, token }: Props) {
  const { resend, isPending, isOnCooldown, countdown, isDisabled } =
    useResendVerificationEmail(token)

  const hasToken = Boolean(token?.trim())

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Button size="lg" className="w-full gap-2" onClick={resend} disabled={isDisabled}>
          {isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : isOnCooldown ? (
            <Clock className="h-4 w-4" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isPending
            ? 'Sending…'
            : isOnCooldown
              ? `Resend available in ${countdown}`
              : 'Resend Verification Email'}
        </Button>

        {isOnCooldown && (
          <p className="text-center text-xs text-muted-foreground">
            Please wait before requesting another email.
          </p>
        )}

        {!hasToken && (
          <p className="text-center text-xs text-muted-foreground">
            We couldn&apos;t find the verification details for this request.
          </p>
        )}
      </div>

      <Link
        href="/login"
        className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full gap-2')}
      >
        <LogIn className="h-4 w-4" />
        Already verified? Go to Login
      </Link>
    </div>
  )
}
