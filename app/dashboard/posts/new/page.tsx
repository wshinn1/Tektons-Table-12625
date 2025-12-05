import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PostEditor } from '@/components/dashboard/post-editor'

export default async function NewPostPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tenant) redirect('/onboarding')

  // Get categories and topics
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('name')

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('name')

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <PostEditor 
        tenantId={tenant.id}
        categories={categories || []}
        topics={topics || []}
      />
    </div>
  )
}
