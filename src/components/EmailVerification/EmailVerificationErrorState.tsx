'use client'

import { AlertTriangle, ArrowLeft, Clock, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { headlineForVerificationError } from '@/lib/email-verification/error-copy'
import type { EmailVerificationErrorCode } from '@/lib/email-verification/types'
import { useResendVerificationEmail } from '@/lib/hooks/useResendVerificationEmail'

interface Props {
  code: EmailVerificationErrorCode
  message: string
  /** The activation token from the URL, used to call the resend endpoint. */
  token?: string | null
  onBackToLogin: () => void
}

export function EmailVerificationErrorState({ code, message, token, onBackToLogin }: Props) {
  const headline = headlineForVerificationError(code)
  const { resend, isPending, isOnCooldown, countdown, isDisabled } =
    useResendVerificationEmail(token)

  const badgeLabel =
    code === 'expired'
      ? 'Link expired'
      : code === 'already_verified'
        ? 'Already verified'
        : 'Link issue'

  return (
    <Card className="w-full max-w-[560px] shadow-lg">
      <CardContent className="flex flex-col items-center gap-6 px-6 py-10 sm:px-10">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-amber-50 ring-2 ring-amber-200/80">
              <AlertTriangle className="h-10 w-10 text-amber-600" strokeWidth={1.5} />
            </div>
          </div>
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-50"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-600" />
            {badgeLabel}
          </Badge>
        </div>

        <div className="-mt-1 space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{headline}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              className="h-11 w-full gap-2 bg-[#006D36] text-white hover:bg-[#006D36]/90"
              onClick={resend}
              disabled={isDisabled}
            >
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
                  : 'Resend verification email'}
            </Button>

            {isOnCooldown && (
              <p className="text-center text-xs text-muted-foreground">
                Please wait before requesting another email.
              </p>
            )}

            {!token && (
              <p className="text-center text-xs text-muted-foreground">
                We couldn&apos;t find the verification details for this request.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2 border-border"
            onClick={onBackToLogin}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </div>

        <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Recovery tips
          </p>
          <ul className="space-y-2">
            {[
              'Open the most recent verification email from us.',
              'Copy the full link—some clients break long URLs.',
              'Use the button above to request a fresh verification email.',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                <p className="text-xs leading-5 text-muted-foreground">{line}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Still need help?{' '}
          <Link
            href="/contact"
            className="font-medium text-[#006D36] underline-offset-4 hover:underline"
          >
            Contact support
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
