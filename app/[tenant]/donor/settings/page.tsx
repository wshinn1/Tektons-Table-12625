import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailPreferences } from "@/components/supporter/email-preferences"

export default async function DonorSettingsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${tenantSlug}/auth/donor-login?redirect=/${tenantSlug}/donor/settings`)
  }

  // Get tenant info
  const { data: tenant } = await supabase.from("tenants").select("id, full_name").eq("subdomain", tenantSlug).single()

  if (!tenant) {
    redirect(`/${tenantSlug}`)
  }

  // Get supporter record
  const { data: supporter } = await supabase
    .from("supporters")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences for {tenant.full_name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose how you receive updates from this ministry</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailPreferences email={user.email || ""} currentPreference={supporter?.email_notifications ?? true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your donor profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          {supporter?.full_name && (
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{supporter.full_name}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
