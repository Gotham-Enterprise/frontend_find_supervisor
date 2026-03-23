import Link from 'next/link'

const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Us', href: '/contact' },
] as const

export function AuthPageFooter() {
  return (
    <footer className="flex min-h-14 items-center justify-between border-t border-border bg-card px-6 py-3 sm:px-10">
      <p className="text-xs text-muted-foreground">
        ©{new Date().getFullYear()} All Rights Reserved. Find A Supervisor is a registered
        trademark.
      </p>

      <nav className="flex items-center gap-5">
        {footerLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
