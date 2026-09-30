import { ChevronDownIcon, ExternalLinkIcon, StethoscopeIcon } from 'lucide-react'
import { Fragment } from 'react'

import {
  type CollaborationRequiredStatus,
  getPhysicianOversightRules,
  type OversightField,
  PHYSICIAN_ROLE_LABELS,
  type PhysicianOversightRule,
  type PhysicianRole,
  type RatioStatus,
  type RemotePhysicianStatus,
  type RequirementStatus,
} from '@/lib/constants/physician-oversight-rules'
import { cn } from '@/lib/utils'

import { GUIDE_TONE_STYLES, GuideDisclaimer, type GuideTone, oldestVerifiedDate } from './shared'

interface OversightRow {
  label: string
  tone: GuideTone
  text: string
}

/** Tone + fallback text per status, used when an entry has no `detail`. */
type StatusDisplay<S extends string> = Record<S, { tone: GuideTone; fallback: string }>

const COLLABORATION_DISPLAY: StatusDisplay<CollaborationRequiredStatus> = {
  NOT_REQUIRED: { tone: 'good', fallback: 'Not required' },
  TRANSITION_PERIOD: { tone: 'neutral', fallback: 'Only for a transition period' },
  REQUIRED: { tone: 'neutral', fallback: 'Required' },
}

const REMOTE_DISPLAY: StatusDisplay<RemotePhysicianStatus> = {
  ALLOWED: { tone: 'good', fallback: 'Yes' },
  LIMITED: { tone: 'caution', fallback: 'With conditions' },
  NOT_ALLOWED: { tone: 'bad', fallback: 'No, physician must be on site' },
  NOT_SPECIFIED: { tone: 'unknown', fallback: "Rules don't say" },
}

const MEETINGS_DISPLAY: StatusDisplay<RequirementStatus> = {
  NOT_REQUIRED: { tone: 'good', fallback: 'Not required' },
  REQUIRED: { tone: 'caution', fallback: 'Required' },
  NOT_SPECIFIED: { tone: 'unknown', fallback: "Rules don't say" },
}

const CHART_REVIEW_DISPLAY: StatusDisplay<RequirementStatus> = {
  NOT_REQUIRED: { tone: 'good', fallback: 'No set requirement' },
  REQUIRED: { tone: 'neutral', fallback: 'Required' },
  NOT_SPECIFIED: { tone: 'unknown', fallback: "Rules don't say" },
}

const RATIO_DISPLAY: StatusDisplay<RatioStatus> = {
  NONE: { tone: 'good', fallback: 'No limit' },
  LIMIT: { tone: 'neutral', fallback: 'Limited' },
  NOT_SPECIFIED: { tone: 'unknown', fallback: "Rules don't say" },
}

function toRow<S extends string>(
  label: string,
  field: OversightField<S>,
  display: StatusDisplay<S>,
): OversightRow {
  const { tone, fallback } = display[field.status]
  return { label, tone, text: field.detail ?? fallback }
}

/** The five rows the card shows for one role. */
export function getOversightRows(rule: PhysicianOversightRule): OversightRow[] {
  const physician = rule.role === 'NP' ? 'Collaborating physician' : 'Supervising physician'
  return [
    toRow(`${physician} required?`, rule.collaborationRequired, COLLABORATION_DISPLAY),
    toRow('Remote physician allowed?', rule.remotePhysician, REMOTE_DISPLAY),
    toRow('In-person meetings', rule.inPersonMeetings, MEETINGS_DISPLAY),
    toRow('Chart review', rule.chartReview, CHART_REVIEW_DISPLAY),
    toRow('Physician ratio limit', rule.ratioLimit, RATIO_DISPLAY),
  ]
}

function OversightValue({ tone, text }: { tone: GuideTone; text: string }) {
  const { className, Icon } = GUIDE_TONE_STYLES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-start gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <Icon className="mt-0.5 size-3 shrink-0" aria-hidden />
      {text}
    </span>
  )
}

function RoleSection({ rule, showRole }: { rule: PhysicianOversightRule; showRole: boolean }) {
  return (
    <div className="space-y-2">
      {showRole && (
        <h3 className="text-xs font-semibold text-foreground">
          {PHYSICIAN_ROLE_LABELS[rule.role]}
        </h3>
      )}
      {/* Fixed label column keeps values aligned; stacks on narrow screens. */}
      <dl className="grid grid-cols-1 items-start gap-x-3 gap-y-1.5 sm:grid-cols-[11rem_minmax(0,1fr)]">
        {getOversightRows(rule).map((row) => (
          <Fragment key={row.label}>
            <dt className="text-xs text-muted-foreground sm:pt-0.5">{row.label}</dt>
            <dd className="mb-1 min-w-0 sm:mb-0">
              <OversightValue tone={row.tone} text={row.text} />
            </dd>
          </Fragment>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">{rule.summary}</p>
    </div>
  )
}

function RuleSource({ rule, showRole }: { rule: PhysicianOversightRule; showRole: boolean }) {
  return (
    <div className="space-y-1.5">
      {showRole && (
        <p className="text-xs font-semibold text-foreground">{PHYSICIAN_ROLE_LABELS[rule.role]}</p>
      )}
      {rule.otherConditions.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
          {rule.otherConditions.map((condition) => (
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

interface PhysicianOversightGuideProps {
  /** US state code (e.g. "TX"). */
  state: string
  /** Display name for the state (e.g. "Texas"). */
  stateName: string
  /** Which role to show; null shows both NP and PA. */
  role: PhysicianRole | null
  /** Render nothing (instead of a "check with your board" note) for states we haven't researched. */
  hideWhenNoData?: boolean
}

/**
 * Tells NPs and PAs what the physician relationship requires in a state —
 * above all, whether a remote physician works. Informational only.
 */
export function PhysicianOversightGuide({
  state,
  stateName,
  role,
  hideWhenNoData = false,
}: PhysicianOversightGuideProps) {
  const stateRules = getPhysicianOversightRules(state)
  const rules = role ? stateRules.filter((r) => r.role === role) : stateRules
  const showRole = rules.length > 1

  if (rules.length === 0) {
    if (hideWhenNoData) return null
    return (
      <section
        aria-label="Physician oversight rules"
        className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
      >
        <StethoscopeIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          We haven&apos;t verified {stateName}&apos;s physician collaboration rules yet. Check with
          your state licensing board before relying on a remote physician.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="Physician oversight rules"
      className="space-y-3 rounded-xl border border-border bg-card px-4 py-3"
    >
      <h2 className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-foreground">
        <StethoscopeIcon className="size-4 shrink-0 text-primary" aria-hidden />
        Physician oversight rules in {stateName}
        {!showRole && (
          <span className="font-normal text-muted-foreground">
            · {PHYSICIAN_ROLE_LABELS[rules[0].role]}
          </span>
        )}
      </h2>

      <div className={cn(showRole && 'grid gap-5 lg:grid-cols-2')}>
        {rules.map((rule) => (
          <RoleSection key={rule.role} rule={rule} showRole={showRole} />
        ))}
      </div>

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
            <RuleSource key={rule.role} rule={rule} showRole={showRole} />
          ))}
        </div>
      </details>

      <GuideDisclaimer lastVerified={oldestVerifiedDate(rules)} />
    </section>
  )
}
