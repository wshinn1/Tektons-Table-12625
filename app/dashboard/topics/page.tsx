import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopicManager } from '@/components/dashboard/topic-manager'

export default async function TopicsPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!tenant) redirect('/onboarding')

  // Get topics with post counts
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('post_count', { ascending: false })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Topics</h1>
        <p className="text-muted-foreground mt-2">
          Tag and organize your posts with topics
        </p>
      </div>
      <TopicManager tenantId={tenant.id} topics={topics || []} />
    </div>
  )
}
