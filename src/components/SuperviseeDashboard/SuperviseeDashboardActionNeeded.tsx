import { CreditCard, FileSignature } from 'lucide-react'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { formatDisplayName } from '@/lib/utils/profile-formatters'
import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'
import { getAgreementStage } from '@/lib/utils/supervision-status'
import type { HireListItem } from '@/types/hire'

/** Hired list the hire lives on (Medical Director hires have their own page). */
function hiredListPath(hire: HireListItem): string {
  const raw = hire.typeOfSupervisorNeeded
  const needed = Array.isArray(raw) ? raw : raw ? [raw] : []
  return needed.some((name) => name?.trim() === MEDICAL_DIRECTOR_TYPE_NAME)
    ? '/hired-medical-directors'
    : '/hired-supervisors'
}

interface ActionItem {
  hire: HireListItem
  title: string
  description: string
  cta: string
  needsCard: boolean
}

/**
 * Agreements waiting on the supervisee. A supervisor's proposal sits unsigned
 * until the supervisee acts, and for hourly agreements the card for the weekly
 * prepays has to be saved before signing — surface both here so they aren't
 * only discoverable from the hired list.
 */
export function getSuperviseeActionItems(hires: HireListItem[]): ActionItem[] {
  return hires
    .filter(
      (hire) =>
        (hire.status === 'ACCEPTED' || hire.status === 'ACTIVE') &&
        getAgreementStage(hire) === 'AWAITING_SIGNATURE',
    )
    .map((hire) => {
      const supervisorName = formatDisplayName(hire.supervisor)
      const hourly = IN_APP_PAYMENTS_ENABLED && hire.agreement?.hourlyRateCents != null
      const needsCard = hourly && hire.paymentMethodSavedAt == null
      return {
        hire,
        needsCard,
        title: needsCard
          ? `Set up payment and sign your agreement with ${supervisorName}`
          : `Sign your agreement with ${supervisorName}`,
        description: needsCard
          ? 'Save a card for the weekly prepays, then sign. Supervision starts once both are done.'
          : 'Your supervisor has sent the agreement. Supervision starts once you sign it.',
        cta: needsCard ? 'Set up & sign' : 'Review & sign',
      }
    })
}

export function SuperviseeDashboardActionNeeded({ hires }: { hires: HireListItem[] }) {
  const items = getSuperviseeActionItems(hires)
  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">
        {items.length === 1 ? 'Action needed' : `Action needed (${items.length})`}
      </p>
      <ul className="mt-3 divide-y divide-amber-200/70">
        {items.map(({ hire, title, description, cta, needsCard }) => (
          <li
            key={hire.id}
            className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              {needsCard ? (
                <CreditCard className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
              ) : (
                <FileSignature className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
              )}
              <div>
                <p className="text-sm font-medium text-amber-900">{title}</p>
                <p className="text-sm text-amber-800">{description}</p>
              </div>
            </div>
            <Link
              href={`${hiredListPath(hire)}?hire=${encodeURIComponent(hire.id)}`}
              className={buttonVariants({
                size: 'sm',
                className: 'shrink-0 self-stretch sm:self-center',
              })}
            >
              {cta}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
