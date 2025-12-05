import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SiteContentEditor from '@/components/admin/site-content-editor'

export default async function SiteContentPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is super admin
  const { data: superAdmin } = await supabase
    .from('super_admins')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!superAdmin) {
    redirect('/dashboard')
  }

  // Fetch all site content
  const { data: siteContent } = await supabase
    .from('site_content')
    .select('*')
    .order('section')

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Landing Page Content Editor</h1>
          <p className="text-muted-foreground mt-2">
            Edit all sections of the landing page. Changes are applied immediately.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <SiteContentEditor initialContent={siteContent || []} />
      </div>
    </div>
  )
}
