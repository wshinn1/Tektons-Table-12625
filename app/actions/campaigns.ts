"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { emailsMatch } from "@/lib/utils"

export interface Campaign {
  id: string
  tenant_id: string
  title: string
  slug: string
  description: string
  goal_amount: number
  current_amount: number
  featured_image_url: string | null
  status: "draft" | "active" | "paused" | "completed"
  show_in_menu: boolean
  show_donor_list: boolean
  allow_anonymous: boolean
  recent_donations_limit: number
  suggested_amounts: number[]
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface CampaignFormData {
  title: string
  description: string
  goal_amount: number
  featured_image_url?: string
  status?: "draft" | "active" | "paused" | "completed"
  show_in_menu?: boolean
  show_donor_list?: boolean
  allow_anonymous?: boolean
  recent_donations_limit?: number
  suggested_amounts?: number[]
  end_date?: string
}

export async function createCampaign(tenantId: string, formData: CampaignFormData) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  // Verify user owns this tenant
  const { data: tenant } = await supabase.from("tenants").select("id").eq("id", tenantId).eq("id", user.id).single()

  if (!tenant) {
    throw new Error("Unauthorized: You can only create campaigns for your own account")
  }

  // Generate slug from title using database function
  const { data: slugData, error: slugError } = await supabase.rpc("generate_campaign_slug", {
    p_title: formData.title,
    p_tenant_id: tenantId,
  })

  if (slugError) {
    console.error("Error generating slug:", slugError)
    throw new Error("Failed to generate campaign URL")
  }

  // Create campaign in tenant_campaigns table
  const { data: campaign, error } = await supabase
    .from("tenant_campaigns")
    .insert({
      tenant_id: tenantId,
      title: formData.title,
      slug: slugData,
      description: formData.description,
      goal_amount: formData.goal_amount,
      current_amount: 0,
      featured_image_url: formData.featured_image_url || null,
      status: formData.status || "draft",
      show_in_menu: formData.show_in_menu ?? true,
      show_donor_list: formData.show_donor_list ?? true,
      allow_anonymous: formData.allow_anonymous ?? true,
      recent_donations_limit: formData.recent_donations_limit ?? 10,
      suggested_amounts: formData.suggested_amounts || [25, 50, 100, 250, 500],
      end_date: formData.end_date || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating campaign:", error)
    throw new Error("Failed to create campaign")
  }

  revalidatePath(`/admin/campaigns`)
  revalidatePath(`/campaigns`)

  return campaign
}

export async function updateCampaign(campaignId: string, formData: Partial<CampaignFormData>) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  // Verify user owns this campaign
  const { data: campaign } = await supabase
    .from("tenant_campaigns")
    .select("tenant_id, slug")
    .eq("id", campaignId)
    .single()

  if (!campaign || campaign.tenant_id !== user.id) {
    throw new Error("Unauthorized: You can only update your own campaigns")
  }

  // If title is being updated, regenerate slug
  const updateData: any = { ...formData }
  if (formData.title) {
    const { data: slugData } = await supabase.rpc("generate_campaign_slug", {
      p_title: formData.title,
      p_tenant_id: campaign.tenant_id,
    })
    updateData.slug = slugData
  }

  const { data: updatedCampaign, error } = await supabase
    .from("tenant_campaigns")
    .update(updateData)
    .eq("id", campaignId)
    .select()
    .single()

  if (error) {
    console.error("Error updating campaign:", error)
    throw new Error("Failed to update campaign")
  }

  revalidatePath(`/admin/campaigns`)
  revalidatePath(`/campaigns/${updatedCampaign.slug}`)
  revalidatePath(`/campaigns`)

  return updatedCampaign
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  // Verify user owns this campaign
  const { data: campaign } = await supabase.from("tenant_campaigns").select("tenant_id").eq("id", campaignId).single()

  if (!campaign || campaign.tenant_id !== user.id) {
    throw new Error("Unauthorized: You can only delete your own campaigns")
  }

  const { error } = await supabase.from("tenant_campaigns").delete().eq("id", campaignId)

  if (error) {
    console.error("Error deleting campaign:", error)
    throw new Error("Failed to delete campaign")
  }

  revalidatePath(`/admin/campaigns`)
  revalidatePath(`/campaigns`)

  return { success: true }
}

export async function linkDonationToCampaign(donationId: string, campaignId: string, amount: number) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Verify campaign belongs to user
  const { data: campaign } = await supabase
    .from("tenant_campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("tenant_id", user.id)
    .single()

  if (!campaign) throw new Error("Campaign not found")

  const { error } = await supabase.from("campaign_donations").insert({
    campaign_id: campaignId,
    donation_id: donationId,
    amount,
  })

  if (error) throw new Error(error.message)

  revalidatePath("/admin/campaigns")
  return { success: true }
}

export async function getCampaignBySlug(tenantId: string, slug: string) {
  const supabase = await createServerClient()

  const { data: campaign, error } = await supabase
    .from("tenant_campaigns")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("Error fetching campaign:", error)
    return null
  }

  return campaign as Campaign
}

export async function getActiveCampaigns(tenantId: string) {
  const supabase = await createServerClient()

  const { data: campaigns, error } = await supabase
    .from("tenant_campaigns")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching campaigns:", error)
    return []
  }

  return campaigns as Campaign[]
}

export async function getAllCampaigns(tenantId: string) {
  const supabase = await createServerClient()

  const { data: campaigns, error } = await supabase
    .from("tenant_campaigns")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching campaigns:", error)
    return []
  }

  return campaigns as Campaign[]
}

export async function pauseCampaign(campaignId: string) {
  return updateCampaign(campaignId, { status: "paused" })
}

export async function completeCampaign(campaignId: string) {
  return updateCampaign(campaignId, { status: "completed" })
}

export async function getCampaignDonations(campaignId: string, limit = 10) {
  const supabase = await createServerClient()

  const { data: donations, error } = await supabase
    .from("campaign_donations")
    .select(
      `
      *,
      donation:donations (
        id,
        amount,
        created_at,
        supporter:supporters (
          full_name,
          email
        )
      )
    `,
    )
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching campaign donations:", error)
    return []
  }

  return donations
}

export async function getCampaignStats(campaignId: string) {
  const supabase = await createServerClient()

  // Get campaign details
  const { data: campaign } = await supabase.from("tenant_campaigns").select("*").eq("id", campaignId).single()

  if (!campaign) {
    return null
  }

  // Get donation count
  const { count: donationCount } = await supabase
    .from("campaign_donations")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaignId)

  // Calculate progress percentage
  const progressPercentage = campaign.goal_amount > 0 ? (campaign.current_amount / campaign.goal_amount) * 100 : 0

  return {
    campaign,
    donationCount: donationCount || 0,
    progressPercentage: Math.min(progressPercentage, 100),
  }
}

export async function updateCampaignNotificationPreference(
  tenantId: string,
  preference: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify tenant ownership
    const { data: tenant } = await supabase.from("tenants").select("email").eq("id", tenantId).single()

    if (!tenant || !emailsMatch(tenant.email, user.email)) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate preference
    if (!["immediate", "daily", "off"].includes(preference)) {
      return { success: false, error: "Invalid preference value" }
    }

    const { error } = await supabase
      .from("tenants")
      .update({ campaign_notification_preference: preference })
      .eq("id", tenantId)

    if (error) throw error

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating notification preference:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update preference",
    }
  }
}
