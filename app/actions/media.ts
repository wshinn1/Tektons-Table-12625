"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { del } from "@vercel/blob"

export async function getMediaLibrary(tenantId?: string) {
  const supabase = await createServerClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // If no tenantId provided, try to find the user's tenant
  let effectiveTenantId = tenantId
  if (!effectiveTenantId) {
    const { data: tenant } = await adminSupabase.from("tenants").select("id").eq("email", user.email).maybeSingle()

    effectiveTenantId = tenant?.id
  }

  // Build query with tenant filter
  let query = adminSupabase.from("media_library").select("*").order("created_at", { ascending: false })

  if (effectiveTenantId) {
    query = query.eq("tenant_id", effectiveTenantId)
  } else {
    // Super admins without a tenant see platform media (null tenant_id)
    query = query.is("tenant_id", null)
  }

  const { data, error } = await query

  if (error) {
    console.error("Failed to fetch media:", error)
    throw new Error("Failed to fetch media")
  }

  return data
}

export async function deleteMedia(id: string, url: string) {
  const supabase = await createServerClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify the user owns this media or is a super admin
  const { data: media } = await adminSupabase.from("media_library").select("tenant_id").eq("id", id).single()

  if (media?.tenant_id) {
    const { data: tenant } = await adminSupabase
      .from("tenants")
      .select("id")
      .eq("id", media.tenant_id)
      .eq("email", user.email)
      .maybeSingle()

    if (!tenant) {
      const { data: adminCheck } = await adminSupabase.from("super_admins").select("id").eq("user_id", user.id).limit(1)

      if (!adminCheck || adminCheck.length === 0) {
        throw new Error("Unauthorized to delete this media")
      }
    }
  }

  // Delete from Blob storage
  try {
    await del(url)
  } catch (error) {
    console.error("Failed to delete from Blob:", error)
  }

  // Delete from database
  const { error } = await adminSupabase.from("media_library").delete().eq("id", id)

  if (error) {
    console.error("Failed to delete media:", error)
    throw new Error("Failed to delete media")
  }
}

export async function updateMediaAltText(id: string, altText: string) {
  const supabase = await createServerClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership similar to deleteMedia
  const { data: media } = await adminSupabase.from("media_library").select("tenant_id").eq("id", id).single()

  if (media?.tenant_id) {
    const { data: tenant } = await adminSupabase
      .from("tenants")
      .select("id")
      .eq("id", media.tenant_id)
      .eq("email", user.email)
      .maybeSingle()

    if (!tenant) {
      const { data: adminCheck } = await adminSupabase.from("super_admins").select("id").eq("user_id", user.id).limit(1)

      if (!adminCheck || adminCheck.length === 0) {
        throw new Error("Unauthorized to update this media")
      }
    }
  }

  const { error } = await adminSupabase.from("media_library").update({ alt_text: altText }).eq("id", id)

  if (error) {
    console.error("Failed to update alt text:", error)
    throw new Error("Failed to update alt text")
  }
}
