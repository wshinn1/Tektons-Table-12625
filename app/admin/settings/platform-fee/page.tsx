import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlatformFeeForm } from '@/components/admin/platform-fee-form'
import { FeeHistoryTable } from '@/components/admin/fee-history-table'

export default async function PlatformFeePage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  // Check if user is super admin
  const { data: isAdmin } = await supabase
    .from('super_admins')
    .select('id')
    .eq('id', user.id)
    .single()
    
  if (!isAdmin) redirect('/dashboard')
  
  // Get current platform fee
  const { data: currentFee } = await supabase
    .from('platform_fee_config')
    .select('*')
    .order('effective_date', { ascending: false })
    .limit(1)
    .single()
    
  // Get fee history
  const { data: feeHistory } = await supabase
    .from('platform_fee_audit')
    .select('*, changed_by_admin:super_admins!platform_fee_audit_changed_by_fkey(name)')
    .order('changed_at', { ascending: false })
    .limit(10)
    
  // Get active tenant count
  const { count: tenantCount } = await supabase
    .from('tenants')
    .select('*', { count: 'only', head: true })
    .eq('is_active', true)
  
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Fee Management</h1>
        <p className="text-muted-foreground">Adjust the base platform fee percentage</p>
      </div>
      
      <PlatformFeeForm 
        currentFee={currentFee?.base_fee_percentage || 3.50}
        effectiveDate={currentFee?.effective_date}
        tenantCount={tenantCount || 0}
      />
      
      <FeeHistoryTable history={feeHistory || []} />
    </div>
  )
}
