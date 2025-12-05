import type { SupabaseClient } from "@supabase/supabase-js"

export async function getCurrentTenant(supabase: SupabaseClient) {
  console.log("[v0] getCurrentTenant - Starting tenant lookup...")

  // Get current authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.log("[v0] getCurrentTenant - Auth error:", authError)
    return null
  }

  if (!user) {
    console.log("[v0] getCurrentTenant - No user found")
    return null
  }

  console.log("[v0] getCurrentTenant - User found:", user.id)

  // First, try by user_id (standard flow)
  let { data: tenant, error: tenantError } = await supabase.from("tenants").select("*").eq("id", user.id).single()

  // If not found by id, try by email
  if (!tenant || tenantError) {
    console.log("[v0] getCurrentTenant - Tenant not found by id, trying email:", user.email)
    const emailResult = await supabase.from("tenants").select("*").eq("email", user.email).single()

    tenant = emailResult.data
    tenantError = emailResult.error
  }

  if (tenantError) {
    console.log("[v0] getCurrentTenant - Tenant query error:", tenantError)
    return null
  }

  if (!tenant) {
    console.log("[v0] getCurrentTenant - No tenant found for user:", user.id, user.email)
    return null
  }

  console.log("[v0] getCurrentTenant - Tenant found:", {
    id: tenant.id,
    subdomain: tenant.subdomain,
    email: tenant.email,
  })

  return {
    ...tenant,
    slug: tenant.subdomain, // Ensure slug is available for blob path
  }
}
