import { Star } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Supervisor } from '@/types'

import { InitialsAvatar } from './SuperviseeDashboardShared'

interface SuperviseeDashboardRecommendedSupervisorsProps {
  supervisors: Supervisor[]
}

export function SuperviseeDashboardRecommendedSupervisors({
  supervisors,
}: SuperviseeDashboardRecommendedSupervisorsProps) {
  if (supervisors.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Recommended for You</CardTitle>
          <p className="text-sm text-muted-foreground">Based on your supervision needs</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <Star className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No supervisors available right now.</p>
          <Link
            href="/supervisors"
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Browse all supervisors →
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Recommended for You</CardTitle>
          <p className="text-sm text-muted-foreground">Based on your supervision needs</p>
        </div>
        <Link href="/supervisors" className="text-sm font-medium text-primary hover:underline">
          Browse all →
        </Link>
      </CardHeader>
      <CardContent className="flex-1 divide-y pt-0">
        {supervisors.map((supervisor) => (
          <div key={supervisor.id} className="py-4">
            <div className="flex items-start gap-3">
              <InitialsAvatar name={supervisor.name} className="size-10 text-sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight">{supervisor.name}</p>
                    <p className="text-xs text-muted-foreground">{supervisor.department}</p>
                  </div>
                  {supervisor.available && (
                    <span className="shrink-0 text-xs font-medium text-emerald-600">
                      Accepting now
                    </span>
                  )}
                </div>

                {supervisor.specializations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {supervisor.specializations.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href={`/supervisors/${supervisor.id}`}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
