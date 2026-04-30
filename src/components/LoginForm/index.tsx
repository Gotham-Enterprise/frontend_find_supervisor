'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/lib/hooks'
import { cn } from '@/lib/utils'

import {
  loginFormDefaultValues,
  type LoginFormValues,
  loginSchema,
  REMEMBERED_LOGIN_EMAIL_KEY,
} from './helpers'
import { parseLoginError } from './parse-login-error'

export function LoginForm() {
  const { mutate: login, isPending, error, reset: resetMutation } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const defaultValues = useMemo(() => ({ ...loginFormDefaultValues }), [])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  })

  const { setValue } = form
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_LOGIN_EMAIL_KEY)
      if (saved) {
        setValue('email', saved)
        setValue('rememberMe', true)
      }
    } catch {
      // ignore storage access errors
    }
  }, [setValue])

  function clearApiError() {
    resetMutation()
  }

  function onSubmit(values: LoginFormValues) {
    resetMutation()
    login(
      { email: values.email, password: values.password },
      {
        onSuccess: () => {
          try {
            if (values.rememberMe) {
              localStorage.setItem(REMEMBERED_LOGIN_EMAIL_KEY, values.email)
            } else {
              localStorage.removeItem(REMEMBERED_LOGIN_EMAIL_KEY)
            }
          } catch {
            // ignore
          }
        },
      },
    )
  }

  const parsedError = error ? parseLoginError(error) : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {parsedError?.kind === 'invalid_credentials' && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            Invalid email or password. Please check your credentials and try again.
          </div>
        )}

        {parsedError?.kind === 'email_unverified' && (
          <div
            role="alert"
            className="rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
          >
            <p>{parsedError.message}</p>
            {parsedError.activationToken ? (
              <Link
                href={`/email-verification?token=${encodeURIComponent(parsedError.activationToken)}`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'mt-3 w-full border-amber-600/40 text-amber-950 hover:bg-amber-100 dark:text-amber-50 dark:hover:bg-amber-900/40',
                )}
              >
                Open verification link
              </Link>
            ) : (
              <p className="mt-2 text-xs opacity-90">
                {/* Backend did not return a token; user can request help via Contact. */}
                Need help?{' '}
                <Link href="/contact" className="font-medium underline underline-offset-2">
                  Contact support
                </Link>
                .
              </p>
            )}
          </div>
        )}

        {parsedError?.kind === 'account_deactivated' && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {parsedError.message}
          </div>
        )}

        {parsedError?.kind === 'account_locked' && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {parsedError.message}
          </div>
        )}

        {parsedError?.kind === 'generic' && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {parsedError.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel className="min-w-0">Email address</FormLabel>
                <Link
                  href="/forgot-email"
                  className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Forgot email?
                </Link>
              </div>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  startAdornment={<Mail className="size-4 text-muted-foreground" aria-hidden />}
                  {...field}
                  onChange={(e) => {
                    clearApiError()
                    field.onChange(e)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel className="min-w-0">Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  startAdornment={<Lock className="size-4 text-muted-foreground" aria-hidden />}
                  endAdornment={
                    <button
                      type="button"
                      className="inline-flex rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={0}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  }
                  {...field}
                  onChange={(e) => {
                    clearApiError()
                    field.onChange(e)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  aria-label="Remember me on this device"
                />
              </FormControl>
              <span className="text-sm text-muted-foreground">Remember me</span>
            </FormItem>
          )}
        />

        <Button type="submit" className="h-11 w-full text-base" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  )
}
