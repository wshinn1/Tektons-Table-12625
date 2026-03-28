import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdmin } from "@/lib/auth"
import { addTenantToMoosend, addContactToMoosend } from "@/lib/moosend"

export async function POST() {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const [tenantsRes, subscribersRes, supportersRes] = await Promise.all([
    admin.from("tenants").select("email, full_name").eq("is_active", true),
    admin.from("tenant_email_subscribers").select("email, name"),
    admin.from("tenant_financial_supporters").select("email, name"),
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

  const results = await Promise.allSettled([
    ...tenants.map((t) => addTenantToMoosend(t.email, t.full_name)),
    ...subscribers.map((s) => addContactToMoosend(s.email, s.name)),
    ...supporters.map((s) => addContactToMoosend(s.email, s.name)),
  ])

  const errors = results.filter((r) => r.status === "rejected").length

  return NextResponse.json({
    synced: { tenants: tenants.length, subscribers: subscribers.length, supporters: supporters.length },
    errors,
  })
}
