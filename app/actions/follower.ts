"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function followTenant(tenantId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in to follow" }
  }

  const { data, error } = await supabase
    .from("tenant_followers")
    .insert({
      tenant_id: tenantId,
      user_id: user.id,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      return { error: "You have already requested to follow this missionary" }
    }
    return { error: error.message }
  }

  // TODO: Send email notification to tenant about new follower request

  revalidatePath(`/[tenant]`, "page")
  return { data }
}

export async function unfollowTenant(tenantId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in" }
  }

  const { error } = await supabase.from("tenant_followers").delete().eq("tenant_id", tenantId).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/[tenant]`, "page")
  return { success: true }
}

export async function getFollowerStatus(tenantId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { status: null }
  }

  const { data, error } = await supabase
    .from("tenant_followers")
    .select("status")
    .eq("tenant_id", tenantId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }

  return { status: data?.status || null }
}

export async function approveFollower(followerId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from("tenant_followers")
    .update({ status: "approved" })
    .eq("id", followerId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // TODO: Send email notification to user about approval

  revalidatePath("/[tenant]/admin/users", "page")
  return { data }
}

export async function rejectFollower(followerId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from("tenant_followers")
    .update({ status: "rejected" })
    .eq("id", followerId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/[tenant]/admin/users", "page")
  return { data }
}
