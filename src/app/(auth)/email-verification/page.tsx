import { Suspense } from 'react'

import { EmailVerificationPage } from '@/components/EmailVerification/EmailVerificationPage'
import { VerifyEmailFlow } from '@/components/EmailVerification/VerifyEmailFlow'

interface Props {
  searchParams: Promise<{
    token?: string
    fullName?: string
    email?: string
    role?: string
    activationToken?: string
  }>
}

export const metadata = {
  title: 'Verify Your Email | Find A Supervisor',
  description: 'Please verify your email address to activate your account.',
}

function VerifyEmailFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero-bg px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#006D36] border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams

  // token in the URL means the user clicked the verification link from their email
  if (params.token) {
    return (
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailFlow />
      </Suspense>
    )
  }

  // No token — show the "check your email" page with resend option
  return (
    <EmailVerificationPage
      data={{
        fullName: params.fullName ?? '',
        email: params.email ?? '',
        role: params.role ?? '',
        token: params.activationToken ?? '',
      }}
    />
  )
}
