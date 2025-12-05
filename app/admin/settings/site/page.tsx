import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import Link from "next/link"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { getSiteMetadata } from "@/app/actions/site-settings"

export default async function SiteSettingsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  const metadata = await getSiteMetadata()

  if (!metadata) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/admin/settings" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Settings
            </Link>
            <h1 className="text-2xl font-bold mt-2">Site Settings</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">No site metadata found. Please run the migration script.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/settings" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Settings
          </Link>
          <h1 className="text-2xl font-bold mt-2">Site Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage site-wide title, favicon, and social sharing settings for tektonstable.com
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <SiteSettingsForm initialMetadata={metadata} />
      </div>
    </div>
  )
}
