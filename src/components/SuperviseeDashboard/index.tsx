'use client'

import { useState } from 'react'

import { EditSuperviseeProfileModal } from '@/components/EditSuperviseeProfileModal'
import { useMatchingRequests, useSupervisors, useUser } from '@/lib/hooks'
import { useSuperviseeProfile } from '@/lib/hooks/useSuperviseeProfile'

import { SuperviseeDashboardContent } from './SuperviseeDashboardContent'
import { SuperviseeDashboardSkeleton } from './SuperviseeDashboardSkeleton'
import {
  getSuperviseeProfileCompletion,
  getSuperviseeProfileCompletionFromData,
} from './SuperviseeDashboardUtils'

export function SuperviseeDashboard() {
  const { user } = useUser()
  const [editModalOpen, setEditModalOpen] = useState(false)

  const { data: matchingData, isLoading: matchingLoading } = useMatchingRequests()
  const { data: supervisorsData, isLoading: supervisorsLoading } = useSupervisors({
    available: true,
    pageSize: 3,
  })
  const {
    data: superviseeProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = useSuperviseeProfile()

  // Block the full skeleton only on the core data; profile loads independently
  if (matchingLoading || supervisorsLoading) return <SuperviseeDashboardSkeleton />

  const allRequests = matchingData?.data ?? []
  const pendingRequests = allRequests.filter((r) => r.status === 'pending')
  const acceptedRequests = allRequests.filter((r) => r.status === 'accepted')
  const availableSupervisors = supervisorsData?.data ?? []

  // Use the richer profile-based completion when available, fall back to user-only
  const completion = superviseeProfile
    ? getSuperviseeProfileCompletionFromData(superviseeProfile)
    : user
      ? getSuperviseeProfileCompletion(user)
      : 0

  return (
    <>
      <SuperviseeDashboardContent
        user={user ?? null}
        completion={completion}
        pendingRequests={pendingRequests}
        acceptedRequests={acceptedRequests}
        allRequests={allRequests}
        availableSupervisors={availableSupervisors}
        superviseeProfile={superviseeProfile ?? null}
        isProfileLoading={profileLoading}
        isProfileError={profileError}
        onEditProfileClick={() => setEditModalOpen(true)}
      />

      {superviseeProfile && (
        <EditSuperviseeProfileModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          profile={superviseeProfile}
        />
      )}
    </>
  )
}
