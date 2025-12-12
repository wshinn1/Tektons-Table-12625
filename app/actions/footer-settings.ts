"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface FooterLink {
  label: string
  url: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterSettings {
  id: string
  site_title: string
  site_subtitle: string
  copyright_text: string
  menu_columns: FooterColumn[]
  created_at: string
  updated_at: string
}

export async function getFooterSettings(): Promise<FooterSettings | null> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("footer_settings").select("*").single()

    if (error) {
      console.error("Error fetching footer settings:", error)
      return null
    }

    if (data && typeof data.menu_columns === "string") {
      data.menu_columns = JSON.parse(data.menu_columns)
    }

    if (!data.menu_columns || !Array.isArray(data.menu_columns)) {
      data.menu_columns = [
        {
          title: "Product",
          links: [
            { label: "Features", url: "/features" },
            { label: "Pricing", url: "/pricing" },
            { label: "Example", url: "/example" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", url: "/about" },
            { label: "Privacy", url: "/privacy" },
            { label: "Terms", url: "/terms" },
          ],
        },
        {
          title: "Connect",
          links: [
            { label: "Contact", url: "/contact" },
            { label: "Blog", url: "/blog" },
            { label: "Login", url: "/auth/login" },
          ],
        },
      ]
    }

    return data as FooterSettings
  } catch (error) {
    console.error("Error in getFooterSettings:", error)
    return null
  }
}

export async function updateFooterSettings(
  settings: Partial<FooterSettings>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: isAdmin } = await supabase.from("super_admins").select("id").eq("user_id", user.id).single()

    if (!isAdmin) {
      return { success: false, error: "Not authorized" }
    }

    // Update footer settings
    const { error } = await supabase
      .from("footer_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id!)

    if (error) {
      console.error("Error updating footer settings:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Error in updateFooterSettings:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
