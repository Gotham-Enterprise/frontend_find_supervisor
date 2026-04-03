'use client'

import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  LayoutDashboard,
  Mail,
  MessageCircle,
  ShieldCheck,
  Star,
  UserCog,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'

import { SupervisorDashboardSubscription } from '@/components/Dashboard/subscription'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupervisorProfile, useUser } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { SupervisorProfileData, VerificationStatus } from '@/types/supervisor-profile'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return '?'
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

function getProfileCompletion(profile: SupervisorProfileData): number {
  const checks: boolean[] = [
    !!profile.user.profilePhotoUrl,
    !!profile.licenseType,
    !!profile.profession,
    !!profile.licenseNumber,
    !!profile.stateLicense,
    !!profile.yearsOfExperience,
    !!profile.supervisionFormat,
    !!profile.availability,
    !!profile.supervisionFeeAmount,
    !!profile.professionalSummary,
    (profile.certification?.length ?? 0) > 0,
    (profile.patientPopulation?.length ?? 0) > 0,
    !!profile.user.city,
    !!profile.user.state,
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
}

type StepStatus = 'done' | 'current' | 'upcoming'

interface ChecklistStep {
  label: string
  description: string
  status: StepStatus
  /** When current, show “Coming soon” instead of the Start link (no subscription URL yet) */
  noRedirect?: boolean
}

function hasActiveSubscription(profile: SupervisorProfileData): boolean {
  return (
    profile.user.subscriptions?.some((s) => s.status === 'ACTIVE' || s.status === 'TRIALING') ??
    false
  )
}

function getChecklist(profile: SupervisorProfileData): ChecklistStep[] {
  const detailsDone = !!(
    profile.availability &&
    profile.supervisionFeeAmount &&
    profile.supervisionFormat
  )
  const subscribed = hasActiveSubscription(profile)
  const fullProfileDone = detailsDone && subscribed
  const verified = profile.verificationStatus === 'APPROVED'

  const subscribeStatus: StepStatus = subscribed
    ? 'done'
    : profile.user.emailVerified && detailsDone
      ? 'current'
      : 'upcoming'

  return [
    {
      label: 'Create your account',
      description: 'Account registered successfully',
      status: 'done',
    },
    {
      label: 'Verify your email',
      description: 'Email confirmed',
      status: profile.user.emailVerified ? 'done' : 'current',
    },
    {
      label: 'Complete full profile details',
      description: 'Availability, fees, and supervision format',
      status: detailsDone ? 'done' : profile.user.emailVerified ? 'current' : 'upcoming',
    },
    {
      label: 'Subscribe to our app',
      description:
        'Choose a plan to unlock full platform access. Subscription checkout will be available soon.',
      status: subscribeStatus,
      noRedirect: true,
    },
    {
      label: 'Await admin verification',
      description: 'Review typically takes 2–3 business days',
      status: verified ? 'done' : fullProfileDone ? 'current' : 'upcoming',
    },
  ]
}

function formatFee(amount: number | null | undefined, type: string | null | undefined): string {
  if (!amount) return '—'
  const dollars = Math.floor(amount / 100)
  const label = type === 'HOURLY' ? '/hr' : type === 'MONTHLY' ? '/month' : '/session'
  return `$${dollars}${label}`
}

function formatFormat(fmt: string | null | undefined): string {
  if (!fmt) return ''
  return { IN_PERSON: 'In-Person', VIRTUAL: 'Virtual', HYBRID: 'Hybrid' }[fmt] ?? fmt
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// ─── Small reusable pieces ───────────────────────────────────────────────────

function ProfileAvatar({
  fullName,
  photoUrl,
  size = 'md',
}: {
  fullName: string | null | undefined
  photoUrl: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = { sm: 'size-8 text-xs', md: 'size-12 text-sm', lg: 'size-16 text-lg' }[size]
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={fullName ?? ''}
        className={cn('rounded-full object-cover', sizeClass)}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground',
        sizeClass,
      )}
    >
      {getInitials(fullName)}
    </div>
  )
}

function CircularProgress({ value }: { value: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative flex size-20 items-center justify-center">
      <svg className="size-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-base font-bold text-white">{value}%</span>
    </div>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'done') return <CheckCircle2 className="size-5 shrink-0 text-primary" />
  if (status === 'current')
    return <Circle className="size-5 shrink-0 fill-amber-400 text-amber-400" />
  return <Circle className="size-5 shrink-0 text-muted-foreground/30" />
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === 'APPROVED')
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
        ● Approved
      </span>
    )
  if (status === 'REJECTED')
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        ● Rejected
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      ● Pending Review
    </span>
  )
}

// ─── Skeleton loading state ───────────────────────────────────────────────────

function SupervisorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-64 rounded-xl lg:col-span-3" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
    </div>
  )
}

// ─── Dashboard sections ───────────────────────────────────────────────────────

function WelcomeBanner({
  profile,
  completion,
}: {
  profile: SupervisorProfileData
  completion: number
}) {
  const composedName = `${profile.user.firstName ?? ''} ${profile.user.lastName ?? ''}`.trim()
  const name = profile.user.fullName ?? (composedName || profile.user.email)
  const isPending = profile.verificationStatus === 'PENDING'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
            Supervisor Portal
          </p>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome, {name}</h1>
            <p className="mt-1 text-sm opacity-80">
              Let&apos;s complete your supervisor setup and get your profile live.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <span className="size-1.5 rounded-full bg-amber-300" />
              Profile setup in progress
            </span>
            {isPending && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <span className="size-1.5 rounded-full bg-amber-300" />
                Verification: Pending Review
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <CircularProgress value={completion} />
          <span className="text-xs font-medium opacity-70">Profile Completion</span>
        </div>
      </div>
    </div>
  )
}

function StatusCards({
  profile,
  completion,
}: {
  profile: SupervisorProfileData
  completion: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Email */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email
          </CardTitle>
          <Mail className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          {profile.user.emailVerified ? (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              ✓ Verified
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Unverified</Badge>
          )}
          <p className="truncate text-sm text-muted-foreground">{profile.user.email}</p>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Profile Completion
          </CardTitle>
          <LayoutDashboard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Badge
            className={cn(
              'hover:opacity-100',
              completion >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
            )}
          >
            ● {completion}% Complete
          </Badge>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {14 - Math.round((completion / 100) * 14)} steps remaining
          </p>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Verification Status
          </CardTitle>
          <ShieldCheck className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <VerificationBadge status={profile.verificationStatus} />
          <p className="text-sm text-muted-foreground">
            {profile.verificationStatus === 'APPROVED' && 'Profile is verified'}
            {profile.verificationStatus === 'PENDING' && 'Admin review in progress'}
            {profile.verificationStatus === 'REJECTED' &&
              (profile.verificationNotes ?? 'Review required')}
          </p>
        </CardContent>
      </Card>

      {/* Profile Visibility */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Profile Visibility
          </CardTitle>
          {profile.visibilityStatus === 'VISIBLE' ? (
            <Eye className="size-4 text-muted-foreground" />
          ) : (
            <EyeOff className="size-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent className="space-y-1">
          {profile.visibilityStatus === 'VISIBLE' ? (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">● Public</Badge>
          ) : (
            <Badge className="bg-muted text-muted-foreground hover:bg-muted">● Hidden</Badge>
          )}
          <p className="text-sm text-muted-foreground">
            {profile.visibilityStatus === 'VISIBLE'
              ? 'Visible to supervisees'
              : 'Visible after verification'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SetupChecklist({ profile }: { profile: SupervisorProfileData }) {
  const steps = getChecklist(profile)
  const doneCount = steps.filter((s) => s.status === 'done').length

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Setup Checklist</CardTitle>
          <p className="text-sm text-muted-foreground">Complete all steps to go live</p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {doneCount}/{steps.length}
        </span>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <StepIcon status={step.status} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      step.status === 'upcoming' && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  {step.status === 'done' && (
                    <span className="shrink-0 text-xs font-medium text-emerald-600">Done</span>
                  )}
                  {step.status === 'current' && step.noRedirect && (
                    <span className="shrink-0 text-xs text-muted-foreground">Coming soon</span>
                  )}
                  {step.status === 'current' && !step.noRedirect && (
                    <Link
                      href="/dashboard"
                      className="shrink-0 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
                    >
                      Start →
                    </Link>
                  )}
                  {step.status === 'upcoming' && (
                    <span className="shrink-0 text-xs text-muted-foreground">Upcoming</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function ProfilePreview({ profile }: { profile: SupervisorProfileData }) {
  const composedName = `${profile.user.firstName ?? ''} ${profile.user.lastName ?? ''}`.trim()
  const name = profile.user.fullName ?? (composedName || '—')
  const location = [profile.user.city, profile.user.state].filter(Boolean).join(', ')
  const fmt = formatFormat(profile.supervisionFormat)
  const tags = [
    profile.user.specialty?.name,
    profile.user.occupation?.name,
    ...(profile.certification ?? []),
    ...(profile.patientPopulation ?? []),
  ]
    .filter((v): v is string => !!v)
    .slice(0, 5)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Profile Preview</CardTitle>
          <p className="text-sm text-muted-foreground">How your profile looks publicly</p>
        </div>
        <Badge className="bg-muted text-muted-foreground hover:bg-muted">+ Hidden</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <ProfileAvatar fullName={name} photoUrl={profile.user.profilePhotoUrl} size="lg" />
          <div className="min-w-0">
            <p className="font-semibold leading-tight">{name}</p>
            <p className="text-sm text-muted-foreground">
              {profile.licenseType ?? profile.profession ?? '—'}
            </p>
            {(location || fmt) && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {location}
                {location && fmt && ' · '}
                {fmt}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x rounded-lg border text-center text-sm">
          <div className="py-2">
            <p className="font-semibold">{profile.yearsOfExperience ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Yrs Exp.</p>
          </div>
          <div className="py-2">
            <p className="font-semibold">{profile.totalCompletedSupervision ?? 0}</p>
            <p className="text-xs text-muted-foreground">Reviews</p>
          </div>
          <div className="py-2">
            <p className="font-semibold capitalize">{profile.availability ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Availability</p>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Fee + accepting */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span className="font-semibold text-primary">
            {formatFee(profile.supervisionFeeAmount, profile.supervisionFeeType)}
          </span>
          {profile.acceptingSupervisees ? (
            <span className="text-xs font-medium text-emerald-600">Accepting now</span>
          ) : (
            <span className="text-xs text-muted-foreground">Not accepting</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Link
            href="/dashboard"
            className="flex-1 rounded-lg bg-primary py-2 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Edit Profile
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium transition-colors hover:bg-muted"
          >
            Preview Public
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function VerificationPanel({ profile }: { profile: SupervisorProfileData }) {
  if (profile.verificationStatus === 'APPROVED') return null

  const isRejected = profile.verificationStatus === 'REJECTED'

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-start',
        isRejected ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50',
      )}
    >
      <AlertCircle
        className={cn('mt-0.5 size-5 shrink-0', isRejected ? 'text-red-500' : 'text-amber-500')}
      />
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">
            {isRejected ? 'Profile Verification Issue' : 'Profile Under Review'}
          </p>
          <VerificationBadge status={profile.verificationStatus} />
        </div>
        <p className="text-sm text-muted-foreground">
          {isRejected
            ? (profile.verificationNotes ??
              'Your profile requires updates before it can be approved.')
            : 'Your supervisor profile has been submitted and is currently under admin review. Your profile will remain hidden from supervisee searches until the review is complete. This process typically takes 2–3 business days.'}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <BadgeCheck className="size-4" /> Check Status
        </button>
        <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <MessageCircle className="size-4" /> Contact Support
        </button>
      </div>
    </div>
  )
}

function QuickActions() {
  const actions = [
    {
      icon: UserCog,
      label: 'Complete Profile',
      description: 'Fill missing details',
      link: 'Go to profile →',
    },
    {
      icon: CalendarDays,
      label: 'Edit Availability',
      description: 'Set your schedule',
      link: 'Manage →',
    },
    { icon: Wallet, label: 'Update Fees', description: 'Set session pricing', link: 'Edit fees →' },
    { icon: Eye, label: 'Profile Preview', description: 'See public view', link: 'Preview →' },
    {
      icon: HelpCircle,
      label: 'Contact Support',
      description: 'Get help from our team',
      link: 'Message us →',
    },
  ]

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">Jump to key tasks from here</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {actions.map(({ icon: Icon, label, description, link }) => (
            <Link
              key={label}
              href="/dashboard"
              className="group flex flex-col gap-2 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <span className="mt-auto text-xs font-medium text-primary">{link}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TipsAndHelp() {
  const tips = [
    'Complete your profile to 100% — profiles with full bios, licenses, and availability details get approved faster.',
    'Upload your license document — a clear photo or PDF of your active license is required for verification.',
    'Add a professional summary — describe your supervision style, specialties, and approach in 3–5 sentences.',
    'Set your availability and fees — supervisees want to know when you&apos;re available and at what cost upfront.',
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Tips */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base font-semibold">Tips for Faster Approval</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ol className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{tip.replace('&apos;', "'")}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Verification guide + Need Help */}
      <div className="space-y-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Verification Guide</p>
              <p className="text-sm text-muted-foreground">
                Learn what the admin review process involves and how to prepare your account for
                approval.
              </p>
              <button className="mt-1 text-sm font-medium text-primary hover:underline">
                Read the guide →
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base font-semibold">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            {[
              { icon: MessageCircle, label: 'Chat with support' },
              { icon: Star, label: 'Read the FAQ' },
              { icon: Mail, label: 'Email us' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex w-full items-center justify-between py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {label}
                </span>
                <ChevronRight className="size-4" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BillingSection({ profile }: { profile: SupervisorProfileData }) {
  const sub = profile.user.subscriptions?.[0]
  if (!sub) return null

  const isActive = sub.status === 'ACTIVE' || sub.status === 'TRIALING'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Billing &amp; Subscription</CardTitle>
          <p className="text-sm text-muted-foreground">Manage your plan and payment details</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <CreditCard className="size-4" /> Manage Billing
        </button>
      </CardHeader>
      <CardContent className="grid gap-6 pt-4 sm:grid-cols-2">
        {/* Current plan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Current Plan</p>
            {isActive && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                ● Active
              </Badge>
            )}
          </div>
          <div className="rounded-xl border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{sub.plan.name}</p>
                <p className="text-xs text-muted-foreground">Supervisor plan</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCents(sub.plan.priceInCents)}</p>
                <p className="text-xs text-muted-foreground lowercase">/{sub.plan.billingCycle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next invoice */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Next Invoice</p>
            {sub.cancelAtPeriodEnd && (
              <span className="text-xs text-muted-foreground">
                Cancels {formatDate(sub.currentPeriodEnd)}
              </span>
            )}
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-2xl font-bold">{formatCents(sub.plan.priceInCents)}</p>
            <p className="text-sm text-muted-foreground">
              Due on {formatDate(sub.currentPeriodEnd)}
            </p>
            {sub.currentPeriodEnd && !sub.cancelAtPeriodEnd && (
              <span className="mt-1 inline-block text-xs text-emerald-600">● Auto-renews</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SupervisorDashboard() {
  const { user } = useUser()
  const { data: profile, isLoading, isError } = useSupervisorProfile()

  if (isLoading) return <SupervisorDashboardSkeleton />

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
        <AlertCircle className="mb-3 size-10 text-muted-foreground/50" />
        <p className="font-medium text-foreground">Could not load your profile</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please refresh the page or contact support if this persists.
        </p>
      </div>
    )
  }

  const completion = getProfileCompletion(profile)
  const composedName = `${profile.user.firstName ?? ''} ${profile.user.lastName ?? ''}`.trim()
  const displayName =
    profile.user.fullName ?? user?.fullName ?? (composedName || user?.email) ?? null

  // Merge the display name into the profile user for child components
  const enrichedProfile: SupervisorProfileData = {
    ...profile,
    user: { ...profile.user, fullName: displayName ?? profile.user.fullName },
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner profile={enrichedProfile} completion={completion} />
      <StatusCards profile={enrichedProfile} completion={completion} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SetupChecklist profile={enrichedProfile} />
        </div>
        <div className="lg:col-span-2">
          <ProfilePreview profile={enrichedProfile} />
        </div>
      </div>

      <VerificationPanel profile={enrichedProfile} />
      <QuickActions />
      <SupervisorDashboardSubscription
        isSubscribed={hasActiveSubscription(enrichedProfile)}
        planName={enrichedProfile.user.subscriptions?.[0]?.plan.name}
        currentPeriodEnd={enrichedProfile.user.subscriptions?.[0]?.currentPeriodEnd}
      />
      <TipsAndHelp />
      <BillingSection profile={enrichedProfile} />
    </div>
  )
}
