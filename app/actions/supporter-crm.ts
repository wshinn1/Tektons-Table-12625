'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSupporterNote({
  supporterId,
  tenantId,
  note
}: {
  supporterId: string
  tenantId: string
  note: string
}) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('supporter_notes')
    .insert({
      supporter_id: supporterId,
      tenant_id: tenantId,
      note,
      created_by: user.id
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/supporters/${supporterId}`)
  return { success: true }
}
