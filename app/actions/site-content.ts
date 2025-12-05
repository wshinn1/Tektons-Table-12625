'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSiteContent(
  sectionId: string,
  content: any,
  isActive?: boolean
) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is super admin
    const { data: superAdmin } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!superAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const updateData: any = {
      content,
      updated_by: user.id
    }

    if (isActive !== undefined) {
      updateData.is_active = isActive
    }

    const { error } = await supabase
      .from('site_content')
      .update(updateData)
      .eq('id', sectionId)

    if (error) {
      console.error('Error updating site content:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error in updateSiteContent:', error)
    return { success: false, error: 'Failed to update content' }
  }
}
