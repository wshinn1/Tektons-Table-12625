"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getCategories(tenantId: string) {
  const adminSupabase = createAdminClient()

  const { data: categories, error } = await adminSupabase
    .from("categories")
    .select("id, name, slug")
    .eq("tenant_id", tenantId)
    .order("name")

  if (error) {
    console.error("[v0] Failed to fetch categories:", error)
    return []
  }

  return categories || []
}

export async function createCategory(tenantId: string, nameOrFormData: FormData | string) {
  const supabase = await createServerClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: tenant } = await adminSupabase
    .from("tenants")
    .select("id")
    .eq("id", tenantId)
    .eq("email", user.email)
    .single()

  if (!tenant) throw new Error("Unauthorized - not your tenant")

  // Handle both FormData and string input
  let name: string
  let description: string | null = null
  let icon: string | null = null
  let color: string | null = null
  let is_visible = true

  if (typeof nameOrFormData === "string") {
    name = nameOrFormData
  } else {
    name = nameOrFormData.get("name") as string
    description = nameOrFormData.get("description") as string
    icon = nameOrFormData.get("icon") as string
    color = nameOrFormData.get("color") as string
    is_visible = nameOrFormData.get("is_visible") === "on"
  }

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")

  const { data: category, error } = await adminSupabase
    .from("categories")
    .insert({
      tenant_id: tenantId,
      name,
      slug,
      description,
      icon,
      color,
      is_visible,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Failed to create category:", error)
    throw error
  }

  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/posts")
  revalidatePath("/admin/blog")

  return category
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = await createServerClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: category } = await adminSupabase
    .from("categories")
    .select("tenant_id, tenants!inner(email)")
    .eq("id", categoryId)
    .single()

  if (!category || (category.tenants as any)?.email !== user.email) {
    throw new Error("Unauthorized - not your category")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const icon = formData.get("icon") as string
  const color = formData.get("color") as string
  const is_visible = formData.get("is_visible") === "on"

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")

  const { error } = await adminSupabase
    .from("categories")
    .update({
      name,
      slug,
      description,
      icon,
      color,
      is_visible,
    })
    .eq("id", categoryId)

  if (error) {
    console.error("[v0] Failed to update category:", error)
    throw error
  }

  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/posts")
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createServerClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: category } = await adminSupabase
    .from("categories")
    .select("tenant_id, tenants!inner(email)")
    .eq("id", categoryId)
    .single()

  if (!category || (category.tenants as any)?.email !== user.email) {
    throw new Error("Unauthorized - not your category")
  }

  const { error } = await adminSupabase.from("categories").delete().eq("id", categoryId)

  if (error) {
    console.error("[v0] Failed to delete category:", error)
    throw error
  }

  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/posts")
}
