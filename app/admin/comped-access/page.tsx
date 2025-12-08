import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { CompedAccessManager } from "@/components/admin/comped-access/comped-access-manager"

export default async function CompedAccessPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/admin")
  }

  const adminClient = createAdminClient()

  // Fetch active comped access grants
  const { data: compedAccess, error } = await adminClient
    .from("comped_access")
    .select(`
      *,
      user:auth.users!comped_access_user_id_fkey(id, email),
      granted_by_user:auth.users!comped_access_granted_by_fkey(id, email)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Get stats
  const { count: activeCount } = await adminClient
    .from("comped_access")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: permanentCount } = await adminClient
    .from("comped_access")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .is("expires_at", null)

  const { count: expiringCount } = await adminClient
    .from("comped_access")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .not("expires_at", "is", null)
    .lte("expires_at", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Comped Access</h1>
        <p className="mt-1 text-gray-500">Grant and manage free premium access for users</p>
      </div>

      <CompedAccessManager
        initialCompedAccess={compedAccess || []}
        stats={{
          active: activeCount || 0,
          permanent: permanentCount || 0,
          expiringSoon: expiringCount || 0,
        }}
        currentUserId={user.id}
      />
    </div>
  )
}
