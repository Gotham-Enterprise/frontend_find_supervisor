'use client'

import { SupervisorList } from '@/components/SupervisorList'
import { useSupervisors } from '@/lib/hooks'

export function SupervisorsPage() {
  const { data, isLoading } = useSupervisors()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Supervisors</h1>
        <p className="text-sm text-muted-foreground">
          Browse available supervisors and their specializations
        </p>
      </div>
      <SupervisorList supervisors={data?.data ?? []} isLoading={isLoading} />
    </div>
  )
}
