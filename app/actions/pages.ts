"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPages() {
  const supabase = await createServerClient()

  const { data: pages, error } = await supabase.from("pages").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return pages
}

export async function getPageWithSections(slug: string) {
  const supabase = await createServerClient()

  const { data: page, error: pageError } = await supabase.from("pages").select("*").eq("slug", slug).single()

  if (pageError) throw pageError

  const { data: sections, error: sectionsError } = await supabase
    .from("page_sections")
    .select(`
      *,
      section_templates (*)
    `)
    .eq("page_id", page.id)
    .order("order_index", { ascending: true })

  if (sectionsError) throw sectionsError

  return { page, sections }
}

export async function getSectionTemplates() {
  const supabase = await createServerClient()

  const { data: templates, error } = await supabase
    .from("section_templates")
    .select("*")
    .order("category", { ascending: true })

  if (error) throw error
  return templates
}

export async function createPage(formData: {
  slug: string
  title: string
  meta_description?: string
  is_published: boolean
}) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("pages").insert([formData]).select().single()

  if (error) throw error

  revalidatePath("/admin/pages")
  return data
}

export async function updatePage(
  id: string,
  formData: {
    title?: string
    meta_description?: string
    is_published?: boolean
  },
) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/pages")
  return data
}

export async function setAsHomepage(pageId: string) {
  const supabase = await createServerClient()

  // First, unset any existing homepage
  await supabase.from("pages").update({ is_homepage: false }).eq("is_homepage", true)

  // Then set the new homepage
  const { data, error } = await supabase
    .from("pages")
    .update({ is_homepage: true, is_published: true }) // Homepage must be published
    .eq("id", pageId)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/pages")
  revalidatePath("/")
  return data
}

export async function getHomepage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .select("*, page_sections(*, section_templates(*))")
    .eq("is_homepage", true)
    .single()

  if (error) {
    // Fallback to 'home' slug if no homepage is set
    const { data: fallback } = await supabase
      .from("pages")
      .select("*, page_sections(*, section_templates(*))")
      .eq("slug", "home")
      .single()
    return fallback
  }

  return data
}

export async function addSectionToPage(pageId: string, templateId: string, orderIndex: number) {
  const supabase = await createServerClient()

  // Get template default props
  const { data: template } = await supabase
    .from("section_templates")
    .select("default_props")
    .eq("id", templateId)
    .single()

  const { data, error } = await supabase
    .from("page_sections")
    .insert([
      {
        page_id: pageId,
        section_template_id: templateId,
        order_index: orderIndex,
        props: template?.default_props || {},
      },
    ])
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/pages")
  return data
}

export async function updatePageSection(sectionId: string, props: any) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("page_sections")
    .update({ props, updated_at: new Date().toISOString() })
    .eq("id", sectionId)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/pages")
  return data
}

export async function deletePageSection(sectionId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("page_sections").delete().eq("id", sectionId)

  if (error) throw error

  revalidatePath("/admin/pages")
}

export async function reorderPageSections(sections: { id: string; order_index: number }[]) {
  const supabase = await createServerClient()

  for (const section of sections) {
    await supabase.from("page_sections").update({ order_index: section.order_index }).eq("id", section.id)
  }

  revalidatePath("/admin/pages")
}
