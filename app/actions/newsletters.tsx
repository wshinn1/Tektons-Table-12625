'use server'

import { createServerClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
import { revalidatePath } from 'next/cache'

export async function saveNewsletter(data: {
  id?: string
  subject: string
  content: string
  language: string
  segment: string
  status: string
}) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (data.id) {
      // Update existing
      const { error } = await supabase
        .from('newsletters')
        .update({
          subject: data.subject,
          content: data.content,
          language: data.language,
          segment: data.segment,
          status: data.status,
        })
        .eq('id', data.id)
        .eq('tenant_id', user.id)

      if (error) throw error
    } else {
      // Create new
      const { error } = await supabase
        .from('newsletters')
        .insert({
          tenant_id: user.id,
          subject: data.subject,
          content: data.content,
          language: data.language,
          segment: data.segment,
          status: data.status,
        })

      if (error) throw error
    }

    revalidatePath('/dashboard/newsletters')
    return { success: true }
  } catch (error) {
    console.error('[v0] Save newsletter error:', error)
    return { success: false, error: 'Failed to save newsletter' }
  }
}

export async function sendNewsletter(data: {
  id?: string
  subject: string
  content: string
  language: string
  segment: string
}) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get tenant info
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, subdomain')
      .eq('id', user.id)
      .single()

    if (!tenant) {
      return { success: false, error: 'Tenant not found' }
    }

    // Get supporters based on segment
    let query = supabase
      .from('supporter_profiles')
      .select('id, email, name')
      .eq('email_notifications_enabled', true)

    if (data.segment === 'monthly_donors') {
      // Get supporters with active subscriptions
      const { data: subscribers } = await supabase
        .from('subscriptions')
        .select('supporter_id')
        .eq('status', 'active')

      const subscriberIds = subscribers?.map(s => s.supporter_id) || []
      query = query.in('id', subscriberIds)
    } else if (data.segment === 'new_supporters') {
      // Supporters from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query = query.gte('created_at', thirtyDaysAgo.toISOString())
    } else if (data.segment === 'one_time_donors') {
      // Supporters who donated but no subscription
      const { data: oneTimeDonors } = await supabase
        .from('supporters')
        .select('supporter_id')
        .is('subscription_id', null)

      const oneTimeDonorIds = [...new Set(oneTimeDonors?.map(d => d.supporter_id) || [])]
      query = query.in('id', oneTimeDonorIds)
    }

    const { data: supporters, error: supporterError } = await query

    if (supporterError) throw supporterError

    if (!supporters || supporters.length === 0) {
      return { success: false, error: 'No supporters match this segment' }
    }

    // Create or update newsletter record
    let newsletterId = data.id

    if (newsletterId) {
      const { error } = await supabase
        .from('newsletters')
        .update({
          subject: data.subject,
          content: data.content,
          language: data.language,
          segment: data.segment,
          status: 'sending',
        })
        .eq('id', newsletterId)
        .eq('tenant_id', user.id)

      if (error) throw error
    } else {
      const { data: newsletter, error } = await supabase
        .from('newsletters')
        .insert({
          tenant_id: user.id,
          subject: data.subject,
          content: data.content,
          language: data.language,
          segment: data.segment,
          status: 'sending',
        })
        .select()
        .single()

      if (error) throw error
      newsletterId = newsletter.id
    }

    // Send emails in batches
    let sentCount = 0
    const batchSize = 50

    for (let i = 0; i < supporters.length; i += batchSize) {
      const batch = supporters.slice(i, i + batchSize)

      const emailPromises = batch.map(async (supporter) => {
        try {
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: `${tenant.name} <updates@tektonstable.com>`,
            to: supporter.email,
            subject: data.subject,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="white-space: pre-wrap;">${data.content}</div>
                <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 14px; color: #666;">
                  <a href="https://${tenant.subdomain}.tektonstable.com" style="color: #0066cc;">Visit ${tenant.name}'s Page</a>
                  | <a href="https://tektonstable.com/unsubscribe?email=${encodeURIComponent(supporter.email)}" style="color: #999;">Unsubscribe</a>
                </p>
              </div>
            `,
          })

          if (emailError) throw emailError

          // Track recipient
          await supabase.from('newsletter_recipients').insert({
            newsletter_id: newsletterId,
            supporter_id: supporter.id,
            email: supporter.email,
            sent_at: new Date().toISOString(),
            resend_message_id: emailData?.id,
            status: 'sent',
          })

          sentCount++
        } catch (error) {
          console.error(`[v0] Failed to send to ${supporter.email}:`, error)
          
          await supabase.from('newsletter_recipients').insert({
            newsletter_id: newsletterId,
            supporter_id: supporter.id,
            email: supporter.email,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      })

      await Promise.all(emailPromises)
    }

    // Update newsletter status
    await supabase
      .from('newsletters')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
      })
      .eq('id', newsletterId)

    revalidatePath('/dashboard/newsletters')
    return { success: true, count: sentCount }
  } catch (error) {
    console.error('[v0] Send newsletter error:', error)
    return { success: false, error: 'Failed to send newsletter' }
  }
}

export async function scheduleNewsletter(data: {
  id?: string
  subject: string
  content: string
  language: string
  segment: string
  scheduledFor: string
}) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const scheduledDate = new Date(data.scheduledFor)
    if (scheduledDate <= new Date()) {
      return { success: false, error: 'Scheduled time must be in the future' }
    }

    if (data.id) {
      const { error } = await supabase
        .from('newsletters')
        .update({
          subject: data.subject,
          content: data.content,
          language: data.language,
          segment: data.segment,
          status: 'scheduled',
          scheduled_for: scheduledDate.toISOString(),
        })
        .eq('id', data.id)
        .eq('tenant_id', user.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('newsletters')
        .insert({
          tenant_id: user.id,
          subject: data.subject,
          content: data.content,
          language: data.language,
          segment: data.segment,
          status: 'scheduled',
          scheduled_for: scheduledDate.toISOString(),
        })

      if (error) throw error
    }

    revalidatePath('/dashboard/newsletters')
    return { success: true }
  } catch (error) {
    console.error('[v0] Schedule newsletter error:', error)
    return { success: false, error: 'Failed to schedule newsletter' }
  }
}
