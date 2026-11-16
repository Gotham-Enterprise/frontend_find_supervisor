'use client'

import { Check, ChevronDown, Search, X } from 'lucide-react'
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
  /** Fires when focus leaves the control entirely (trigger + popup). */
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Adds a search box to the top of the list that filters options by label. */
  searchable?: boolean
  searchPlaceholder?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
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
  onBlur,
  placeholder = 'Select...',
  disabled = false,
  className,
  searchable = false,
  searchPlaceholder = 'Search…',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  /** Index into `visibleOptions` of the keyboard-highlighted row; -1 = none. */
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const normalizedQuery = query.trim().toLowerCase()
  const visibleOptions =
    searchable && normalizedQuery
      ? options.filter((opt) => opt.label.toLowerCase().includes(normalizedQuery))
      : options

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

  // ── Searchable: focus the search box when the list opens ──────────────────
  useEffect(() => {
    if (isOpen && searchable) searchInputRef.current?.focus()
  }, [isOpen, searchable])

  // ── Keep the highlighted row in view ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return
    const row = listRef.current?.querySelector<HTMLElement>(`[data-active="true"]`)
    row?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex])

  function open() {
    if (disabled) return
    setIsOpen(true)
  }

  function close({ refocusTrigger = false } = {}) {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(-1)
    if (refocusTrigger) triggerRef.current?.focus()
  }

  // ── Toggle a single option (never closes the dropdown) ────────────────────
  function toggle(optValue: string) {
    onChange(value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue])
  }

  function removeTag(optValue: string) {
    onChange(value.filter((v) => v !== optValue))
  }

  function moveActive(delta: number) {
    if (visibleOptions.length === 0) return
    setActiveIndex((current) => {
      const start = current < 0 ? (delta > 0 ? -1 : visibleOptions.length) : current
      return Math.min(Math.max(start + delta, 0), visibleOptions.length - 1)
    })
  }

  /** Shared by the trigger and the search box. Returns true when the key was handled. */
  function handleListKeyDown(e: React.KeyboardEvent): boolean {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          open()
          setActiveIndex(0)
        } else {
          moveActive(1)
        }
        return true
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) moveActive(-1)
        return true
      case 'Home':
        if (!isOpen) return false
        e.preventDefault()
        setActiveIndex(visibleOptions.length > 0 ? 0 : -1)
        return true
      case 'End':
        if (!isOpen) return false
        e.preventDefault()
        setActiveIndex(visibleOptions.length - 1)
        return true
      case 'Escape':
        if (!isOpen) return false
        e.preventDefault()
        close({ refocusTrigger: true })
        return true
      case 'Tab':
        if (isOpen) close()
        return false
      default:
        return false
    }
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (handleListKeyDown(e)) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (isOpen && activeIndex >= 0 && visibleOptions[activeIndex]) {
        toggle(visibleOptions[activeIndex].value)
      } else if (isOpen) {
        close()
      } else {
        open()
      }
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (handleListKeyDown(e)) return
    if (e.key === 'Enter') {
      // Never submit the surrounding form from the search box.
      e.preventDefault()
      const target =
        activeIndex >= 0
          ? visibleOptions[activeIndex]
          : visibleOptions.length === 1
            ? visibleOptions[0]
            : undefined
      if (target) toggle(target.value)
    }
  }

  function handleContainerBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
      onBlur?.()
    }
  }

  const selectedOptions = value
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is TagOption => o !== undefined)

  const optionId = (index: number) => `${listboxId}-option-${index}`
  const activeDescendant =
    isOpen && activeIndex >= 0 && visibleOptions[activeIndex] ? optionId(activeIndex) : undefined

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={cn('relative', className)} onBlur={handleContainerBlur}>
      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={searchable ? undefined : activeDescendant}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (disabled) return
          if (isOpen) close()
          else open()
        }}
        onKeyDown={handleTriggerKeyDown}
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
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                // Keyboard users remove a chip without toggling the list.
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  removeTag(opt.value)
                }
              }}
              disabled={disabled}
              aria-label={`Remove ${opt.label}`}
              className="ml-0.5 rounded-sm text-primary/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none"
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
        <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          {searchable && (
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(e.target.value.trim() ? 0 : -1)
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                aria-controls={listboxId}
                aria-activedescendant={activeDescendant}
                aria-autocomplete="list"
                autoComplete="off"
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="max-h-60 overflow-y-auto py-1"
          >
            {visibleOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {options.length === 0 ? 'No options available.' : 'No results found.'}
              </li>
            ) : (
              visibleOptions.map((opt, index) => {
                const checked = value.includes(opt.value)
                const active = index === activeIndex
                return (
                  <li
                    key={opt.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={checked}
                    data-active={active ? 'true' : undefined}
                    onMouseDown={(e) => {
                      // preventDefault keeps focus on the trigger so the
                      // dropdown does not blur-close
                      e.preventDefault()
                      toggle(opt.value)
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-popover-foreground',
                      'hover:bg-accent hover:text-accent-foreground',
                      active && 'bg-accent text-accent-foreground',
                      checked && !active && 'bg-accent/50',
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
        </div>
      )}
    </div>
  )
}
