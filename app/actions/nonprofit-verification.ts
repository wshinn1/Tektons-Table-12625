'use server'

import { createServerClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function verifyNonprofit(tenantId: string, notes: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin(user.id))) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update tenant status
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        nonprofit_verification_status: 'verified',
        nonprofit_verified_at: new Date().toISOString()
      })
      .eq('id', tenantId)

    if (updateError) throw updateError

    // Create audit record
    await supabase
      .from('nonprofit_verification_audit')
      .insert({
        tenant_id: tenantId,
        status: 'verified',
        notes: notes,
        verified_by: user.id
      })

    revalidatePath('/admin/nonprofit-verification')
    revalidatePath('/admin/tenants')

    return { success: true }
  } catch (error) {
    console.error('Error verifying nonprofit:', error)
    return { success: false, error: 'Failed to verify nonprofit status' }
  }
}

export async function rejectNonprofit(tenantId: string, notes: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin(user.id))) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update tenant status
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        nonprofit_verification_status: 'rejected',
        is_nonprofit: false
      })
      .eq('id', tenantId)

    if (updateError) throw updateError

    // Create audit record
    await supabase
      .from('nonprofit_verification_audit')
      .insert({
        tenant_id: tenantId,
        status: 'rejected',
        notes: notes,
        verified_by: user.id
      })

    revalidatePath('/admin/nonprofit-verification')
    revalidatePath('/admin/tenants')

    return { success: true }
  } catch (error) {
    console.error('Error rejecting nonprofit:', error)
    return { success: false, error: 'Failed to reject nonprofit status' }
  }
}
