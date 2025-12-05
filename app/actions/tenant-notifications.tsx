"use server"

import { getResend } from "@/lib/resend"

export async function notifyNewTenantCreated({
  tenantName,
  subdomain,
  email,
  missionOrganization,
  location,
  ministryFocus,
}: {
  tenantName: string
  subdomain: string
  email: string
  missionOrganization?: string
  location?: string
  ministryFocus?: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set, skipping new tenant notification")
      return { success: false, error: "Email not configured" }
    }

    const resend = getResend()

    const tenantSiteUrl = `https://${subdomain}.tektonstable.com`
    const adminUrl = `https://${subdomain}.tektonstable.com/admin`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
          New Tenant Site Created!
        </h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #4F46E5; margin-top: 0;">${tenantName}</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Subdomain:</strong></td>
              <td style="padding: 8px 0;">${subdomain}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            ${
              missionOrganization
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Organization:</strong></td>
              <td style="padding: 8px 0;">${missionOrganization}</td>
            </tr>
            `
                : ""
            }
            ${
              location
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Location:</strong></td>
              <td style="padding: 8px 0;">${location}</td>
            </tr>
            `
                : ""
            }
            ${
              ministryFocus
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Ministry Focus:</strong></td>
              <td style="padding: 8px 0;">${ministryFocus}</td>
            </tr>
            `
                : ""
            }
          </table>
        </div>
        
        <div style="margin: 20px 0;">
          <p><strong>Tenant Site:</strong> <a href="${tenantSiteUrl}">${tenantSiteUrl}</a></p>
          <p><strong>Admin Dashboard:</strong> <a href="${adminUrl}">${adminUrl}</a></p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #888; font-size: 12px;">
          This notification was sent automatically when a new tenant created their site on Tekton's Table.
        </p>
      </div>
    `

    await resend.emails.send({
      from: "Newtenant@tektonstable.com",
      to: "weshinn@gmail.com",
      subject: `New Tenant: ${tenantName} (${subdomain}.tektonstable.com)`,
      html,
    })

    console.log("[v0] New tenant notification email sent for:", subdomain)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Failed to send new tenant notification:", error)
    return { success: false, error: error.message }
  }
}
