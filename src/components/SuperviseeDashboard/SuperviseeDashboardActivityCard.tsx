import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MatchingRequest, User } from '@/types'

import { ProgressBar } from './SuperviseeDashboardShared'
import { getGoalSteps } from './SuperviseeDashboardUtils'

interface SuperviseeDashboardActivityCardProps {
  user: User
  completion: number
  allRequests: MatchingRequest[]
}

export function SuperviseeDashboardActivityCard({
  user,
  completion,
  allRequests,
}: SuperviseeDashboardActivityCardProps) {
  const hasAcceptedRequest = allRequests.some((r) => r.status === 'accepted')
  const steps = getGoalSteps(user, hasAcceptedRequest)
  const doneCount = steps.filter((s) => s.status === 'done').length
  const acceptedCount = allRequests.filter((r) => r.status === 'accepted').length

  return (
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
          <ProgressBar
            value={steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0}
          />
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
                  <span className="shrink-0 capitalize text-muted-foreground/70">{req.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
