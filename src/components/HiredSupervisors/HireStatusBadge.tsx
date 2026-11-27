import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { HireStatus } from '@/types/hire'

const STATUS_CONFIG: Record<HireStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  // Accepted (not started yet) is an outline; Active is filled with a live dot,
  // so the two greens read differently at a glance.
  ACCEPTED: {
    label: 'Accepted',
    className: 'border-primary/40 bg-white text-primary hover:bg-white',
  },
  ACTIVE: {
    label: 'In Progress',
    className: 'border-primary bg-primary text-primary-foreground hover:bg-primary',
  },
  COMPLETED: { label: 'Completed', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
  CANCELED: { label: 'Canceled', className: 'bg-red-100 text-red-600 hover:bg-red-100' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-600 hover:bg-red-100' },
  // Before completion, REVIEWED only means the supervisor opened the request.
  REVIEWED: { label: 'Viewed', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
}

interface HireStatusBadgeProps {
  status: HireStatus
  /**
   * When `status` is `REVIEWED` but supervision is already finished (`completedAt` set),
   * show **Completed** — `REVIEWED` is also used for “supervisor viewed pending request” (no `completedAt`).
   */
  completedAt?: string | null
  /** On a green (bg-primary) surface (workroom header): its own Active look, without the pulsing dot. */
  onPrimary?: boolean
}

export function HireStatusBadge({ status, completedAt, onPrimary = false }: HireStatusBadgeProps) {
  const isPostCompletionReviewed =
    status === 'REVIEWED' && completedAt != null && String(completedAt).length > 0

  const effectiveStatus: HireStatus = isPostCompletionReviewed ? 'COMPLETED' : status

  const config = STATUS_CONFIG[effectiveStatus] ?? { label: status, className: '' }
  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        onPrimary &&
          effectiveStatus === 'ACTIVE' &&
          'border-white/30 bg-white/15 text-white hover:bg-white/15',
      )}
    >
      {/* Next to the avatar's online dot (workroom header) a pulsing dot reads as "online". */}
      {effectiveStatus === 'ACTIVE' && !onPrimary && (
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
      )}
      {config.label}
    </Badge>
  )
}
