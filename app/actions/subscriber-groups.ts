"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface SubscriberGroup {
  id: string
  tenant_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  member_count?: number
}

// Get all groups for a tenant
export async function getSubscriberGroups(tenantId: string): Promise<SubscriberGroup[]> {
  const supabase = await createClient()

  const { data: groups, error } = await supabase
    .from("subscriber_groups")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name")

  if (error) {
    console.error("[v0] Error fetching groups:", error)
    return []
  }

  // Get member counts for each group
  const groupsWithCounts = await Promise.all(
    (groups || []).map(async (group) => {
      const { count } = await supabase
        .from("subscriber_group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id)

      // Also count subscribers with this as primary group
      const { count: primaryCount } = await supabase
        .from("tenant_email_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id)
        .eq("status", "subscribed")

      return {
        ...group,
        member_count: (count || 0) + (primaryCount || 0),
      }
    }),
  )

  return groupsWithCounts
}

// Create a new group
export async function createSubscriberGroup(
  tenantId: string,
  name: string,
  description?: string,
): Promise<{ success: boolean; group?: SubscriberGroup; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscriber_groups")
    .insert({
      tenant_id: tenantId,
      name: name.trim(),
      description: description?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "A group with this name already exists" }
    }
    console.error("[v0] Error creating group:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/supporters")
  return { success: true, group: data }
}

// Update a group
export async function updateSubscriberGroup(
  groupId: string,
  name: string,
  description?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("subscriber_groups")
    .update({
      name: name.trim(),
      description: description?.trim() || null,
    })
    .eq("id", groupId)

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "A group with this name already exists" }
    }
    console.error("[v0] Error updating group:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/supporters")
  return { success: true }
}

// Delete a group
export async function deleteSubscriberGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("subscriber_groups").delete().eq("id", groupId)

  if (error) {
    console.error("[v0] Error deleting group:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/supporters")
  return { success: true }
}

// Add subscriber to group
export async function addSubscriberToGroup(
  groupId: string,
  subscriberId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("subscriber_group_members").insert({
    group_id: groupId,
    subscriber_id: subscriberId,
  })

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Subscriber is already in this group" }
    }
    console.error("[v0] Error adding to group:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/supporters")
  return { success: true }
}

// Remove subscriber from group
export async function removeSubscriberFromGroup(
  groupId: string,
  subscriberId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("subscriber_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("subscriber_id", subscriberId)

  if (error) {
    console.error("[v0] Error removing from group:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/supporters")
  return { success: true }
}

// Get subscribers in a group
export async function getGroupSubscribers(groupId: string) {
  const supabase = await createClient()

  // Get members via junction table
  const { data: members, error: membersError } = await supabase
    .from("subscriber_group_members")
    .select(`
      subscriber:tenant_email_subscribers(
        id, name, email, subscribed_at, status
      )
    `)
    .eq("group_id", groupId)

  // Get members with this as primary group
  const { data: primaryMembers, error: primaryError } = await supabase
    .from("tenant_email_subscribers")
    .select("id, name, email, subscribed_at, status")
    .eq("group_id", groupId)
    .eq("status", "subscribed")

  if (membersError || primaryError) {
    console.error("[v0] Error fetching group subscribers:", membersError || primaryError)
    return []
  }

  // Combine and deduplicate
  const allMembers = new Map()

  members?.forEach((m: any) => {
    if (m.subscriber) {
      allMembers.set(m.subscriber.id, m.subscriber)
    }
  })

  primaryMembers?.forEach((m) => {
    allMembers.set(m.id, m)
  })

  return Array.from(allMembers.values())
}

// Get subscribers by group targeting (for sending)
export async function getSubscribersByTargetGroups(tenantId: string, targetGroups: string[]) {
  const supabase = await createClient()

  // If "all" is selected, return everyone
  if (targetGroups.includes("all")) {
    const { data, error } = await supabase
      .from("tenant_email_subscribers")
      .select("id, name, email")
      .eq("tenant_id", tenantId)
      .eq("status", "subscribed")

    if (error) {
      console.error("[v0] Error fetching all subscribers:", error)
      return []
    }
    return data || []
  }

  const allSubscribers = new Map()

  // If "followers" is selected (default group)
  if (targetGroups.includes("followers")) {
    const { data } = await supabase
      .from("tenant_email_subscribers")
      .select("id, name, email")
      .eq("tenant_id", tenantId)
      .eq("status", "subscribed")
      .is("group_id", null)

    data?.forEach((s) => allSubscribers.set(s.id, s))
  }

  // Get subscribers from specific groups
  const groupIds = targetGroups.filter((g) => g !== "followers" && g !== "all")

  for (const groupId of groupIds) {
    // Get from junction table
    const { data: members } = await supabase
      .from("subscriber_group_members")
      .select(`
        subscriber:tenant_email_subscribers(id, name, email, status)
      `)
      .eq("group_id", groupId)

    members?.forEach((m: any) => {
      if (m.subscriber?.status === "subscribed") {
        allSubscribers.set(m.subscriber.id, {
          id: m.subscriber.id,
          name: m.subscriber.name,
          email: m.subscriber.email,
        })
      }
    })

    // Get with primary group
    const { data: primaryMembers } = await supabase
      .from("tenant_email_subscribers")
      .select("id, name, email")
      .eq("group_id", groupId)
      .eq("status", "subscribed")

    primaryMembers?.forEach((m) => allSubscribers.set(m.id, m))
  }

  return Array.from(allSubscribers.values())
}

// Set subscriber's primary group
export async function setSubscriberPrimaryGroup(
  subscriberId: string,
  groupId: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("tenant_email_subscribers").update({ group_id: groupId }).eq("id", subscriberId)

  if (error) {
    console.error("[v0] Error setting primary group:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/supporters")
  return { success: true }
}
