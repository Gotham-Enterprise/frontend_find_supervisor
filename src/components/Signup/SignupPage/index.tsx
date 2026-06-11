import { AuthPageFooter } from '@/components/Layout/auth-page-footer'
import { PublicHeader } from '@/components/Layout/public-header'
import { SignupCard } from '@/components/Signup/SignupCard'
import { SignupHeader } from '@/components/Signup/SignupHeader'
import type { SignupRole } from '@/components/Signup/types'

type SignupPageProps = {
  initialRole?: SignupRole
}

export function SignupPage({ initialRole }: SignupPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-hero-bg">
      <PublicHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-2xl">
          <SignupHeader />
          <SignupCard initialRole={initialRole} />
        </div>
      </main>

      <AuthPageFooter />
    </div>
  )
}
