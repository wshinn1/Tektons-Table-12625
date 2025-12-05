"use server"

import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

export async function createSectionTemplate(data: {
  name: string
  category: string
  description?: string
  component_path?: string
  default_props?: any
  thumbnail_url?: string
  source_type?: string
  original_screenshot_url?: string
  editable_fields?: any[]
  generated_html?: string
  generated_css?: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized")
  }

  const { data: template, error } = await supabase
    .from("section_templates")
    .insert([
      {
        ...data,
        default_props: data.default_props || {},
        editable_fields: data.editable_fields || [],
      },
    ])
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/sections")
  return template
}

export async function updateSectionTemplate(
  id: string,
  data: {
    name?: string
    category?: string
    description?: string
    default_props?: any
    thumbnail_url?: string
    editable_fields?: any[]
    generated_html?: string
    generated_css?: string
  },
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized")
  }

  const { data: template, error } = await supabase
    .from("section_templates")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/sections")
  revalidatePath(`/admin/sections/${id}/edit`)
  return template
}

export async function deleteSectionTemplate(id: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("section_templates").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/admin/sections")
}

export async function uploadScreenshot(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized")
  }

  const file = formData.get("file") as File
  if (!file) {
    throw new Error("No file provided")
  }

  const blob = await put(`screenshots/${Date.now()}-${file.name}`, file, {
    access: "public",
  })

  return blob.url
}

export async function getSectionTemplate(id: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("section_templates").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function duplicateSectionTemplate(id: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized")
  }

  // Get original template
  const { data: original, error: fetchError } = await supabase
    .from("section_templates")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) throw fetchError

  // Create copy
  const { data: copy, error: insertError } = await supabase
    .from("section_templates")
    .insert([
      {
        name: `${original.name} (Copy)`,
        category: original.category,
        description: original.description,
        component_path: original.component_path,
        default_props: original.default_props,
        thumbnail_url: original.thumbnail_url,
        source_type: original.source_type,
        original_screenshot_url: original.original_screenshot_url,
        editable_fields: original.editable_fields,
        generated_html: original.generated_html,
        generated_css: original.generated_css,
      },
    ])
    .select()
    .single()

  if (insertError) throw insertError

  revalidatePath("/admin/sections")
  return copy
}
