import { MessageSquareOff } from 'lucide-react'

interface ChatEmptyStateProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function ChatEmptyState({ title, description, action }: ChatEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessageSquareOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
