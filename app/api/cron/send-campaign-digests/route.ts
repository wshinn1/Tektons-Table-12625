import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail, FROM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"
import { EMAIL_TEMPLATES } from "@/lib/email-templates"

// Create Supabase admin client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    console.log("[Campaign Digest Cron] Starting daily campaign digest job...")

    // Get yesterday's date (since we're running at noon EST for yesterday's donations)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDate = yesterday.toISOString().split("T")[0]

    // Get all pending digests for yesterday
    const { data: digests, error: digestError } = await supabase
      .from("campaign_donation_digest")
      .select("*")
      .eq("notification_date", yesterdayDate)
      .is("sent_at", null)

    if (digestError) {
      console.error("[Campaign Digest Cron] Error fetching digests:", digestError)
      return NextResponse.json({ error: digestError.message }, { status: 500 })
    }

    if (!digests || digests.length === 0) {
      console.log("[Campaign Digest Cron] No pending digests found")
      return NextResponse.json({ message: "No pending digests" })
    }

    console.log(`[Campaign Digest Cron] Found ${digests.length} pending digest(s)`)

    let successCount = 0
    let errorCount = 0

    for (const digest of digests) {
      try {
        // Get tenant details
        const { data: tenant } = await supabase
          .from("tenants")
          .select("full_name, email, subdomain")
          .eq("id", digest.tenant_id)
          .single()

        if (!tenant) {
          console.error(`[Campaign Digest Cron] Tenant not found: ${digest.tenant_id}`)
          errorCount++
          continue
        }

        // Get campaign breakdown for yesterday
        const { data: campaignData } = await supabase
          .from("campaign_donations")
          .select(`
            amount,
            campaign_id,
            tenant_campaigns(title, slug)
          `)
          .gte("created_at", yesterdayDate)
          .lt("created_at", new Date().toISOString().split("T")[0])
          .eq("tenant_campaigns.tenant_id", digest.tenant_id)

        // Group by campaign
        const campaignMap = new Map<string, { title: string; slug: string; count: number; total: number }>()

        campaignData?.forEach((donation: any) => {
          const campaignId = donation.campaign_id
          const campaign = donation.tenant_campaigns

          if (campaign) {
            if (!campaignMap.has(campaignId)) {
              campaignMap.set(campaignId, {
                title: campaign.title,
                slug: campaign.slug,
                count: 0,
                total: 0,
              })
            }
            const entry = campaignMap.get(campaignId)!
            entry.count++
            entry.total += Number(donation.amount)
          }
        })

        const campaigns = Array.from(campaignMap.values()).map((campaign) => ({
          title: campaign.title,
          donationCount: campaign.count,
          totalAmount: campaign.total,
          url: `https://${tenant.subdomain}.${process.env.NEXT_PUBLIC_SITE_URL || "tektonstable.com"}/campaigns/${campaign.slug}`,
        }))

        // Send digest email
        const digestEmail = EMAIL_TEMPLATES.campaignDailyDigest({
          tenantName: tenant.full_name,
          campaigns,
          totalAmount: digest.total_amount,
          totalDonations: digest.donation_count,
          date: new Date(yesterdayDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        })

        await sendEmail({
          to: tenant.email,
          from: FROM_EMAIL,
          subject: digestEmail.subject,
          html: digestEmail.html,
          replyTo: REPLY_TO_EMAIL,
        })

        // Mark digest as sent
        await supabase
          .from("campaign_donation_digest")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", digest.id)

        console.log(`[Campaign Digest Cron] Sent digest to ${tenant.email}`)
        successCount++
      } catch (error) {
        console.error(`[Campaign Digest Cron] Error processing digest ${digest.id}:`, error)
        errorCount++
      }
    }

    console.log(`[Campaign Digest Cron] Completed. Success: ${successCount}, Errors: ${errorCount}`)

    return NextResponse.json({
      success: true,
      processed: digests.length,
      successCount,
      errorCount,
    })
  } catch (error) {
    console.error("[Campaign Digest Cron] Fatal error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
