import { PublicFooter } from '@/components/Layout/public-footer'
import { PublicHeader } from '@/components/Layout/public-header'

/**
 * Layout for the public /browse-supervisees page.
 * Uses the same public header/footer as the landing page.
 * No auth required — this page is fully public and indexable.
 */
export default function BrowseSuperviseesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
