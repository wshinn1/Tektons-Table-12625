"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface TenantMenuItem {
  id: string
  tenant_id: string
  label: string
  url: string
  page_id: string | null
  icon: string | null
  sort_order: number
  is_visible: boolean
  is_system: boolean
  open_in_new_tab: boolean
  menu_location: "navbar" | "sidebar_admin" | "sidebar_donor"
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

  const adminSupabase = createAdminClient()
  const { data: tenant } = await adminSupabase.from("tenants").select("email").eq("id", tenantId).single()

  return tenant?.email?.toLowerCase() === user.email?.toLowerCase()
}

// Get all menu items for a tenant
export async function getTenantMenuItems(tenantId: string): Promise<TenantMenuItem[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from("tenant_menu_items")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching tenant menu items:", error)
    return []
  }

  return data || []
}

// Get visible menu items for public display
export async function getVisibleMenuItems(tenantId: string): Promise<TenantMenuItem[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from("tenant_menu_items")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching visible menu items:", error)
    return []
  }

  return data || []
}

// Get menu items by location
export async function getMenuItemsByLocation(
  tenantId: string,
  location: "navbar" | "sidebar_admin" | "sidebar_donor",
): Promise<TenantMenuItem[]> {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from("tenant_menu_items")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("menu_location", location)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching menu items by location:", error)
    return []
  }

  return data || []
}

// Create a new menu item
export async function createTenantMenuItem(
  tenantId: string,
  data: {
    label: string
    url: string
    page_id?: string | null
    icon?: string | null
    is_visible?: boolean
    open_in_new_tab?: boolean
    menu_location?: "navbar" | "sidebar_admin" | "sidebar_donor"
  },
): Promise<{ success: boolean; item?: TenantMenuItem; error?: string }> {
  const isOwner = await verifyTenantOwnership(tenantId)
  if (!isOwner) {
    return { success: false, error: "Unauthorized" }
  }

  const adminSupabase = createAdminClient()

  // Get the highest sort order
  const { data: lastItem } = await adminSupabase
    .from("tenant_menu_items")
    .select("sort_order")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()

  const newSortOrder = (lastItem?.sort_order ?? -1) + 1

  const { data: item, error } = await adminSupabase
    .from("tenant_menu_items")
    .insert({
      tenant_id: tenantId,
      label: data.label,
      url: data.url,
      page_id: data.page_id || null,
      icon: data.icon || null,
      sort_order: newSortOrder,
      is_visible: data.is_visible ?? true,
      is_system: false,
      open_in_new_tab: data.open_in_new_tab ?? false,
      menu_location: data.menu_location ?? "navbar",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating tenant menu item:", error)
    return { success: false, error: "Failed to create menu item" }
  }

  revalidatePath(`/admin/menu`)
  return { success: true, item }
}

// Update a menu item
export async function updateTenantMenuItem(
  itemId: string,
  data: {
    label?: string
    url?: string
    page_id?: string | null
    icon?: string | null
    is_visible?: boolean
    open_in_new_tab?: boolean
    menu_location?: "navbar" | "sidebar_admin" | "sidebar_donor"
  },
): Promise<{ success: boolean; item?: TenantMenuItem; error?: string }> {
  const adminSupabase = createAdminClient()

  // Get the item to verify ownership
  const { data: existingItem } = await adminSupabase
    .from("tenant_menu_items")
    .select("tenant_id, is_system")
    .eq("id", itemId)
    .single()

  if (!existingItem) {
    return { success: false, error: "Menu item not found" }
  }

  const isOwner = await verifyTenantOwnership(existingItem.tenant_id)
  if (!isOwner) {
    return { success: false, error: "Unauthorized" }
  }

  // System items can only have visibility toggled
  const updateData: Record<string, unknown> = {}

  if (existingItem.is_system) {
    // Only allow visibility toggle for system items
    if (typeof data.is_visible === "boolean") {
      updateData.is_visible = data.is_visible
    }
  } else {
    // Custom items can be fully edited
    if (data.label !== undefined) updateData.label = data.label
    if (data.url !== undefined) updateData.url = data.url
    if (data.page_id !== undefined) updateData.page_id = data.page_id
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.is_visible !== undefined) updateData.is_visible = data.is_visible
    if (data.open_in_new_tab !== undefined) updateData.open_in_new_tab = data.open_in_new_tab
    if (data.menu_location !== undefined) updateData.menu_location = data.menu_location
  }

  if (Object.keys(updateData).length === 0) {
    return { success: false, error: "No valid updates provided" }
  }

  const { data: item, error } = await adminSupabase
    .from("tenant_menu_items")
    .update(updateData)
    .eq("id", itemId)
    .select()
    .single()

  if (error) {
    console.error("Error updating tenant menu item:", error)
    return { success: false, error: "Failed to update menu item" }
  }

  revalidatePath(`/admin/menu`)
  return { success: true, item }
}

// Delete a menu item (only non-system items)
export async function deleteTenantMenuItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient()

  // Get the item to verify ownership and check if system
  const { data: existingItem } = await adminSupabase
    .from("tenant_menu_items")
    .select("tenant_id, is_system")
    .eq("id", itemId)
    .single()

  if (!existingItem) {
    return { success: false, error: "Menu item not found" }
  }

  if (existingItem.is_system) {
    return { success: false, error: "System menu items cannot be deleted, only hidden" }
  }

  const isOwner = await verifyTenantOwnership(existingItem.tenant_id)
  if (!isOwner) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await adminSupabase.from("tenant_menu_items").delete().eq("id", itemId)

  if (error) {
    console.error("Error deleting tenant menu item:", error)
    return { success: false, error: "Failed to delete menu item" }
  }

  revalidatePath(`/admin/menu`)
  return { success: true }
}

// Reorder menu items
export async function reorderTenantMenuItems(
  tenantId: string,
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const isOwner = await verifyTenantOwnership(tenantId)
  if (!isOwner) {
    return { success: false, error: "Unauthorized" }
  }

  const adminSupabase = createAdminClient()

  // Update each item's sort order
  const updates = orderedIds.map((id, index) =>
    adminSupabase.from("tenant_menu_items").update({ sort_order: index }).eq("id", id).eq("tenant_id", tenantId),
  )

  const results = await Promise.all(updates)
  const hasError = results.some((r) => r.error)

  if (hasError) {
    console.error("Error reordering menu items")
    return { success: false, error: "Failed to reorder menu items" }
  }

  revalidatePath(`/admin/menu`)
  return { success: true }
}

// Seed default menu items for a tenant (used on tenant creation)
export async function seedDefaultMenuItems(tenantId: string): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient()

  // Check if menu items already exist
  const { data: existing } = await adminSupabase
    .from("tenant_menu_items")
    .select("id")
    .eq("tenant_id", tenantId)
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: true } // Already seeded
  }

  const defaultItems = [
    { label: "Home", url: "/", sort_order: 0, is_system: true, menu_location: "navbar" },
    { label: "About", url: "/about", sort_order: 1, is_system: true, menu_location: "navbar" },
    { label: "Support", url: "/giving", sort_order: 2, is_system: true, menu_location: "navbar" },
    { label: "Subscribe", url: "/subscribe", sort_order: 3, is_system: true, menu_location: "navbar" },
    { label: "Contact", url: "/contact", sort_order: 4, is_system: true, menu_location: "navbar" },
  ]

  const { error } = await adminSupabase.from("tenant_menu_items").insert(
    defaultItems.map((item) => ({
      ...item,
      tenant_id: tenantId,
      is_visible: true,
      open_in_new_tab: false,
    })),
  )

  if (error) {
    console.error("Error seeding default menu items:", error)
    return { success: false, error: "Failed to seed menu items" }
  }

  return { success: true }
}
