"use server"

import { getResend, HELLO_EMAIL } from "@/lib/resend"

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

export async function sendTenantWelcomeEmail({
  tenantName,
  subdomain,
  email,
}: {
  tenantName: string
  subdomain: string
  email: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set, skipping tenant welcome email")
      return { success: false, error: "Email not configured" }
    }

    const resend = getResend()

    const tenantSiteUrl = `https://${subdomain}.tektonstable.com`
    const adminUrl = `https://${subdomain}.tektonstable.com/admin`
    const premiumResourcesUrl = `https://tektonstable.com/resources`
    const premiumBlogUrl = `https://tektonstable.com/blog`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #111827; font-size: 28px; margin: 0 0 8px 0;">Welcome to Tekton's Table!</h1>
              <p style="color: #6b7280; font-size: 16px; margin: 0;">Your ministry site is ready</p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${tenantName},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Congratulations on creating your Tekton's Table site! We're thrilled to partner with you in building sustainable support for your ministry.
            </p>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #f59e0b;">
              <h2 style="color: #92400e; font-size: 18px; margin: 0 0 12px 0; display: flex; align-items: center;">
                🎁 Your Free Gift: 1 Month of Premium Resources
              </h2>
              <p style="color: #78350f; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                As a thank you for joining Tekton's Table, you have <strong>one free month</strong> of access to all our Premium Resources, including:
              </p>
              <ul style="color: #78350f; font-size: 14px; line-height: 1.8; margin: 0 0 16px 0; padding-left: 20px;">
                <li>150,000+ words of fundraising guides and strategies</li>
                <li>Donor communication templates and best practices</li>
                <li>Ministry leadership content and training</li>
                <li>Exclusive articles on sustainable fundraising</li>
              </ul>
              <p style="color: #78350f; font-size: 14px; margin: 0;">
                Your free trial starts when you subscribe. Just click "Subscribe Now" on any premium resource and you'll get 30 days free!
              </p>
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="color: #111827; font-size: 16px; margin: 0 0 16px 0;">Your Site Details</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="color: #6b7280; padding: 4px 0; font-size: 14px;">Your Site:</td>
                  <td style="padding: 4px 0;"><a href="${tenantSiteUrl}" style="color: #4f46e5; text-decoration: none; font-size: 14px;">${tenantSiteUrl}</a></td>
                </tr>
                <tr>
                  <td style="color: #6b7280; padding: 4px 0; font-size: 14px;">Admin Dashboard:</td>
                  <td style="padding: 4px 0;"><a href="${adminUrl}" style="color: #4f46e5; text-decoration: none; font-size: 14px;">${adminUrl}</a></td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${premiumResourcesUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-right: 12px;">
                Explore Premium Resources
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
              <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Quick Start Tips</h3>
              <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Complete your profile in the Admin Dashboard</li>
                <li>Share your first blog post with your supporters</li>
                <li>Connect your Stripe account to receive donations</li>
                <li>Explore our premium fundraising guides to boost your support</li>
              </ol>
            </div>

            <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin-top: 24px; text-align: center;">
              <p style="color: #1e40af; font-size: 14px; margin: 0 0 8px 0;">
                <strong>About Tekton's Table</strong>
              </p>
              <p style="color: #3b82f6; font-size: 13px; margin: 0; line-height: 1.6;">
                We help missionaries and ministry workers build long-term, sustainable fundraising so they can focus on their calling to positively impact the world.
              </p>
              <a href="https://tektonstable.com" style="color: #1e40af; font-size: 13px; margin-top: 8px; display: inline-block;">Learn more about Tekton's Table →</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 32px;">
              Questions? Just reply to this email - we're here to help!
            </p>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
            © ${new Date().getFullYear()} Tekton's Table. All rights reserved.
          </p>
        </body>
      </html>
    `

    await resend.emails.send({
      from: `Tekton's Table <${HELLO_EMAIL}>`,
      to: email,
      subject: `Welcome to Tekton's Table - Your Free Month of Premium Resources Awaits! 🎁`,
      html,
    })

    console.log("[v0] Tenant welcome email sent to:", email)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Failed to send tenant welcome email:", error)
    return { success: false, error: error.message }
  }
}
