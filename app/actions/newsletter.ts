"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getResend } from "@/lib/resend"

export async function getSubscribers(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tenant_email_subscribers")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "subscribed")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function addSubscriber(tenantId: string, email: string, name?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tenant_email_subscribers")
    .insert({
      tenant_id: tenantId,
      email,
      name,
      status: "subscribed", // Auto-subscribe when added
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/admin/newsletter`)
  revalidatePath(`/admin/supporters`)
  return data
}

export async function importSubscribersFromCSV(
  tenantId: string,
  subscribers: Array<{ email: string; name?: string }>,
  groupId?: string,
) {
  const supabase = await createClient()

  const subscribersToInsert = subscribers.map((sub) => ({
    tenant_id: tenantId,
    email: sub.email,
    name: sub.name,
    status: "subscribed",
    group_id: groupId || null,
  }))

  const { data, error } = await supabase
    .from("tenant_email_subscribers")
    .upsert(subscribersToInsert, {
      onConflict: "tenant_id,email",
      ignoreDuplicates: true,
    })
    .select()

  if (error) throw error

  revalidatePath(`/admin/newsletter`)
  revalidatePath(`/admin/supporters`)
  return data
}

export async function unsubscribeEmail(subscriberId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tenant_email_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("id", subscriberId)

  if (error) throw error

  revalidatePath(`/admin/newsletter`)
}

export async function createNewsletter(
  tenantId: string,
  subject: string,
  previewText: string,
  content: string,
  designJson?: any,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tenant_newsletters")
    .insert({
      tenant_id: tenantId,
      subject,
      preview_text: previewText,
      content: designJson ? JSON.stringify({ html: content, design: designJson }) : content,
      status: "draft",
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/admin/newsletter`)
  return data
}

export async function updateNewsletter(
  newsletterId: string,
  updates: {
    subject?: string
    preview_text?: string
    content?: string
    design_json?: any
    status?: string
    scheduled_for?: string
    timezone?: string
    target_groups?: string[]
  },
) {
  const supabase = await createClient()

  const updateData: any = {}

  if (updates.subject !== undefined) updateData.subject = updates.subject
  if (updates.preview_text !== undefined) updateData.preview_text = updates.preview_text
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.design_json !== undefined) updateData.design_json = updates.design_json
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.scheduled_for !== undefined) updateData.scheduled_for = updates.scheduled_for
  if (updates.timezone !== undefined) updateData.timezone = updates.timezone
  if (updates.target_groups !== undefined) updateData.target_groups = updates.target_groups

  const { error } = await supabase.from("tenant_newsletters").update(updateData).eq("id", newsletterId)

  if (error) throw error

  revalidatePath(`/admin/newsletter`)
}

export async function getNewsletters(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tenant_newsletters")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function sendNewsletter(newsletterId: string) {
  const supabase = await createClient()
  const resend = getResend()

  // Get newsletter
  const { data: newsletter, error: newsletterError } = await supabase
    .from("tenant_newsletters")
    .select("*, tenant:tenants(*)")
    .eq("id", newsletterId)
    .single()

  if (newsletterError) throw newsletterError

  const targetGroups = newsletter.target_groups || ["all"]

  let subscribers: any[] = []

  if (targetGroups.includes("all")) {
    // Get all subscribed users
    const { data, error } = await supabase
      .from("tenant_email_subscribers")
      .select("*")
      .eq("tenant_id", newsletter.tenant_id)
      .eq("status", "subscribed")

    if (error) throw error
    subscribers = data || []
  } else {
    // Get subscribers from specific groups
    const allSubscribers = new Map()

    // If "followers" is selected (default group - no group assigned)
    if (targetGroups.includes("followers")) {
      const { data } = await supabase
        .from("tenant_email_subscribers")
        .select("*")
        .eq("tenant_id", newsletter.tenant_id)
        .eq("status", "subscribed")
        .is("group_id", null)

      data?.forEach((s) => allSubscribers.set(s.id, s))
    }

    // Get subscribers from custom groups
    const groupIds = targetGroups.filter((g: string) => g !== "followers" && g !== "all")

    for (const groupId of groupIds) {
      // Get subscribers with this primary group
      const { data: primaryMembers } = await supabase
        .from("tenant_email_subscribers")
        .select("*")
        .eq("group_id", groupId)
        .eq("status", "subscribed")

      primaryMembers?.forEach((m) => allSubscribers.set(m.id, m))

      // Get from junction table
      const { data: members } = await supabase
        .from("subscriber_group_members")
        .select(`
          subscriber:tenant_email_subscribers(*)
        `)
        .eq("group_id", groupId)

      members?.forEach((m: any) => {
        if (m.subscriber?.status === "subscribed") {
          allSubscribers.set(m.subscriber.id, m.subscriber)
        }
      })
    }

    subscribers = Array.from(allSubscribers.values())
  }

  if (!subscribers || subscribers.length === 0) {
    throw new Error("No subscribers found for the selected groups")
  }

  const fromEmail = "hello@tektonstable.com"
  const replyToEmail = newsletter.tenant?.personal_reply_email || newsletter.tenant?.email

  let htmlContent = newsletter.content

  // Parse content if it's JSON
  try {
    const parsed = JSON.parse(newsletter.content)
    if (parsed.html) {
      htmlContent = parsed.html
    }
  } catch {
    // Content is already plain HTML
  }

  let successCount = 0
  let failCount = 0

  for (const subscriber of subscribers) {
    try {
      const emailData: any = {
        from: fromEmail,
        to: subscriber.email,
        subject: newsletter.subject,
        html: htmlContent,
      }

      if (replyToEmail) {
        emailData.reply_to = replyToEmail
      }

      await resend.emails.send(emailData)
      successCount++
    } catch (error) {
      console.error(`[v0] Failed to send newsletter to ${subscriber.email}:`, error)
      failCount++
    }
  }

  const { error: updateError } = await supabase
    .from("tenant_newsletters")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: subscribers.length,
    })
    .eq("id", newsletterId)

  if (updateError) throw updateError

  revalidatePath(`/admin/newsletter`)
  return { success: true, recipients: successCount, failed: failCount }
}

export async function getAllEmailRecipients(tenantId: string) {
  const supabase = await createClient()

  // Get followers from tenant_email_subscribers
  const { data: followers, error: followersError } = await supabase
    .from("tenant_email_subscribers")
    .select("email, name")
    .eq("tenant_id", tenantId)
    .eq("status", "subscribed")

  if (followersError) throw followersError

  // Get financial supporters who are also email subscribers
  const { data: financialSupporters, error: supportersError } = await supabase
    .from("supporters")
    .select("email, full_name")
    .eq("tenant_id", tenantId)
    .not("email", "is", null)

  if (supportersError) throw supportersError

  // Combine and deduplicate by email
  const allRecipients = new Map()

  followers?.forEach((f) => {
    allRecipients.set(f.email.toLowerCase(), { email: f.email, name: f.name })
  })

  financialSupporters?.forEach((s) => {
    if (!allRecipients.has(s.email.toLowerCase())) {
      allRecipients.set(s.email.toLowerCase(), { email: s.email, name: s.full_name })
    }
  })

  return Array.from(allRecipients.values())
}

export async function sendTestNewsletter(newsletterId: string, testEmail: string) {
  const supabase = await createClient()
  const resend = getResend()

  // Get newsletter
  const { data: newsletter, error: newsletterError } = await supabase
    .from("tenant_newsletters")
    .select("*, tenant:tenants(*)")
    .eq("id", newsletterId)
    .single()

  if (newsletterError) throw newsletterError

  const fromEmail = "hello@tektonstable.com"
  const replyToEmail = newsletter.tenant?.personal_reply_email || newsletter.tenant?.email

  let htmlContent = newsletter.content

  // Parse content if it's JSON
  try {
    const parsed = JSON.parse(newsletter.content)
    if (parsed.html) {
      htmlContent = parsed.html
    }
  } catch {
    // Content is already plain HTML
  }

  try {
    const emailData: any = {
      from: fromEmail,
      to: testEmail,
      subject: `[TEST] ${newsletter.subject}`,
      html: htmlContent,
    }

    if (replyToEmail) {
      emailData.reply_to = replyToEmail
    }

    await resend.emails.send(emailData)

    return { ok: true, message: "Test email sent successfully" }
  } catch (error) {
    console.error(`[v0] Failed to send test newsletter to ${testEmail}:`, error)
    throw new Error("Failed to send test email")
  }
}

export async function scheduleNewsletter(newsletterId: string, scheduledFor: string, timezone: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tenant_newsletters")
    .update({
      status: "scheduled",
      scheduled_for: scheduledFor,
      timezone: timezone,
    })
    .eq("id", newsletterId)

  if (error) throw error

  revalidatePath(`/admin/newsletter`)
  return { success: true }
}
