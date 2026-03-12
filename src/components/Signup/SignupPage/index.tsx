import { PublicHeader } from '@/components/Layout/public-header'
import { SignupCard } from '@/components/Signup/SignupCard'
import { SignupHeader } from '@/components/Signup/SignupHeader'

export function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-hero-bg">
      <PublicHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-2xl">
          <SignupHeader />
          <SignupCard />
        </div>
      </main>

      <footer className="border-t border-border py-5 text-center">
        <nav className="flex items-center justify-center gap-6">
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Contact Us', href: '/contact' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  )
}
