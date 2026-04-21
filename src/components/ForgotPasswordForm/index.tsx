'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { AuthPageFooter } from '@/components/Layout/auth-page-footer'
import { PublicHeader } from '@/components/Layout/public-header'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { forgotPassword } from '@/lib/api/recovery'
import { parseApiError } from '@/lib/utils/error-parser'

import {
  forgotPasswordFormDefaultValues,
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from './helpers'

export function ForgotPasswordPage() {
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
                Reset Password
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>
            <ForgotPasswordForm />
          </div>
        </div>
      </main>

      <AuthPageFooter />
    </div>
  )
}

function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: forgotPasswordFormDefaultValues,
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setApiError(null)
    setIsSubmitting(true)
    try {
      await forgotPassword({ email: values.email })
      setSubmitted(true)
    } catch (err) {
      setApiError(parseApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="rounded-lg border border-border bg-muted/50 px-4 py-4 text-sm text-foreground"
        >
          <p className="font-medium">Check your inbox</p>
          <p className="mt-1 text-muted-foreground">
            If an account exists for{' '}
            <span className="font-medium text-foreground">{form.getValues('email')}</span>, you will
            receive a password reset link shortly.
          </p>
        </div>
        <Link
          href="/login"
          className="block text-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
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
          name="email"
          label="Email address"
          required
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          isSubmitting={isSubmitting}
          startAdornment={<Mail className="size-4 text-muted-foreground" aria-hidden />}
        />

        <Button type="submit" className="h-11 w-full text-base" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            'Send reset link'
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
