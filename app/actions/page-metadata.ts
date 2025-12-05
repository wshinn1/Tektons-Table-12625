"use server"

import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

export async function getPageMetadata(pageKey: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("page_metadata").select("*").eq("page_key", pageKey).single()

  if (error) throw error
  return data
}

export async function getAllPageMetadata() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Only super admins can access page metadata")
  }

  const { data, error } = await supabase.from("page_metadata").select("*").order("page_name")

  if (error) throw error
  return data
}

export async function updatePageMetadata(pageKey: string, metadata: any) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Only super admins can update page metadata")
  }

  const { error } = await supabase
    .from("page_metadata")
    .update({
      ...metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("page_key", pageKey)

  if (error) throw error

  revalidatePath("/admin/settings/pages")
  revalidatePath(metadata.page_path || "/")
  return { success: true }
}

export async function uploadPageImage(file: File, pageKey: string, type: "og" | "twitter") {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Only super admins can upload images")
  }

  // Upload to Vercel Blob
  const blob = await put(`page-metadata/${pageKey}-${type}-${Date.now()}.${file.name.split(".").pop()}`, file, {
    access: "public",
  })

  return blob.url
}
