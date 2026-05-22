import { SignupPage } from '@/components/Signup/SignupPage'
import { noIndexMetadata } from '@/lib/seo/config'

export const metadata = {
  title: 'Create Account',
  description: 'Create your free Find A Supervisor account.',
  ...noIndexMetadata,
}

export default function Page() {
  return <SignupPage />
}
