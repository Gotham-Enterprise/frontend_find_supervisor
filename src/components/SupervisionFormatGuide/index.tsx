import { ChevronDownIcon, ExternalLinkIcon, LandmarkIcon } from 'lucide-react'

import {
  getFormatStatuses,
  getStateSupervisionRules,
  PROFESSION_GROUP_LABELS,
  type ProfessionGroup,
  type RemoteSupervisionStatus,
  type StateSupervisionRule,
} from '@/lib/constants/state-supervision-rules'
import { cn } from '@/lib/utils'

import { GUIDE_TONE_STYLES, GuideDisclaimer, type GuideTone, oldestVerifiedDate } from './shared'

const STATUS_STYLES: Record<
  RemoteSupervisionStatus,
  { label: string; legend: string; tone: GuideTone }
> = {
  ALLOWED: { label: 'Counts', legend: 'Counts toward licensure', tone: 'good' },
  LIMITED: { label: 'Limited', legend: 'Counts with limits', tone: 'caution' },
  NOT_ALLOWED: { label: "Doesn't count", legend: "Doesn't count", tone: 'bad' },
  NOT_SPECIFIED: {
    label: 'Not specified',
    legend: "Rules don't say. Ask your board",
    tone: 'unknown',
  },
}

function FormatChip({ label, status }: { label: string; status: RemoteSupervisionStatus }) {
  const { label: statusLabel, tone } = STATUS_STYLES[status]
  const { className, Icon } = GUIDE_TONE_STYLES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {label}
      <span className="sr-only">: {statusLabel}</span>
    </span>
  )
}

/** Explains only the statuses that actually appear in the card. */
function StatusLegend({ rules }: { rules: StateSupervisionRule[] }) {
  const present = new Set(rules.flatMap((rule) => Object.values(getFormatStatuses(rule))))
  const statuses = (Object.keys(STATUS_STYLES) as RemoteSupervisionStatus[]).filter((status) =>
    present.has(status),
  )
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground" aria-hidden>
      {statuses.map((status) => {
        const { legend, tone } = STATUS_STYLES[status]
        const { Icon } = GUIDE_TONE_STYLES[tone]
        return (
          <li key={status} className="inline-flex items-center gap-1">
            <Icon className="size-3" />
            {legend}
          </li>
        )
      })}
    </ul>
  )
}

function FormatChips({ rule }: { rule: StateSupervisionRule }) {
  const { inPerson, hybrid, remote } = getFormatStatuses(rule)
  return (
    <div className="flex flex-wrap gap-1.5">
      <FormatChip label="In-Person" status={inPerson} />
      <FormatChip label="Hybrid" status={hybrid} />
      <FormatChip label="Virtual" status={remote} />
    </div>
  )
}

function RuleDetails({
  rule,
  showProfession,
}: {
  rule: StateSupervisionRule
  showProfession: boolean
}) {
  return (
    <div className="space-y-1.5">
      {/* With a single profession the summary is already shown above the fold. */}
      {showProfession && (
        <>
          <p className="text-xs font-semibold text-foreground">
            {PROFESSION_GROUP_LABELS[rule.profession]}
          </p>
          <p className="text-sm text-foreground">{rule.summary}</p>
        </>
      )}
      {rule.remoteLimit && <p className="text-xs text-muted-foreground">{rule.remoteLimit}</p>}
      {rule.conditions.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
          {rule.conditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        {rule.board} ·{' '}
        <a
          href={rule.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
        >
          {rule.citation}
          <ExternalLinkIcon className="size-3" aria-hidden />
        </a>
      </p>
    </div>
  )
}

interface SupervisionFormatGuideProps {
  /** US state code (e.g. "TX"). */
  state: string
  /** Display name for the state (e.g. "Texas"). */
  stateName: string
  /** The supervisee's profession; null shows every profession we cover for the state. */
  profession: ProfessionGroup | null
  /** Render nothing (instead of a "check with your board" note) for states we haven't researched. */
  hideWhenNoData?: boolean
}

/**
 * Tells Supervisees which supervision formats count toward licensure in their
 * state. Informational only — it never filters results.
 *
 * Hook-free so public pages can render it on the server; details use a native
 * <details> element so their text is in the HTML for search engines.
 */
export function SupervisionFormatGuide({
  state,
  stateName,
  profession,
  hideWhenNoData = false,
}: SupervisionFormatGuideProps) {
  const stateRules = getStateSupervisionRules(state)
  const rules = profession ? stateRules.filter((r) => r.profession === profession) : stateRules
  const showProfession = rules.length > 1

  if (rules.length === 0) {
    if (hideWhenNoData) return null
    return (
      <section
        aria-label="Supervision format rules"
        className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
      >
        <LandmarkIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          We haven&apos;t verified {stateName}&apos;s rules on virtual supervision yet. Check with
          your state licensing board before counting virtual hours toward licensure.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="Supervision format rules"
      className="space-y-2 rounded-xl border border-border bg-card px-4 py-3"
    >
      <h2 className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-foreground">
        <LandmarkIcon className="size-4 shrink-0 text-primary" aria-hidden />
        Supervision formats that count in {stateName}
        {!showProfession && (
          <span className="font-normal text-muted-foreground">
            · {PROFESSION_GROUP_LABELS[rules[0].profession]}
          </span>
        )}
      </h2>

      {showProfession ? (
        <div className="space-y-1.5">
          {rules.map((rule) => (
            <div key={rule.profession} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="w-44 shrink-0 text-xs text-muted-foreground">
                {PROFESSION_GROUP_LABELS[rule.profession]}
              </span>
              <FormatChips rule={rule} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <FormatChips rule={rules[0]} />
          <p className="text-sm text-muted-foreground">{rules[0].summary}</p>
        </>
      )}

      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md text-xs font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Details and sources</span>
          <span className="hidden group-open:inline">Hide details</span>
          <ChevronDownIcon
            className="size-3.5 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {rules.map((rule) => (
            <RuleDetails key={rule.profession} rule={rule} showProfession={showProfession} />
          ))}
        </div>
      </details>

      <StatusLegend rules={rules} />

      <GuideDisclaimer lastVerified={oldestVerifiedDate(rules)} />
    </section>
  )
}
