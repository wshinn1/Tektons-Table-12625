import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tenantId, postId, platform } = await request.json()
    const supabase = await createClient()

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const { error } = await supabase
      .from('social_shares')
      .insert({
        tenant_id: tenantId,
        post_id: postId,
        platform,
        ip_address: ipAddress,
        user_agent: userAgent,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track share error:', error)
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
  }
}
