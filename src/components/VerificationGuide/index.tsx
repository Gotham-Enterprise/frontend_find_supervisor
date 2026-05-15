'use client'

import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  MessageCircle,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import type React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ─── Section components ───────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
      <div className="relative flex items-start gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <BookOpen className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Verification Guide</h1>
          <p className="max-w-2xl text-sm leading-relaxed opacity-80">
            Everything you need to know about the admin review process — what we check, what you
            need to prepare, and how to get approved as quickly as possible.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <span className="size-1.5 rounded-full bg-amber-300" />
              Review takes 2–3 business days
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              Profile hidden until approved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function WhatIsVerification() {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">
            What is the Verification Process?
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Before your profile becomes visible to supervisees, our admin team manually reviews your
          credentials and profile information. This ensures that every supervisor on our platform
          holds valid, active licensure and meets our quality standards.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: 'Profile Review',
              body: 'Admins check your license, credentials, bio, and profile completeness.',
            },
            {
              icon: BadgeCheck,
              title: 'Credential Check',
              body: 'Your license number and type are verified against relevant licensing boards.',
            },
            {
              icon: Shield,
              title: 'Approval & Visibility',
              body: 'Once approved, your profile becomes publicly searchable by supervisees.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border p-4 space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RequiredDocuments() {
  const docs = [
    {
      required: true,
      label: 'Active License Document',
      detail:
        'A clear photo or PDF of your current, unexpired professional license. Must show your name, license number, type, and expiration date.',
    },
    {
      required: true,
      label: 'License Number',
      detail:
        'Enter the exact license number as it appears on your license. This is cross-referenced during review.',
    },
    {
      required: true,
      label: 'State of Licensure',
      detail: 'The state(s) in which you are licensed to practice.',
    },
    {
      required: true,
      label: 'Certifications (select all that apply)',
      detail:
        'Choose your certifications from the list (e.g. EMDR, DBT, CBT) during signup or via Edit Profile. No file upload is needed — selecting the certification name is sufficient.',
    },
  ]

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Documents to Prepare</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="divide-y">
          {docs.map(({ required, label, detail }) => (
            <div key={label} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <CheckCircle2
                className={`mt-0.5 size-4 shrink-0 ${required ? 'text-primary' : 'text-muted-foreground/40'}`}
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{label}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      required ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {required ? 'Required' : 'Optional'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileFieldsRequired() {
  const fields = [
    { label: 'Profile Photo', note: 'A clear, professional headshot' },
    { label: 'License Type', note: 'e.g. LCSW, LPC, LMFT, BCBA' },
    { label: 'License Number or Uploaded License File', note: 'Number or scanned document' },
    { label: 'State of Licensure', note: 'One or more states where you hold an active license' },
    { label: 'Occupation / Profession', note: 'Your primary professional role' },
    { label: 'NPI Number', note: 'Your 10-digit National Provider Identifier' },
    { label: 'Years of Experience', note: 'Total years practicing in your field' },
    { label: 'Supervision Format', note: 'In-person, virtual, or hybrid' },
    { label: 'Availability', note: 'When you are available for sessions' },
    { label: 'Supervision Fee', note: 'Your rate per session, hour, or month' },
    { label: 'Professional Summary / Bio', note: 'At least 2–3 sentences about your approach' },
    { label: 'Certifications', note: 'Any additional credentials you hold' },
    { label: 'Patient Populations Served', note: 'Who you specialize in working with' },
    { label: 'City & State', note: 'Your practice location' },
  ]

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">
            Profile Fields Required for Approval
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          All fields below must be completed before your profile can be approved.
        </p>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {fields.map(({ label, note }, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium leading-snug">{label}</p>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Link
            href="/my-profile"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Complete my profile →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewTimeline() {
  const steps = [
    {
      day: 'Day 1',
      title: 'Profile Submitted',
      body: 'Your profile will be reviewed by the admin team for approval within 2–3 business days.',
    },
    {
      day: 'Day 1–2',
      title: 'Admin Review',
      body: 'Our team reviews your license document, credentials, and profile quality. Your profile is hidden from search results during this time.',
    },
    {
      day: 'Day 2–3',
      title: 'Decision Issued',
      body: "You receive a notification. If approved, your profile goes live immediately. If there are issues, you'll see detailed notes on your dashboard.",
    },
    {
      day: 'Ongoing',
      title: 'Live Profile',
      body: 'Supervisees can now find and contact you. Keep your profile up to date — expired license documents may trigger a re-review.',
    },
  ]

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">What Happens During Review</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <ol className="relative space-y-0 border-l border-border pl-6">
          {steps.map(({ day, title, body }, i) => (
            <li key={i} className="pb-6 last:pb-0">
              <span className="absolute -left-[9px] flex size-[18px] items-center justify-center rounded-full border-2 border-primary bg-white" />
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-primary">
                {day}
              </span>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function IfRejected() {
  const reasons = [
    'License document is blurry, cropped, or expired',
    'License number does not match the uploaded document',
    'Professional summary / bio is too short or missing',
    'Credentials listed are unverifiable or inconsistent',
    'Profile photo is missing or not a professional headshot',
    'Supervision fee or availability is not set',
  ]

  return (
    <Card className="border-red-200 bg-red-50/40">
      <CardHeader className="border-b border-red-100 pb-3">
        <div className="flex items-center gap-2">
          <XCircle className="size-5 text-red-500" />
          <CardTitle className="text-base font-semibold">If Your Profile is Rejected</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          A rejection is not permanent. The specific reason will always be shown on your dashboard
          under the Verification Status card. After fixing the issue, your profile re-enters the
          review queue automatically.
        </p>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Common rejection reasons:</p>
          <ul className="space-y-1.5">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-4 space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="size-4 text-primary" />
            <p className="text-sm font-semibold">How to Re-submit</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Go to{' '}
            <Link href="/my-profile" className="font-medium text-primary hover:underline">
              My Profile
            </Link>{' '}
            and fix the flagged issues. Save your changes, and a new review will begin within 72
            hours. There is no limit on resubmissions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function TipsForFasterApproval() {
  const tips = [
    {
      tip: 'Upload a high-quality license document',
      detail:
        'A clear, well-lit photo or a scanned PDF — not a screenshot. The license number, type, and expiration date must be legible.',
    },
    {
      tip: 'Write a detailed professional summary',
      detail:
        'Describe your supervision style, approach, and what supervisees can expect. Aim for at least 3–5 sentences.',
    },
    {
      tip: 'Set your availability and fees upfront',
      detail:
        'Incomplete profiles with missing fees or availability are the most common cause of delayed approvals.',
    },
    {
      tip: 'Add certifications if you have them',
      detail:
        'Extra credentials (EMDR, DBT, CBT, etc.) increase your credibility and help admins verify your expertise faster.',
    },
    {
      tip: 'Use a professional profile photo',
      detail:
        'A clear headshot with a neutral background builds trust with supervisees and shows you take the platform seriously.',
    },
  ]

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">Tips for Faster Approval</CardTitle>
        <p className="text-sm text-muted-foreground">
          Profiles that follow these tips are approved significantly faster.
        </p>
      </CardHeader>
      <CardContent className="pt-5">
        <ol className="space-y-4">
          {tips.map(({ tip, detail }, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{tip}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function NeedHelp() {
  const items: { icon: React.ElementType; label: string; sub: string; href: string }[] = [
    {
      icon: BookOpen,
      label: 'Read the FAQ',
      sub: 'Browse common questions',
      href: '/faq',
    },
    {
      icon: MessageCircle,
      label: 'Contact Us',
      sub: 'Send us a message and we will get back to you',
      href: '/contact-us',
    },
  ]

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">Still Have Questions?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Our support team is happy to help with any verification questions.
        </p>
      </CardHeader>
      <CardContent className="divide-y pt-0">
        {items.map(({ icon: Icon, label, sub, href }) => (
          <Link key={label} href={href} className="block">
            <span className="flex w-full items-center justify-between py-4 text-sm transition-colors hover:text-foreground">
              <span className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </span>
                <span className="text-left">
                  <span className="block font-medium text-foreground">{label}</span>
                  <span className="block text-xs text-muted-foreground">{sub}</span>
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function VerificationGuide() {
  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <WhatIsVerification />
          <ProfileFieldsRequired />
          <TipsForFasterApproval />
          <IfRejected />
        </div>

        <div className="space-y-6">
          <RequiredDocuments />
          <ReviewTimeline />
          <NeedHelp />
        </div>
      </div>

      {/* Back to dashboard */}
      <div className="flex justify-start">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
