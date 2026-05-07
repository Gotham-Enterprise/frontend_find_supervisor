'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { type Resolver, useForm } from 'react-hook-form'

import { SupervisorProfileEditFields } from '@/components/profile-edit/SupervisorProfileEditFields'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { useUser } from '@/lib/contexts/UserContext'
import {
  createEditSupervisorProfileSchema,
  type EditSupervisorProfileFormValues,
  getDefaultSupervisorProfileFormValues,
  supervisorProfileFormValuesToPayload,
} from '@/lib/forms/supervisor-profile-edit'
import { useUpdateSupervisorProfile } from '@/lib/hooks/useUpdateSupervisorProfile'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface EditSupervisorProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: SupervisorProfileData
}

export function EditSupervisorProfileModal({
  open,
  onOpenChange,
  profile,
}: EditSupervisorProfileModalProps) {
  const { user } = useUser()
  const userId = user?.id ?? ''

  const mutation = useUpdateSupervisorProfile(userId)
  const locationSyncEpoch = useMemo(
    () =>
      [
        open ? '1' : '0',
        profile.user.state ?? '',
        profile.user.city ?? '',
        profile.user.zipcode ?? '',
      ].join('|'),
    [open, profile.user.state, profile.user.city, profile.user.zipcode],
  )

  const editSchema = useMemo(() => createEditSupervisorProfileSchema(profile), [profile])

  const form = useForm<EditSupervisorProfileFormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(editSchema) as Resolver<EditSupervisorProfileFormValues>,
    defaultValues: getDefaultSupervisorProfileFormValues(profile),
  })

  useEffect(() => {
    if (open) {
      form.reset(getDefaultSupervisorProfileFormValues(profile))
      queueMicrotask(() => void form.trigger())
    }
  }, [open, profile.updatedAt, form, profile])

  async function onSubmit(values: EditSupervisorProfileFormValues) {
    await mutation.mutateAsync(supervisorProfileFormValuesToPayload(values))
    onOpenChange(false)
  }

  const isSubmitting = form.formState.isSubmitting || mutation.isPending
  const { isValid } = form.formState

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="mb-4">Edit Supervisor Profile</DialogTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SupervisorProfileEditFields
              form={form}
              profile={profile}
              isSubmitting={isSubmitting}
              locationSyncEpoch={locationSyncEpoch}
            />

            {mutation.isError && (
              <p className="text-sm text-destructive">Failed to save changes. Please try again.</p>
            )}

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
