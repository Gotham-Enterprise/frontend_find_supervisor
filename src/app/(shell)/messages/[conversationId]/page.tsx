import { MessagesPage } from '@/components/Chat'

interface MessagesThreadRouteProps {
  params: Promise<{ conversationId: string }>
}

export async function generateMetadata() {
  return {
    title: 'Messages | Find A Supervisor',
    description: 'View and manage your supervision conversations.',
  }
}

export default async function MessagesThreadRoute({ params }: MessagesThreadRouteProps) {
  const { conversationId } = await params
  return <MessagesPage conversationId={conversationId} />
}
