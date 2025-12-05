import { createClient } from '@supabase/supabase-js'

// Server-side admin client with service role key
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Check if user is super admin
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const adminClient = createAdminClient()
  
  const { data, error } = await adminClient
    .from('super_admins')
    .select('id')
    .eq('user_id', userId)
    .single()

  return !!data && !error
}
