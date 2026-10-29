'use client'

import type { ReactNode } from 'react'

import { formatHours } from '@/components/HirePayment/HourlyQuoteSummary'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useSuperviseeFormOptions } from '@/lib/hooks'
import { formatUsdCents } from '@/lib/utils/money'
import {
  formatAvailability,
  formatBudgetRange,
  formatDate,
  formatDateOnly,
  formatDisplayName,
  formatFeeAmount,
  formatSupervisionFormat,
  formatSupervisionHours,
  resolveSupervisorTypeLabel,
} from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'

import { HireStatusBadge } from './HireStatusBadge'

const UNSPECIFIED = 'Not specified'

function displayText(value: string | null | undefined, formatted?: string): string {
  const v = (formatted ?? value ?? '').trim()
  if (!v || v === 'N/A' || v === '—') return UNSPECIFIED
  return v
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return UNSPECIFIED
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return UNSPECIFIED
  }
}

function isSpecified(value: string): boolean {
  return value.trim() !== UNSPECIFIED && value.trim() !== ''
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-sm text-foreground ${multiline ? 'whitespace-pre-wrap break-words' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}

function FieldList({
  fields,
  wide = false,
}: {
  fields: Array<{ label: string; value: string; multiline?: boolean }>
  /** Two columns on wider screens; long text still spans the full width. */
  wide?: boolean
}) {
  const visible = fields.filter((f) => isSpecified(f.value))
  if (visible.length === 0) return null
  return (
    <div className={wide ? 'grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2' : 'space-y-3'}>
      {visible.map((f) => (
        <div key={f.label} className={wide && f.multiline ? 'sm:col-span-2' : undefined}>
          <Field label={f.label} value={f.value} multiline={f.multiline} />
        </div>
      ))}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  )
}

/**
 * Everything about the hire request — what was requested, the supervisor
 * snapshot, and the agreement timeline. Shown in the request details dialog
 * and on the workroom's Contract details tab.
 */
export function HireRequestDetailsBody({
  hire,
  showStatus = true,
  wide = false,
}: {
  hire: HireListItem
  showStatus?: boolean
  /** Full-width page layout: fields in two columns. */
  wide?: boolean
}) {
  const { supervisorTypes } = useSuperviseeFormOptions()
  const supervisorTypeOptions = supervisorTypes.data ?? []
  const licenseStates =
    hire.supervisorStateLicense?.length > 0 ? hire.supervisorStateLicense.join(', ') : UNSPECIFIED

  const requestedFields = [
    {
      label: 'Preferred format',
      value: displayText(hire.preferredFormat, formatSupervisionFormat(hire.preferredFormat)),
    },
    {
      label: 'Preferred availability',
      value: displayText(
        hire.preferredAvailability,
        formatAvailability(hire.preferredAvailability),
      ),
    },
    {
      label: 'Type of supervisor needed',
      value: displayText(
        null,
        resolveSupervisorTypeLabel(hire.typeOfSupervisorNeeded, supervisorTypeOptions),
      ),
    },
    {
      label: 'Preferred start date',
      value: displayText(hire.preferredStartDate, formatDateOnly(hire.preferredStartDate)),
    },
    ...(hire.supervisionHours != null
      ? [
          {
            label: 'Supervision hours needed',
            value: displayText(null, formatSupervisionHours(hire.supervisionHours)),
          },
        ]
      : []),
    {
      label: 'Budget range',
      value: displayText(
        null,
        formatBudgetRange(hire.budgetRangeStart, hire.budgetRangeEnd, hire.budgetRangeType),
      ),
    },
    { label: 'Intro message', value: displayText(hire.introMessage), multiline: true },
    { label: 'Goals', value: displayText(hire.goals), multiline: true },
  ]

  const snapshotFields = [
    { label: 'Profession', value: displayText(hire.supervisorProfession) },
    { label: 'License type', value: displayText(hire.supervisorLicenseType) },
    { label: 'State license', value: licenseStates },
    {
      label: 'Format',
      value: displayText(hire.supervisorFormat, formatSupervisionFormat(hire.supervisorFormat)),
    },
    {
      label: 'Availability',
      value: displayText(
        hire.supervisorAvailability,
        formatAvailability(hire.supervisorAvailability),
      ),
    },
    {
      label: 'Fee',
      value: displayText(null, formatFeeAmount(hire.supervisorFeeAmount, hire.supervisorFeeType)),
    },
  ]

  const agreementFields = [
    { label: 'Submitted', value: formatDateTime(hire.createdAt) },
    { label: 'Last updated', value: formatDateTime(hire.updatedAt) },
    { label: 'Accepted at', value: formatDateTime(hire.acceptedAt) },
    { label: 'Agreed at', value: formatDateTime(hire.agreedAt) },
    ...(hire.agreement
      ? [
          {
            label: 'Agreement document',
            value:
              hire.agreement.source === 'UPLOADED'
                ? 'Uploaded by supervisor'
                : 'Platform default template',
          },
          { label: 'Agreement version', value: String(hire.agreement.version) },
          {
            label: 'Supervisor signed',
            value: `${hire.agreement.supervisorSignatureName} · ${formatDateTime(hire.agreement.supervisorSignedAt)}`,
          },
          {
            label: 'Supervisee signed',
            value: hire.agreement.superviseeSignedAt
              ? `${hire.agreement.superviseeSignatureName ?? 'Signed'} · ${formatDateTime(hire.agreement.superviseeSignedAt)}`
              : 'Awaiting signature',
          },
        ]
      : []),
    {
      label: 'Supervision start',
      value: displayText(hire.startDate, formatDateOnly(hire.startDate)),
    },
    { label: 'Supervision end', value: displayText(hire.endDate, formatDateOnly(hire.endDate)) },
    // Hourly (in-app billed) hires show the agreement's hourly terms; others the monthly ones.
    ...(hire.agreement?.hourlyRateCents != null && hire.agreement.weeklyCapMinutes != null
      ? [
          { label: 'Hourly rate', value: formatUsdCents(hire.agreement.hourlyRateCents) },
          { label: 'Max per week', value: formatHours(hire.agreement.weeklyCapMinutes) },
          {
            label: 'Length',
            value:
              hire.agreement.totalHours != null
                ? `${formatHours(hire.agreement.totalHours * 60)} total`
                : 'Ongoing',
          },
          {
            label: 'Payment card',
            value: hire.paymentMethodSavedAt
              ? `Saved ${formatDate(hire.paymentMethodSavedAt)}`
              : 'Not set up yet',
          },
        ]
      : [
          {
            label: 'Planned duration (months)',
            value: hire.supervisionMonths != null ? String(hire.supervisionMonths) : UNSPECIFIED,
          },
          {
            label: 'Monthly amount',
            value: displayText(hire.monthlyAmount, hire.monthlyAmount ?? undefined),
          },
        ]),
    {
      label: 'Transaction fee',
      value: displayText(hire.transactionFeePct, hire.transactionFeePct ?? undefined),
    },
    { label: 'Completed at', value: formatDateTime(hire.completedAt) },
    { label: 'Canceled at', value: formatDateTime(hire.canceledAt) },
    { label: 'Rejected at', value: formatDateTime(hire.rejectedAt) },
    ...(hire.status === 'REJECTED'
      ? [
          {
            label: 'Rejection reason',
            value: displayText(hire.rejectionReason),
            multiline: true as const,
          },
        ]
      : []),
    { label: 'Notes', value: displayText(hire.notes), multiline: true },
  ]

  const hasRequested = requestedFields.some((f) => isSpecified(f.value))
  const hasSnapshot = snapshotFields.some((f) => isSpecified(f.value))
  const hasAgreement = agreementFields.some((f) => isSpecified(f.value))

  return (
    <div className="space-y-6">
      {showStatus && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <HireStatusBadge status={hire.status} completedAt={hire.completedAt} />
        </div>
      )}

      {hasRequested && (
        <div>
          <SectionTitle>What you requested</SectionTitle>
          <div className="mt-3">
            <FieldList fields={requestedFields} wide={wide} />
          </div>
        </div>
      )}

      {hasRequested && hasSnapshot && <Separator />}

      {hasSnapshot && (
        <div>
          <SectionTitle>Supervisor snapshot (at request)</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Captured when you submitted this request; may differ from the supervisor’s current
            profile.
          </p>
          <div className="mt-3">
            <FieldList fields={snapshotFields} wide={wide} />
          </div>
        </div>
      )}

      {(hasRequested || hasSnapshot) && hasAgreement && <Separator />}

      {hasAgreement && (
        <div>
          <SectionTitle>Agreement & timeline</SectionTitle>
          <div className="mt-3">
            <FieldList fields={agreementFields} wide={wide} />
          </div>
        </div>
      )}
    </div>
  )
}

interface HireRequestDetailsDialogProps {
  hire: HireListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HireRequestDetailsDialog({
  hire,
  open,
  onOpenChange,
}: HireRequestDetailsDialogProps) {
  const supervisorName = formatDisplayName(hire.supervisor)
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(85vh,780px)] max-w-2xl sm:max-w-2xl"
        bodyClassName="p-0"
        header={
          <>
            <DialogTitle className="text-lg">Request details</DialogTitle>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Full information for this hire request
            </p>
            <p className="mt-3 text-sm font-medium text-foreground">{supervisorName}</p>
          </>
        }
      >
        <div className="px-6 py-5">
          <HireRequestDetailsBody hire={hire} />
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
