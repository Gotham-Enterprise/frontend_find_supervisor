import { SearchXIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onClearFilters: () => void
  /** Display noun for the searched entity, e.g. "Supervisors" or "Medical Directors". */
  entityLabel?: string
}

export function EmptyState({ onClearFilters, entityLabel = 'Supervisors' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <SearchXIcon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">No {entityLabel} found</h3>
      <p className="mb-5 max-w-sm text-sm text-muted-foreground">
        No {entityLabel} match your current filters. Try broadening your search or adjusting your
        criteria.
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        Clear all filters
      </Button>
    </div>
  )
}
