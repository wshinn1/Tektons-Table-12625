'use server'

import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createStripeConnectAccount() {
  const supabase = await createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get tenant record
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (tenantError || !tenant) {
    throw new Error('Tenant not found')
  }

  // Check if already has Stripe account
  if (tenant.stripe_account_id) {
    return { accountId: tenant.stripe_account_id }
  }

  // Create Stripe Connect account
  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    business_profile: {
      name: tenant.full_name,
      url: `https://${tenant.subdomain}.tektonstable.com`,
      product_description: 'Missionary fundraising and supporter management',
    },
  })

  // Save account ID to database
  await supabase
    .from('tenants')
    .update({ 
      stripe_account_id: account.id,
      stripe_account_status: 'pending',
    })
    .eq('id', tenant.id)

  return { accountId: account.id }
}

export async function createStripeOnboardingLink() {
  const supabase = await createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get tenant record
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (tenantError || !tenant || !tenant.stripe_account_id) {
    throw new Error('Stripe account not found')
  }

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: tenant.stripe_account_id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/stripe/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/stripe/return`,
    type: 'account_onboarding',
  })

  return { url: accountLink.url }
}

export async function refreshStripeAccountStatus() {
  const supabase = await createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get tenant record
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (tenantError || !tenant || !tenant.stripe_account_id) {
    throw new Error('Stripe account not found')
  }

  // Fetch account status from Stripe
  const account = await stripe.accounts.retrieve(tenant.stripe_account_id)

  // Update database
  await supabase
    .from('tenants')
    .update({
      stripe_charges_enabled: account.charges_enabled,
      stripe_payouts_enabled: account.payouts_enabled,
      stripe_onboarding_completed: account.details_submitted,
      stripe_account_status: account.details_submitted ? 'active' : 'pending',
    })
    .eq('id', tenant.id)

  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    onboardingCompleted: account.details_submitted,
  }
}
