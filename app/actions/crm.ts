"use server"

import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type Contact = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  source: string
  tags: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

export async function getContacts(): Promise<Contact[]> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

  if (error) throw error

  return data as Contact[]
}

export async function createContact(contactData: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  source?: string
  tags?: string[]
  notes?: string
  group_ids?: string[]
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      first_name: contactData.first_name,
      last_name: contactData.last_name,
      email: contactData.email,
      phone: contactData.phone,
      source: contactData.source || "manual",
      tags: contactData.tags,
      notes: contactData.notes,
    })
    .select()
    .single()

  if (error) throw error

  // Add to groups if specified
  if (contactData.group_ids && contactData.group_ids.length > 0) {
    const members = contactData.group_ids.map((groupId) => ({
      contact_id: contact.id,
      group_id: groupId,
    }))

    await supabase.from("contact_group_members").insert(members)
  }

  revalidatePath("/admin/contacts")
  return contact
}

export async function updateContact(
  id: string,
  contactData: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    tags?: string[]
    notes?: string
  },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("contacts")
    .update({
      ...contactData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/contacts")
  return data
}

export async function deleteContact(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin())) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("contacts").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/admin/contacts")
}
