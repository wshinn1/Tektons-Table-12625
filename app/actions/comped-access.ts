"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { addMonths, addYears } from "date-fns"
import { sendCompAccessGrantedEmail } from "@/lib/premium-emails"

export async function searchUsers(query: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  // Search users by email
  const { data: users, error } = await adminClient
    .from("auth.users")
    .select("id, email")
    .ilike("email", `%${query}%`)
    .limit(10)

  if (error) {
    // Try alternate approach using auth.users view
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
      perPage: 100,
    })

    if (authError) {
      console.error("Error searching users:", authError)
      return { error: "Failed to search users" }
    }

    const filteredUsers = authUsers.users
      .filter((u) => u.email?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10)
      .map((u) => ({ id: u.id, email: u.email || "" }))

    return { users: filteredUsers }
  }

  return { users: users || [] }
}

export async function grantCompedAccess(data: {
  userId: string
  duration: string
  reason?: string
  grantedBy: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  // Check if user already has active comped access
  const { data: existing } = await adminClient
    .from("comped_access")
    .select("id")
    .eq("user_id", data.userId)
    .eq("is_active", true)
    .single()

  if (existing) {
    return { error: "User already has active comped access" }
  }

  // Calculate expiration date based on duration
  let expiresAt: Date | null = null
  const now = new Date()

  switch (data.duration) {
    case "1_month":
      expiresAt = addMonths(now, 1)
      break
    case "3_months":
      expiresAt = addMonths(now, 3)
      break
    case "6_months":
      expiresAt = addMonths(now, 6)
      break
    case "1_year":
      expiresAt = addYears(now, 1)
      break
    case "lifetime":
      expiresAt = null // Permanent
      break
    default:
      expiresAt = addMonths(now, 1)
  }

  const { data: compedAccess, error } = await adminClient
    .from("comped_access")
    .insert({
      user_id: data.userId,
      granted_by: data.grantedBy,
      reason: data.reason || null,
      starts_at: now.toISOString(),
      expires_at: expiresAt?.toISOString() || null,
      is_active: true,
    })
    .select(`
      *,
      user:auth.users!comped_access_user_id_fkey(id, email),
      granted_by_user:auth.users!comped_access_granted_by_fkey(id, email)
    `)
    .single()

  if (error) {
    console.error("Error granting comped access:", error)

    // Try without the join if auth.users isn't accessible
    const { data: basicAccess, error: basicError } = await adminClient
      .from("comped_access")
      .insert({
        user_id: data.userId,
        granted_by: data.grantedBy,
        reason: data.reason || null,
        starts_at: now.toISOString(),
        expires_at: expiresAt?.toISOString() || null,
        is_active: true,
      })
      .select()
      .single()

    if (basicError) {
      return { error: basicError.message }
    }

    // Get user email separately
    const { data: userData } = await adminClient.auth.admin.getUserById(data.userId)

    if (userData?.user?.email) {
      try {
        await sendCompAccessGrantedEmail(userData.user.email, expiresAt, data.reason)
        console.log("[v0] Comp access granted email sent to:", userData.user.email)
      } catch (emailError) {
        console.error("[v0] Failed to send comp access email:", emailError)
      }
    }

    revalidatePath("/admin/comped-access")
    return {
      compedAccess: {
        ...basicAccess,
        user: userData?.user ? { id: userData.user.id, email: userData.user.email || "" } : null,
        granted_by_user: null,
      },
    }
  }

  if (compedAccess?.user?.email) {
    try {
      await sendCompAccessGrantedEmail(compedAccess.user.email, expiresAt, data.reason)
      console.log("[v0] Comp access granted email sent to:", compedAccess.user.email)
    } catch (emailError) {
      console.error("[v0] Failed to send comp access email:", emailError)
    }
  }

  revalidatePath("/admin/comped-access")
  return { compedAccess }
}

export async function revokeCompedAccess(data: {
  id: string
  revokedBy: string
  reason?: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("comped_access")
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: data.revokedBy,
      revoke_reason: data.reason || null,
    })
    .eq("id", data.id)

  if (error) {
    console.error("Error revoking comped access:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/comped-access")
  return { success: true }
}

export async function getCompedAccessHistory(userId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  const { data: history, error } = await adminClient
    .from("comped_access")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching comped access history:", error)
    return { error: error.message }
  }

  return { history }
}
