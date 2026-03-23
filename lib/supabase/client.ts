import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

// Singleton instance to prevent multiple clients
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

// Helper to build cookie string with proper domain for cross-subdomain auth
function buildCookieString(name: string, value: string, options?: { maxAge?: number }): string {
  const hostname = window.location.hostname
  const isProduction = hostname.includes('tektonstable.com')
  
  let cookieStr = `${name}=${value}; path=/; SameSite=Lax`
  
  if (isProduction) {
    // Use root domain to share cookies across all subdomains
    cookieStr += `; domain=.tektonstable.com; Secure`
  }
  
  // Set max age (default 1 year)
  const maxAge = options?.maxAge ?? 60 * 60 * 24 * 365
  cookieStr += `; max-age=${maxAge}`
  
  return cookieStr
}

export function createBrowserClient(forceNew = false) {
  // Allow forcing a new client to ensure fresh auth state
  if (browserClient && !forceNew) {
    return browserClient
  }
  
  browserClient = createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Parse all cookies from document.cookie
          return document.cookie.split('; ').filter(Boolean).map(cookie => {
            const [name, ...rest] = cookie.split('=')
            return { name, value: rest.join('=') }
          })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = buildCookieString(name, value, options)
          })
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  )
  
  return browserClient
}

// Alias for backward compatibility - use the same function reference
export const createClient = createBrowserClient
