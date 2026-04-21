'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { AuthPageFooter } from '@/components/Layout/auth-page-footer'
import { PublicHeader } from '@/components/Layout/public-header'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { resetPassword } from '@/lib/api/recovery'
import { useUserSnackbar } from '@/lib/contexts/UserSnackbarContext'
import { parseApiError } from '@/lib/utils/error-parser'

import {
  resetPasswordFormDefaultValues,
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from './helpers'

export function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-hero-bg">
      <PublicHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Find A Supervisor
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              Match with the right supervisor for your journey.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 space-y-1 text-center sm:mb-8 sm:text-left">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Set New Password
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a new password for your account.
              </p>
            </div>
            <ResetPasswordForm />
          </div>
        </div>
      </main>

      <AuthPageFooter />
    </div>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showSuccess } = useUserSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const token = searchParams.get('token') ?? ''

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordFormDefaultValues,
  })

  // Invalid/missing token — show a clear error state before the user can submit
  if (!token) {
    return (
      <div className="space-y-5">
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          This password reset link is invalid or has expired. Please request a new one.
        </div>
        <Link
          href="/forgot-password"
          className="block text-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  async function onSubmit(values: ResetPasswordFormValues) {
    setApiError(null)
    setIsSubmitting(true)
    try {
      await resetPassword({ token, newPassword: values.newPassword })
      showSuccess('Your password has been updated. You can now sign in.')
      router.push('/login')
    } catch (err) {
      setApiError(parseApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {apiError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {apiError}
          </div>
        )}

        <FormInputField
          control={form.control}
          name="newPassword"
          label="New password"
          required
          placeholder="••••••••"
          passwordToggle
          autoComplete="new-password"
          isSubmitting={isSubmitting}
          startAdornment={<Lock className="size-4 text-muted-foreground" aria-hidden />}
        />

        <FormInputField
          control={form.control}
          name="confirmPassword"
          label="Confirm password"
          required
          placeholder="••••••••"
          passwordToggle
          autoComplete="new-password"
          isSubmitting={isSubmitting}
          startAdornment={<Lock className="size-4 text-muted-foreground" aria-hidden />}
        />

        <Button type="submit" className="h-11 w-full text-base" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Updating…
            </>
          ) : (
            'Update password'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}
