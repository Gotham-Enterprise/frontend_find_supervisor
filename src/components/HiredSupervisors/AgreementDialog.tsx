'use client'

import { FileText } from 'lucide-react'
import { useState } from 'react'

import { HirePaymentSetup } from '@/components/HirePayment/HirePaymentSetup'
import { WeeklyQuoteSummary } from '@/components/HirePayment/WeeklyQuoteSummary'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { isSupervisorRole } from '@/lib/auth/roles'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { useUser, useUserSnackbar } from '@/lib/hooks'
import { useConfetti } from '@/lib/hooks/useConfetti'
import { useSignAgreement } from '@/lib/hooks/useHires'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import { formatDate, formatDisplayName } from '@/lib/utils/profile-formatters'
import type { AgreementRecord, HireListItem } from '@/types/hire'

const UNSPECIFIED = 'Not specified'

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return UNSPECIFIED
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return UNSPECIFIED
  }
}

function formatMoney(value: string | null): string {
  if (value == null) return UNSPECIFIED
  const n = Number(value)
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : value
}

/** Weekly agreements are billed in-app; legacy ones carry monthly terms. */
function isWeeklyAgreement(agreement: AgreementRecord): boolean {
  return agreement.weeklyAmountCents != null && agreement.durationWeeks != null
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`
}

function sourceLabel(agreement: AgreementRecord): string {
  return agreement.source === 'UPLOADED' ? 'Uploaded by supervisor' : 'Platform default template'
}

function TermItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
    </div>
  )
}

function SignatureBlock({
  party,
  name,
  signedAt,
}: {
  party: string
  name: string | null
  signedAt: string | null
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-muted/30 px-3 py-2.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{party}</p>
      {signedAt ? (
        <>
          <p className="mt-1 font-serif text-sm italic text-foreground">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Signed {formatDateTime(signedAt)}</p>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">Not signed yet</p>
      )}
    </div>
  )
}

/**
 * Sign form is a child of DialogContent so its state unmounts (and resets)
 * whenever the dialog closes.
 */
function SignAgreementSection({
  hire,
  onOpenChange,
}: {
  hire: HireListItem
  onOpenChange: (open: boolean) => void
}) {
  const [signatureName, setSignatureName] = useState('')
  const [consent, setConsent] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()
  const { burst } = useConfetti()
  const signMutation = useSignAgreement()

  const supervisorName = formatDisplayName(hire.supervisor)
  const isPending = signMutation.isPending
  // Weekly agreements continue straight to the payment step in this dialog.
  const paysInApp =
    IN_APP_PAYMENTS_ENABLED && hire.agreement != null && isWeeklyAgreement(hire.agreement)

  function handleSign() {
    signMutation.mutate(
      { hireId: hire.id, payload: { signatureName } },
      {
        onSuccess: () => {
          burst()
          if (paysInApp) {
            showSuccess('Agreement signed!', {
              description: 'Set up your weekly payment to start your supervision.',
            })
            return
          }
          showSuccess('Agreement signed!', {
            description: `Your supervision with ${supervisorName} is ready to begin.`,
          })
          onOpenChange(false)
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  return (
    <>
      <Separator className="my-5" />
      <section>
        <h3 className="text-sm font-semibold text-foreground">Sign this agreement</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Type your full legal name to sign electronically.
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <label
              htmlFor="agreement-signature-name"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Full Legal Name
            </label>
            <Input
              id="agreement-signature-name"
              className="mt-1"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="e.g. Jane M. Doe"
              autoComplete="name"
              disabled={isPending}
            />
          </div>
          <label className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
            <Checkbox
              checked={consent}
              onCheckedChange={setConsent}
              disabled={isPending}
              className="mt-0.5"
            />
            <span>
              I agree that typing my name above constitutes my electronic signature and that I
              intend to be bound by this agreement.
            </span>
          </label>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={isPending || !signatureName.trim() || !consent} onClick={handleSign}>
              {isPending ? 'Signing…' : 'Sign Agreement'}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

interface AgreementDialogProps {
  hire: HireListItem
  open: boolean
  onOpenChange: (open: boolean) => void
  /** True only for the supervisee while their signature is pending — shows the sign form. */
  canSign?: boolean
}

export function AgreementDialog({
  hire,
  open,
  onOpenChange,
  canSign = false,
}: AgreementDialogProps) {
  const { user } = useUser()
  const agreement = hire.agreement
  if (!agreement) return null

  const showSignForm = canSign && agreement.superviseeSignedAt == null
  const weekly = isWeeklyAgreement(agreement)
  const viewerIsSupervisor = isSupervisorRole(user?.role)
  const showPayment = IN_APP_PAYMENTS_ENABLED && weekly

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(85vh,720px)] max-w-lg overflow-y-auto">
        <DialogTitle>Supervision Agreement</DialogTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Version {agreement.version} · {sourceLabel(agreement)}
        </p>

        <section className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Terms</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <TermItem label="Start Date" value={formatDate(agreement.startDate)} />
            {weekly ? (
              <>
                <TermItem label="Duration" value={plural(agreement.durationWeeks ?? 0, 'week')} />
                <TermItem
                  label="Weekly Amount"
                  value={formatUsdCents(agreement.weeklyAmountCents ?? 0)}
                />
              </>
            ) : (
              <>
                <TermItem
                  label="Duration"
                  value={
                    agreement.supervisionMonths != null
                      ? plural(agreement.supervisionMonths, 'month')
                      : UNSPECIFIED
                  }
                />
                <TermItem label="Monthly Amount" value={formatMoney(agreement.monthlyAmount)} />
              </>
            )}
            {agreement.transactionFeePct != null && (
              <TermItem
                label="Platform Transaction Fee"
                value={`${Number(agreement.transactionFeePct)}%`}
              />
            )}
          </dl>
        </section>

        <Separator className="my-5" />

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Document</h3>
          {agreement.fileUrl ? (
            <a
              href={agreement.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <FileText className="size-4" aria-hidden />
              View agreement document
            </a>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              The platform&apos;s standard supervision agreement, applied with the terms above.
            </p>
          )}
        </section>

        <Separator className="my-5" />

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Signatures</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SignatureBlock
              party="Supervisor"
              name={agreement.supervisorSignatureName}
              signedAt={agreement.supervisorSignedAt}
            />
            <SignatureBlock
              party="Supervisee"
              name={agreement.superviseeSignatureName}
              signedAt={agreement.superviseeSignedAt}
            />
          </div>
        </section>

        {showPayment && agreement.quote && (viewerIsSupervisor || showSignForm) && (
          <>
            <Separator className="my-5" />
            <section>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Weekly Payment</h3>
              <WeeklyQuoteSummary
                quote={agreement.quote}
                perspective={viewerIsSupervisor ? 'supervisor' : 'supervisee'}
                durationWeeks={agreement.durationWeeks}
              />
              {showSignForm && (
                <p className="mt-2 text-xs text-muted-foreground">
                  You&apos;ll set up payment right after signing.
                </p>
              )}
            </section>
          </>
        )}

        {showPayment && !viewerIsSupervisor && agreement.superviseeSignedAt != null && (
          <>
            <Separator className="my-5" />
            <section>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Weekly Payment</h3>
              <HirePaymentSetup
                hireId={hire.id}
                supervisorName={formatDisplayName(hire.supervisor)}
              />
            </section>
          </>
        )}

        {showSignForm && <SignAgreementSection hire={hire} onOpenChange={onOpenChange} />}
      </DialogContent>
    </DialogRoot>
  )
}
