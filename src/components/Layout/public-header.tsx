'use client'

import { ChevronDown, ExternalLink, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const homeLink = { label: 'Home', href: '/' }

/** Public directories, grouped under the "Browse" menu. */
const browseLinks = [
  {
    label: 'Supervisors',
    href: '/supervisors',
    description: 'Licensed Supervisors, Collaborating & Supervising Physicians',
  },
  {
    label: 'Medical Directors',
    href: '/medical-directors',
    description: 'MDs and DOs for med spas, clinics, and practices',
  },
  {
    label: 'Supervisees',
    href: '/browse-supervisees',
    description: 'Professionals looking for a Supervisor',
  },
]

const sectionLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'FAQ', href: '/#faq' },
]

const navLinkClass =
  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'

function isBrowsePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Re-selecting the directory you're already on (e.g. to drop its filters)
 * starts from the top. Without this, browser scroll anchoring keeps the old
 * offset while the page re-renders, tucking the heading under the sticky bars.
 */
function scrollToTopIfCurrent(pathname: string, href: string) {
  if (pathname === href) window.scrollTo({ top: 0 })
}

/**
 * Desktop "Browse" disclosure menu. The links are always server-rendered into
 * the HTML (only visually hidden while closed) so crawlers still see the
 * header's internal links to every directory — a Radix dropdown would only
 * mount them once opened. Opens on hover or click; Escape and outside clicks
 * close it.
 */
function BrowseMenu() {
  const pathname = usePathname() ?? ''
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  // A click right after hover-open (or a touch tap, which emulates mouseenter
  // first) should keep the menu open instead of toggling it shut.
  const openedByHoverRef = useRef(false)
  const isActive = browseLinks.some(({ href }) => isBrowsePath(pathname, href))

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        if (open) return
        openedByHoverRef.current = true
        setOpen(true)
      }}
      onMouseLeave={() => {
        openedByHoverRef.current = false
        setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false)
          buttonRef.current?.focus()
        }
      }}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="browse-menu"
        onClick={() => {
          if (open && openedByHoverRef.current) {
            openedByHoverRef.current = false
            return
          }
          setOpen((prev) => !prev)
        }}
        className={cn(
          'flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground',
          isActive || open ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        Browse
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {/* pt-2 bridges the gap below the trigger so hover isn't lost on the way down */}
      <div
        id="browse-menu"
        className={cn(
          'absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-2 transition-all duration-150',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <ul className="rounded-xl border bg-popover p-2 shadow-lg">
          {browseLinks.map(({ label, href, description }) => {
            const current = isBrowsePath(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => {
                    setOpen(false)
                    scrollToTopIfCurrent(pathname, href)
                  }}
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-3 py-2 transition-colors hover:bg-accent',
                    current && 'bg-accent',
                  )}
                >
                  <span className="block text-sm font-medium text-foreground">Browse {label}</span>
                  <span className="block text-xs text-muted-foreground">{description}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export function PublicHeader() {
  const pathname = usePathname() ?? ''
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="https://www.gothamenterprisesltd.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <Image
            src="/logo.png"
            alt="Gotham Enterprises LTD"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href={homeLink.href} className={navLinkClass}>
            {homeLink.label}
          </Link>
          <BrowseMenu />
          {sectionLinks.map(({ label, href }) => (
            <Link key={href} href={href} className={navLinkClass}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Log In
          </Link>
          <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
            Sign Up
          </Link>
          <a
            href="https://www.gothamenterprisesltd.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <ExternalLink className="h-4 w-4" />
            Go to Job Site
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className={buttonVariants({ size: 'sm' })}
          >
            Sign Up
          </Link>
          <button
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t transition-all duration-200 md:hidden',
          mobileOpen ? 'max-h-[36rem]' : 'max-h-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          <Link href={homeLink.href} onClick={() => setMobileOpen(false)} className={navLinkClass}>
            {homeLink.label}
          </Link>
          {/* Browse group — flat links (one tap to each directory), no nested toggle */}
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
            Browse
          </p>
          <div className="flex flex-col gap-1 border-l pl-3">
            {browseLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  setMobileOpen(false)
                  scrollToTopIfCurrent(pathname, href)
                }}
                className={navLinkClass}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {sectionLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={navLinkClass}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-2 border-t pt-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Log In
            </Link>
            <a
              href="https://www.gothamenterprisesltd.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <ExternalLink className="h-4 w-4" />
              Go to Job Site
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
