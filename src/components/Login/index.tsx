import { AuthPageFooter } from '@/components/Layout/auth-page-footer'
import { PublicHeader } from '@/components/Layout/public-header'
import { LoginForm } from '@/components/LoginForm'

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-hero-bg">
      <PublicHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Find A Supervisor
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              Match with the right supervisor for your journey.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 space-y-1 text-center sm:mb-8 sm:text-left">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Sign in
              </h2>
              <p className="text-sm text-muted-foreground">Enter your credentials to continue.</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </main>

      <AuthPageFooter />
    </div>
  )
}
