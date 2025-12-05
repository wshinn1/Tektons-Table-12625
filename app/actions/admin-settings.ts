'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePlatformFee({
  newFeePercentage,
  applyToExisting,
  reason
}: {
  newFeePercentage: number
  applyToExisting: boolean
  reason: string
}) {
  const supabase = await createServerClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  // Check if super admin
  const { data: isAdmin } = await supabase
    .from('super_admins')
    .select('id')
    .eq('id', user.id)
    .single()
    
  if (!isAdmin) return { success: false, error: 'Not authorized' }
  
  // Validate fee
  if (newFeePercentage < 0.5 || newFeePercentage > 10) {
    return { success: false, error: 'Fee must be between 0.5% and 10%' }
  }
  
  // Get current fee
  const { data: currentFee } = await supabase
    .from('platform_fee_config')
    .select('base_fee_percentage')
    .order('effective_date', { ascending: false })
    .limit(1)
    .single()
    
  const oldFee = currentFee?.base_fee_percentage || 3.50
  
  // Get affected tenant count
  let affectedCount = 0
  if (applyToExisting) {
    const { count } = await supabase
      .from('tenants')
      .select('*', { count: 'only', head: true })
      .eq('is_active', true)
    affectedCount = count || 0
  }
  
  // Insert new fee config
  const { error: configError } = await supabase
    .from('platform_fee_config')
    .insert({
      base_fee_percentage: newFeePercentage,
      effective_date: new Date().toISOString(),
      created_by: user.id,
      notes: reason
    })
    
  if (configError) {
    return { success: false, error: 'Failed to update fee config' }
  }
  
  // Insert audit record
  const { error: auditError } = await supabase
    .from('platform_fee_audit')
    .insert({
      old_fee: oldFee,
      new_fee: newFeePercentage,
      changed_by: user.id,
      reason,
      affected_tenants_count: affectedCount
    })
    
  if (auditError) {
    console.error('Failed to create audit log:', auditError)
  }
  
  // If applying to existing tenants, update their pricing records
  if (applyToExisting) {
    // Update all active tenants' pricing
    const { error: updateError } = await supabase
      .from('tenant_pricing')
      .update({ 
        platform_fee_percentage: newFeePercentage,
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true)
      
    if (updateError) {
      console.error('Failed to update tenant pricing:', updateError)
    }
  }
  
  revalidatePath('/admin/settings/platform-fee')
  return { success: true }
}

export async function toggleReferralProgram(enabled: boolean, reason: string) {
  const supabase = await createServerClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  // Check if super admin
  const { data: isAdmin } = await supabase
    .from('super_admins')
    .select('id')
    .eq('id', user.id)
    .single()
    
  if (!isAdmin) return { success: false, error: 'Not authorized' }
  
  // Update referral program settings
  const { error } = await supabase
    .from('referral_program_settings')
    .update({
      is_enabled: enabled,
      disabled_at: enabled ? null : new Date().toISOString(),
      disabled_by: enabled ? null : user.id,
      reason: enabled ? null : reason
    })
    .eq('id', (await supabase.from('referral_program_settings').select('id').single()).data?.id)
    
  if (error) {
    return { success: false, error: 'Failed to toggle referral program' }
  }
  
  // Update system settings
  await supabase
    .from('system_settings')
    .update({
      setting_value: { enabled },
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('setting_key', 'referral_program_enabled')
  
  revalidatePath('/admin/settings')
  return { success: true }
}
