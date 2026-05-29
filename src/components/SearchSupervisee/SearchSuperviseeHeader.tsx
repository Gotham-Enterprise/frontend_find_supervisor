'use client'

import { SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SearchSuperviseeHeaderProps {
  keyword: string
  onKeywordChange: (value: string) => void
  onSearch: () => void
}

export function SearchSuperviseeHeader({
  keyword,
  onKeywordChange,
  onSearch,
}: SearchSuperviseeHeaderProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="pb-0">
      <div className="w-full px-0">
        <p className="text-sm text-muted-foreground">
          Browse supervisees looking for supervision matched to your specialty, licensure, and
          location.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, title, or keywords…"
              className="h-10 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button onClick={onSearch} size="default" className="shrink-0 sm:w-auto">
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
