'use client'

import { useMatchingRequests, useSupervisors, useUser } from '@/lib/hooks'

import { SuperviseeDashboardContent } from './SuperviseeDashboardContent'
import { SuperviseeDashboardSkeleton } from './SuperviseeDashboardSkeleton'
import { getSuperviseeProfileCompletion } from './SuperviseeDashboardUtils'

export function SuperviseeDashboard() {
  const { user } = useUser()
  const { data: matchingData, isLoading: matchingLoading } = useMatchingRequests()
  const { data: supervisorsData, isLoading: supervisorsLoading } = useSupervisors({
    available: true,
    pageSize: 3,
  })

  if (matchingLoading || supervisorsLoading) return <SuperviseeDashboardSkeleton />

  const allRequests = matchingData?.data ?? []
  const pendingRequests = allRequests.filter((r) => r.status === 'pending')
  const acceptedRequests = allRequests.filter((r) => r.status === 'accepted')
  const availableSupervisors = supervisorsData?.data ?? []
  const completion = user ? getSuperviseeProfileCompletion(user) : 0

  return (
    <SuperviseeDashboardContent
      user={user ?? null}
      completion={completion}
      pendingRequests={pendingRequests}
      acceptedRequests={acceptedRequests}
      allRequests={allRequests}
      availableSupervisors={availableSupervisors}
    />
  )
}
