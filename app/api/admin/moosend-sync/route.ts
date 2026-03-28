import { NextResponse } from "next/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { addTenantToMoosend, addContactToMoosend } from "@/lib/moosend"

export async function POST() {
  // Verify super admin auth
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch all data in parallel
  const [tenantsResult, subscribersResult, supportersResult] = await Promise.all([
    supabase
      .from("tenants")
      .select("email, full_name")
      .eq("is_active", true),
    supabase
      .from("tenant_email_subscribers")
      .select("email, name")
      .eq("status", "subscribed"),
    supabase
      .from("tenant_financial_supporters")
      .select("email, name"),
  ])

  // Deduplicate tenants by email
  const tenantsMap = new Map<string, string | null>()
  for (const tenant of tenantsResult.data || []) {
    if (tenant.email && !tenantsMap.has(tenant.email)) {
      tenantsMap.set(tenant.email, tenant.full_name)
    }
  }

  // Deduplicate subscribers by email
  const subscribersMap = new Map<string, string | null>()
  for (const sub of subscribersResult.data || []) {
    if (sub.email && !subscribersMap.has(sub.email)) {
      subscribersMap.set(sub.email, sub.name)
    }
  }

  // Deduplicate supporters by email
  const supportersMap = new Map<string, string | null>()
  for (const sup of supportersResult.data || []) {
    if (sup.email && !supportersMap.has(sup.email)) {
      supportersMap.set(sup.email, sup.name)
    }
  }

  // Build promises for all Moosend calls
  const tenantPromises = Array.from(tenantsMap.entries()).map(([email, name]) =>
    addTenantToMoosend(email, name)
  )

  const subscriberPromises = Array.from(subscribersMap.entries()).map(([email, name]) =>
    addContactToMoosend(email, name)
  )

  const supporterPromises = Array.from(supportersMap.entries()).map(([email, name]) =>
    addContactToMoosend(email, name)
  )

  // Run all calls with Promise.allSettled so one failure doesn't stop the rest
  const [tenantResults, subscriberResults, supporterResults] = await Promise.all([
    Promise.allSettled(tenantPromises),
    Promise.allSettled(subscriberPromises),
    Promise.allSettled(supporterPromises),
  ])

  // Count successes and errors
  const countResults = (results: PromiseSettledResult<void>[]) => {
    let success = 0
    let errors = 0
    for (const result of results) {
      if (result.status === "fulfilled") {
        success++
      } else {
        errors++
      }
    }
    return { success, errors }
  }

  const tenantStats = countResults(tenantResults)
  const subscriberStats = countResults(subscriberResults)
  const supporterStats = countResults(supporterResults)

  return NextResponse.json({
    synced: {
      tenants: tenantStats.success,
      subscribers: subscriberStats.success,
      supporters: supporterStats.success,
    },
    errors: tenantStats.errors + subscriberStats.errors + supporterStats.errors,
  })
}
