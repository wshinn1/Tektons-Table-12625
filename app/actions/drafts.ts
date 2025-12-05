"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface DraftPage {
  id: string
  title: string
  slug: string
  category: string
  html_content: string
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface DraftVersion {
  id: string
  draft_id: string
  version_number: number
  title: string
  html_content: string
  notes: string | null
  changed_by: string | null
  created_at: string
}

export async function getDraftPages() {
  const supabase = await createServerClient()

  const { data: drafts, error } = await supabase
    .from("draft_pages")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) throw error
  return drafts as DraftPage[]
}

export async function getDraftPage(id: string) {
  const supabase = await createServerClient()

  const { data: draft, error } = await supabase.from("draft_pages").select("*").eq("id", id).single()

  if (error) throw error
  return draft as DraftPage
}

export async function createDraftPage(data: {
  title: string
  slug: string
  category: string
  html_content?: string
  notes?: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: draft, error } = await supabase
    .from("draft_pages")
    .insert({
      ...data,
      html_content: data.html_content || "",
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/admin/drafts")
  return draft as DraftPage
}

export async function updateDraftPage(id: string, data: Partial<DraftPage>) {
  const supabase = await createServerClient()

  const { data: draft, error } = await supabase.from("draft_pages").update(data).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/admin/drafts")
  revalidatePath(`/admin/drafts/${id}`)
  return draft as DraftPage
}

export async function deleteDraftPage(id: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("draft_pages").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/admin/drafts")
}

export async function getDraftVersions(draftId: string) {
  const supabase = await createServerClient()

  const { data: versions, error } = await supabase
    .from("draft_versions")
    .select("*")
    .eq("draft_id", draftId)
    .order("version_number", { ascending: false })

  if (error) throw error
  return versions as DraftVersion[]
}

export async function restoreDraftVersion(draftId: string, versionId: string) {
  const supabase = await createServerClient()

  // Get the version
  const { data: version, error: versionError } = await supabase
    .from("draft_versions")
    .select("*")
    .eq("id", versionId)
    .single()

  if (versionError) throw versionError

  // Update the draft with version content
  const { data: draft, error: updateError } = await supabase
    .from("draft_pages")
    .update({
      html_content: version.html_content,
      notes: version.notes,
    })
    .eq("id", draftId)
    .select()
    .single()

  if (updateError) throw updateError
  revalidatePath(`/admin/drafts/${draftId}`)
  return draft as DraftPage
}

export async function duplicateDraftPage(id: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get original draft
  const { data: original, error: fetchError } = await supabase.from("draft_pages").select("*").eq("id", id).single()

  if (fetchError) throw fetchError

  // Create duplicate with modified title/slug
  const { data: duplicate, error: createError } = await supabase
    .from("draft_pages")
    .insert({
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      category: original.category,
      html_content: original.html_content,
      notes: original.notes,
      status: "draft",
      created_by: user?.id,
    })
    .select()
    .single()

  if (createError) throw createError
  revalidatePath("/admin/drafts")
  return duplicate as DraftPage
}
