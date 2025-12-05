'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDemoSiteContent(
  section: string,
  content: any,
  isActive: boolean
) {
  const supabase = await createServerClient()

  // Check if user is super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: isSuperAdmin } = await supabase
    .from('super_admins')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!isSuperAdmin) {
    return { error: 'Not authorized' }
  }

  // Upsert the content
  const { error } = await supabase
    .from('demo_site_config')
    .upsert({
      section,
      content,
      is_active: isActive,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'section'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/example')
  revalidatePath('/admin/demo-site')
  
  return { success: true }
}
