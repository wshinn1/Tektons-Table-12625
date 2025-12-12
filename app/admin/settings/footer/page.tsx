import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FooterSettingsForm } from "@/components/admin/footer-settings-form"
import { getFooterSettings } from "@/app/actions/footer-settings"

export default async function FooterSettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Check if user is super admin
  const { data: isAdmin } = await supabase.from("super_admins").select("id").eq("user_id", user.id).single()

  if (!isAdmin) redirect("/dashboard")

  // Get current footer settings
  const footerSettings = await getFooterSettings()

  if (!footerSettings) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Footer Settings</CardTitle>
            <CardDescription>No footer settings found. Please run the database migration.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Footer Settings</h1>
        <p className="text-muted-foreground">Manage your platform footer content and navigation</p>
      </div>

      <FooterSettingsForm settings={footerSettings} />
    </div>
  )
}
