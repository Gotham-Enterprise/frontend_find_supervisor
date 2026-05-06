'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { FormInputField } from '@/components/ui/form-input-field'
import { type ChangePasswordFormValues, changePasswordSchema } from '@/lib/forms/change-password'
import { useChangePassword, useUserSnackbar } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'

export function ChangePasswordCard() {
  const { mutateAsync, isPending } = useChangePassword()
  const { showSuccess, showError } = useUserSnackbar()

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await mutateAsync(values)
      showSuccess('Password changed successfully.')
      form.reset()
    } catch (error) {
      showError(parseApiError(error))
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password. Your new password must be at least 8 characters and include
          uppercase, lowercase, a number, and a special character.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormInputField
              control={form.control}
              name="currentPassword"
              label="Current Password"
              placeholder="••••••••"
              autoComplete="current-password"
              passwordToggle
              isSubmitting={isPending}
              required
            />

            <FormInputField
              control={form.control}
              name="newPassword"
              label="New Password"
              placeholder="••••••••"
              autoComplete="new-password"
              passwordToggle
              isSubmitting={isPending}
              required
            />

            <FormInputField
              control={form.control}
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="••••••••"
              autoComplete="new-password"
              passwordToggle
              isSubmitting={isPending}
              required
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isPending ? 'Updating…' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
