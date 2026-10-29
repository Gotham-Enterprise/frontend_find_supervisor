'use client'

import { AlertCircle, ArrowLeft, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { AgreementStageBadge } from '@/components/HiredSupervisors/AgreementStageBadge'
import { HireStatusBadge } from '@/components/HiredSupervisors/HireStatusBadge'
import { useHireActions, type WorkroomTab } from '@/components/HiredSupervisors/useHireActions'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useHire, useMyReviews } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { formatDate, formatLocation } from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'
import type { Review } from '@/types/review'

import { WorkroomDetails } from './WorkroomDetails'
import { WorkroomMessages } from './WorkroomMessages'
import { WorkroomOverview } from './WorkroomOverview'
import { WorkroomTimesheet } from './WorkroomTimesheet'

const TABS: { id: WorkroomTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'timesheet', label: 'Timesheet' },
  { id: 'messages', label: 'Messages' },
  { id: 'details', label: 'Contract details' },
]

const BACK_LINK = (
  <Link
    href="/hired-supervisors"
    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft className="size-4" aria-hidden />
    Hired Supervisors
  </Link>
)

function WorkroomSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-40" />
      <Card className="gap-0 rounded-xl px-6 py-5">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="mt-6 h-8 w-96 max-w-full" />
      </Card>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

/**
 * A supervisee's workroom for one hire, modeled on Upwork's contract
 * workroom: a header with the supervisor and the hire's actions, and tabs for
 * Overview, Timesheet (signed hourly agreements), Messages and Contract details.
 * The tab lives in `?tab=` so notifications can link straight to it.
 */
export function HireWorkroomPage({ hireId }: { hireId: string }) {
  const { data: hire, isLoading, isError } = useHire(hireId)
  const { data: reviewsData } = useMyReviews(0)

  if (isLoading) return <WorkroomSkeleton />
  if (isError || !hire) {
    return (
      <div className="space-y-6">
        {BACK_LINK}
        <Card className="items-center rounded-xl py-14 text-center">
          <AlertCircle className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-base font-semibold text-foreground">We couldn&apos;t find this hire</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            It may have been removed, or it belongs to a different account.
          </p>
        </Card>
      </div>
    )
  }

  const existingReview = reviewsData?.items.find((r) => r.hireId === hire.id)
  return <Workroom hire={hire} existingReview={existingReview} />
}

function Workroom({ hire, existingReview }: { hire: HireListItem; existingReview?: Review }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Agreement emails/notifications link here with ?agreement=review to open it for signing.
  const agreementLinked = searchParams.get('agreement') === 'review' && hire.agreement != null
  const [agreementLinkClosed, setAgreementLinkClosed] = useState(false)
  const actions = useHireActions(hire, {
    existingReview,
    agreementDeepLink: {
      open: agreementLinked && !agreementLinkClosed,
      onClose: () => setAgreementLinkClosed(true),
    },
  })
  const {
    supervisorName,
    canSignAgreement,
    needsPaymentSetup,
    hasSessions,
    openAgreement,
    openPayment,
  } = actions

  // Timesheet only exists once a signed hourly agreement is billed in the app.
  const tabs = TABS.filter((t) => t.id !== 'timesheet' || hasSessions)
  const requested = searchParams.get('tab') as WorkroomTab | null
  const activeTab: WorkroomTab = tabs.some((t) => t.id === requested) ? requested! : 'overview'

  function selectTab(tab: WorkroomTab) {
    router.replace(tab === 'overview' ? pathname : `${pathname}?tab=${tab}`, { scroll: false })
  }

  const occupation = hire.supervisor.supervisorProfile?.occupation?.trim()
  const specialty = hire.supervisor.supervisorProfile?.specialty?.trim()
  const occupationDisplay = [occupation, specialty].filter(Boolean).join(' · ')
  const location = formatLocation(hire.supervisor.city, hire.supervisor.state)
  const changeCard = () => openPayment({ changeCard: !needsPaymentSetup })

  return (
    <div className="space-y-6">
      {BACK_LINK}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-primary py-0 text-primary-foreground">
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar
              src={hire.supervisor.profilePhotoUrl}
              name={supervisorName}
              alt={`Profile photo of ${supervisorName}`}
              size="xl"
              showPresence
              userId={hire.supervisorId}
              presenceRingClassName="ring-primary"
              // Smaller than the xl default, sitting on the photo's edge.
              presenceDotClassName="bottom-1 right-1 size-3.5 translate-x-0 translate-y-0"
            />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {supervisorName}
              </h1>
              {occupationDisplay && (
                <p className="mt-0.5 truncate text-sm opacity-80">{occupationDisplay}</p>
              )}
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-80">
                {location && location !== 'N/A' && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden />
                    {location}
                  </span>
                )}
                <span>Requested {formatDate(hire.createdAt)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <HireStatusBadge status={hire.status} completedAt={hire.completedAt} onPrimary />
                <AgreementStageBadge hire={hire} />
                {hire.hasReviewed && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    <Star className="size-2.5 fill-amber-500 text-amber-500" aria-hidden />
                    Reviewed
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={actions.profileHref}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'hidden border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground sm:inline-flex',
              )}
            >
              View Profile
            </Link>
            {/* The ⋯ trigger is a ghost button; keep it white on the green header. */}
            <div className="[&>button:hover]:bg-white/15 [&>button]:text-primary-foreground">
              {actions.renderMenu('workroom')}
            </div>
          </div>
        </div>

        <div
          className="overflow-x-auto border-t border-white/15 px-6"
          role="tablist"
          aria-label="Workroom sections"
        >
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const selected = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => selectTab(tab.id)}
                  className={cn(
                    'relative whitespace-nowrap rounded-t-sm border-0 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60',
                    selected ? 'text-white' : 'text-white/70 hover:text-white',
                  )}
                >
                  {tab.label}
                  {/* Selected marker as its own bar, so unselected tabs carry no border at all. */}
                  {selected && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-white"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      <div role="tabpanel">
        {activeTab === 'overview' && (
          <WorkroomOverview
            hire={hire}
            supervisorName={supervisorName}
            canSignAgreement={canSignAgreement}
            needsPaymentSetup={needsPaymentSetup}
            hasSessions={hasSessions}
            onSign={openAgreement}
            onSetUpPayment={() => openPayment()}
          />
        )}
        {activeTab === 'timesheet' && (
          <WorkroomTimesheet
            hireId={hire.id}
            supervisorName={supervisorName}
            onChangeCard={changeCard}
            onSetUpPayment={() => openPayment()}
          />
        )}
        {activeTab === 'messages' && <WorkroomMessages hire={hire} />}
        {activeTab === 'details' && (
          <WorkroomDetails
            hire={hire}
            supervisorName={supervisorName}
            canSignAgreement={canSignAgreement}
            onSign={openAgreement}
            onSetUpPayment={openPayment}
          />
        )}
      </div>

      {actions.dialogs}
    </div>
  )
}
