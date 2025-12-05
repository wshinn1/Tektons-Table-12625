import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { StripeSetupFlow } from '@/components/stripe/setup-flow'

export default async function StripeSetupPage() {
  const supabase = await createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get tenant record
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (tenantError || !tenant) {
    redirect('/onboarding')
  }

  // If already completed, redirect to dashboard
  if (tenant.stripe_onboarding_completed) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <StripeSetupFlow tenant={tenant} />
    </div>
  )
}
