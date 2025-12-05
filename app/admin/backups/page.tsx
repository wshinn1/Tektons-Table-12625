import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { CreateBackupSection } from "@/components/admin/backups/create-backup-section"
import { RestoreBackupSection } from "@/components/admin/backups/restore-backup-section"
import { AutomatedBackupsList } from "@/components/admin/backups/automated-backups-list"

export default async function BackupsPage() {
  console.log("[v0] Backup page: Starting load")

  const supabase = await createServerClient()
  console.log("[v0] Backup page: Created Supabase client")

  // Check if user is super admin
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("[v0] Backup page: Got user", {
    userId: user?.id,
    userEmail: user?.email,
    hasError: !!userError,
    errorMessage: userError?.message,
  })

  if (!user) {
    console.log("[v0] Backup page: No user found, redirecting to admin login")
    redirect("/auth/admin-login")
  }

  const isAdmin = await isSuperAdmin(user.id)
  console.log("[v0] Backup page: Super admin check result:", isAdmin)

  if (!isAdmin) {
    console.log("[v0] Backup page: User is not super admin, redirecting to admin login")
    redirect("/auth/admin-login")
  }

  console.log("[v0] Backup page: Auth checks passed, fetching backups")

  const {
    data: backups,
    count,
    error: backupsError,
  } = await supabase
    .from("backups")
    .select("*, tenants(full_name, subdomain)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, 49) // First 50 backups

  console.log("[v0] Backup page: Fetched backups", {
    backupsCount: backups?.length,
    totalCount: count,
    hasError: !!backupsError,
    errorMessage: backupsError?.message,
  })

  console.log("[v0] Backup page: Rendering page")

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Backup Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CreateBackupSection />
        <RestoreBackupSection />
      </div>

      <AutomatedBackupsList backups={backups || []} totalCount={count || 0} />
    </div>
  )
}
