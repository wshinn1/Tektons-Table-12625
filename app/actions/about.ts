"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateAboutPage(tenantSlug: string, content: any) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Get tenant
  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", tenantSlug).single()

  if (!tenant || tenant.id !== user.id) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      about_content: content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating about page:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/${tenantSlug}/about`)
  revalidatePath(`/${tenantSlug}/admin/about`)
  return { success: true }
}

export async function getAboutContent(tenantSlug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tenants")
    .select("about_content, contact_email")
    .eq("slug", tenantSlug)
    .single()

  if (error) {
    console.error("Error fetching about content:", error)
    return null
  }

  return data
}
