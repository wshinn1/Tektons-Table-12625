"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function requestPageBuilder(tenantSubdomain: string) {
  const supabase = await createClient()

  try {
    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name, subdomain, primary_contact_email, page_builder_requested")
      .eq("subdomain", tenantSubdomain)
      .single()

    if (tenantError || !tenant) {
      return { success: false, error: "Tenant not found" }
    }

    // Check if already requested
    if (tenant.page_builder_requested) {
      return { success: false, error: "Page builder already requested" }
    }

    // Update tenant to mark request
    const { error: updateError } = await supabase
      .from("tenants")
      .update({
        page_builder_requested: true,
        page_builder_requested_at: new Date().toISOString(),
      })
      .eq("subdomain", tenantSubdomain)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Send email notification to admin
    try {
      await resend.emails.send({
        from: "Tekton's Table <notifications@tektonstable.com>",
        to: process.env.ADMIN_EMAIL || "admin@tektonstable.com",
        subject: `Custom Page Builder Request - ${tenant.name}`,
        html: `
          <h2>New Custom Page Builder Request</h2>
          <p>A tenant has requested access to the custom page builder.</p>
          <h3>Tenant Details:</h3>
          <ul>
            <li><strong>Tenant Name:</strong> ${tenant.name}</li>
            <li><strong>Subdomain:</strong> ${tenant.subdomain}</li>
            <li><strong>Contact Email:</strong> ${tenant.primary_contact_email || "Not provided"}</li>
            <li><strong>Requested At:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <h3>Next Steps:</h3>
          <ol>
            <li>Create a new Plasmic project at <a href="https://studio.plasmic.app">studio.plasmic.app</a></li>
            <li>Get the Project ID and API Token from Plasmic</li>
            <li>Update the tenant's Plasmic credentials in the database:
              <pre>
UPDATE tenants 
SET plasmic_project_id = 'PROJECT_ID',
    plasmic_api_token = 'API_TOKEN'
WHERE subdomain = '${tenant.subdomain}';
              </pre>
            </li>
            <li>Configure the app host URL in Plasmic to: https://${tenant.subdomain}.tektonstable.com/plasmic-host</li>
          </ol>
        `,
      })
    } catch (emailError) {
      console.error("[v0] Failed to send email notification:", emailError)
      // Don't fail the request if email fails
    }

    revalidatePath(`/${tenantSubdomain}/admin/settings`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error requesting page builder:", error)
    return { success: false, error: "Failed to request page builder" }
  }
}

export async function updatePlasmiSettings(
  tenantSubdomain: string,
  plasmic_project_id: string | null,
  plasmic_api_token: string | null,
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("tenants")
      .update({
        plasmic_project_id,
        plasmic_api_token,
      })
      .eq("subdomain", tenantSubdomain)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/${tenantSubdomain}/admin/settings`)
    revalidatePath(`/${tenantSubdomain}/admin/pages`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating Plasmic settings:", error)
    return { success: false, error: "Failed to update Plasmic settings" }
  }
}

export async function deleteTenantAccount(tenantId: string) {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("full_name, subdomain, id")
      .eq("id", tenantId)
      .single()

    if (tenantError || !tenant) {
      return { success: false, error: "Tenant not found" }
    }

    // Delete tenant (cascading deletes will handle related data)
    const { error: deleteError } = await supabase.from("tenants").delete().eq("id", tenantId)

    if (deleteError) {
      console.error("[v0] Error deleting tenant:", deleteError)
      return { success: false, error: deleteError.message }
    }

    // Delete user account from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(tenantId)

    if (authError) {
      console.error("[v0] Error deleting auth user:", authError)
      // Don't fail the entire operation if auth deletion fails
    }

    revalidatePath("/admin/tenants")
    return { success: true, deletedTenant: tenant.full_name }
  } catch (error) {
    console.error("[v0] Error in deleteTenantAccount:", error)
    return { success: false, error: "Failed to delete account" }
  }
}

export async function updateTenantSettings(settings: {
  tenantId: string
  full_name?: string
  email?: string
  bio?: string
  location?: string
  mission_organization?: string
  ministry_focus?: string
  profile_image_url?: string
  primary_color?: string
}) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== settings.tenantId) {
      return { success: false, error: "Unauthorized" }
    }

    const { tenantId, ...updateData } = settings

    const { error } = await supabase.from("tenants").update(updateData).eq("id", tenantId)

    if (error) {
      console.error("[v0] Error updating tenant settings:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/[tenant]/admin/settings`, "page")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateTenantSettings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

export async function addFollower(tenantId: string, name: string, email: string, groupId?: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== tenantId) {
      return { success: false, error: "Unauthorized" }
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from("tenant_followers")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("user_id", email) // Using email as identifier
      .single()

    if (existing) {
      return { success: false, error: "Follower already exists" }
    }

    // Create follower
    const { error } = await supabase.from("tenant_followers").insert({
      tenant_id: tenantId,
      user_id: email,
      status: "approved",
      approved_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error adding follower:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/[tenant]/admin/supporters`, "page")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in addFollower:", error)
    return { success: false, error: "Failed to add follower" }
  }
}

export async function updateNotificationSettings(settings: {
  tenantId: string
  emailNotifications?: boolean
  campaignNotifications?: boolean
  donationNotifications?: boolean
}) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== settings.tenantId) {
      return { success: false, error: "Unauthorized" }
    }

    const { tenantId, ...updateData } = settings

    const { error } = await supabase
      .from("tenants")
      .update({
        campaign_notification_preference: settings.campaignNotifications ? "enabled" : "disabled",
      })
      .eq("id", tenantId)

    if (error) {
      console.error("[v0] Error updating notification settings:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/[tenant]/admin/settings`, "page")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateNotificationSettings:", error)
    return { success: false, error: "Failed to update notification settings" }
  }
}

export async function updateBlogWidgetPreference(formData: FormData) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const preference = formData.get("preference") as string

    const { error } = await supabase
      .from("tenant_giving_settings")
      .update({ blog_widget_preference: preference })
      .eq("tenant_id", user.id)

    if (error) {
      console.error("[v0] Error updating blog widget preference:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/[tenant]/admin/settings`, "page")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateBlogWidgetPreference:", error)
    return { success: false, error: "Failed to update preference" }
  }
}

export async function updateBrandingSettings(settings: {
  tenantId: string
  faviconUrl: string
  ogImageUrl: string
  siteTitle: string
  siteDescription: string
}) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== settings.tenantId) {
      return { success: false, error: "Unauthorized" }
    }

    const { error } = await supabase
      .from("tenants")
      .update({
        favicon_url: settings.faviconUrl,
        og_image_url: settings.ogImageUrl,
        site_title: settings.siteTitle,
        site_description: settings.siteDescription,
      })
      .eq("id", settings.tenantId)

    if (error) {
      console.error("[v0] Error updating branding settings:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/[tenant]/admin/settings`, "page")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateBrandingSettings:", error)
    return { success: false, error: "Failed to update branding settings" }
  }
}

export async function requestAccountDeletion(tenantId: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== tenantId) {
      throw new Error("Unauthorized")
    }

    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("full_name, email, subdomain")
      .eq("id", tenantId)
      .single()

    if (tenantError || !tenant) {
      throw new Error("Tenant not found")
    }

    // Send email notification to admin
    try {
      await resend.emails.send({
        from: "Tekton's Table <notifications@tektonstable.com>",
        to: process.env.ADMIN_EMAIL || "admin@tektonstable.com",
        subject: `Account Deletion Request - ${tenant.full_name}`,
        html: `
          <h2>Account Deletion Request</h2>
          <p>A tenant has requested account deletion.</p>
          <h3>Tenant Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${tenant.full_name}</li>
            <li><strong>Email:</strong> ${tenant.email}</li>
            <li><strong>Subdomain:</strong> ${tenant.subdomain}</li>
            <li><strong>Tenant ID:</strong> ${tenantId}</li>
            <li><strong>Requested At:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        `,
      })
    } catch (emailError) {
      console.error("[v0] Failed to send deletion request email:", emailError)
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in requestAccountDeletion:", error)
    throw error
  }
}

export async function updateEmailRecipients(tenantId: string, recipients: string[]) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== tenantId) {
      throw new Error("Unauthorized")
    }

    const { error } = await supabase.from("tenants").update({ contact_email_recipients: recipients }).eq("id", tenantId)

    if (error) {
      console.error("[v0] Error updating email recipients:", error)
      throw new Error(error.message)
    }

    revalidatePath(`/[tenant]/admin/settings`, "page")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateEmailRecipients:", error)
    throw error
  }
}

export async function updateHomepageWidgetPreference(formData: FormData) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const preference = formData.get("preference") as string

    const { error } = await supabase
      .from("tenant_giving_settings")
      .update({ homepage_widget_preference: preference })
      .eq("tenant_id", user.id)

    if (error) {
      console.error("[v0] Error updating homepage widget preference:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/[tenant]/admin/settings`, "page")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateHomepageWidgetPreference:", error)
    return { success: false, error: "Failed to update preference" }
  }
}

export async function saveNewsletterFromName(tenantId: string, fromName: string) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: tenantCheck } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .eq("email", user.email!)
      .maybeSingle()

    if (!tenantCheck) throw new Error("Unauthorized")

    const { error } = await supabase
      .from("tenants")
      .update({ newsletter_from_name: fromName.trim() })
      .eq("id", tenantId)
    if (error) throw new Error(error.message)
    revalidatePath(`/[tenant]/admin/settings`, "page")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to save" }
  }
}

export async function saveBlogViewLayout(tenantId: string, layout: "grid" | "list") {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: tenantCheck } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .eq("email", user.email!)
      .maybeSingle()

    if (!tenantCheck) throw new Error("Unauthorized")

    const { error } = await supabase.from("tenants").update({ blog_view_layout: layout }).eq("id", tenantId)
    if (error) throw new Error(error.message)
    revalidatePath(`/[tenant]/blog`, "page")
    revalidatePath(`/[tenant]/admin/blog-view`, "page")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to save" }
  }
}
