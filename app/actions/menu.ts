"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface MenuItem {
  id: string
  tenant_id: string | null
  label: string
  url: string
  parent_id: string | null
  is_dropdown: boolean
  navigation_side: "left" | "right"
  position: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface NavigationSettings {
  id: string
  logo_type: "image" | "text"
  logo_text: string
  logo_image_url: string
  created_at: string
  updated_at: string
}

export async function getNavigationSettings(): Promise<NavigationSettings | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("navigation_settings").select("*").limit(1).single()

  if (error) {
    console.error("Error fetching navigation settings:", error)
    return null
  }

  return data as NavigationSettings
}

export async function updateNavigationSettings(data: Partial<NavigationSettings>) {
  const supabase = await createServerClient()

  // Get existing settings or create new
  const { data: existing } = await supabase.from("navigation_settings").select("id").limit(1).single()

  if (existing) {
    const { data: settings, error } = await supabase
      .from("navigation_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating navigation settings:", error)
      return { error: error.message }
    }

    revalidatePath("/admin/menu-navigation")
    revalidatePath("/")
    return { settings }
  } else {
    const { data: settings, error } = await supabase.from("navigation_settings").insert(data).select().single()

    if (error) {
      console.error("Error creating navigation settings:", error)
      return { error: error.message }
    }

    revalidatePath("/admin/menu-navigation")
    revalidatePath("/")
    return { settings }
  }
}

export async function getPublishedMenuItems() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .is("tenant_id", null)
    .eq("published", true)
    .order("position", { ascending: true })

  if (error) {
    console.error("Error fetching published menu items:", error)
    return []
  }

  return data as MenuItem[]
}

export async function getMenuItems(tenantId?: string) {
  const supabase = await createServerClient()

  let query = supabase.from("menu_items").select("*").order("position", { ascending: true })

  if (tenantId) {
    query = query.eq("tenant_id", tenantId)
  } else {
    query = query.is("tenant_id", null)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching menu items:", error)
    return []
  }

  return data as MenuItem[]
}

export async function createMenuItem(data: Omit<MenuItem, "id" | "created_at" | "updated_at">) {
  const supabase = await createServerClient()

  const { data: menuItem, error } = await supabase.from("menu_items").insert(data).select().single()

  if (error) {
    console.error("Error creating menu item:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/menu-navigation")
  revalidatePath("/")
  return { menuItem }
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
  const supabase = await createServerClient()

  const { data: menuItem, error } = await supabase
    .from("menu_items")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating menu item:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/menu-navigation")
  revalidatePath("/")
  return { menuItem }
}

export async function deleteMenuItem(id: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("menu_items").delete().eq("id", id)

  if (error) {
    console.error("Error deleting menu item:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/menu-navigation")
  revalidatePath("/")
  return { success: true }
}

export async function reorderMenuItems(items: { id: string; position: number }[]) {
  const supabase = await createServerClient()

  const promises = items.map(({ id, position }) =>
    supabase.from("menu_items").update({ position, updated_at: new Date().toISOString() }).eq("id", id),
  )

  await Promise.all(promises)

  revalidatePath("/admin/menu-navigation")
  revalidatePath("/")
  return { success: true }
}
