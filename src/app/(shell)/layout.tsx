import { ShellLayout } from '@/components/layout/shell-layout'

export default function ProtectedShellLayout({ children }: { children: React.ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>
}
