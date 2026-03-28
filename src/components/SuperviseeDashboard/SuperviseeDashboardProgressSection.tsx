import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MatchingRequest, User } from '@/types'

import { GoalStepIcon, ProgressBar } from './SuperviseeDashboardShared'
import { getGoalSteps } from './SuperviseeDashboardUtils'

interface SuperviseeDashboardProgressSectionProps {
  user: User
  completion: number
  allRequests: MatchingRequest[]
}

export function SuperviseeDashboardProgressSection({
  user,
  completion,
  allRequests,
}: SuperviseeDashboardProgressSectionProps) {
  const hasAcceptedRequest = allRequests.some((r) => r.status === 'accepted')
  const steps = getGoalSteps(user, hasAcceptedRequest)
  const doneCount = steps.filter((s) => s.status === 'done').length
  const acceptedCount = allRequests.filter((r) => r.status === 'accepted').length

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
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
      </div>

      <div className="lg:col-span-2">
        <Card className="flex flex-col">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-semibold">Your Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Sessions and engagement summary</p>
          </CardHeader>
          <CardContent className="flex-1 space-y-5 pt-4">
            <div className="grid grid-cols-3 divide-x rounded-lg border text-center text-sm">
              <div className="py-2">
                <p className="text-xl font-bold text-primary">{acceptedCount}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="py-2">
                <p className="text-xl font-bold text-primary">{allRequests.length}</p>
                <p className="text-xs text-muted-foreground">Requests</p>
              </div>
              <div className="py-2">
                <p className="text-xl font-bold text-primary">{doneCount}</p>
                <p className="text-xs text-muted-foreground">Goals Done</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Profile completion</span>
                <span className="text-muted-foreground">{completion}%</span>
              </div>
              <ProgressBar value={completion} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Journey milestones</span>
                <span className="text-muted-foreground">
                  {doneCount}/{steps.length}
                </span>
              </div>
              <ProgressBar value={Math.round((doneCount / steps.length) * 100)} />
            </div>

            {allRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Recent Requests</p>
                <ul className="space-y-2">
                  {allRequests.slice(0, 3).map((req) => (
                    <li key={req.id} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn('size-2 shrink-0 rounded-full', {
                          'bg-emerald-500': req.status === 'accepted',
                          'bg-amber-400': req.status === 'pending',
                          'bg-red-400': req.status === 'rejected',
                          'bg-muted-foreground': req.status === 'cancelled',
                        })}
                      />
                      <span className="flex-1 truncate text-muted-foreground">
                        Request to {req.supervisorName}
                      </span>
                      <span className="shrink-0 capitalize text-muted-foreground/70">
                        {req.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
