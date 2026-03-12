'use client'

import { Plus, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type TagInputProps = {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: readonly string[]
  className?: string
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add...',
  suggestions,
  className,
}: TagInputProps) {
  const [inputVal, setInputVal] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputVal('')
    setShowSuggestions(false)
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputVal) addTag(inputVal)
    }
    if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const filteredSuggestions = suggestions?.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(inputVal.toLowerCase()),
  )

  return (
    <div className={cn('relative', className)}>
      <div
        className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="ml-0.5 rounded-sm text-primary/70 hover:text-primary"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        <div className="flex flex-1 items-center gap-1" style={{ minWidth: '80px' }}>
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => addTag(inputVal)}
              className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Add tag"
            >
              <Plus className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {showSuggestions && filteredSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-border bg-popover py-1 shadow-md">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                addTag(s)
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
