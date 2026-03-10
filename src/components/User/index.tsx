'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupervisor } from '@/lib/hooks/useSupervisor'

interface UserPageProps {
  userId: string
}

export function UserPage({ userId }: UserPageProps) {
  const { data: supervisor, isLoading } = useSupervisor(userId)

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />
  }

  if (!supervisor) {
    return <p className="text-sm text-muted-foreground">The requested user could not be found.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{supervisor.name}</h1>
        <p className="text-sm text-muted-foreground">Supervisor profile</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{supervisor.email}</CardTitle>
            <Badge variant={supervisor.available ? 'default' : 'secondary'}>
              {supervisor.available ? 'Available' : 'Full'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            <span className="font-medium">Department:</span> {supervisor.department}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
