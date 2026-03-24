import { CheckCircle2, Mail } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import type { VerificationPageData } from '../types'
import { VerificationActions } from '../VerificationActions'
import { VerificationSummary } from '../VerificationSummary'

interface Props {
  data: VerificationPageData
}

export function EmailVerificationCard({ data }: Props) {
  const hasData = Boolean(data.email)

  return (
    <Card className="w-full max-w-[560px] shadow-lg">
      <CardContent className="flex flex-col items-center gap-6 px-6 py-10 sm:px-10">
        {/* ── Email Icon ───────────────────────────────────────────── */}
        <div className="relative">
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#006D36]/10 ring-1 ring-[#006D36]/20">
            <Mail className="h-10 w-10 text-[#006D36]" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#006D36] ring-[2.5px] ring-background">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* ── Status Badge ─────────────────────────────────────────── */}
        <Badge className="gap-1.5 rounded-full border border-[#006D36]/25 bg-[#006D36]/10 px-3 py-1 text-xs font-semibold text-[#006D36] hover:bg-[#006D36]/10">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#006D36]" />
          Registration Successful
        </Badge>

        {/* ── Title & Description ───────────────────────────────────── */}
        <div className="-mt-1 space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify Your Email</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your account has been created successfully.
            <br />
            Please verify your email address to activate your account.
          </p>
        </div>

        {/* ── Email Sent Highlight ──────────────────────────────────── */}
        {hasData && (
          <div className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Verification Email Sent To
            </p>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#006D36]" />
              <span className="text-sm font-semibold text-foreground">{data.email}</span>
            </div>
          </div>
        )}

        {/* ── User Info Summary ─────────────────────────────────────── */}
        {hasData && <VerificationSummary data={data} />}

        {/* ── Action Buttons ────────────────────────────────────────── */}
        <VerificationActions email={data.email} token={data.token} />

        {/* ── Helper Tips ───────────────────────────────────────────── */}
        <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-4">
          <ul className="space-y-2">
            {[
              <>
                Didn&apos;t get the email? Check your{' '}
                <strong className="font-semibold text-foreground">spam or junk</strong> folder.
              </>,
              <>Wait a few minutes before requesting another email.</>,
              <>You need to verify your email before you can sign in.</>,
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <p className="text-xs leading-5 text-muted-foreground">{line}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Fallback if page opened without data ─────────────────── */}
        {!hasData && (
          <p className="text-center text-sm text-muted-foreground">
            If you recently registered, please check your inbox for a verification email.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
