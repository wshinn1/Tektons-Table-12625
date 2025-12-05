import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import { render } from "@react-email/render"
import TenantBackupEmail from "@/emails/tenant-backup-success"

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting tenant backups...")
    const supabase = createClient()

    // Get all tenants with backup enabled
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, subdomain, full_name, user_id")
      .eq("backup_enabled", true)

    if (tenantsError) throw tenantsError
    if (!tenants || tenants.length === 0) {
      console.log("[v0] No tenants with backup enabled")
      return NextResponse.json({ message: "No tenants to backup" })
    }

    const results = []

    // Backup each tenant
    for (const tenant of tenants) {
      try {
        console.log(`[v0] Backing up tenant: ${tenant.subdomain}`)

        // Create backup record
        const { data: backupRecord, error: backupError } = await supabase
          .from("backups")
          .insert({
            backup_type: "full",
            backup_category: "tenant",
            tenant_id: tenant.id,
            status: "in_progress",
            started_at: new Date().toISOString(),
            retention_days: 30,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single()

        if (backupError) throw backupError

        // Tables to backup for this tenant
        const tenantData: Record<string, any> = {
          tenant_info: tenant,
          posts: [],
          blog_posts: [],
          support_tiers: [],
          supporters: [],
          followers: [],
          donations: [],
          financial_supporters: [],
          funding_goals: [],
          newsletters: [],
          email_subscribers: [],
          navigation_menu: [],
          giving_settings: [],
          about_page: [],
          campaigns: [],
          contact_submissions: [],
        }

        let totalRecords = 0

        // Backup tenant's posts
        const { data: posts } = await supabase.from("posts").select("*").eq("user_id", tenant.id)
        tenantData.posts = posts || []
        totalRecords += posts?.length || 0

        const { data: blogPosts } = await supabase.from("blog_posts").select("*").eq("author_id", tenant.id)
        tenantData.blog_posts = blogPosts || []
        totalRecords += blogPosts?.length || 0

        // Backup support tiers
        const { data: tiers } = await supabase.from("support_tiers").select("*").eq("user_id", tenant.id)
        tenantData.support_tiers = tiers || []
        totalRecords += tiers?.length || 0

        // Backup supporters
        const { data: supporters } = await supabase.from("supporters").select("*").eq("supported_user_id", tenant.id)
        tenantData.supporters = supporters || []
        totalRecords += supporters?.length || 0

        const { data: followers } = await supabase.from("tenant_followers").select("*").eq("tenant_id", tenant.id)
        tenantData.followers = followers || []
        totalRecords += followers?.length || 0

        // Backup donations
        const { data: donations } = await supabase.from("donations").select("*").eq("tenant_id", tenant.id)
        tenantData.donations = donations || []
        totalRecords += donations?.length || 0

        const { data: financialSupporters } = await supabase
          .from("financial_supporters")
          .select("*")
          .eq("tenant_id", tenant.id)
        tenantData.financial_supporters = financialSupporters || []
        totalRecords += financialSupporters?.length || 0

        // Backup funding goals
        const { data: goals } = await supabase.from("funding_goals").select("*").eq("user_id", tenant.id)
        tenantData.funding_goals = goals || []
        totalRecords += goals?.length || 0

        // Backup newsletters
        const { data: newsletters } = await supabase.from("newsletters").select("*").eq("user_id", tenant.id)
        tenantData.newsletters = newsletters || []
        totalRecords += newsletters?.length || 0

        const { data: emailSubscribers } = await supabase
          .from("email_subscribers")
          .select("*")
          .eq("tenant_id", tenant.id)
        tenantData.email_subscribers = emailSubscribers || []
        totalRecords += emailSubscribers?.length || 0

        const { data: navMenu } = await supabase.from("tenant_navigation_menu").select("*").eq("tenant_id", tenant.id)
        tenantData.navigation_menu = navMenu || []
        totalRecords += navMenu?.length || 0

        const { data: givingSettings } = await supabase
          .from("tenant_giving_settings")
          .select("*")
          .eq("tenant_id", tenant.id)
        tenantData.giving_settings = givingSettings || []
        totalRecords += givingSettings?.length || 0

        const { data: aboutPage } = await supabase.from("tenant_about").select("*").eq("tenant_id", tenant.id)
        tenantData.about_page = aboutPage || []
        totalRecords += aboutPage?.length || 0

        const { data: campaigns } = await supabase.from("tenant_campaigns").select("*").eq("tenant_id", tenant.id)
        tenantData.campaigns = campaigns || []
        totalRecords += campaigns?.length || 0

        const { data: contactSubmissions } = await supabase
          .from("tenant_contact_submissions")
          .select("*")
          .eq("tenant_id", tenant.id)
        tenantData.contact_submissions = contactSubmissions || []
        totalRecords += contactSubmissions?.length || 0

        // Upload to organized Blob folder: /backups/tenants/{tenant-id}/YYYY-MM-DD/
        const now = new Date()
        const dateFolder = now.toISOString().split("T")[0]
        const timestamp = now.toISOString().replace(/[:.]/g, "-")
        const fileName = `backups/tenants/${tenant.id}/${dateFolder}/tenant-${tenant.subdomain}-${timestamp}.json`

        const backupJson = JSON.stringify(tenantData, null, 2)
        const fileSize = Buffer.byteLength(backupJson, "utf8")

        const blob = await put(fileName, backupJson, {
          access: "public",
          addRandomSuffix: false,
        })

        // Update backup record
        await supabase
          .from("backups")
          .update({
            status: "completed",
            blob_url: blob.url,
            blob_key: fileName,
            file_size_bytes: fileSize,
            tables_backed_up: Object.keys(tenantData),
            record_count: totalRecords,
            completed_at: new Date().toISOString(),
          })
          .eq("id", backupRecord.id)

        const { data: user } = await supabase.from("users").select("email").eq("id", tenant.user_id).single()

        // Send email to tenant
        await sendTenantBackupEmail(
          {
            ...tenant,
            name: tenant.full_name,
            email: user?.email,
          },
          {
            backupId: backupRecord.id,
            fileSize,
            recordCount: totalRecords,
            blobUrl: blob.url,
          },
        )

        results.push({
          tenantId: tenant.id,
          subdomain: tenant.subdomain,
          success: true,
          records: totalRecords,
        })

        console.log(`[v0] Tenant backup completed: ${tenant.subdomain} (${totalRecords} records)`)
      } catch (error: any) {
        console.error(`[v0] Tenant backup failed for ${tenant.subdomain}:`, error)
        results.push({
          tenantId: tenant.id,
          subdomain: tenant.subdomain,
          success: false,
          error: error.message,
        })
      }
    }

    console.log(`[v0] All tenant backups completed: ${results.length} tenants processed`)

    return NextResponse.json({
      success: true,
      tenantsProcessed: results.length,
      results,
    })
  } catch (error: any) {
    console.error("[v0] Tenant backup process failed:", error)
    return NextResponse.json({ error: "Tenant backup process failed", details: error.message }, { status: 500 })
  }
}

async function sendTenantBackupEmail(tenant: any, data: any) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set, skipping email")
      return
    }

    const resend = getResend()
    const fromEmail = process.env.RESEND_FROM_EMAIL || "backup@tektonstable.com"

    const emailHtml = render(
      TenantBackupEmail({
        tenantName: tenant.name,
        subdomain: tenant.subdomain,
        backupId: data.backupId,
        fileSize: formatFileSize(data.fileSize),
        recordCount: data.recordCount,
        completedAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
        blobUrl: data.blobUrl,
      }),
    )

    await resend.emails.send({
      from: fromEmail,
      to: tenant.email,
      subject: `✓ Your Tektons Table Site Backup - ${new Date().toLocaleDateString()}`,
      html: emailHtml,
    })

    // Update email sent status
    const supabase = createClient()
    await supabase
      .from("backups")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", data.backupId)

    console.log(`[v0] Backup email sent to ${tenant.email}`)
  } catch (error) {
    console.error(`[v0] Failed to send backup email to ${tenant.email}:`, error)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}
