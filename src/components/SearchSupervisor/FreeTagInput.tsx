'use client'

import { XIcon } from 'lucide-react'
import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface FreeTagInputProps {
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function FreeTagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter…',
  className,
}: FreeTagInputProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function remove(item: string) {
    onChange(value.filter((v) => v !== item))
  }

  return (
    <div
      className={cn(
        'flex min-h-10 cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
        >
          {item}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              remove(item)
            }}
            aria-label={`Remove ${item}`}
            className="ml-0.5 rounded-sm text-primary/70 hover:text-primary"
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[80px] flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
