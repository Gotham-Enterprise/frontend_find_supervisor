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
import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'

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
    data: superviseeProfile,
    isLoading: profileLoading,
    isError: profileError,
    isFetched: profileFetched,
  } = useSuperviseeProfile()

  // Which recommendation sections apply — supervisors and Medical Directors
  // are separate products with separate cards.
  const needs = (superviseeProfile?.typeOfSupervisorNeeded ?? []).map((need) => need.trim())
  const hasMdNeed = profileFetched && needs.includes(MEDICAL_DIRECTOR_TYPE_NAME)
  // Legacy profiles without stored needs keep the general supervisors section.
  const hasNonMdNeed =
    !profileFetched ||
    needs.length === 0 ||
    needs.some((need) => need && need !== MEDICAL_DIRECTOR_TYPE_NAME)

  const {
    data: recommendedData,
    isLoading: recommendedLoading,
    isError: recommendedError,
  } = useRecommendedSupervisors({ page: 1, limit: 6, mode: 'supervisors' }, hasNonMdNeed)
  const {
    data: recommendedMdData,
    isLoading: recommendedMdLoading,
    isError: recommendedMdError,
  } = useRecommendedSupervisors({ page: 1, limit: 6, mode: 'medicalDirectors' }, hasMdNeed)

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
        showSupervisorsSection={hasNonMdNeed}
        showMedicalDirectorsSection={hasMdNeed}
        recommendedMedicalDirectors={recommendedMdData?.items ?? []}
        isRecommendedMdLoading={recommendedMdLoading}
        isRecommendedMdError={recommendedMdError}
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
