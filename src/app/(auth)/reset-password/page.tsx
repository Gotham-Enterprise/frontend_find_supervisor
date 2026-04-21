import { Suspense } from 'react'

import { ResetPasswordPage } from '@/components/ResetPasswordForm'

export const metadata = {
  title: 'Set New Password | Find A Supervisor',
  description: 'Set a new password for your Find A Supervisor account.',
}

function ResetPasswordFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero-bg px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#006D36] border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

export default function ResetPasswordRoutePage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordPage />
    </Suspense>
  )
}
