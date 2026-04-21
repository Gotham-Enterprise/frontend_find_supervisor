import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MatchingRequest, User } from '@/types'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import { GoalStepIcon } from './SuperviseeDashboardShared'
import { getGoalSteps } from './SuperviseeDashboardUtils'

interface SuperviseeDashboardGoalsProgressCardProps {
  user: User
  allRequests: MatchingRequest[]
  /** When set, email + profile completion for goals match GET supervisee/profile (auth user can be stale). */
  superviseeProfile?: SuperviseeProfileData | null
}

export function SuperviseeDashboardGoalsProgressCard({
  user,
  allRequests,
  superviseeProfile,
}: SuperviseeDashboardGoalsProgressCardProps) {
  const hasAcceptedRequest = allRequests.some((r) => r.status === 'accepted')
  const steps = getGoalSteps(user, hasAcceptedRequest, superviseeProfile)
  const doneCount = steps.filter((s) => s.status === 'done').length

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Goals &amp; Progress</CardTitle>
          <p className="text-sm text-muted-foreground">Track your supervision journey</p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {doneCount}/{steps.length}
        </span>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <GoalStepIcon status={step.status} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      step.status === 'upcoming' && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  {step.status === 'done' && (
                    <span className="shrink-0 text-xs font-medium text-emerald-600">Done</span>
                  )}
                  {step.status === 'current' && (
                    <Link
                      href="/profile"
                      className="shrink-0 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
                    >
                      Start →
                    </Link>
                  )}
                  {step.status === 'upcoming' && (
                    <span className="shrink-0 text-xs text-muted-foreground">Upcoming</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
