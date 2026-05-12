'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { SuperviseeProfileEditFields } from '@/components/profile-edit/SuperviseeProfileEditFields'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { useUser } from '@/lib/contexts/UserContext'
import { useUserSnackbar } from '@/lib/contexts/UserSnackbarContext'
import {
  type EditSuperviseeProfileFormValues,
  editSuperviseeProfileSchema,
  getDefaultSuperviseeProfileFormValues,
  superviseeProfileFormValuesToPayload,
} from '@/lib/forms/supervisee-profile-edit'
import { useUpdateSuperviseeProfile } from '@/lib/hooks/useUpdateSuperviseeProfile'
import { parseApiError } from '@/lib/utils/error-parser'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

interface EditSuperviseeProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: SuperviseeProfileData
}

export function EditSuperviseeProfileModal({
  open,
  onOpenChange,
  profile,
}: EditSuperviseeProfileModalProps) {
  const { user } = useUser()
  const { showError } = useUserSnackbar()
  const userId = user?.id ?? ''

  const mutation = useUpdateSuperviseeProfile(userId)
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

  const form = useForm<EditSuperviseeProfileFormValues>({
    resolver: zodResolver(editSuperviseeProfileSchema),
    defaultValues: getDefaultSuperviseeProfileFormValues(profile),
  })

  useEffect(() => {
    if (open) {
      mutation.reset()
      form.reset(getDefaultSuperviseeProfileFormValues(profile))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: EditSuperviseeProfileFormValues) {
    try {
      await mutation.mutateAsync(superviseeProfileFormValuesToPayload(values))
      onOpenChange(false)
    } catch (err: unknown) {
      showError(parseApiError(err))
    }
  }

  const isSubmitting = form.formState.isSubmitting || mutation.isPending

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="mb-4">Edit Supervisee Profile</DialogTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SuperviseeProfileEditFields
              form={form}
              profile={profile}
              isSubmitting={isSubmitting}
              locationSyncEpoch={locationSyncEpoch}
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </DialogRoot>
  )
}
