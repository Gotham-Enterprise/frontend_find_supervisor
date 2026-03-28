'use client'

import { SuperviseeDashboard } from '@/components/SuperviseeDashboard'
import { SupervisorDashboard } from '@/components/SupervisorDashboard'
import { useUser } from '@/lib/hooks'

export function DashboardPage() {
  const { user, isLoading } = useUser()

  // Don't flash the wrong dashboard while user is still loading
  if (isLoading) return null

  const role = user?.role?.toUpperCase()

  if (role === 'SUPERVISOR') return <SupervisorDashboard />
  if (role === 'SUPERVISEE') return <SuperviseeDashboard />

  // Fallback for unknown/admin roles
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Select a role to see your dashboard.</p>
    </div>
  )
}
