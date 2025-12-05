import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"
import { getResend } from "@/lib/resend"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const resend = getResend()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get newsletter
    const { data: newsletter, error: newsletterError } = await supabase
      .from("admin_newsletters")
      .select("*")
      .eq("id", id)
      .single()

    if (newsletterError) throw newsletterError

    // Get all contacts from target groups
    const { data: contacts, error: contactsError } = await supabase
      .from("contact_group_members")
      .select("contact_id, contacts(*)")
      .in("group_id", newsletter.target_groups)

    if (contactsError) throw contactsError

    // Deduplicate contacts
    const uniqueContacts = Array.from(new Map(contacts.map((item: any) => [item.contacts.id, item.contacts])).values())

    // Update newsletter status
    await supabase
      .from("admin_newsletters")
      .update({
        status: "sending",
        recipient_count: uniqueContacts.length,
      })
      .eq("id", id)

    // Create recipient records
    const recipients = uniqueContacts.map((contact: any) => ({
      newsletter_id: id,
      contact_id: contact.id,
      status: "pending",
    }))

    const { data: createdRecipients } = await supabase.from("admin_newsletter_recipients").insert(recipients).select()

    // Send emails
    let sent = 0
    let failed = 0

    for (const recipient of createdRecipients || []) {
      const contact = uniqueContacts.find((c: any) => c.id === recipient.contact_id)
      if (!contact) continue

      try {
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: contact.email,
          subject: newsletter.subject,
          html: newsletter.content,
        })

        if (emailError) throw emailError

        await supabase
          .from("admin_newsletter_recipients")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            resend_message_id: emailData?.id,
          })
          .eq("id", recipient.id)

        sent++
      } catch (error) {
        console.error(`Failed to send to ${contact.email}:`, error)
        await supabase
          .from("admin_newsletter_recipients")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", recipient.id)

        failed++
      }
    }

    // Update newsletter final status
    await supabase
      .from("admin_newsletters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        sent_count: sent,
        failed_count: failed,
      })
      .eq("id", id)

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: uniqueContacts.length,
    })
  } catch (error) {
    console.error("[Newsletter Send]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
