import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    console.log("[v0] Contact API - starting")
    const body = await request.json()
    const { tenant_id, name, email, subject, message } = body

    if (!tenant_id || !name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Contact API - creating admin client")
    const supabase = createAdminClient()

    // Save to database
    console.log("[v0] Contact API - inserting submission")
    const { error: dbError } = await supabase.from("tenant_contact_submissions").insert({
      tenant_id,
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

    console.log("[v0] Contact API - submission saved successfully")

    // Get tenant info for email
    const { data: tenant } = await supabase
      .from("tenants")
      .select("email, full_name, contact_email_recipients")
      .eq("id", tenant_id)
      .single()

    if (tenant) {
      console.log("[v0] Contact API - sending emails")
      // Send email to tenant owner
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

      // Send confirmation to submitter
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

      console.log("[v0] Contact API - emails sent successfully")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error processing contact form:", error)
    return NextResponse.json({ error: "Failed to process contact form" }, { status: 500 })
  }
}
