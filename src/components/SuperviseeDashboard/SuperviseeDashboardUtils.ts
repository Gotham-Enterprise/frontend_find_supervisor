import type { User } from '@/types'

import type { GoalStep } from './SuperviseeDashboardTypes'

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export function getSuperviseeProfileCompletion(user: User): number {
  const checks: boolean[] = [
    !!user.emailVerified,
    !!user.profilePhotoUrl,
    !!user.fullName || !!user.name,
    !!user.city,
    !!user.state,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export function getGoalSteps(user: User, hasAcceptedRequest: boolean): GoalStep[] {
  return [
    {
      label: 'Create your account',
      description: 'Account registered successfully',
      status: 'done',
    },
    {
      label: 'Verify your email',
      description: 'Confirm your email address',
      status: user.emailVerified ? 'done' : 'current',
    },
    {
      label: 'Complete your profile',
      description: 'Add your supervision goals and license info',
      status: user.city && user.state ? 'done' : user.emailVerified ? 'current' : 'upcoming',
    },
    {
      label: 'Find your first supervisor',
      description: 'Browse verified supervisors and send a request',
      status: hasAcceptedRequest ? 'done' : user.emailVerified ? 'current' : 'upcoming',
    },
    {
      label: 'Complete 10 supervision hours',
      description: 'Work toward your licensed hours goal',
      status: 'upcoming',
    },
  ]
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
