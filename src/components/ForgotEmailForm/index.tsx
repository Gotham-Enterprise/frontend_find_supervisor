'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Phone } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { AuthPageFooter } from '@/components/Layout/auth-page-footer'
import { PublicHeader } from '@/components/Layout/public-header'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { forgotEmail } from '@/lib/api/recovery'
import { useUserSnackbar } from '@/lib/contexts/UserSnackbarContext'
import { parseApiError } from '@/lib/utils/error-parser'

import {
  forgotEmailFormDefaultValues,
  type ForgotEmailFormValues,
  forgotEmailSchema,
} from './helpers'

export function ForgotEmailPage() {
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
                Recover Email
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your phone number and set a new password to recover access to your account.
              </p>
            </div>
            <ForgotEmailForm />
          </div>
        </div>
      </main>

      <AuthPageFooter />
    </div>
  )
}

function ForgotEmailForm() {
  const router = useRouter()
  const { showSuccess } = useUserSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<ForgotEmailFormValues>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: forgotEmailFormDefaultValues,
  })

  async function onSubmit(values: ForgotEmailFormValues) {
    setApiError(null)
    setIsSubmitting(true)
    try {
      await forgotEmail({ phone: values.phone, newPassword: values.newPassword })
      showSuccess('Your password has been updated. You can now sign in with your new credentials.')
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

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone number <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Phone className="size-4" aria-hidden />
                  </span>
                  <PhoneInput
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val)
                      setApiError(null)
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={isSubmitting}
                    className="pl-9"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              Recovering…
            </>
          ) : (
            'Recover account'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remember your credentials?{' '}
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
