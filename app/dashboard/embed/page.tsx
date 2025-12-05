import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmbedCodeGenerator } from '@/components/dashboard/embed-code-generator'
import { ArrowLeft, Code, Globe } from 'lucide-react'
import Link from 'next/link'

async function getTenantInfo() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tenant) redirect('/onboarding')

  return tenant
}

export default async function EmbedPage() {
  const tenant = await getTenantInfo()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">WordPress Embedding</h1>
          <p className="text-muted-foreground">
            Embed your Tektons Table fundraising page into your WordPress site
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Your Embed URL</h2>
                <p className="text-muted-foreground mb-4">
                  This is your Tektons Table fundraising page URL
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                  https://{tenant.subdomain}.tektonstable.com
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">Embed Code Generator</h2>
                <p className="text-muted-foreground mb-6">
                  Copy and paste this code into your WordPress page or post
                </p>
                <EmbedCodeGenerator subdomain={tenant.subdomain} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">How to Embed in WordPress</h3>
            <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
              <li>Log into your WordPress admin dashboard</li>
              <li>Create a new page or edit an existing one</li>
              <li>Switch to the HTML/Code editor (not Visual editor)</li>
              <li>Paste the embed code from above</li>
              <li>Publish or update your page</li>
              <li>Your Tektons Table fundraising page will appear embedded on your WordPress site</li>
            </ol>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-2">Example Use Case</h3>
            <p className="text-sm mb-2">
              If your WordPress site is <strong>johnsmith.org</strong>, you can embed your Tektons Table site at <strong>johnsmith.org/support</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Visitors see your branding, but the fundraising functionality is powered by Tektons Table.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Benefits of Embedding</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>SEO Friendly</strong> - Keep your own domain for search rankings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Brand Consistency</strong> - Matches your WordPress theme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Full Functionality</strong> - Donations, posts, campaigns all work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Easy Updates</strong> - Changes automatically sync</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>No Coding Required</strong> - Simple copy and paste</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Mobile Responsive</strong> - Auto-adjusts for all devices</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
