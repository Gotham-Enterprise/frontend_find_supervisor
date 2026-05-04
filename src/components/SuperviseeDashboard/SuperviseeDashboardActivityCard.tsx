import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
import type { HireListItem } from '@/types/hire'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import { ProgressBar } from './SuperviseeDashboardShared'
import { getGoalSteps, hasMetFindFirstSupervisorGoal } from './SuperviseeDashboardUtils'

interface SuperviseeDashboardActivityCardProps {
  user: User
  completion: number
  allHires: HireListItem[]
  /** True total from the API response — use this instead of allHires.length to avoid showing a capped page count. */
  totalHiresCount: number
  superviseeProfile?: SuperviseeProfileData | null
}

export function SuperviseeDashboardActivityCard({
  user,
  completion,
  allHires,
  totalHiresCount,
  superviseeProfile,
}: SuperviseeDashboardActivityCardProps) {
  const steps = getGoalSteps(user, hasMetFindFirstSupervisorGoal(allHires), superviseeProfile)
  const doneCount = steps.filter((s) => s.status === 'done').length
  const acceptedCount = allHires.filter(
    (h) => h.status === 'ACCEPTED' || h.status === 'ACTIVE',
  ).length

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
            <p className="text-xl font-bold text-primary">{totalHiresCount}</p>
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

        {allHires.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Recent Requests</p>
            <ul className="space-y-2">
              {allHires.slice(0, 3).map((hire) => (
                <li key={hire.id} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn('size-2 shrink-0 rounded-full', {
                      'bg-emerald-500': hire.status === 'ACCEPTED' || hire.status === 'ACTIVE',
                      'bg-amber-400': hire.status === 'PENDING',
                      'bg-red-400': hire.status === 'REJECTED',
                      'bg-muted-foreground':
                        hire.status === 'CANCELED' || hire.status === 'COMPLETED',
                    })}
                  />
                  <span className="flex-1 truncate text-muted-foreground">
                    Request to {hire.supervisor?.fullName ?? '—'}
                  </span>
                  <span className="shrink-0 capitalize text-muted-foreground/70">
                    {hire.status.toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
