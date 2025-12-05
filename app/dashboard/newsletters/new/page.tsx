import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewsletterEditor from '@/components/newsletters/newsletter-editor'

export default async function NewNewsletterPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Create Newsletter</h1>
      <NewsletterEditor />
    </div>
  )
}
