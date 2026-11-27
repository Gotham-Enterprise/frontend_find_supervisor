import { AlertTriangle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { overCapText } from '@/lib/utils/hourly-billing'

/**
 * "1 h over weekly max" flag shown wherever a week's logged time appears. The
 * weekly max is soft: hours over it are still invoiced and paid out unless the
 * supervisee reports a problem, so the flag is what tells them to look.
 * Renders nothing when the week is within its max.
 */
export function OverCapBadge({
  overCapMinutes,
  prominent = false,
  className,
}: {
  overCapMinutes: number
  /** Larger, for the supervisee's review UI next to Approve / Report a problem. */
  prominent?: boolean
  className?: string
}) {
  if (overCapMinutes <= 0) return null
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 border-amber-300 bg-amber-50 font-medium text-amber-900 hover:bg-amber-50',
        prominent ? 'h-auto px-2.5 py-1 text-xs' : 'px-1.5 py-0 text-[11px]',
        className,
      )}
    >
      <AlertTriangle className={prominent ? 'size-3.5' : 'size-3'} aria-hidden />
      {overCapText(overCapMinutes)}
    </Badge>
  )
}
