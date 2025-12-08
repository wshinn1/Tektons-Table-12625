"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ==================== CATEGORY ACTIONS ====================

export async function createCategory(data: {
  name: string
  description: string
  is_premium: boolean
  icon: string
  color: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  // Get the max display_order
  const { data: maxOrder } = await adminClient
    .from("resource_categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrder?.display_order || 0) + 1

  const { data: category, error } = await adminClient
    .from("resource_categories")
    .insert({
      name: data.name,
      slug: generateSlug(data.name),
      description: data.description || null,
      is_premium: data.is_premium,
      icon: data.icon,
      color: data.color,
      display_order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/resources/categories")
  return { category }
}

export async function updateCategory(
  id: string,
  data: {
    name: string
    description: string
    is_premium: boolean
    icon: string
    color: string
  },
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  const { data: category, error } = await adminClient
    .from("resource_categories")
    .update({
      name: data.name,
      slug: generateSlug(data.name),
      description: data.description || null,
      is_premium: data.is_premium,
      icon: data.icon,
      color: data.color,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating category:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/resources/categories")
  return { category }
}

export async function deleteCategory(id: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient.from("resource_categories").delete().eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/resources/categories")
  return { success: true }
}

export async function reorderCategories(orderedIds: string[]) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  // Update each category's display_order
  for (let i = 0; i < orderedIds.length; i++) {
    await adminClient.from("resource_categories").update({ display_order: i }).eq("id", orderedIds[i])
  }

  revalidatePath("/admin/resources/categories")
  return { success: true }
}

// ==================== RESOURCE ACTIONS ====================

export async function createResource(data: {
  title: string
  excerpt: string
  content: any // TipTap JSON
  featured_image?: string
  is_premium: boolean
  status: "draft" | "published"
  category_ids: string[]
  meta_title?: string
  meta_description?: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  // Calculate word count and read time
  const textContent = extractTextFromTipTap(data.content)
  const wordCount = textContent.split(/\s+/).filter(Boolean).length
  const readTime = Math.ceil(wordCount / 200) // Average reading speed

  const { data: resource, error } = await adminClient
    .from("platform_resources")
    .insert({
      title: data.title,
      slug: generateSlug(data.title),
      excerpt: data.excerpt || null,
      content: data.content,
      featured_image: data.featured_image || null,
      author_id: user.id,
      is_premium: data.is_premium,
      status: data.status,
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || data.excerpt,
      word_count: wordCount,
      estimated_read_time: readTime,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating resource:", error)
    return { error: error.message }
  }

  // Add category assignments
  if (data.category_ids.length > 0) {
    const assignments = data.category_ids.map((categoryId) => ({
      resource_id: resource.id,
      category_id: categoryId,
    }))

    await adminClient.from("resource_category_assignments").insert(assignments)
  }

  revalidatePath("/admin/resources")
  return { resource }
}

export async function updateResource(
  id: string,
  data: {
    title: string
    excerpt: string
    content: any
    featured_image?: string
    is_premium: boolean
    status: "draft" | "published" | "archived"
    category_ids: string[]
    meta_title?: string
    meta_description?: string
  },
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  // Get current resource to check publish status
  const { data: currentResource } = await adminClient
    .from("platform_resources")
    .select("status, published_at")
    .eq("id", id)
    .single()

  // Calculate word count and read time
  const textContent = extractTextFromTipTap(data.content)
  const wordCount = textContent.split(/\s+/).filter(Boolean).length
  const readTime = Math.ceil(wordCount / 200)

  // Determine published_at
  let publishedAt = currentResource?.published_at
  if (data.status === "published" && currentResource?.status !== "published") {
    publishedAt = new Date().toISOString()
  }

  const { data: resource, error } = await adminClient
    .from("platform_resources")
    .update({
      title: data.title,
      slug: generateSlug(data.title),
      excerpt: data.excerpt || null,
      content: data.content,
      featured_image: data.featured_image || null,
      is_premium: data.is_premium,
      status: data.status,
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || data.excerpt,
      word_count: wordCount,
      estimated_read_time: readTime,
      published_at: publishedAt,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating resource:", error)
    return { error: error.message }
  }

  // Update category assignments
  await adminClient.from("resource_category_assignments").delete().eq("resource_id", id)

  if (data.category_ids.length > 0) {
    const assignments = data.category_ids.map((categoryId) => ({
      resource_id: resource.id,
      category_id: categoryId,
    }))

    await adminClient.from("resource_category_assignments").insert(assignments)
  }

  revalidatePath("/admin/resources")
  revalidatePath(`/resources/article/${resource.slug}`)
  return { resource }
}

export async function deleteResource(id: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient.from("platform_resources").delete().eq("id", id)

  if (error) {
    console.error("Error deleting resource:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/resources")
  return { success: true }
}

export async function getResource(id: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    return { error: "Unauthorized" }
  }

  const adminClient = createAdminClient()

  const { data: resource, error } = await adminClient
    .from("platform_resources")
    .select(`
      *,
      categories:resource_category_assignments(
        category_id,
        category:resource_categories(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching resource:", error)
    return { error: error.message }
  }

  return { resource }
}

export async function getCategories() {
  const adminClient = createAdminClient()

  const { data: categories, error } = await adminClient
    .from("resource_categories")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return { error: error.message }
  }

  return { categories }
}

// Helper function to extract plain text from TipTap JSON
function extractTextFromTipTap(json: any): string {
  if (!json) return ""

  let text = ""

  function traverse(node: any) {
    if (node.text) {
      text += node.text + " "
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse)
    }
  }

  traverse(json)
  return text.trim()
}
