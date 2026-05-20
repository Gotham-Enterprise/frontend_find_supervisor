import { AuthPageFooter } from '@/components/Layout/auth-page-footer'
import { PublicHeader } from '@/components/Layout/public-header'

import { ContactUsPage } from './index'

export function PublicContactUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-hero-bg">
      <PublicHeader />

      <main className="flex flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-5xl">
          <ContactUsPage />
        </div>
      </main>

      <AuthPageFooter />
    </div>
  )
}
