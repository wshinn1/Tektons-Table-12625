import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return mock client if credentials aren't available (e.g., in v0 preview)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase] Missing credentials - returning mock client for preview")

    // Create a chainable mock that supports all query methods
    const createChainableMock = () => ({
      select: () => createChainableMock(),
      eq: () => createChainableMock(),
      neq: () => createChainableMock(),
      gt: () => createChainableMock(),
      gte: () => createChainableMock(),
      lt: () => createChainableMock(),
      lte: () => createChainableMock(),
      like: () => createChainableMock(),
      ilike: () => createChainableMock(),
      is: () => createChainableMock(),
      in: () => createChainableMock(),
      contains: () => createChainableMock(),
      order: () => createChainableMock(),
      limit: () => createChainableMock(),
      range: () => createChainableMock(),
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: null, error: null }),
    })

    return {
      from: () => createChainableMock(),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: null }),
        signUp: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }

  const cookieStore = await cookies()

  const isProduction = process.env.NODE_ENV === "production"
  const cookieDomain = isProduction ? ".tektonstable.com" : undefined
  
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Merge Supabase's options with our domain settings
            cookieStore.set(name, value, {
              ...options,
              domain: cookieDomain,
              path: '/',
              sameSite: 'lax',
              secure: isProduction,
              // Preserve max-age from Supabase if set, otherwise use 1 year
              maxAge: options?.maxAge ?? 60 * 60 * 24 * 365,
            })
          })
        } catch {
          // setAll called from Server Component, ignored if middleware refreshes sessions
        }
      },
    },
  })
}

export const createClient = createServerClient
