'use client'

import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { useSupervisorPastClients } from '@/lib/hooks'
import { getInitials } from '@/lib/utils/profile-formatters'
import type { PastClientHire } from '@/types/past-clients'

const AVATAR_PALETTE: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: '#DBEAFE', fg: '#1D4ED8' },
  { bg: '#FCE7F3', fg: '#BE185D' },
  { bg: '#FEF9C3', fg: '#A16207' },
  { bg: '#D1FAE5', fg: '#047857' },
  { bg: '#EDE9FE', fg: '#5B21B6' },
]

function paletteForId(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}

function PastClientCard({ row }: { row: PastClientHire }) {
  const { supervisee } = row
  const displayName = supervisee.fullName?.trim() || supervisee.email
  const initials = getInitials(supervisee.fullName)
  const palette = paletteForId(supervisee.id)
  const [photoFailed, setPhotoFailed] = useState(false)
  const photoUrl = supervisee.profilePhotoUrl?.trim()
  const showPhoto = Boolean(photoUrl && !photoFailed)

  return (
    <div className="flex items-center gap-2.5">
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- external profile URLs from API
        <img
          src={photoUrl}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ backgroundColor: palette.bg, color: palette.fg }}
        >
          {initials}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-[#374151]">{displayName}</p>
        <p className="text-xs text-[#6B7280]">{supervisee.email}</p>
      </div>
    </div>
  )
}

function PastClientsSkeleton() {
  return (
    <div className="flex flex-wrap gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface SupervisorProfilePastClientsProps {
  supervisorId: string
}

export function SupervisorProfilePastClients({ supervisorId }: SupervisorProfilePastClientsProps) {
  const { data, isLoading, isError } = useSupervisorPastClients({
    supervisorId,
    page: 1,
    limit: 0,
    enabled: true,
  })

  const rows = data ?? []

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">Past Clients</h2>

      {isLoading && (
        <>
          <p className="mb-4 text-sm text-[#6B7280]">Loading past clients…</p>
          <PastClientsSkeleton />
        </>
      )}

      {isError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          <AlertCircle className="size-4 shrink-0" />
          <span>Could not load past clients. Please try again later.</span>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <p className="text-sm text-[#6B7280]">No past clients yet.</p>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <div className="flex flex-wrap gap-6">
          {rows.map((row) => (
            <PastClientCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </section>
  )
}
