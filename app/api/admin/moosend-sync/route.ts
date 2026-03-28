import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdmin } from "@/lib/auth"
import { addTenantToMoosend, addContactToMoosend } from "@/lib/moosend"

export async function POST() {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const [tenantsRes, subscribersRes, supportersRes, followerIdsRes] = await Promise.all([
    admin.from("tenants").select("email, full_name").eq("is_active", true),
    admin.from("tenant_email_subscribers").select("email, name"),
    admin.from("tenant_financial_supporters").select("email, name"),
    admin.from("tenant_followers").select("user_id"),
  ])

  const dedup = <T extends { email: string }>(rows: T[]) => {
    const map = new Map<string, T>()
    for (const row of rows) {
      if (row.email) map.set(row.email.toLowerCase(), row)
    }
    return Array.from(map.values())
  }

  const tenants = dedup(tenantsRes.data || [])
  const subscribers = dedup(subscribersRes.data || [])
  const supporters = dedup(supportersRes.data || [])

  // Fetch follower profiles by their IDs (two-step, no broken join)
  const followerIds = [...new Set((followerIdsRes.data || []).map((f) => f.user_id).filter(Boolean))]
  let followers: { email: string; name?: string }[] = []
  let followerProfilesError: string | null = null
  if (followerIds.length > 0) {
    const { data: profiles, error } = await admin
      .from("supporter_profiles")
      .select("email, full_name")
      .in("id", followerIds)
    if (error) followerProfilesError = error.message
    followers = dedup((profiles || []).map((p) => ({ email: p.email, name: p.full_name })))
  }

  const queryErrors = [
    tenantsRes.error?.message,
    subscribersRes.error?.message,
    supportersRes.error?.message,
    followerIdsRes.error?.message,
    followerProfilesError,
  ].filter(Boolean)

  const results = await Promise.allSettled([
    ...tenants.map((t) => addTenantToMoosend(t.email, (t as any).full_name)),
    ...subscribers.map((s) => addContactToMoosend(s.email, (s as any).name)),
    ...supporters.map((s) => addContactToMoosend(s.email, (s as any).name)),
    ...followers.map((f) => addContactToMoosend(f.email, (f as any).name)),
  ])

  const errors = results.filter((r) => r.status === "rejected").length

  return NextResponse.json({
    synced: { tenants: tenants.length, subscribers: subscribers.length, supporters: supporters.length, followers: followers.length },
    errors,
    queryErrors,
  })
}
