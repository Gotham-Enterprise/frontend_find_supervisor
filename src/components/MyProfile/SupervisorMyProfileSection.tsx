'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'

import { SupervisorProfileEditFields } from '@/components/profile-edit/SupervisorProfileEditFields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserSnackbar } from '@/lib/contexts/UserSnackbarContext'
import {
  createEditSupervisorProfileSchema,
  type EditSupervisorProfileFormValues,
  getDefaultSupervisorProfileFormValues,
  supervisorProfileFormValuesToPayload,
} from '@/lib/forms/supervisor-profile-edit'
import { useSupervisorProfile, useUpdateSupervisorProfile, useUser } from '@/lib/hooks'
import { mergeSupervisorProfileDisplayName } from '@/lib/profile/supervisor-profile-display'
import { parseApiError } from '@/lib/utils/error-parser'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

function SupervisorMyProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Skeleton className="h-8 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="size-24 rounded-full" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
      <AlertCircle className="mb-3 size-10 text-muted-foreground/50" />
      <p className="font-medium text-foreground">Could not load your profile</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Please try again or contact support if this persists.
      </p>
      <Button type="button" variant="outline" className="mt-6" onClick={() => onRetry()}>
        Try again
      </Button>
    </div>
  )
}

function SupervisorMyProfileEditor({
  profile,
  userId,
}: {
  profile: SupervisorProfileData
  userId: string
}) {
  const { refreshUser } = useUser()
  const { showSuccess, showError } = useUserSnackbar()
  const mutation = useUpdateSupervisorProfile(userId)
  const [cancelLocationNonce, setCancelLocationNonce] = useState(0)

  const locationSyncEpoch = useMemo(
    () =>
      [
        cancelLocationNonce,
        profile.user.state ?? '',
        profile.user.city ?? '',
        profile.user.zipcode ?? '',
      ].join('|'),
    [cancelLocationNonce, profile.user.state, profile.user.city, profile.user.zipcode],
  )

  const editSchema = useMemo(() => createEditSupervisorProfileSchema(profile), [profile])

  const form = useForm<EditSupervisorProfileFormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(editSchema) as Resolver<EditSupervisorProfileFormValues>,
    defaultValues: getDefaultSupervisorProfileFormValues(profile),
  })

  useEffect(() => {
    form.reset(getDefaultSupervisorProfileFormValues(profile))
    queueMicrotask(() => void form.trigger())
  }, [profile, form])

  const isSubmitting = form.formState.isSubmitting || mutation.isPending
  const { isValid } = form.formState

  async function onSubmit(values: EditSupervisorProfileFormValues) {
    try {
      await mutation.mutateAsync(supervisorProfileFormValuesToPayload(values))
      await refreshUser()
      showSuccess('Profile saved')
    } catch (err: unknown) {
      showError(parseApiError(err))
    }
  }

  function handleCancel() {
    form.reset(getDefaultSupervisorProfileFormValues(profile))
    setCancelLocationNonce((n) => n + 1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SupervisorProfileEditFields
          form={form}
          profile={profile}
          isSubmitting={isSubmitting}
          locationSyncEpoch={locationSyncEpoch}
        />

        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function SupervisorMyProfileSection() {
  const { user } = useUser()
  const { data: profile, isLoading, isError, refetch } = useSupervisorProfile()

  const enrichedProfile = useMemo(() => {
    if (!profile || !user?.id) return null
    return mergeSupervisorProfileDisplayName(profile, user)
  }, [profile, user])

  if (isLoading) {
    return <SupervisorMyProfileSkeleton />
  }

  if (isError || !profile || !user?.id) {
    return <ProfileLoadError onRetry={() => void refetch()} />
  }

  if (!enrichedProfile) {
    return <ProfileLoadError onRetry={() => void refetch()} />
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details supervisees see on your profile. Changes use the same information as
          your dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supervisor profile</CardTitle>
          <CardDescription>
            Fields match your dashboard editor. Save applies your updates immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupervisorMyProfileEditor profile={enrichedProfile} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
