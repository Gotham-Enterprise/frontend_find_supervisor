'use client'

import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

// ─── Public types ─────────────────────────────────────────────────────────────

export type TagOption = {
  label: string
  value: string
}

export type TagInputProps = {
  /** Full list of available options shown in the dropdown. */
  options: readonly TagOption[]
  /** Currently selected values (controlled). */
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Convert a plain string array into TagOption objects. */
export function toTagOptions(arr: readonly string[]): TagOption[] {
  return arr.map((s) => ({ label: s, value: s }))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TagInput({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  // ── Close on outside click ────────────────────────────────────────────────
  // Calling setState inside a subscribed event callback is fine for the
  // React Compiler rule — this is exactly the "external system subscription"
  // pattern the rule permits.
  useEffect(() => {
    if (!isOpen) return

    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen])

  // ── Toggle a single option (FIX: never close the dropdown) ───────────────
  function toggle(optValue: string) {
    onChange(value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue])
    // Intentionally NOT closing the dropdown — this was the bug in the
    // previous implementation where `addTag` called setShowSuggestions(false).
  }

  function removeTag(optValue: string) {
    onChange(value.filter((v) => v !== optValue))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      setIsOpen((o) => !o)
    }
  }

  const selectedOptions = value
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is TagOption => o !== undefined)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex min-h-10 cursor-pointer flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm',
          'select-none transition-colors',
          'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          isOpen && 'border-ring ring-3 ring-ring/50',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {/* Selected tags */}
        {selectedOptions.map((opt) => (
          <span
            key={opt.value}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {opt.label}
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation() // keep dropdown state intact
                removeTag(opt.value)
              }}
              disabled={disabled}
              aria-label={`Remove ${opt.label}`}
              className="ml-0.5 rounded-sm text-primary/70 hover:text-primary disabled:pointer-events-none"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        {/* Placeholder */}
        {value.length === 0 && <span className="flex-1 text-muted-foreground">{placeholder}</span>}

        {/* Chevron indicator */}
        <ChevronDown
          aria-hidden
          className={cn(
            'ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-150',
            isOpen && 'rotate-180',
          )}
        />
      </div>

      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-md"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No options available.</li>
          ) : (
            options.map((opt) => {
              const checked = value.includes(opt.value)
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={checked}
                  onMouseDown={(e) => {
                    // preventDefault keeps focus on the trigger so the
                    // dropdown does not blur-close
                    e.preventDefault()
                    toggle(opt.value)
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-popover-foreground',
                    'hover:bg-accent hover:text-accent-foreground',
                    checked && 'bg-accent/50',
                  )}
                >
                  {/* Inline checkbox visual — avoids nesting <button> inside the <li> handler */}
                  <span
                    aria-hidden
                    className={cn(
                      'inline-flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                      checked
                        ? 'border-primary bg-primary text-white'
                        : 'border-[#d1d5db] bg-white',
                    )}
                  >
                    {checked && <Check className="size-3 stroke-[3]" />}
                  </span>
                  {opt.label}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
