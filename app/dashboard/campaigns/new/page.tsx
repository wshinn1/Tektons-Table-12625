import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CampaignForm from '@/components/campaigns/campaign-form'

export default async function NewCampaignPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Campaign</h1>
        <p className="text-muted-foreground">Set up a fundraising campaign for your mission</p>
      </div>

      <CampaignForm />
    </div>
  )
}
