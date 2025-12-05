"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/resend"
import { EMAIL_TEMPLATES } from "@/lib/email-templates"
import { createAdminClient } from "@/lib/supabase/admin"

export async function signupSupporter({
  email,
  password,
  fullName,
  language,
  tenantId,
}: {
  email: string
  password: string
  fullName: string
  language: string
  tenantId: string
}) {
  const supabase = await createServerClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/supporter/dashboard`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  // Create supporter profile
  const { error: profileError } = await supabase.from("supporter_profiles").insert({
    id: authData.user.id,
    tenant_id: tenantId,
    email,
    full_name: fullName,
    preferred_language: language,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  return { success: true }
}

export async function loginSupporter({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function requestPasswordReset({ email }: { email: string }) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/supporter-reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword({ password }: { password: string }) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function subscribeToTenant({
  email,
  password,
  fullName,
  receiveEmails,
  tenantSlug,
  groupId,
}: {
  email: string
  password: string
  fullName: string
  receiveEmails: boolean
  tenantSlug: string
  groupId?: string
}) {
  const supabase = await createServerClient()

  // Get tenant info
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, full_name")
    .eq("subdomain", tenantSlug)
    .single()

  if (tenantError || !tenant) {
    return { error: "Tenant not found" }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/supporter/dashboard`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  const { error: profileError } = await supabase.from("supporter_profiles").insert({
    id: authData.user.id,
    tenant_id: tenant.id,
    email,
    full_name: fullName,
    email_notifications: receiveEmails,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  if (receiveEmails) {
    const adminClient = createAdminClient()

    const { error: subscriberError } = await adminClient.from("tenant_email_subscribers").upsert(
      {
        tenant_id: tenant.id,
        email,
        name: fullName,
        status: "subscribed",
        subscribed_at: new Date().toISOString(),
        group_id: groupId || null,
      },
      {
        onConflict: "tenant_id,email",
        ignoreDuplicates: false,
      },
    )

    if (subscriberError) {
      console.error("[v0] Error adding subscriber to email list:", subscriberError)
    } else {
      console.log("[v0] Subscriber added to email newsletter system with group:", groupId || "default")
    }

    // Get or create the Email Followers group (system groups don't have tenant_id)
    const { data: group } = await supabase
      .from("contact_groups")
      .select("id")
      .eq("name", "Email Followers")
      .eq("is_system", true)
      .single()

    let contactGroupId = group?.id

    if (!contactGroupId) {
      const { data: newGroup } = await supabase
        .from("contact_groups")
        .insert({
          name: "Email Followers",
          is_system: true,
          description: "All email subscribers",
        })
        .select("id")
        .single()

      contactGroupId = newGroup?.id
    }

    if (contactGroupId) {
      await supabase.from("contact_group_members").insert({
        group_id: contactGroupId,
        contact_id: authData.user.id,
      })
    }

    // Send welcome email
    try {
      const { data: latestPost } = await supabase
        .from("blog_posts")
        .select("title, slug")
        .eq("tenant_id", tenant.id)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .single()

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const latestPostUrl = latestPost ? `${baseUrl}/${tenantSlug}/blog/${latestPost.slug}` : undefined

      await sendEmail({
        to: email,
        from: process.env.RESEND_FROM_EMAIL || "noreply@tektonstable.com",
        ...EMAIL_TEMPLATES.welcomeSubscriber({
          subscriberName: fullName,
          tenantName: tenant.full_name || tenantSlug,
          tenantSlug,
          latestPostTitle: latestPost?.title,
          latestPostUrl,
        }),
      })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
    }
  }

  revalidatePath("/", "layout")
  revalidatePath("/admin/supporters", "page")
  return { success: true }
}

export async function donorSignOut() {
  const supabase = await createServerClient()

  // Sign out from Supabase (global scope clears all sessions)
  const { error } = await supabase.auth.signOut({ scope: "global" })

  if (error) {
    console.error("[v0] Signout error:", error)
  }

  // Add delay to ensure client-side cleanup completes
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Clear cookies manually for both domains
  const cookieStore = await import("next/headers").then((m) => m.cookies())
  const cookiesToClear = ["sb-access-token", "sb-refresh-token", "supabase-auth-token", "sb-auth-token"]

  for (const cookie of cookiesToClear) {
    ;(await cookieStore).delete(cookie)
    ;(await cookieStore).delete({
      name: cookie,
      domain: ".tektonstable.com",
    })
  }

  revalidatePath("/", "layout")
  return { success: true }
}
