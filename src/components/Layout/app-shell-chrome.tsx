import { DashboardTopbar } from './dashboard-topbar'
import { Sidebar } from './sidebar'

interface AppShellChromeProps {
  children: React.ReactNode
}

/**
 * Authenticated app chrome (sidebar + topbar) without enforcing login.
 * Used when a page is public but should match the dashboard layout for signed-in users.
 */
export function AppShellChrome({ children }: AppShellChromeProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background-subtle">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
