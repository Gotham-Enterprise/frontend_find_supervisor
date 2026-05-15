'use client'

import { AlertCircle, ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { buttonVariants } from '@/components/ui/button'
import {
  useAvailabilityOptions,
  useCertificateOptions,
  useLicenseTypeOptions,
  usePatientPopulationOptions,
  useStatesOptions,
} from '@/lib/hooks'
import { useSupervisor } from '@/lib/hooks/useSupervisor'
import { cn } from '@/lib/utils'
import { resolveOptionLabels } from '@/lib/utils/profile-formatters'

import { SupervisorProfileAbout } from './SupervisorProfileAbout'
import { SupervisorProfileCheckList } from './SupervisorProfileCheckList'
import { SupervisorProfileConsultation } from './SupervisorProfileConsultation'
import { SupervisorProfileContact } from './SupervisorProfileContact'
import { SupervisorProfileHero } from './SupervisorProfileHero'
import { SupervisorProfilePastClients } from './SupervisorProfilePastClients'
import { SupervisorProfilePractice } from './SupervisorProfilePractice'
import { SupervisorProfileProfessional } from './SupervisorProfileProfessional'
import { SupervisorProfileReviews } from './SupervisorProfileReviews'
import { SupervisorProfileSkeleton } from './SupervisorProfileSkeleton'

interface SupervisorProfilePageProps {
  supervisorId: string
}

const BACK_LINK_CONFIG: Record<string, { href: string; label: string }> = {
  dashboard: { href: '/dashboard', label: 'Back to Dashboard' },
  'hired-supervisors': { href: '/hired-supervisors', label: 'Back to Hired Supervisors' },
}

const DEFAULT_BACK = { href: '/find-supervisors', label: 'Back to Find Supervisors' }

export function SupervisorProfilePage({ supervisorId }: SupervisorProfilePageProps) {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? ''
  const backLink = BACK_LINK_CONFIG[from] ?? DEFAULT_BACK

  const { data: profile, isLoading, isError } = useSupervisor(supervisorId)
  const { data: certificationOptions = [] } = useCertificateOptions()
  const { data: patientPopulationOptions = [] } = usePatientPopulationOptions()
  const { data: licenseTypeOptions = [] } = useLicenseTypeOptions()
  const { data: stateOptions = [] } = useStatesOptions()
  const { data: availabilityOptions = [] } = useAvailabilityOptions()
  if (isLoading) {
    return <SupervisorProfileSkeleton />
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <AlertCircle className="mb-3 size-10 text-muted-foreground/50" />
        <p className="font-medium text-foreground">Supervisor not found</p>
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

  const focusAreaLabels = resolveOptionLabels(
    profile.patientPopulation ?? [],
    patientPopulationOptions,
  )
  const approachLabels = resolveOptionLabels(profile.certification ?? [], certificationOptions)

  return (
    /* Bleed white to the full shell content area — overrides the shell's bg-background */
    <div className="min-h-full bg-white px-6 pt-6 pb-12">
      <div className="mx-auto max-w-4xl">
        {/* Back navigation */}
        <Link
          href={backLink.href}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {backLink.label}
        </Link>

        <SupervisorProfileHero profile={profile} supervisorId={supervisorId} />
        <SupervisorProfileAbout profile={profile} />

        {focusAreaLabels.length > 0 && (
          <SupervisorProfileCheckList title="Areas of Supervision Focus" items={focusAreaLabels} />
        )}

        {approachLabels.length > 0 && (
          <SupervisorProfileCheckList
            title="Supervision & Practice Approaches"
            items={approachLabels}
          />
        )}

        <SupervisorProfileProfessional
          profile={profile}
          certificationOptions={certificationOptions}
          patientPopulationOptions={patientPopulationOptions}
          licenseTypeOptions={licenseTypeOptions}
          stateOptions={stateOptions}
        />

        <SupervisorProfileConsultation profile={profile} />

        <SupervisorProfilePractice profile={profile} availabilityOptions={availabilityOptions} />

        <SupervisorProfileContact profile={profile} />

        <SupervisorProfilePastClients supervisorId={supervisorId} />
        <SupervisorProfileReviews supervisorId={supervisorId} />
      </div>
    </div>
  )
}
