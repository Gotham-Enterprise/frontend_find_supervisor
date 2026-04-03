'use client'

import { SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TagInput } from '@/components/ui/tag-input'

import { SUPERVISION_FORMAT_TAG_OPTIONS } from './helpers'

interface SearchSupervisorHeaderProps {
  keyword: string
  supervisionFormats: string[]
  onKeywordChange: (value: string) => void
  onSupervisionFormatsChange: (values: string[]) => void
  onSearch: () => void
}

export function SearchSupervisorHeader({
  keyword,
  supervisionFormats,
  onKeywordChange,
  onSupervisionFormatsChange,
  onSearch,
}: SearchSupervisorHeaderProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="bg-background pb-10">
      <div className="w-full px-0">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
          Supervisee Portal
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Find A Supervisor
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse verified supervisors matched to your license, location, and goals.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name or license type…"
                className="h-10 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="w-full min-w-0 sm:max-w-[220px]">
              <TagInput
                options={SUPERVISION_FORMAT_TAG_OPTIONS}
                value={supervisionFormats}
                onChange={onSupervisionFormatsChange}
                placeholder="Format"
              />
            </div>
          </div>
          <Button onClick={onSearch} size="default" className="shrink-0 sm:w-auto">
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
