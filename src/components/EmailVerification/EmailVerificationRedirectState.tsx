'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  onContinue: () => void
  progressFraction?: number
}

export function EmailVerificationRedirectState({ onContinue, progressFraction = 0.65 }: Props) {
  return (
    <Card className="w-full max-w-[560px] shadow-lg">
      <CardContent className="flex flex-col items-center gap-6 px-6 py-10 sm:px-10">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#006D36]/10 ring-1 ring-[#006D36]/20">
              <Loader2 className="h-10 w-10 animate-spin text-[#006D36]" strokeWidth={1.5} />
            </div>
          </div>
          <Badge className="gap-1.5 rounded-full border border-[#006D36]/25 bg-[#006D36]/10 px-3 py-1 text-xs font-semibold text-[#006D36] hover:bg-[#006D36]/10">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#006D36]" />
            Email verified
          </Badge>
        </div>

        <div className="-mt-1 space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Taking you to your account
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your email is verified and your account is ready. We&apos;re signing you in—please wait
            while we take you to your dashboard.
          </p>
        </div>

        <div className="w-full space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full bg-[#006D36] transition-all duration-500')}
              style={{ width: `${Math.round(progressFraction * 100)}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">Signing you in…</p>
        </div>

        <Button
          type="button"
          className="h-11 w-full gap-2 bg-[#006D36] text-white hover:bg-[#006D36]/90"
          onClick={onContinue}
        >
          Continue to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          If you aren&apos;t redirected,{' '}
          <button
            type="button"
            onClick={onContinue}
            className="font-medium text-[#006D36] underline-offset-4 hover:underline"
          >
            continue manually
          </button>
        </p>
      </CardContent>
    </Card>
  )
}

export function VerifyEmailBackLink() {
  return (
    <Link
      href="/"
      className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      ← Back to Homepage
    </Link>
  )
}
