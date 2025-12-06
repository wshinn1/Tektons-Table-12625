"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateTenantSettings(data: {
  full_name?: string
  mission_organization?: string
  location?: string
  bio?: string
  personal_reply_email?: string
  email_signature?: string
  language_preference?: string
  is_nonprofit?: boolean
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      full_name: data.full_name,
      mission_organization: data.mission_organization,
      location: data.location,
      bio: data.bio,
      personal_reply_email: data.personal_reply_email,
      email_signature: data.email_signature,
      language_preference: data.language_preference,
      is_nonprofit: data.is_nonprofit,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateNotificationSettings(data: {
  notificationEmail: string | null
  settings: {
    donation_notifications?: boolean
    new_supporter_notifications?: boolean
    monthly_summary?: boolean
    failed_payment_alerts?: boolean
  }
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      notification_email: data.notificationEmail,
      notification_settings: data.settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateHomepageWidgetPreference(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const preference = formData.get("homepage_widget_preference") as string

  const { error } = await supabase
    .from("tenants")
    .update({
      homepage_widget_preference: preference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function deleteTenantAccount(tenantId: string) {
  // Verify the caller is a super admin
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized: Only super admins can delete tenant accounts")
  }

  const adminClient = createAdminClient()

  // First, get the tenant email for confirmation
  const { data: tenant, error: fetchError } = await adminClient
    .from("tenants")
    .select("id, email, subdomain, full_name")
    .eq("id", tenantId)
    .single()

  if (fetchError || !tenant) {
    throw new Error("Tenant not found")
  }

  // Delete tenant record (CASCADE will handle related tables:
  // posts, goals, donations, supporters, newsletters, etc.)
  const { error: deleteError } = await adminClient.from("tenants").delete().eq("id", tenantId)

  if (deleteError) {
    throw new Error(`Failed to delete tenant data: ${deleteError.message}`)
  }

  // Delete the user from Supabase Auth
  // The tenant ID is the same as the user's auth ID
  const { error: authError } = await adminClient.auth.admin.deleteUser(tenantId)

  if (authError) {
    // Log but don't throw - tenant data is already deleted
    console.error(`Warning: Failed to delete auth user ${tenantId}:`, authError.message)
  }

  revalidatePath("/admin/tenants")

  return { success: true, deletedTenant: tenant.full_name }
}

export async function suspendTenantAccount(tenantId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized: Only super admins can suspend tenant accounts")
  }

  const adminClient = createAdminClient()

  // Set tenant as inactive
  const { error } = await adminClient.from("tenants").update({ is_active: false }).eq("id", tenantId)

  if (error) {
    throw new Error(`Failed to suspend tenant: ${error.message}`)
  }

  revalidatePath("/admin/tenants")

  return { success: true }
}

export async function reactivateTenantAccount(tenantId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized: Only super admins can reactivate tenant accounts")
  }

  const adminClient = createAdminClient()

  // Set tenant as active
  const { error } = await adminClient.from("tenants").update({ is_active: true }).eq("id", tenantId)

  if (error) {
    throw new Error(`Failed to reactivate tenant: ${error.message}`)
  }

  revalidatePath("/admin/tenants")

  return { success: true }
}

export async function addFollower(tenantId: string, name: string, email: string, groupId?: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("tenant_email_subscribers").insert({
    tenant_id: tenantId,
    name: name,
    email: email,
    status: "subscribed",
    subscribed_at: new Date().toISOString(),
    group_id: groupId || null,
  })

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "This email is already subscribed" }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/supporters")
  return { success: true }
}

export async function updateBlogWidgetPreference(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const preference = formData.get("blog_widget_preference") as string

  const { error } = await supabase
    .from("tenants")
    .update({
      blog_widget_preference: preference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function requestAccountDeletion() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Mark account for deletion (actual deletion handled by admin)
  const { error } = await supabase
    .from("tenants")
    .update({
      deletion_requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateEmailRecipients(data: {
  recipients: string[]
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      email_recipients: data.recipients,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateBrandingSettings(data: {
  tenantId: string
  faviconUrl: string
  ogImageUrl: string
  siteTitle: string
  siteDescription: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Verify user owns this tenant
  const { data: tenant } = await supabase.from("tenants").select("id, email").eq("id", data.tenantId).single()

  if (!tenant || tenant.email !== user.email) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("tenants")
    .update({
      favicon_url: data.faviconUrl,
      og_image_url: data.ogImageUrl,
      site_title: data.siteTitle,
      site_description: data.siteDescription,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.tenantId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}
