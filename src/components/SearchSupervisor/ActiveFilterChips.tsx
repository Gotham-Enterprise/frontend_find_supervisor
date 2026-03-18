import { XIcon } from 'lucide-react'

import type { ActiveChip } from './helpers'

interface ActiveFilterChipsProps {
  chips: ActiveChip[]
  onRemove: (key: string) => void
}

export function ActiveFilterChips({ chips, onRemove }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            className="ml-0.5 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={`Remove ${chip.label} filter`}
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
    </div>
  )
}
