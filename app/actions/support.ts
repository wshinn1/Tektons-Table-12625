"use server"

import { getResend } from "@/lib/resend"

const SUPPORT_DESTINATION = "weshinn@gmail.com"
const FROM_EMAIL = "support@tektonstable.com"

export async function submitSupportTicket(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const category = formData.get("category") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string
    const chatHistory = formData.get("chatHistory") as string | null

    if (!name || !email || !subject || !message) {
      return { success: false, error: "Please fill in all required fields." }
    }

    const resend = getResend()

    // Format the email content
    const emailContent = `
New Support Ticket

From: ${name} (${email})
Category: ${category || "General"}
Subject: ${subject}

Message:
${message}

${chatHistory ? `\n--- AI Chat History ---\n${chatHistory}\n--- End Chat History ---` : ""}
    `.trim()

    await resend.emails.send({
      from: `Tekton's Table Support <${FROM_EMAIL}>`,
      to: SUPPORT_DESTINATION,
      replyTo: email,
      subject: `Support Ticket: ${subject}`,
      text: emailContent,
    })

    await resend.emails.send({
      from: `Tekton's Table <${FROM_EMAIL}>`,
      to: email,
      subject: `We received your message: ${subject}`,
      text: `Hi ${name},

Thank you for contacting Tekton's Table support. We've received your message and will get back to you within 24 hours.

Your message:
${message}

Best regards,
Tekton's Table Support Team
      `.trim(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error submitting support ticket:", error)
    return { success: false, error: "Failed to send message. Please try again later." }
  }
}

export async function submitTenantSupportRequest({
  email,
  name,
  subject,
  details,
  tenantName,
  subdomain,
}: {
  email: string
  name: string
  subject: string
  details: string
  tenantName: string
  subdomain: string
}) {
  try {
    if (!email || !subject || !details) {
      return { success: false, error: "Please fill in all required fields." }
    }

    const resend = getResend()

    const emailContent = `
Tenant Support Request

Tenant: ${tenantName} (${subdomain})
From: ${name} (${email})
Subject: ${subject}

Details:
${details}
    `.trim()

    await resend.emails.send({
      from: `Tekton's Table Support <${FROM_EMAIL}>`,
      to: SUPPORT_DESTINATION,
      replyTo: email,
      subject: `[Tenant Support] ${subject}`,
      text: emailContent,
    })

    // Send confirmation to the tenant admin
    await resend.emails.send({
      from: `Tekton's Table <${FROM_EMAIL}>`,
      to: email,
      subject: `We received your support request: ${subject}`,
      text: `Hi ${name},

Thank you for reaching out. We've received your support request and will get back to you as soon as possible.

Your request:
${details}

Best regards,
Tekton's Table Support Team
      `.trim(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error submitting tenant support request:", error)
    return { success: false, error: "Failed to send message. Please try again later." }
  }
}

export async function escalateChatToHuman({
  email,
  name,
  chatHistory,
}: {
  email: string
  name?: string
  chatHistory: string
}) {
  try {
    if (!email) {
      return { success: false, error: "Email is required." }
    }

    if (!chatHistory) {
      return { success: false, error: "No chat history to send." }
    }

    const resend = getResend()
    const displayName = name || "A user"

    await resend.emails.send({
      from: `Tekton's Table Support <${FROM_EMAIL}>`,
      to: SUPPORT_DESTINATION,
      replyTo: email,
      subject: `Chat Escalation from ${displayName}`,
      text: `
A user has requested human support after chatting with the AI assistant.

Contact: ${displayName} (${email})

--- Chat Transcript ---
${chatHistory}
--- End Transcript ---

Please follow up with this user via email.
      `.trim(),
    })

    await resend.emails.send({
      from: `Tekton's Table <${FROM_EMAIL}>`,
      to: email,
      subject: `Your support request has been received`,
      text: `Hi${name ? ` ${name}` : ""},

We've received your request and forwarded your conversation to our support team. Someone will get back to you via email within 24 hours.

Thank you for your patience!

Best regards,
Tekton's Table Support Team
      `.trim(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error escalating chat:", error)
    return { success: false, error: "Failed to send request. Please try again." }
  }
}
