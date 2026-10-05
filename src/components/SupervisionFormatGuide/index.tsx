import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  ExternalLinkIcon,
  LandmarkIcon,
  XIcon,
} from 'lucide-react'

import {
  getFormatStatuses,
  getStateSupervisionRules,
  PROFESSION_GROUP_LABELS,
  type ProfessionGroup,
  type RemoteSupervisionStatus,
  type StateSupervisionRule,
} from '@/lib/constants/state-supervision-rules'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<
  RemoteSupervisionStatus,
  { label: string; legend: string; className: string; Icon: typeof CheckIcon }
> = {
  ALLOWED: {
    label: 'Allowed',
    legend: 'Allowed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Icon: CheckIcon,
  },
  LIMITED: {
    label: 'Limited',
    legend: 'Allowed with limits',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    Icon: AlertTriangleIcon,
  },
  NOT_ALLOWED: {
    label: 'Not allowed',
    legend: 'Not allowed',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    Icon: XIcon,
  },
  NOT_SPECIFIED: {
    label: 'Not specified',
    legend: "Rules don't say. Ask your board",
    className: 'bg-muted text-muted-foreground border-border',
    Icon: CircleHelpIcon,
  },
}

function formatVerifiedDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function FormatChip({ label, status }: { label: string; status: RemoteSupervisionStatus }) {
  const { label: statusLabel, className, Icon } = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-medium',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
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
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground" aria-hidden>
      {statuses.map((status) => {
        const { legend, Icon } = STATUS_STYLES[status]
        return (
          <li key={status} className="inline-flex items-center gap-1">
            <Icon className="size-3.5" />
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

interface GuideState {
  /** US state code (e.g. "TX"). */
  code: string
  /** Display name (e.g. "Texas"). */
  name: string
}

interface GuideRow {
  key: string
  label: string
  stateName: string
  rule: StateSupervisionRule
}

/**
 * One row per (state, profession). Labels name only what varies: the state
 * when several states are shown, the profession when several are, or both.
 */
function buildRows(states: GuideState[], professions?: ProfessionGroup[]): GuideRow[] {
  const entries = states.flatMap((state) =>
    getStateSupervisionRules(state.code)
      .filter((rule) => !professions || professions.includes(rule.profession))
      .map((rule) => ({ state, rule })),
  )
  const multipleStates = new Set(entries.map((e) => e.state.code)).size > 1
  const multipleProfessions = new Set(entries.map((e) => e.rule.profession)).size > 1

  return entries.map(({ state, rule }) => {
    const professionLabel = PROFESSION_GROUP_LABELS[rule.profession]
    let label = professionLabel
    if (multipleStates) {
      label = multipleProfessions ? `${state.name} · ${professionLabel}` : state.name
    }
    return { key: `${rule.state}-${rule.profession}`, label, stateName: state.name, rule }
  })
}

function RuleDetails({ row, showLabel }: { row: GuideRow; showLabel: boolean }) {
  const { rule } = row
  return (
    <div className="space-y-1.5">
      {/* With a single row the summary is already shown above the fold. */}
      {showLabel && (
        <>
          <p className="text-sm font-semibold text-foreground">{row.label}</p>
          <p className="text-sm text-foreground">{rule.summary}</p>
        </>
      )}
      {rule.remoteLimit && <p className="text-sm text-muted-foreground">{rule.remoteLimit}</p>}
      {rule.conditions.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
          {rule.conditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>
      )}
      <p className="text-sm text-muted-foreground">
        {rule.board} ·{' '}
        <a
          href={rule.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
        >
          {rule.citation}
          <ExternalLinkIcon className="size-3.5" aria-hidden />
        </a>
      </p>
    </div>
  )
}

interface SupervisionFormatGuideProps {
  /** States to show, one row each (per profession). */
  states: GuideState[]
  /** Professions to show; omit to show every profession we cover. */
  professions?: ProfessionGroup[]
  /** Render nothing (instead of a "check with your board" note) for states we haven't researched. */
  hideWhenNoData?: boolean
}

/**
 * Tells Supervisees which supervision formats are allowed in their state:
 * remote supervision toward licensure for mental-health professions, remote
 * physician oversight for NPs and PAs. Informational only — it never filters
 * results.
 *
 * Hook-free so public pages can render it on the server; details use a native
 * <details> element so their text is in the HTML for search engines.
 */
export function SupervisionFormatGuide({
  states,
  professions,
  hideWhenNoData = false,
}: SupervisionFormatGuideProps) {
  const rows = buildRows(states, professions)
  const stateNames = states.map((s) => s.name).join(', ')

  if (rows.length === 0) {
    if (hideWhenNoData) return null
    return (
      <section
        aria-label="Supervision format rules"
        className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
      >
        <LandmarkIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          We haven&apos;t verified the rules on virtual supervision for {stateNames} yet. Check with
          your state licensing board before relying on virtual supervision.
        </p>
      </section>
    )
  }

  const rules = rows.map((row) => row.rule)
  const singleState = new Set(rules.map((r) => r.state)).size === 1
  const singleProfession = new Set(rules.map((r) => r.profession)).size === 1
  const lastVerified = rules.map((r) => r.lastVerified).sort()[0]

  return (
    <section
      aria-label="Supervision format rules"
      className="space-y-2 rounded-xl border border-border bg-card px-4 py-3"
    >
      <h2 className="flex flex-wrap items-center gap-x-2 text-base font-semibold text-foreground">
        <LandmarkIcon className="size-4 shrink-0 text-primary" aria-hidden />
        {singleState
          ? `Supervision Formats Allowed in ${rows[0].stateName}`
          : 'Supervision Formats Allowed'}
        {singleProfession && (
          <span className="font-normal text-muted-foreground">
            · {PROFESSION_GROUP_LABELS[rules[0].profession]}
          </span>
        )}
      </h2>

      {rows.length > 1 ? (
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div key={row.key} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="w-64 shrink-0 text-sm text-muted-foreground">{row.label}</span>
              <FormatChips rule={row.rule} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <FormatChips rule={rows[0].rule} />
          <p className="text-sm text-muted-foreground">{rows[0].rule.summary}</p>
        </>
      )}

      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Details and sources</span>
          <span className="hidden group-open:inline">Hide details</span>
          <ChevronDownIcon
            className="size-3.5 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {rows.map((row) => (
            <RuleDetails key={row.key} row={row} showLabel={rows.length > 1} />
          ))}
        </div>
      </details>

      <StatusLegend rules={rules} />

      <p className="text-sm text-muted-foreground">
        For guidance only, not legal advice. Rules change, so confirm with your state board. Last
        verified {formatVerifiedDate(lastVerified)}.
      </p>
    </section>
  )
}
