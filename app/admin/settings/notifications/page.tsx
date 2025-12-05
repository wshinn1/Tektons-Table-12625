import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TenantNotificationSettings } from "@/components/tenant/notification-settings"

export default async function NotificationSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, email, notification_email, notification_settings, full_name")
    .eq("id", user.id)
    .single()

  if (!tenant) {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage how you receive updates about donations and supporter activity
          </p>
        </div>

        <TenantNotificationSettings
          tenantId={tenant.id}
          primaryEmail={tenant.email}
          notificationEmail={tenant.notification_email}
          settings={tenant.notification_settings || {}}
        />
      </div>
    </div>
  )
}
