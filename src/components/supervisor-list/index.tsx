import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Supervisor } from '@/types'

interface SupervisorListProps {
  supervisors: Supervisor[]
  isLoading: boolean
}

export function SupervisorList({ supervisors, isLoading }: SupervisorListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2 pb-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {supervisors.map((supervisor) => (
        <Link key={supervisor.id} href={`/user/${supervisor.id}`} className="block transition-opacity hover:opacity-90">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{supervisor.name}</CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">{supervisor.email}</p>
                </div>
                <Badge variant={supervisor.available ? 'default' : 'secondary'}>
                  {supervisor.available ? 'Available' : 'Full'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Department:</span> {supervisor.department}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
