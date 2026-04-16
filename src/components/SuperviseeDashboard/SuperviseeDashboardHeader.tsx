import { useMemo } from 'react'

import type { User } from '@/types'

import { CircularProgress } from './SuperviseeDashboardShared'

interface SuperviseeDashboardHeaderProps {
  user: User
  completion: number
}

export function SuperviseeDashboardHeader({ user, completion }: SuperviseeDashboardHeaderProps) {
  const name = user.fullName ?? user.name ?? user.email
  const firstName = name.split(' ')[0] ?? name

  const isNewUser = useMemo(() => {
    if (!user.createdAt) return false
    const now = new Date()
    return now.getTime() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000
  }, [user.createdAt])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {isNewUser ? `Welcome, ${firstName}` : `Welcome back, ${firstName}`}
            </h1>
            <p className="mt-1 text-sm opacity-80">
              Track your sessions, manage requests, and find the right supervisor.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                Email Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <span className="size-1.5 rounded-full bg-amber-300" />
                Email Unverified
              </span>
            )}
            {completion < 100 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <span className="size-1.5 rounded-full bg-amber-300" />
                Profile setup in progress
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <CircularProgress value={completion} />
          <span className="text-xs font-medium opacity-70">Profile Completion</span>
        </div>
      </div>
    </div>
  )
}
