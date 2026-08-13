import { GuestOnlyPathGuard } from '@/components/Layout/GuestOnlyPathGuard'
import { PublicFooter } from '@/components/Layout/public-footer'
import { PublicHeader } from '@/components/Layout/public-header'

/**
 * Server layout for the public route group. The guest-only guard is a client
 * component, but the shell is passed through as children so the header/footer
 * remain server components (the footer fetches top-states data server-side).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestOnlyPathGuard>
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </GuestOnlyPathGuard>
  )
}
