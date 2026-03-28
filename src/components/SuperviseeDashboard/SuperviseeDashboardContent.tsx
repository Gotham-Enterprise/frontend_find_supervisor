import type { MatchingRequest, Supervisor, User } from '@/types'

import { SuperviseeDashboardActiveRequests } from './SuperviseeDashboardActiveRequests'
import { SuperviseeDashboardHeader } from './SuperviseeDashboardHeader'
import { SuperviseeDashboardProgressSection } from './SuperviseeDashboardProgressSection'
import { SuperviseeDashboardQuickActions } from './SuperviseeDashboardQuickActions'
import { SuperviseeDashboardRecommendedSupervisors } from './SuperviseeDashboardRecommendedSupervisors'
import { SuperviseeDashboardSubscription } from './SuperviseeDashboardSubscription'
import { SuperviseeDashboardSummaryCards } from './SuperviseeDashboardSummaryCards'
import { SuperviseeDashboardUpcomingSessionsCard } from './SuperviseeDashboardUpcomingSessionsCard'

interface SuperviseeDashboardContentProps {
  user: User | null
  completion: number
  pendingRequests: MatchingRequest[]
  acceptedRequests: MatchingRequest[]
  allRequests: MatchingRequest[]
  availableSupervisors: Supervisor[]
}

export function SuperviseeDashboardContent({
  user,
  completion,
  pendingRequests,
  acceptedRequests,
  allRequests,
  availableSupervisors,
}: SuperviseeDashboardContentProps) {
  return (
    <div className="space-y-6">
      {user && <SuperviseeDashboardHeader user={user} completion={completion} />}

      <SuperviseeDashboardSummaryCards
        pendingCount={pendingRequests.length}
        acceptedCount={acceptedRequests.length}
        supervisorCount={availableSupervisors.length}
      />

      <SuperviseeDashboardUpcomingSessionsCard requests={acceptedRequests} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SuperviseeDashboardRecommendedSupervisors supervisors={availableSupervisors} />
        </div>
        <div className="lg:col-span-2">
          <SuperviseeDashboardActiveRequests requests={pendingRequests} />
        </div>
      </div>

      <SuperviseeDashboardQuickActions />

      <SuperviseeDashboardSubscription />

      {user && (
        <SuperviseeDashboardProgressSection
          user={user}
          completion={completion}
          allRequests={allRequests}
        />
      )}
    </div>
  )
}
