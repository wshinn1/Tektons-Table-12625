import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CategoryManager } from '@/components/dashboard/category-manager'

export default async function CategoriesPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!tenant) redirect('/onboarding')

  // Get categories with post counts
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      *,
      posts:posts(count)
    `)
    .eq('tenant_id', tenant.id)
    .order('display_order')

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <p className="text-muted-foreground mt-2">
          Organize your content with custom categories
        </p>
      </div>
      <CategoryManager tenantId={tenant.id} categories={categories || []} />
    </div>
  )
}
