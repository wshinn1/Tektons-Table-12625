import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdmin } from "@/lib/auth"
import { addTenantToMoosend, addContactToMoosend } from "@/lib/moosend"

export async function POST() {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const [tenantsRes, subscribersRes, supportersRes, followersRes] = await Promise.all([
    admin.from("tenants").select("email, full_name").eq("is_active", true),
    admin.from("tenant_email_subscribers").select("email, name"),
    admin.from("tenant_financial_supporters").select("email, name"),
    admin
      .from("tenant_followers")
      .select("follower:supporter_profiles!tenant_followers_follower_id_fkey(email, full_name)"),
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

  const followerRows = (followersRes.data || [])
    .map((f: any) => ({ email: f.follower?.email, name: f.follower?.full_name }))
    .filter((f) => !!f.email)
  const followers = dedup(followerRows as { email: string; name?: string }[])

  const queryErrors = [
    tenantsRes.error?.message,
    subscribersRes.error?.message,
    supportersRes.error?.message,
    followersRes.error?.message,
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
