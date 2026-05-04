'use client'

import { useState } from 'react'

import { EditSuperviseeProfileModal } from '@/components/EditSuperviseeProfileModal'
import {
  useHiresList,
  useRecommendedSupervisors,
  useSuperviseeUpcomingSessions,
  useUser,
} from '@/lib/hooks'
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

  const { data: hiresData, isLoading: hiresLoading, isError: hiresError } = useHiresList(1, 10)
  const {
    data: upcomingSessionsData,
    isLoading: upcomingSessionsLoading,
    isError: upcomingSessionsError,
    refetch: refetchUpcomingSessions,
  } = useSuperviseeUpcomingSessions()
  const {
    data: recommendedData,
    isLoading: recommendedLoading,
    isError: recommendedError,
  } = useRecommendedSupervisors({ page: 1, limit: 6 })
  const {
    data: superviseeProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = useSuperviseeProfile()

  // Block the full skeleton on hires data; recommended and profile load independently
  if (hiresLoading) return <SuperviseeDashboardSkeleton />

  const allHires = hiresData?.items ?? []
  const totalHiresCount = hiresData?.totalCount ?? 0
  const pendingHires = allHires.filter((h) => h.status === 'PENDING')

  const recommendedSupervisors = recommendedData?.items ?? []
  const totalRecommendedCount = recommendedData?.totalCount ?? 0

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
        allHires={allHires}
        totalHiresCount={totalHiresCount}
        pendingHires={pendingHires}
        isHiresError={hiresError}
        upcomingSessions={upcomingSessionsData ?? []}
        isUpcomingSessionsLoading={upcomingSessionsLoading}
        isUpcomingSessionsError={upcomingSessionsError}
        onRetryUpcomingSessions={() => {
          void refetchUpcomingSessions()
        }}
        recommendedSupervisors={recommendedSupervisors}
        totalRecommendedCount={totalRecommendedCount}
        isRecommendedLoading={recommendedLoading}
        isRecommendedError={recommendedError}
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
