import { Info, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { SupervisorSearchMode } from '@/lib/api/supervisor-search'

interface SeededFiltersNoticeProps {
  mode: SupervisorSearchMode
  onReapply: () => void
  onDismiss: () => void
}

/**
 * Shown after the profile-seeded first search returned zero results and the
 * seeded filters were auto-cleared so the page isn't empty on load.
 */
export function SeededFiltersNotice({ mode, onReapply, onDismiss }: SeededFiltersNoticeProps) {
  const noun = mode === 'medical-directors' ? 'medical directors' : 'supervisors'

  return (
    <div className="mb-4 flex shrink-0 items-start gap-3 rounded-xl border border-border bg-muted/50 p-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Info className="size-4 text-primary" />
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm text-foreground">
          No {noun} matched your saved preferences, so we cleared those filters to show everyone
          available.
        </p>
        <Button variant="outline" size="sm" onClick={onReapply}>
          Reapply my preferences
        </Button>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
