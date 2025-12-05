import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { BackupSettingsForm } from "@/components/admin/backup-settings-form"

export default async function BackupSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/admin-login")
  }

  const isAdmin = await isSuperAdmin(user.id)
  if (!isAdmin) {
    redirect("/")
  }

  // Get current backup settings
  const { data: settings } = await supabase
    .from("system_settings")
    .select("*")
    .eq("setting_key", "backup_email_recipients")
    .single()

  const currentEmails = settings?.setting_value?.emails || ["weshinn@gmail.com"]

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Backup Email Settings</h1>
        <p className="text-muted-foreground mb-8">
          Configure who receives automated backup notifications. Backups run daily at midnight and noon EST.
        </p>

        <BackupSettingsForm currentEmails={currentEmails} />

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Backup Schedule</h3>
          <ul className="space-y-1 text-sm">
            <li>• Midnight (12:00 AM EST) - Daily full backup</li>
            <li>• Noon (12:00 PM EST) - Daily full backup</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            All email addresses listed above will receive notification emails when backups complete or fail.
          </p>
        </div>
      </div>
    </div>
  )
}
