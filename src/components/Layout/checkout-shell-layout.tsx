'use client'

import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { useRequireAuth } from '@/lib/hooks/useRequireAuth'

interface CheckoutShellLayoutProps {
  children: React.ReactNode
}

/**
 * Authenticated full-width layout for focused flows (e.g. subscription checkout).
 * No dashboard sidebar — reduces distraction during payment.
 */
export function CheckoutShellLayout({ children }: CheckoutShellLayoutProps) {
  useRequireAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Find A Supervisor"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
