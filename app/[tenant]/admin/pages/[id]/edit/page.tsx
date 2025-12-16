import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { PuckPageEditor } from '@/components/tenant/puck-page-editor'
import { createServerClient } from '@/lib/supabase/server'

export default async function EditCustomPagePage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant, id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${tenant}/admin/login`)
  }

  // Check if user is an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect(`/${tenant}`)
  }

  // Fetch the existing page data
  const { data: page, error } = await supabase
    .from('custom_pages')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenant)
    .single()

  if (error || !page) {
    redirect(`/${tenant}/admin/pages`)
  }

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <PuckPageEditor tenant={tenant} pageId={id} initialData={page.content} />
    </Suspense>
  )
}
