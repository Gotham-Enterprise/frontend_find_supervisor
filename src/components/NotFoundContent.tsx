import { SearchX } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface NotFoundContentProps {
  /** Optional contextual action next to "Back to Home" (e.g. a browse link for the segment). */
  secondaryLink?: { href: string; label: string }
  /**
   * Renders the minimal logo header + full-height page chrome. Turn off inside
   * segments whose layout already provides a header (e.g. /supervisors).
   */
  standalone?: boolean
}

/**
 * Shared branded 404 body. Server-component-safe on purpose (no client-module
 * imports like buttonVariants) so not-found boundaries can render it.
 */
export function NotFoundContent({ secondaryLink, standalone = true }: NotFoundContentProps) {
  const body = (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <SearchX className="size-8 text-primary" aria-hidden />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The page you are looking for doesn&apos;t exist or may have moved. Check the address, or
          head back to one of the pages below.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Home
          </Link>
          {secondaryLink && (
            <Link
              href={secondaryLink.href}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {secondaryLink.label}
            </Link>
          )}
        </div>
      </div>
    </main>
  )

  if (!standalone) return body

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Image
              src="/logo.png"
              alt="Gotham Enterprises LTD"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </header>
      {body}
    </div>
  )
}
