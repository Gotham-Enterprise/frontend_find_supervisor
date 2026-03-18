'use client'

import { LogIn, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { useUserSnackbar } from '@/lib/hooks'
import { cn } from '@/lib/utils'

interface Props {
  email: string
}

export function VerificationActions({ email: _email }: Props) {
  const [isResending, setIsResending] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()

  async function handleResend() {
    setIsResending(true)
    try {
      // TODO: wire up resend endpoint when available
      // e.g. await resendVerificationEmail({ email })
      await new Promise((resolve) => setTimeout(resolve, 900))
      showSuccess('Verification email resent. Please check your inbox.')
    } catch {
      showError('Failed to resend. Please try again later.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Button size="lg" className="w-full gap-2" onClick={handleResend} disabled={isResending}>
        <RefreshCw className={cn('h-4 w-4', isResending && 'animate-spin')} />
        {isResending ? 'Sending…' : 'Resend Verification Email'}
      </Button>

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
