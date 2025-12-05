'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(data: {
  tenantId: string
  title: string
  excerpt: string
  content: string
  categoryId: string | null
  topicIds: string[]
  status: string
}) {
  const supabase = await createServerClient()

  // Create post
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      tenant_id: data.tenantId,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category_id: data.categoryId,
      status: data.status,
    })
    .select()
    .single()

  if (error) throw error

  // Add topics
  if (data.topicIds.length > 0) {
    const postTopics = data.topicIds.map(topicId => ({
      post_id: post.id,
      topic_id: topicId
    }))

    await supabase
      .from('post_topics')
      .insert(postTopics)
  }

  revalidatePath('/dashboard/posts')
  return post
}

export async function createCategory(tenantId: string, name: string, description?: string) {
  const supabase = await createServerClient()
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { data, error } = await supabase
    .from('categories')
    .insert({
      tenant_id: tenantId,
      name,
      slug,
      description
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/posts/categories')
  return data
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) throw error

  revalidatePath('/dashboard/posts')
  revalidatePath('/dashboard/posts/categories')
}

export async function createTopic(tenantId: string, name: string) {
  const supabase = await createServerClient()
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { data, error } = await supabase
    .from('topics')
    .insert({
      tenant_id: tenantId,
      name,
      slug
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/posts/topics')
  return data
}

export async function deleteTopic(topicId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId)

  if (error) throw error

  revalidatePath('/dashboard/posts')
  revalidatePath('/dashboard/posts/topics')
}

export async function createFundingGoal(data: {
  tenantId: string
  title: string
  targetAmount: number
  deadline?: string
  isPublic: boolean
}) {
  const supabase = await createServerClient()

  const { data: goal, error } = await supabase
    .from('funding_goals')
    .insert({
      tenant_id: data.tenantId,
      title: data.title,
      target_amount: data.targetAmount,
      deadline: data.deadline || null,
      is_public: data.isPublic,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/goals')
  return goal
}
