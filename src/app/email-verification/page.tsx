import { EmailVerificationPage } from '@/components/EmailVerification/EmailVerificationPage'

interface Props {
  searchParams: Promise<{
    fullName?: string
    email?: string
    role?: string
  }>
}

export const metadata = {
  title: 'Verify Your Email | Find A Supervisor',
  description: 'Please verify your email address to activate your account.',
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams

  return (
    <EmailVerificationPage
      data={{
        fullName: params.fullName ?? '',
        email: params.email ?? '',
        role: params.role ?? '',
      }}
    />
  )
}
