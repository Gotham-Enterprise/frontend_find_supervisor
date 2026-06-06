'use client'

import { AlertCircle, ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { buttonVariants } from '@/components/ui/button'
import {
  useAvailabilityOptions,
  useStatesOptions,
  useSuperviseeFormOptions,
  useSuperviseeProfileById,
} from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { coerceStringList, resolveOptionLabels } from '@/lib/utils/profile-formatters'

import { SupervisorProfileCheckList } from '../SupervisorProfile/SupervisorProfileCheckList'
import { SuperviseeProfileAbout } from './SuperviseeProfileAbout'
import { SuperviseeProfileAvailability } from './SuperviseeProfileAvailability'
import { SuperviseeProfileContact } from './SuperviseeProfileContact'
import { SuperviseeProfileHero } from './SuperviseeProfileHero'
import { SuperviseeProfileProfessional } from './SuperviseeProfileProfessional'
import { SuperviseeProfileSkeleton } from './SuperviseeProfileSkeleton'
import { SuperviseeProfileSupervisionNeeds } from './SuperviseeProfileSupervisionNeeds'

interface SuperviseeProfilePageProps {
  superviseeId: string
}

const BACK_LINK_CONFIG: Record<string, { href: string; label: string }> = {
  dashboard: { href: '/dashboard', label: 'Back to Dashboard' },
  supervisees: { href: '/supervisees', label: 'Back to My Supervisees' },
  'sent-connections': { href: '/connections/sent', label: 'Back to Sent Connections' },
}

const DEFAULT_BACK = { href: '/find-supervisees', label: 'Back to Find Supervisees' }

export function SuperviseeProfilePage({ superviseeId }: SuperviseeProfilePageProps) {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? ''
  const backLink = BACK_LINK_CONFIG[from] ?? DEFAULT_BACK

  const { data: profile, isLoading, isError } = useSuperviseeProfileById(superviseeId)
  const { supervisorTypes } = useSuperviseeFormOptions()
  const { data: stateOptions = [] } = useStatesOptions()
  const { data: availabilityOptions = [] } = useAvailabilityOptions()
  const supervisorTypeOptions = supervisorTypes.data ?? []

  if (isLoading) {
    return <SuperviseeProfileSkeleton />
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <AlertCircle className="mb-3 size-10 text-muted-foreground/50" />
        <p className="font-medium text-foreground">Supervisee not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This profile may not exist or is unavailable.
        </p>
        <Link
          href={backLink.href}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-5')}
        >
          <ArrowLeftIcon className="mr-1.5 size-4" />
          {backLink.label}
        </Link>
      </div>
    )
  }

  const showContactInfo = profile.isInMyHireList ?? false
  const lookingInLabels = resolveOptionLabels(
    coerceStringList(profile.stateTheyAreLookingIn),
    stateOptions,
  )

  return (
    <div className="min-h-full bg-white px-6 pt-6 pb-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href={backLink.href}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {backLink.label}
        </Link>

        <SuperviseeProfileHero profile={profile} />
        <SuperviseeProfileAbout profile={profile} />
        {lookingInLabels.length > 0 && (
          <SupervisorProfileCheckList title="Looking for Supervision In" items={lookingInLabels} />
        )}
        <SuperviseeProfileProfessional
          profile={profile}
          supervisorTypeOptions={supervisorTypeOptions}
          stateOptions={stateOptions}
        />
        <SuperviseeProfileSupervisionNeeds profile={profile} />
        <SuperviseeProfileAvailability
          profile={profile}
          availabilityOptions={availabilityOptions}
        />
        {showContactInfo && <SuperviseeProfileContact profile={profile} />}
      </div>
    </div>
  )
}
