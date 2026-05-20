'use client'

import { AppShellChrome } from '@/components/Layout/app-shell-chrome'
import { useOptionalSession } from '@/lib/hooks/useOptionalSession'

import { ContactUsPage } from './index'
import { PublicContactUsPage } from './PublicContactUsPage'

function ContactUsLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero-bg px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#006D36] border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

export function ContactUsEntry() {
  const session = useOptionalSession()

  if (session === 'loading') {
    return <ContactUsLoading />
  }

  if (session === 'authenticated') {
    return (
      <AppShellChrome>
        <ContactUsPage />
      </AppShellChrome>
    )
  }

  return <PublicContactUsPage />
}
