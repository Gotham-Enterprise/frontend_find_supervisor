import { LoginPage } from '@/components/Login'
import { noIndexMetadata } from '@/lib/seo/config'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Find A Supervisor account.',
  ...noIndexMetadata,
}

export default function LoginRoutePage() {
  return <LoginPage />
}
