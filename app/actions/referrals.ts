'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function validateReferralCode(code: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('referral_codes')
    .select('id, tenant_id, tenants(full_name, email)')
    .eq('code', code)
    .single()
  
  if (error || !data) {
    return { valid: false, referrer: null }
  }
  
  return {
    valid: true,
    referrer: {
      id: data.tenant_id,
      name: data.tenants?.full_name,
      email: data.tenants?.email
    }
  }
}

export async function createReferral(referralCode: string, refereeTenantId: string) {
  const supabase = await createServerClient()
  
  // Validate referral code and get referrer
  const { data: referralCodeData } = await supabase
    .from('referral_codes')
    .select('tenant_id')
    .eq('code', referralCode)
    .single()
  
  if (!referralCodeData) {
    return { success: false, error: 'Invalid referral code' }
  }
  
  // Create referral record
  const { error } = await supabase
    .from('referrals')
    .insert({
      referrer_tenant_id: referralCodeData.tenant_id,
      referee_tenant_id: refereeTenantId,
      referral_code: referralCode,
      status: 'pending'
    })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  // Increment times_used on referral code
  await supabase
    .from('referral_codes')
    .update({ times_used: supabase.rpc('increment', { row_id: referralCodeData.tenant_id }) })
    .eq('tenant_id', referralCodeData.tenant_id)
  
  // TODO: Send email notification to referrer
  
  return { success: true }
}

export async function getReferralStats(tenantId: string) {
  const supabase = await createServerClient()
  
  const { data: pricing } = await supabase
    .from('tenant_pricing')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()
  
  const { data: referrals } = await supabase
    .from('referrals')
    .select('*, referee:referee_tenant_id(full_name, email)')
    .eq('referrer_tenant_id', tenantId)
  
  const completedCount = referrals?.filter(r => r.status === 'completed').length || 0
  const pendingCount = referrals?.filter(r => r.status === 'pending').length || 0
  
  return {
    currentRate: pricing?.current_rate_percentage || 3.50,
    currentTier: pricing?.rate_tier || 'standard',
    completedReferrals: completedCount,
    pendingReferrals: pendingCount,
    discountedUntil: pricing?.discounted_until,
    referrals: referrals || []
  }
}
