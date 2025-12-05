'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTopic(tenantId: string, formData: FormData) {
  const supabase = await createServerClient()
  
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  
  const { error } = await supabase
    .from('topics')
    .insert({
      tenant_id: tenantId,
      name,
      slug
    })
  
  if (error) throw error
  
  revalidatePath('/dashboard/topics')
  revalidatePath('/dashboard/posts')
}

export async function updateTopic(topicId: string, formData: FormData) {
  const supabase = await createServerClient()
  
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  
  const { error } = await supabase
    .from('topics')
    .update({
      name,
      slug
    })
    .eq('id', topicId)
  
  if (error) throw error
  
  revalidatePath('/dashboard/topics')
  revalidatePath('/dashboard/posts')
}

export async function deleteTopic(topicId: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId)
  
  if (error) throw error
  
  revalidatePath('/dashboard/topics')
  revalidatePath('/dashboard/posts')
}
