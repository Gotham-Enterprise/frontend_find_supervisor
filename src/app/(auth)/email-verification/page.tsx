import { Suspense } from 'react'

import { EmailVerificationPage } from '@/components/EmailVerification/EmailVerificationPage'
import { VerifyEmailFlow } from '@/components/EmailVerification/VerifyEmailFlow'

interface Props {
  searchParams: Promise<{
    token?: string
    fullName?: string
    email?: string
    role?: string
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

  if (params.token) {
    return (
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailFlow />
      </Suspense>
    )
  }

  return (
    <EmailVerificationPage
      data={{
        fullName: params.fullName ?? '',
        email: params.email ?? '',
        role: params.role ?? '',
      }}
    />
  )
}
