'use client'

import { CheckCircle, GitPullRequestArrow, UserCheck, Users } from 'lucide-react'

import { SupervisorDashboard } from '@/components/SupervisorDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/lib/hooks'

const stats = [
  { title: 'Total Supervisors', value: '—', icon: Users },
  { title: 'Total Supervisees', value: '—', icon: UserCheck },
  { title: 'Pending Requests', value: '—', icon: GitPullRequestArrow },
  { title: 'Matched Pairs', value: '—', icon: CheckCircle },
]

function DefaultDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of the supervisor matching system</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user, isLoading } = useUser()

  // Don't flash the wrong dashboard while user is still loading
  if (isLoading) return null

  const isSupervisor = user?.role?.toUpperCase() === 'SUPERVISOR'

  if (isSupervisor) return <SupervisorDashboard />

  return <DefaultDashboard />
}
