"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getResend } from "@/lib/resend"

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "hello@tektonstable.com"

export async function sendPostNotificationEmails(postId: string, tenantId: string) {
  const supabase = await createServerClient()
  const resend = getResend()

  console.log("[v0] Sending post notifications for post:", postId, "tenant:", tenantId)

  // Get post details
  const { data: post, error: postError } = await supabase.from("blog_posts").select("*").eq("id", postId).single()

  if (postError || !post) {
    console.error("[v0] Post not found:", postError)
    return { error: "Post not found" }
  }

  const isPlatformPost = !tenantId || tenantId === "platform"

  if (isPlatformPost) {
    // Platform post - send to contacts and tenants
    return await sendPlatformPostNotifications(post, supabase, resend)
  }

  // Tenant post - send to tenant's subscribers and supporters
  return await sendTenantPostNotifications(post, tenantId, supabase, resend)
}

async function sendPlatformPostNotifications(post: any, supabase: any, resend: any) {
  console.log("[v0] Sending platform post notifications to contacts and tenants")

  // Get all contacts (platform subscribers)
  const { data: contacts, error: contactsError } = await supabase.from("contacts").select("*")

  // Get all active tenants (they're interested in platform content)
  const { data: tenants, error: tenantsError } = await supabase.from("tenants").select("*").eq("is_active", true)

  if ((contactsError && tenantsError) || (!contacts?.length && !tenants?.length)) {
    console.log("[v0] No contacts or tenants found for platform post")
    return { error: "No recipients found" }
  }

  // Combine and deduplicate recipients by email
  const allRecipients = new Map<string, { email: string; name: string; id: string; type: string }>()

  contacts?.forEach((contact) => {
    if (contact.email && !allRecipients.has(contact.email)) {
      allRecipients.set(contact.email, {
        email: contact.email,
        name: contact.first_name || contact.last_name || "Friend",
        id: contact.id,
        type: "contact",
      })
    }
  })

  tenants?.forEach((tenant) => {
    if (tenant.email && !allRecipients.has(tenant.email)) {
      allRecipients.set(tenant.email, {
        email: tenant.email,
        name: tenant.full_name || "Friend",
        id: tenant.id,
        type: "tenant",
      })
    }
  })

  const recipients = Array.from(allRecipients.values())
  console.log("[v0] Sending to", recipients.length, "recipients for platform post")

  // Post excerpt
  const postExcerpt =
    post.excerpt ||
    (typeof post.content === "string" ? post.content.substring(0, 200) + "..." : "Check out this new post!")

  // Platform post URL
  const postUrl = `https://tektonstable.com/blog/${post.slug}`

  const featuredImageHtml = post.featured_image_url
    ? `
      <div style="margin-bottom: 24px;">
        <img src="${post.featured_image_url}" alt="${post.title}" style="width: 100%; max-width: 560px; height: auto; border-radius: 8px; display: block;" />
      </div>
    `
    : ""

  // Send emails
  const emailPromises = recipients.map(async (recipient) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject: `New post on Tekton's Table: ${post.title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">New Post on Tekton's Table</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #6b7280; margin-bottom: 20px;">Hi ${recipient.name},</p>
                
                <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                  We just published a new post you might enjoy:
                </p>
                
                ${featuredImageHtml}
                
                <div style="background: #f9fafb; padding: 24px; border-left: 4px solid #667eea; border-radius: 4px; margin-bottom: 30px;">
                  <h2 style="color: #111827; margin: 0 0 12px 0; font-size: 22px; font-weight: 600;">${post.title}</h2>
                  <p style="color: #6b7280; margin: 0; font-size: 15px; line-height: 1.6;">${postExcerpt}</p>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${postUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Read the Full Post</a>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 40px;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
                    Thank you for being part of the Tekton's Table community!
                  </p>
                  <p style="font-size: 13px; color: #9ca3af; margin: 0;">
                    You received this email because you're subscribed to updates from Tekton's Table. 
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      // Log the email send
      await supabase.from("email_logs").insert({
        tenant_id: "platform",
        post_id: post.id,
        email_type: "post_notification",
        recipient_email: recipient.email,
        subject: `New post on Tekton's Table: ${post.title}`,
        resend_message_id: data?.id,
        status: error ? "failed" : "sent",
        error_message: error?.message,
        sent_at: error ? null : new Date().toISOString(),
      })

      console.log("[v0] Email sent to:", recipient.email, error ? "FAILED" : "SUCCESS")
      return { success: !error, email: recipient.email, error: error?.message }
    } catch (err: any) {
      console.error("[v0] Error sending email to", recipient.email, err)
      return { success: false, email: recipient.email, error: err.message }
    }
  })

  const results = await Promise.all(emailPromises)
  const successCount = results.filter((r) => r.success).length

  console.log("[v0] Email results:", successCount, "of", recipients.length, "sent successfully")

  return {
    success: true,
    message: `Sent ${successCount} of ${recipients.length} emails`,
    results,
  }
}

async function sendTenantPostNotifications(post: any, tenantId: string, supabase: any, resend: any) {
  // Get tenant details
  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("*").eq("id", tenantId).single()

  if (tenantError || !tenant) {
    console.error("[v0] Tenant not found:", tenantError)
    return { error: "Tenant not found" }
  }

  // Get all email subscribers (followers)
  const { data: subscribers, error: subscribersError } = await supabase
    .from("tenant_email_subscribers")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "active")

  // Get all financial supporters
  const { data: supporters, error: supportersError } = await supabase
    .from("supporters")
    .select("*")
    .eq("tenant_id", tenantId)

  if ((subscribersError && supportersError) || (!subscribers?.length && !supporters?.length)) {
    console.log("[v0] No subscribers or supporters found")
    return { error: "No recipients found" }
  }

  // Combine and deduplicate recipients by email
  const allRecipients = new Map<string, { email: string; name: string; id: string; type: string }>()

  subscribers?.forEach((sub) => {
    if (sub.email && !allRecipients.has(sub.email)) {
      allRecipients.set(sub.email, {
        email: sub.email,
        name: sub.name || "Friend",
        id: sub.id,
        type: "subscriber",
      })
    }
  })

  supporters?.forEach((sup) => {
    if (sup.email && !allRecipients.has(sup.email)) {
      allRecipients.set(sup.email, {
        email: sup.email,
        name: sup.full_name || "Friend",
        id: sup.id,
        type: "supporter",
      })
    }
  })

  const recipients = Array.from(allRecipients.values())
  console.log("[v0] Sending to", recipients.length, "recipients")

  // Post excerpt (first 200 chars of content or provided excerpt)
  const postExcerpt =
    post.excerpt ||
    (typeof post.content === "string" ? post.content.substring(0, 200) + "..." : "Check out this new post!")

  // Post URL
  const postUrl = `https://${tenant.subdomain}.tektonstable.com/blog/${post.slug}`

  // Reply-to email
  const replyToEmail = tenant.personal_reply_email || tenant.email

  const featuredImageHtml = post.featured_image_url
    ? `
      <div style="margin-bottom: 24px;">
        <img src="${post.featured_image_url}" alt="${post.title}" style="width: 100%; max-width: 560px; height: auto; border-radius: 8px; display: block;" />
      </div>
    `
    : ""

  // Send emails
  const emailPromises = recipients.map(async (recipient) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        replyTo: replyToEmail,
        to: recipient.email,
        subject: `New post from ${tenant.full_name}: ${post.title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">New Post</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #6b7280; margin-bottom: 20px;">Hi ${recipient.name},</p>
                
                <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                  ${tenant.full_name} just published a new post you might enjoy:
                </p>
                
                ${featuredImageHtml}
                
                <div style="background: #f9fafb; padding: 24px; border-left: 4px solid #667eea; border-radius: 4px; margin-bottom: 30px;">
                  <h2 style="color: #111827; margin: 0 0 12px 0; font-size: 22px; font-weight: 600;">${post.title}</h2>
                  <p style="color: #6b7280; margin: 0; font-size: 15px; line-height: 1.6;">${postExcerpt}</p>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${postUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Read the Full Post</a>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 40px;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">
                    Thank you for being part of ${tenant.full_name}'s community!
                  </p>
                  <p style="font-size: 13px; color: #9ca3af; margin: 0;">
                    You received this email because you're subscribed to updates from ${tenant.full_name}. 
                    <a href="https://${tenant.subdomain}.tektonstable.com/unsubscribe?email=${recipient.email}" style="color: #667eea; text-decoration: underline;">Unsubscribe</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      // Log the email send
      await supabase.from("email_logs").insert({
        tenant_id: tenantId,
        post_id: post.id,
        supporter_id: recipient.type === "supporter" ? recipient.id : null,
        email_type: "post_notification",
        recipient_email: recipient.email,
        subject: `New post from ${tenant.full_name}: ${post.title}`,
        resend_message_id: data?.id,
        status: error ? "failed" : "sent",
        error_message: error?.message,
        sent_at: error ? null : new Date().toISOString(),
      })

      console.log("[v0] Email sent to:", recipient.email, error ? "FAILED" : "SUCCESS")
      return { success: !error, email: recipient.email, error: error?.message }
    } catch (err: any) {
      console.error("[v0] Error sending email to", recipient.email, err)
      return { success: false, email: recipient.email, error: err.message }
    }
  })

  const results = await Promise.all(emailPromises)
  const successCount = results.filter((r) => r.success).length

  console.log("[v0] Email results:", successCount, "of", recipients.length, "sent successfully")

  return {
    success: true,
    message: `Sent ${successCount} of ${recipients.length} emails`,
    results,
  }
}

export async function updateEmailPreferences(email: string, notifications: boolean) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("supporter_profiles")
    .update({
      email_notifications: notifications,
      unsubscribed_at: notifications ? null : new Date().toISOString(),
    })
    .eq("email", email)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export const sendPostNotification = sendPostNotificationEmails
