import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageMetadataManager } from "@/components/admin/page-metadata-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAllPageMetadata } from "@/app/actions/page-metadata"

async function checkSuperAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: tenant } = await supabase.from("tenants").select("is_super_admin").eq("id", user.id).single()

  if (!tenant?.is_super_admin) {
    redirect("/dashboard")
  }

  return user
}

export default async function PageMetadataSettingsPage() {
  await checkSuperAdmin()

  let pages
  try {
    pages = await getAllPageMetadata()
  } catch (error) {
    console.error("Failed to load page metadata:", error)
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Database Migration Required
            </CardTitle>
            <CardDescription>
              The page_metadata table hasn't been created yet. Please run the migration script.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to run <code className="bg-muted px-2 py-1 rounded">scripts/048_page_metadata.sql</code> to
              enable per-page metadata management.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/settings">Back to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="w-8 h-8 text-accent" />
              Page Metadata Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage social sharing and SEO metadata for each page. Set global defaults in{" "}
              <Link href="/admin/settings/site" className="text-accent hover:underline">
                Site Settings
              </Link>
              .
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/settings">Back to Settings</Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6 bg-accent/5 border-accent/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-accent mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Global vs. Per-Page Settings</h3>
              <p className="text-sm text-muted-foreground">
                Each page can either use <strong>global defaults</strong> (from Site Settings) or have{" "}
                <strong>custom metadata</strong>. Toggle "Use Global Defaults" to switch between modes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PageMetadataManager pages={pages} />
    </div>
  )
}
