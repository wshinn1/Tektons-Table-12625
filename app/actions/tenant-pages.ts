"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface TenantPage {
  id: string
  tenant_id: string
  title: string
  slug: string
  design_json: Record<string, unknown>
  html_content: string
  status: "draft" | "published"
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

// Check if user owns the tenant
async function verifyTenantOwnership(tenantId: string): Promise<boolean> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  // The tenant's id IS the user's id (tenants.id references auth.users(id))
  // So we just need to check if the tenantId matches the user's id
  // OR check by email as a fallback
  const adminSupabase = createAdminClient()
  const { data: tenant } = await adminSupabase.from("tenants").select("id, email").eq("id", tenantId).single()

  // Check if tenant id matches user id OR email matches
  return tenant?.id === user.id || tenant?.email === user.email
}

// Check if page builder is enabled for tenant
export async function isPageBuilderEnabled(tenantId: string): Promise<boolean> {
  const adminSupabase = createAdminClient()
  const { data: tenant } = await adminSupabase
    .from("tenants")
    .select("page_builder_enabled")
    .eq("id", tenantId)
    .single()

  return tenant?.page_builder_enabled === true
}

// Get all pages for a tenant
export async function getTenantPages(tenantId: string): Promise<TenantPage[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from("tenant_pages")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tenant pages:", error)
    return []
  }

  return data || []
}

// Get a single page by ID
export async function getTenantPage(pageId: string): Promise<TenantPage | null> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase.from("tenant_pages").select("*").eq("id", pageId).single()

  if (error) {
    console.error("Error fetching tenant page:", error)
    return null
  }

  return data
}

// Get a published page by slug (for public viewing)
export async function getPublishedPageBySlug(tenantId: string, slug: string): Promise<TenantPage | null> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from("tenant_pages")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error) {
    return null
  }

  return data
}

export const getTenantPageBySlug = getPublishedPageBySlug

// Create a new page
export async function createTenantPage(params: {
  tenantId: string
  title: string
  slug: string
  designJson?: Record<string, unknown>
  htmlContent?: string
  status?: "draft" | "published"
  metaTitle?: string
  metaDescription?: string
}): Promise<{ success: boolean; page?: TenantPage; error?: string }> {
  const { tenantId, title, slug, designJson, htmlContent, status, metaTitle, metaDescription } = params

  const isOwner = await verifyTenantOwnership(tenantId)
  if (!isOwner) {
    return { success: false, error: "Unauthorized" }
  }

  const enabled = await isPageBuilderEnabled(tenantId)
  if (!enabled) {
    return { success: false, error: "Page builder is not enabled for this tenant" }
  }

  const adminSupabase = createAdminClient()

  // Validate slug format
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return { success: false, error: "Slug must be lowercase letters, numbers, and hyphens only" }
  }

  const { data: page, error } = await adminSupabase
    .from("tenant_pages")
    .insert({
      tenant_id: tenantId,
      title: title,
      slug: slug,
      design_json: designJson || {},
      html_content: htmlContent || "",
      status: status || "draft",
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
    })
    .select()
    .single()

  if (error) {
    if (error.message.includes("reserved")) {
      return { success: false, error: error.message }
    }
    if (error.code === "23505") {
      return { success: false, error: "A page with this slug already exists" }
    }
    console.error("Error creating tenant page:", error)
    return { success: false, error: "Failed to create page" }
  }

  revalidatePath(`/admin/pages`)
  return { success: true, page }
}

// Update a page
export async function updateTenantPage(
  pageId: string,
  data: {
    title?: string
    slug?: string
    design_json?: Record<string, unknown>
    html_content?: string
    status?: "draft" | "published"
    meta_title?: string
    meta_description?: string
  },
): Promise<{ success: boolean; page?: TenantPage; error?: string }> {
  const adminSupabase = createAdminClient()

  // Get the page to verify ownership
  const { data: existingPage } = await adminSupabase.from("tenant_pages").select("tenant_id").eq("id", pageId).single()

  if (!existingPage) {
    return { success: false, error: "Page not found" }
  }

  const isOwner = await verifyTenantOwnership(existingPage.tenant_id)
  if (!isOwner) {
    return { success: false, error: "Unauthorized" }
  }

  // Validate slug if provided
  if (data.slug) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(data.slug)) {
      return { success: false, error: "Slug must be lowercase letters, numbers, and hyphens only" }
    }
  }

  const { data: page, error } = await adminSupabase
    .from("tenant_pages")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .select()
    .single()

  if (error) {
    if (error.message.includes("reserved")) {
      return { success: false, error: error.message }
    }
    if (error.code === "23505") {
      return { success: false, error: "A page with this slug already exists" }
    }
    console.error("Error updating tenant page:", error)
    return { success: false, error: "Failed to update page" }
  }

  revalidatePath(`/admin/pages`)
  return { success: true, page }
}

// Delete a page
export async function deleteTenantPage(pageId: string): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient()

  // Get the page to verify ownership
  const { data: existingPage } = await adminSupabase.from("tenant_pages").select("tenant_id").eq("id", pageId).single()

  if (!existingPage) {
    return { success: false, error: "Page not found" }
  }

  const isOwner = await verifyTenantOwnership(existingPage.tenant_id)
  if (!isOwner) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await adminSupabase.from("tenant_pages").delete().eq("id", pageId)

  if (error) {
    console.error("Error deleting tenant page:", error)
    return { success: false, error: "Failed to delete page" }
  }

  revalidatePath(`/admin/pages`)
  return { success: true }
}

// Duplicate a page
export async function duplicateTenantPage(
  pageId: string,
): Promise<{ success: boolean; page?: TenantPage; error?: string }> {
  const adminSupabase = createAdminClient()

  // Get the original page
  const { data: originalPage } = await adminSupabase.from("tenant_pages").select("*").eq("id", pageId).single()

  if (!originalPage) {
    return { success: false, error: "Page not found" }
  }

  const isOwner = await verifyTenantOwnership(originalPage.tenant_id)
  if (!isOwner) {
    return { success: false, error: "Unauthorized" }
  }

  // Generate a unique slug
  let newSlug = `${originalPage.slug}-copy`
  let counter = 1

  while (true) {
    const { data: existing } = await adminSupabase
      .from("tenant_pages")
      .select("id")
      .eq("tenant_id", originalPage.tenant_id)
      .eq("slug", newSlug)
      .single()

    if (!existing) break
    newSlug = `${originalPage.slug}-copy-${counter}`
    counter++
  }

  const { data: page, error } = await adminSupabase
    .from("tenant_pages")
    .insert({
      tenant_id: originalPage.tenant_id,
      title: `${originalPage.title} (Copy)`,
      slug: newSlug,
      design_json: originalPage.design_json,
      html_content: originalPage.html_content,
      status: "draft",
      meta_title: originalPage.meta_title,
      meta_description: originalPage.meta_description,
    })
    .select()
    .single()

  if (error) {
    console.error("Error duplicating tenant page:", error)
    return { success: false, error: "Failed to duplicate page" }
  }

  revalidatePath(`/admin/pages`)
  return { success: true, page }
}
