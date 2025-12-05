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

// Get a single page by ID for editing (includes design_json for Unlayer)
export async function getPageForEdit(pageId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("pages").select("*").eq("id", pageId).single()

  if (error) throw error
  return data
}

// Get a page by slug for editing
export async function getPageBySlugForEdit(slug: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("pages").select("*").eq("slug", slug).single()

  if (error) throw error
  return data
}

// Create a new Unlayer page
export async function createUnlayerPage(formData: {
  slug: string
  title: string
  meta_description?: string
  meta_keywords?: string
  design_json?: any
  html_content?: string
  is_published?: boolean
}) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .insert([
      {
        ...formData,
        editor_type: "unlayer",
        is_published: formData.is_published ?? false,
      },
    ])
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/pages")
  return data
}

// Save Unlayer page content (design_json and html_content)
export async function saveUnlayerPage(
  pageId: string,
  formData: {
    title?: string
    slug?: string
    meta_description?: string
    meta_keywords?: string
    design_json?: any
    html_content?: string
    is_published?: boolean
  },
) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/pages")
  revalidatePath(`/p/${data.slug}`)
  return data
}

// Publish an Unlayer page
export async function publishUnlayerPage(pageId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .update({
      is_published: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/pages")
  revalidatePath(`/p/${data.slug}`)
  return data
}

// Unpublish an Unlayer page
export async function unpublishUnlayerPage(pageId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .update({
      is_published: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/pages")
  revalidatePath(`/p/${data.slug}`)
  return data
}

// Delete a page (works for both section and unlayer pages)
export async function deletePage(pageId: string) {
  const supabase = await createServerClient()

  // First get the page to know the slug for revalidation
  const { data: page } = await supabase.from("pages").select("slug").eq("id", pageId).single()

  // Delete associated page sections first (for section-based pages)
  await supabase.from("page_sections").delete().eq("page_id", pageId)

  // Delete the page
  const { error } = await supabase.from("pages").delete().eq("id", pageId)

  if (error) throw error

  revalidatePath("/admin/pages")
  if (page?.slug) {
    revalidatePath(`/p/${page.slug}`)
  }
}

// Get page for public rendering (only published pages)
export async function getPublishedPageBySlug(slug: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("pages").select("*").eq("slug", slug).eq("is_published", true).single()

  if (error) return null
  return data
}

// Get all Unlayer pages for admin listing
export async function getUnlayerPages() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .select("id, title, slug, is_published, editor_type, created_at, updated_at")
    .eq("editor_type", "unlayer")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

// Duplicate a page
export async function duplicatePage(pageId: string) {
  const supabase = await createServerClient()

  // Get the original page
  const { data: original, error: fetchError } = await supabase.from("pages").select("*").eq("id", pageId).single()

  if (fetchError) throw fetchError

  // Create a copy with a new slug
  const newSlug = `${original.slug}-copy-${Date.now()}`
  const { data: newPage, error: insertError } = await supabase
    .from("pages")
    .insert([
      {
        title: `${original.title} (Copy)`,
        slug: newSlug,
        meta_description: original.meta_description,
        meta_keywords: original.meta_keywords,
        design_json: original.design_json,
        html_content: original.html_content,
        editor_type: original.editor_type,
        is_published: false, // Copies start as drafts
      },
    ])
    .select()
    .single()

  if (insertError) throw insertError

  revalidatePath("/admin/pages")
  return newPage
}

// Get all published pages for navigation/linking
export async function getPublishedPagesForNavigation() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .select("id, title, slug, editor_type")
    .eq("is_published", true)
    .order("title", { ascending: true })

  if (error) {
    console.error("Error fetching pages for navigation:", error)
    return []
  }
  return data || []
}

// Get all pages (published and unpublished) for admin
export async function getAllPagesForAdmin() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("pages")
    .select("id, title, slug, is_published, editor_type")
    .order("title", { ascending: true })

  if (error) {
    console.error("Error fetching pages for admin:", error)
    return []
  }
  return data || []
}
