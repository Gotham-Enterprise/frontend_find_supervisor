import { ShellLayout } from '@/components/Layout/shell-layout'

export default function ProtectedShellLayout({ children }: { children: React.ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>
}
