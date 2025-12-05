"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function updateNonprofitStatus(
  tenantId: string,
  data: {
    isRegisteredNonprofit: boolean
    nonprofitName?: string | null
    nonprofitEin?: string | null
    nonprofitAddress?: string | null
    nonprofitExemptionLetterUrl?: string | null
  },
) {
  try {
    const supabase = await createServerClient()

    // Verify the user owns this tenant
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .eq("email", user.email)
      .single()

    if (!tenant) {
      return { success: false, error: "Unauthorized" }
    }

    // Update tenant with non-profit information
    const { error } = await supabase
      .from("tenants")
      .update({
        is_registered_nonprofit: data.isRegisteredNonprofit,
        nonprofit_name: data.nonprofitName,
        nonprofit_ein: data.nonprofitEin,
        nonprofit_address: data.nonprofitAddress,
        nonprofit_exemption_letter_url: data.nonprofitExemptionLetterUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId)

    if (error) {
      console.error("Error updating non-profit status:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateNonprofitStatus:", error)
    return { success: false, error: "Failed to update non-profit status" }
  }
}

export async function submitNonprofitApplication(
  tenantId: string,
  data: {
    nonprofitName: string
    nonprofitEin: string
    nonprofitAddress: string
    nonprofitExemptionLetterUrl: string
  },
) {
  try {
    const supabase = await createServerClient()

    // Verify the user owns this tenant
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .eq("email", user.email)
      .single()

    if (!tenant) {
      return { success: false, error: "Unauthorized" }
    }

    // Submit application for review
    const { error } = await supabase
      .from("tenants")
      .update({
        nonprofit_status: "pending",
        nonprofit_name: data.nonprofitName,
        nonprofit_ein: data.nonprofitEin,
        nonprofit_address: data.nonprofitAddress,
        nonprofit_exemption_letter_url: data.nonprofitExemptionLetterUrl,
        nonprofit_submitted_at: new Date().toISOString(),
        is_registered_nonprofit: false, // Not active until approved
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId)

    if (error) {
      console.error("Error submitting non-profit application:", error)
      return { success: false, error: error.message }
    }

    // TODO: Send email notification to super admin about new application
    // TODO: Send confirmation email to missionary

    return { success: true }
  } catch (error) {
    console.error("Error in submitNonprofitApplication:", error)
    return { success: false, error: "Failed to submit application" }
  }
}

export async function approveNonprofitApplication(tenantId: string) {
  try {
    const supabase = await createServerClient()

    // Verify user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is super admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || userData.role !== "super_admin") {
      return { success: false, error: "Unauthorized - Super admin access required" }
    }

    // Approve the application
    const { error } = await supabase
      .from("tenants")
      .update({
        nonprofit_status: "approved",
        is_registered_nonprofit: true,
        nonprofit_verified_at: new Date().toISOString(),
        nonprofit_reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId)

    if (error) {
      console.error("Error approving non-profit application:", error)
      return { success: false, error: error.message }
    }

    // TODO: Send approval email to missionary

    return { success: true }
  } catch (error) {
    console.error("Error in approveNonprofitApplication:", error)
    return { success: false, error: "Failed to approve application" }
  }
}

export async function rejectNonprofitApplication(tenantId: string, reason: string) {
  try {
    const supabase = await createServerClient()

    // Verify user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is super admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || userData.role !== "super_admin") {
      return { success: false, error: "Unauthorized - Super admin access required" }
    }

    // Reject the application
    const { error } = await supabase
      .from("tenants")
      .update({
        nonprofit_status: "rejected",
        is_registered_nonprofit: false,
        nonprofit_rejection_reason: reason,
        nonprofit_reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId)

    if (error) {
      console.error("Error rejecting non-profit application:", error)
      return { success: false, error: error.message }
    }

    // TODO: Send rejection email to missionary with reason

    return { success: true }
  } catch (error) {
    console.error("Error in rejectNonprofitApplication:", error)
    return { success: false, error: "Failed to reject application" }
  }
}
