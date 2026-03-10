import { PublicFooter } from '@/components/Layout/public-footer'
import { PublicHeader } from '@/components/Layout/public-header'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
