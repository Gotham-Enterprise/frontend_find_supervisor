import {
  getActivePaidSupervisionSubscription,
  hasActivePaidSupervisionSubscription,
} from '@/lib/utils/subscription-plan-resolution'
import type { MatchingRequest, Supervisor, User } from '@/types'
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
  /** Full supervisee profile — undefined while loading, null on error/not-found */
  superviseeProfile: SuperviseeProfileData | null | undefined
  isProfileLoading: boolean
  isProfileError: boolean
  onEditProfileClick: () => void
}

export function SuperviseeDashboardContent({
  user,
  completion,
  pendingRequests,
  acceptedRequests,
  allRequests,
  availableSupervisors,
  superviseeProfile,
  isProfileLoading,
  isProfileError,
  onEditProfileClick,
}: SuperviseeDashboardContentProps) {
  const activeSub = superviseeProfile
    ? getActivePaidSupervisionSubscription(superviseeProfile.user.subscriptions)
    : undefined
  const isSubscribed = superviseeProfile
    ? hasActivePaidSupervisionSubscription(superviseeProfile.user.subscriptions)
    : false

  return (
    <div className="space-y-6">
      {user && <SuperviseeDashboardHeader user={user} completion={completion} />}

      <SuperviseeDashboardSummaryCards
        pendingCount={pendingRequests.length}
        acceptedCount={acceptedRequests.length}
        supervisorCount={availableSupervisors.length}
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
              allRequests={allRequests}
              superviseeProfile={superviseeProfile}
            />
            <SuperviseeDashboardActivityCard
              user={user}
              completion={completion}
              allRequests={allRequests}
              superviseeProfile={superviseeProfile}
            />
          </div>
        )}
      </div>

      {/* Upcoming Sessions — full width */}
      <SuperviseeDashboardUpcomingSessionsCard requests={acceptedRequests} />

      {/* Recommended Supervisors (3/5) + Active Requests (2/5) */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SuperviseeDashboardRecommendedSupervisors supervisors={availableSupervisors} />
        </div>
        <div className="lg:col-span-2">
          <SuperviseeDashboardActiveRequests requests={pendingRequests} />
        </div>
      </div>

      <SuperviseeDashboardQuickActions />

      <SuperviseeDashboardSubscription
        isProfileLoading={isProfileLoading}
        isSubscribed={isSubscribed}
        planName={activeSub?.plan?.name}
        plan={activeSub?.plan}
        subscriptionStatus={activeSub?.status}
        currentPeriodEnd={activeSub?.currentPeriodEnd}
      />
    </div>
  )
}
