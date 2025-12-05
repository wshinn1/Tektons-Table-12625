"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getResend } from "@/lib/resend"
import { revalidatePath } from "next/cache"

export async function submitContactMessage(tenantId: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    if (!name || !email || !message) {
      return { success: false, error: "Missing required fields" }
    }

    console.log("[v0] Contact submission - starting for tenant:", tenantId)

    const supabase = createAdminClient()

    const { error: dbError } = await supabase.from("tenant_contact_submissions").insert({
      tenant_id: tenantId,
      name,
      email,
      subject: subject || null,
      message,
      status: "new",
    })

    if (dbError) {
      console.error("[v0] Failed to insert contact submission:", dbError)
      throw dbError
    }

    console.log("[v0] Contact submission saved successfully")

    const { data: tenant } = await supabase
      .from("tenants")
      .select("email, full_name, contact_email_recipients")
      .eq("id", tenantId)
      .single()

    if (tenant) {
      const resend = getResend()

      const recipients = [tenant.email]
      if (tenant.contact_email_recipients) {
        recipients.push(...tenant.contact_email_recipients)
      }

      await resend.emails.send({
        from: "hello@tektonstable.com",
        to: recipients,
        replyTo: email,
        subject: `Contact Form: ${subject || "New Message"}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      })

      await resend.emails.send({
        from: "hello@tektonstable.com",
        to: email,
        subject: `Thanks for contacting ${tenant.full_name}`,
        html: `
          <h2>Thank you for your message!</h2>
          <p>Hi ${name},</p>
          <p>I've received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br>${tenant.full_name}</p>
        `,
      })

      console.log("[v0] Contact emails sent successfully")
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error processing contact form:", error)
    return { success: false, error: "Failed to submit contact message" }
  }
}

export async function updateMessageStatus(messageId: string, status: "new" | "read" | "archived") {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from("tenant_contact_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", messageId)

    if (error) throw error

    revalidatePath("/admin/contact")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating message status:", error)
    return { success: false, error: "Failed to update message status" }
  }
}

export async function deleteContactMessage(messageId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("tenant_contact_submissions").delete().eq("id", messageId)

    if (error) throw error

    revalidatePath("/admin/contact")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting message:", error)
    return { success: false, error: "Failed to delete message" }
  }
}
