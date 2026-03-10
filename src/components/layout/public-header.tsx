'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
]

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Image src="/logo.png" alt="Find A Supervisor" width={120} height={32} className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ label, href }) => (
            <a key={href} href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className={buttonVariants({ size: 'sm' })}>
            Book a Demo
          </Link>
          <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Sign Up
          </Link>
        </div>

        <button
          className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn('overflow-hidden border-t transition-all duration-200 md:hidden', mobileOpen ? 'max-h-96' : 'max-h-0')}>
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t pt-3">
            <Link href="/login" onClick={() => setMobileOpen(false)} className={buttonVariants({ size: 'sm' })}>
              Book a Demo
            </Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Sign Up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
