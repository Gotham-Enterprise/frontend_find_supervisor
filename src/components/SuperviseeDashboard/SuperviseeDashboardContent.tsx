import type { RecommendedSupervisorApiItem } from '@/lib/api/supervisors'
import type { User } from '@/types'
import type { HireListItem, UpcomingSessionItem } from '@/types/hire'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import { SuperviseeDashboardActiveRequests } from './SuperviseeDashboardActiveRequests'
import { SuperviseeDashboardActivityCard } from './SuperviseeDashboardActivityCard'
import { SuperviseeDashboardGoalsProgressCard } from './SuperviseeDashboardGoalsProgressCard'
import { SuperviseeDashboardHeader } from './SuperviseeDashboardHeader'
import {
  SuperviseeDashboardProfileDetails,
  SuperviseeDashboardProfileDetailsError,
  SuperviseeDashboardProfileDetailsSkeleton,
} from './SuperviseeDashboardProfileDetails'
import { SuperviseeDashboardQuickActions } from './SuperviseeDashboardQuickActions'
import { SuperviseeDashboardRecommendedSupervisors } from './SuperviseeDashboardRecommendedSupervisors'
import { SuperviseeDashboardSummaryCards } from './SuperviseeDashboardSummaryCards'
import { SuperviseeDashboardUpcomingSessionsCard } from './SuperviseeDashboardUpcomingSessionsCard'

interface SuperviseeDashboardContentProps {
  user: User | null
  completion: number
  /** All hires (pending + accepted/active + historical) for activity stats and goal tracking. */
  allHires: HireListItem[]
  /** True total hire count from the API — may exceed allHires.length when paginated. */
  totalHiresCount: number
  /** Hires the supervisee is waiting on a response for. */
  pendingHires: HireListItem[]
  /** True when the hires query failed — shown inside the Active Requests card. */
  isHiresError: boolean
  /** From GET /supervision/supervisee/upcoming-sessions — future-dated active supervision. */
  upcomingSessions: UpcomingSessionItem[]
  isUpcomingSessionsLoading: boolean
  isUpcomingSessionsError: boolean
  onRetryUpcomingSessions: () => void
  recommendedSupervisors: RecommendedSupervisorApiItem[]
  /** Total count from API pagination (all eligible, not just current page). */
  totalRecommendedCount: number
  isRecommendedLoading: boolean
  isRecommendedError: boolean
  /** Full supervisee profile — undefined while loading, null on error/not-found */
  superviseeProfile: SuperviseeProfileData | null | undefined
  isProfileLoading: boolean
  isProfileError: boolean
  onEditProfileClick: () => void
}

export function SuperviseeDashboardContent({
  user,
  completion,
  allHires,
  totalHiresCount,
  pendingHires,
  upcomingSessions,
  isUpcomingSessionsLoading,
  isUpcomingSessionsError,
  onRetryUpcomingSessions,
  isHiresError,
  recommendedSupervisors,
  totalRecommendedCount,
  isRecommendedLoading,
  isRecommendedError,
  superviseeProfile,
  isProfileLoading,
  isProfileError,
  onEditProfileClick,
}: SuperviseeDashboardContentProps) {
  return (
    <div className="space-y-6">
      {user && (
        <SuperviseeDashboardHeader
          user={user}
          completion={completion}
          emailVerified={superviseeProfile?.user.emailVerified ?? user.emailVerified ?? false}
        />
      )}

      <SuperviseeDashboardSummaryCards
        pendingCount={pendingHires.length}
        supervisorCount={totalRecommendedCount}
        upcomingSessionsCount={upcomingSessions.length}
        isUpcomingSessionsLoading={isUpcomingSessionsLoading}
      />

      {/* My Profile (40%) | Goals & Progress + Your Activity stacked (60%) */}
      <div className="grid items-stretch gap-4 lg:grid-cols-5">
        <div className="flex flex-col lg:col-span-2">
          {isProfileLoading && <SuperviseeDashboardProfileDetailsSkeleton />}
          {isProfileError && <SuperviseeDashboardProfileDetailsError />}
          {!isProfileLoading && !isProfileError && superviseeProfile && (
            <SuperviseeDashboardProfileDetails
              profile={superviseeProfile}
              onEditClick={onEditProfileClick}
            />
          )}
        </div>
        {user && (
          <div className="flex flex-col gap-4 lg:col-span-3">
            <SuperviseeDashboardGoalsProgressCard
              user={user}
              allHires={allHires}
              superviseeProfile={superviseeProfile}
            />
            <SuperviseeDashboardActivityCard
              user={user}
              completion={completion}
              allHires={allHires}
              totalHiresCount={totalHiresCount}
              superviseeProfile={superviseeProfile}
            />
          </div>
        )}
      </div>

      {/* Upcoming Sessions — full width */}
      <SuperviseeDashboardUpcomingSessionsCard
        sessions={upcomingSessions}
        isLoading={isUpcomingSessionsLoading}
        isError={isUpcomingSessionsError}
        onRetry={onRetryUpcomingSessions}
      />

      {/* Recommended Supervisors (3/5) + Active Requests (2/5) */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SuperviseeDashboardRecommendedSupervisors
            supervisors={recommendedSupervisors}
            isLoading={isRecommendedLoading}
            isError={isRecommendedError}
          />
        </div>
        <div className="lg:col-span-2">
          <SuperviseeDashboardActiveRequests hires={pendingHires} isError={isHiresError} />
        </div>
      </div>

      <SuperviseeDashboardQuickActions />
    </div>
  )
}
