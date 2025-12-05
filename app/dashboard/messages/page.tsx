import { createServerClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/tenant-context'
import { redirect } from 'next/navigation'
import { MessagesList } from '@/components/dashboard/messages-list'

export default async function MessagesPage() {
  const supabase = await createServerClient()
  const tenant = await getCurrentTenant(supabase)

  if (!tenant) {
    redirect('/auth/signin')
  }

  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  const unreadCount = messages?.filter(m => m.status === 'unread').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-2">
          View and respond to contact form submissions
          {unreadCount > 0 && (
            <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      <MessagesList messages={messages || []} />
    </div>
  )
}
