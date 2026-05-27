import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/chat/ChatWindow'
import type { ServiceRequest, User } from '@/types'

interface Props {
  params: Promise<{ requestId: string }>
}

export const metadata: Metadata = { title: 'Chat' }

export default async function ChatPage({ params }: Props) {
  const { requestId } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: request } = await supabase
    .from('service_requests')
    .select(`
      id, status, description, created_at,
      user_id, provider_id,
      user:users!service_requests_user_id_fkey(id, name, avatar_url, email, role, created_at),
      provider:provider_profiles!service_requests_provider_id_fkey(
        user:users(id, name, avatar_url, email, role, created_at)
      ),
      category:categories(name, icon)
    `)
    .eq('id', requestId)
    .single()

  if (!request) notFound()

  const isUser = request.user_id === authUser.id
  const providerUser = (request.provider as unknown as { user: User } | null)?.user
  const requestUser = request.user as unknown as User | null

  if (!isUser && providerUser?.id !== authUser.id) redirect('/home')

  const currentUser = isUser ? requestUser! : providerUser!
  const otherUser = isUser ? providerUser! : requestUser!

  if (!currentUser || !otherUser) notFound()

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatWindow
        request={request as unknown as ServiceRequest}
        currentUser={currentUser}
        otherUser={otherUser}
        isProvider={!isUser}
      />
    </div>
  )
}
