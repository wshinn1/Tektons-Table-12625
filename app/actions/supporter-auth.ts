"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail, SUBSCRIBE_EMAIL } from "@/lib/resend"
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
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email so they can log in immediately
    user_metadata: {
      full_name: fullName,
    },
  })

  if (authError) {
    // Handle duplicate email error
    if (authError.message.includes("already been registered")) {
      return { error: "An account with this email already exists. Please sign in instead." }
    }
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  // Create supporter profile using admin client
  const { error: profileError } = await adminClient.from("supporter_profiles").insert({
    id: authData.user.id,
    tenant_id: tenantId,
    email,
    full_name: fullName,
    preferred_language: language,
  })

  if (profileError) {
    // If profile creation fails, delete the auth user to avoid orphaned records
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  // Check if this email has existing donations to link
  const { data: existingSupporter } = await adminClient
    .from("tenant_financial_supporters")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("email", email)
    .single()

  if (existingSupporter) {
    // Update the financial supporter record with the new user_id
    await adminClient
      .from("tenant_financial_supporters")
      .update({ user_id: authData.user.id })
      .eq("id", existingSupporter.id)
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
  const adminClient = createAdminClient()

  // Get tenant info including their email for reply-to
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, full_name, email")
    .eq("subdomain", tenantSlug)
    .single()

  if (tenantError || !tenant) {
    return { error: "Tenant not found" }
  }

  const { data: existingUsers } = await adminClient.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find((u) => u.email === email)

  let userId: string
  let isExistingUser = false

  if (existingUser) {
    // User already exists - use their existing ID
    userId = existingUser.id
    isExistingUser = true

    // Check if they're already in tenant_email_subscribers for this tenant
    const { data: existingSubscriber } = await adminClient
      .from("tenant_email_subscribers")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("email", email)
      .single()

    if (existingSubscriber) {
      // They're already subscribed to this tenant
      return { error: "You're already following this page. Please sign in to view your account." }
    }

    // Check if they have a supporter_profile for this tenant
    const { data: existingProfile } = await adminClient
      .from("supporter_profiles")
      .select("id")
      .eq("id", userId)
      .eq("tenant_id", tenant.id)
      .single()

    if (!existingProfile) {
      // Create supporter profile for this tenant - use insert, not upsert
      // since supporter_profiles primary key is just 'id', not composite
      const { data: anyProfile } = await adminClient.from("supporter_profiles").select("id").eq("id", userId).single()

      if (!anyProfile) {
        // No profile exists at all, create one
        const { error: profileError } = await adminClient.from("supporter_profiles").insert({
          id: userId,
          tenant_id: tenant.id,
          email,
          full_name: fullName || existingUser.user_metadata?.full_name || email.split("@")[0],
          email_notifications: receiveEmails,
        })

        if (profileError) {
          console.error("[v0] Error creating supporter profile for existing user:", profileError)
        }
      }
    }
  } else {
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) {
      if (authError.message.includes("already been registered")) {
        return { error: "An account with this email already exists. Please sign in instead." }
      }
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create user" }
    }

    userId = authData.user.id

    const { error: profileError } = await adminClient.from("supporter_profiles").insert({
      id: userId,
      tenant_id: tenant.id,
      email,
      full_name: fullName,
      email_notifications: receiveEmails,
    })

    if (profileError) {
      // If profile creation fails, delete the auth user to avoid orphaned records
      await adminClient.auth.admin.deleteUser(userId)
      return { error: profileError.message }
    }
  }

  if (receiveEmails) {
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
    }
  }

  const { error: followerError } = await adminClient.from("tenant_followers").upsert(
    {
      tenant_id: tenant.id,
      user_id: userId,
      status: "approved",
      approved_at: new Date().toISOString(),
    },
    {
      onConflict: "tenant_id,user_id",
      ignoreDuplicates: true,
    },
  )

  if (followerError) {
    console.error("[v0] Error adding to tenant_followers:", followerError)
  }

  // Send welcome email (only for new users)
  if (!isExistingUser && receiveEmails) {
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
      const tenantUrl = `https://${tenantSlug}.tektonstable.com`
      const latestPostUrl = latestPost ? `${tenantUrl}/blog/${latestPost.slug}` : undefined

      await sendEmail({
        to: email,
        from: `${tenant.full_name || tenantSlug} via TektonsTable <${SUBSCRIBE_EMAIL}>`,
        replyTo: tenant.email || undefined,
        ...EMAIL_TEMPLATES.welcomeSubscriber({
          subscriberName: fullName,
          tenantName: tenant.full_name || tenantSlug,
          tenantSlug,
          latestPostTitle: latestPost?.title,
          latestPostUrl,
        }),
      })
    } catch (emailError) {
      console.error("[v0] Failed to send welcome email:", emailError)
    }
  }

  revalidatePath("/", "layout")
  revalidatePath("/admin/supporters", "page")

  if (isExistingUser) {
    return {
      success: true,
      message: "You're now following this ministry! Sign in with your existing account to view updates.",
    }
  }

  return { success: true }
}

export async function loginAndFollowTenant({
  email,
  password,
  tenantSlug,
  receiveEmails,
  groupId,
}: {
  email: string
  password: string
  tenantSlug: string
  receiveEmails: boolean
  groupId?: string
}) {
  const supabase = await createServerClient()
  const adminClient = createAdminClient()

  // Authenticate the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: "Invalid email or password. Please try again." }
  }

  if (!authData.user) {
    return { error: "Failed to sign in" }
  }

  const userId = authData.user.id

  // Get tenant info
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, full_name")
    .eq("subdomain", tenantSlug)
    .single()

  if (tenantError || !tenant) {
    return { error: "Tenant not found" }
  }

  // Check if they're already in tenant_email_subscribers
  const { data: existingSubscriber } = await adminClient
    .from("tenant_email_subscribers")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("email", email)
    .single()

  if (existingSubscriber) {
    // Already following
    return { success: true, message: "You're already following this ministry!" }
  }

  const { data: anyProfile } = await adminClient
    .from("supporter_profiles")
    .select("id, full_name")
    .eq("id", userId)
    .single()

  if (!anyProfile) {
    // Create supporter profile for this user
    const { error: profileError } = await adminClient.from("supporter_profiles").insert({
      id: userId,
      tenant_id: tenant.id,
      email,
      full_name: authData.user.user_metadata?.full_name || email.split("@")[0],
      email_notifications: receiveEmails,
    })

    if (profileError) {
      console.error("[v0] Error creating supporter profile:", profileError)
    }
  }

  // Add to email subscribers if opted in
  if (receiveEmails) {
    const { error: subscriberError } = await adminClient.from("tenant_email_subscribers").upsert(
      {
        tenant_id: tenant.id,
        email,
        name: anyProfile?.full_name || authData.user.user_metadata?.full_name || email.split("@")[0],
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
    }
  }

  const { error: followerError } = await adminClient.from("tenant_followers").upsert(
    {
      tenant_id: tenant.id,
      user_id: userId,
      status: "approved",
      approved_at: new Date().toISOString(),
    },
    {
      onConflict: "tenant_id,user_id",
      ignoreDuplicates: true,
    },
  )

  if (followerError) {
    console.error("[v0] Error adding to tenant_followers:", followerError)
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
