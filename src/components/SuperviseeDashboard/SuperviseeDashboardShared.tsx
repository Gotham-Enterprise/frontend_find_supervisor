import { CheckCircle2, Circle } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { GoalStatus } from './SuperviseeDashboardTypes'
import { getInitials } from './SuperviseeDashboardUtils'

export function InitialsAvatar({
  name,
  className,
}: {
  name: string | null | undefined
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground',
        className,
      )}
    >
      {getInitials(name)}
    </div>
  )
}

export function CircularProgress({ value }: { value: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative flex size-20 items-center justify-center">
      <svg className="size-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-base font-bold text-white">{value}%</span>
    </div>
  )
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export function GoalStepIcon({ status }: { status: GoalStatus }) {
  if (status === 'done') return <CheckCircle2 className="size-5 shrink-0 text-primary" />
  if (status === 'current')
    return <Circle className="size-5 shrink-0 fill-amber-400 text-amber-400" />
  return <Circle className="size-5 shrink-0 text-muted-foreground/30" />
}
