'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AuthPageFooter } from '@/components/Layout/auth-page-footer'
import { PublicHeader } from '@/components/Layout/public-header'
import { TOKEN_KEY } from '@/lib/api/client'
import { AUTO_REDIRECT_MS, getPostVerificationFallbackPath } from '@/lib/email-verification/config'
import { DEFAULT_ERROR_SUPPORTING } from '@/lib/email-verification/error-copy'
import type { EmailVerificationErrorCode } from '@/lib/email-verification/types'
import { verifyEmailToken } from '@/lib/email-verification/verify-email-token'

import { EmailVerificationErrorState } from './EmailVerificationErrorState'
import { EmailVerificationLoadingState } from './EmailVerificationLoadingState'
import {
  EmailVerificationRedirectState,
  VerifyEmailBackLink,
} from './EmailVerificationRedirectState'

type Phase = 'loading' | 'success' | 'error'

function resolveRedirectPath(role?: string): string {
  if (role === 'SUPERVISOR' || role === 'supervisor') return '/dashboard'
  return getPostVerificationFallbackPath()
}

export function VerifyEmailFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [phase, setPhase] = useState<Phase>('loading')
  const [redirectPath, setRedirectPath] = useState('/dashboard')
  const [error, setError] = useState<{
    code: EmailVerificationErrorCode
    message: string
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!token?.trim()) {
        if (!cancelled) {
          setError({
            code: 'missing_token',
            message:
              'Verification link is missing a token. Use the full link from your email or request a new verification email.',
          })
          setPhase('error')
        }
        return
      }

      const result = await verifyEmailToken(token)
      if (cancelled) return

      if (result.kind === 'error') {
        setError({
          code: result.code,
          message: result.message || DEFAULT_ERROR_SUPPORTING,
        })
        setPhase('error')
        return
      }

      if (result.accessToken) {
        localStorage.setItem(TOKEN_KEY, result.accessToken)
      }
      setRedirectPath(resolveRedirectPath(result.role))
      setPhase('success')
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (phase !== 'success') return

    const id = window.setTimeout(() => {
      void router.push(redirectPath)
    }, AUTO_REDIRECT_MS)

    return () => window.clearTimeout(id)
  }, [phase, redirectPath, router])

  function handleContinue() {
    void router.push(redirectPath)
  }

  function handleBackToLogin() {
    void router.push('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-hero-bg">
      <PublicHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-14 sm:py-20">
        {phase === 'loading' && <EmailVerificationLoadingState />}
        {phase === 'success' && <EmailVerificationRedirectState onContinue={handleContinue} />}
        {phase === 'error' && error && (
          <EmailVerificationErrorState
            code={error.code}
            message={error.message}
            token={token}
            onBackToLogin={handleBackToLogin}
          />
        )}

        <VerifyEmailBackLink />
      </main>

      <AuthPageFooter />
    </div>
  )
}
