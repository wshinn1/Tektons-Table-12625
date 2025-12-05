import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye, Settings } from 'lucide-react'
import { DemoSiteEditor } from '@/components/admin/demo-site-editor'

export default async function AdminDemoSitePage() {
  const supabase = await createServerClient()

  // Check if user is super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: isSuperAdmin } = await supabase
    .from('super_admins')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!isSuperAdmin) redirect('/dashboard')

  // Fetch all demo configuration
  const { data: configs } = await supabase
    .from('demo_site_config')
    .select('*')
    .order('section')

  const { data: posts } = await supabase
    .from('demo_posts')
    .select('*')
    .order('display_order')

  const { data: campaigns } = await supabase
    .from('demo_campaigns')
    .select('*')
    .order('display_order')

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Demo Site Management</h1>
          <p className="text-muted-foreground">
            Customize the example missionary page that visitors see
          </p>
        </div>
        <Button asChild>
          <Link href="/example" target="_blank" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview Demo Site
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <DemoSiteEditor section="profile" initialData={configs?.find(c => c.section === 'profile')} />
        </TabsContent>

        <TabsContent value="statistics">
          <DemoSiteEditor section="statistics" initialData={configs?.find(c => c.section === 'statistics')} />
        </TabsContent>

        <TabsContent value="video">
          <DemoSiteEditor section="video" initialData={configs?.find(c => c.section === 'video')} />
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Demo Posts</CardTitle>
              <CardDescription>Manage example blog posts shown on the demo site</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {posts?.length || 0} posts configured
              </p>
              <Button variant="outline">Manage Posts</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Demo Campaigns</CardTitle>
              <CardDescription>Manage example fundraising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {campaigns?.length || 0} campaigns configured
              </p>
              <Button variant="outline">Manage Campaigns</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
