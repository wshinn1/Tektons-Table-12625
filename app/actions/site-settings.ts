"use server"

import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

export interface SiteMetadata {
  title: string
  description: string
  favicon_url: string
  og_image: string
  twitter_card: string
  twitter_site: string
}

const DEFAULT_SITE_METADATA: SiteMetadata = {
  title: "Tekton's Table",
  description: "A platform for missionaries and non-profits to receive donations and support.",
  favicon_url: "/favicon.ico",
  og_image: "",
  twitter_card: "summary_large_image",
  twitter_site: "",
}

export async function getSiteMetadata(): Promise<SiteMetadata> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("system_settings")
    .select("setting_value")
    .eq("setting_key", "site_metadata")
    .maybeSingle() // Use maybeSingle instead of single to avoid error when no rows

  if (error) {
    console.error("Error fetching site metadata:", error)
    return DEFAULT_SITE_METADATA
  }

  if (!data) {
    // Row doesn't exist, return defaults (migration script will create it)
    return DEFAULT_SITE_METADATA
  }

  return (data.setting_value as SiteMetadata) || DEFAULT_SITE_METADATA
}

export async function updateSiteMetadata(metadata: SiteMetadata) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { success: false, error: "Not authorized" }
  }

  const { data: superAdmin } = await supabase.from("super_admins").select("id").eq("user_id", user.id).single()

  const { error } = await supabase.from("system_settings").upsert(
    {
      setting_key: "site_metadata",
      setting_value: metadata,
      description: "Site metadata for SEO and social sharing",
      ...(superAdmin?.id ? { updated_by: superAdmin.id } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "setting_key" },
  )

  if (error) {
    console.error("Failed to update site metadata:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/settings/site", "page")
  revalidatePath("/admin", "layout")
  revalidatePath("/", "layout")

  return { success: true }
}

export async function uploadFavicon(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { success: false, error: "Not authorized" }
  }

  const file = formData.get("favicon") as File
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    const blob = await put(`site/favicon-${Date.now()}.${file.name.split(".").pop()}`, file, {
      access: "public",
    })

    return { success: true, url: blob.url }
  } catch (error) {
    console.error("Failed to upload favicon:", error)
    return { success: false, error: "Failed to upload file" }
  }
}

export async function uploadOgImage(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { success: false, error: "Not authorized" }
  }

  const file = formData.get("og_image") as File
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    const blob = await put(`site/og-image-${Date.now()}.${file.name.split(".").pop()}`, file, {
      access: "public",
    })

    return { success: true, url: blob.url }
  } catch (error) {
    console.error("Failed to upload OG image:", error)
    return { success: false, error: "Failed to upload file" }
  }
}
