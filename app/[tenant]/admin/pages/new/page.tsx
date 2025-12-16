import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { PuckPageEditor } from '@/components/tenant/puck-page-editor'
import { createServerClient } from '@/lib/supabase/server'

export default async function NewCustomPagePage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params
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

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <PuckPageEditor tenant={tenant} />
    </Suspense>
  )
}
