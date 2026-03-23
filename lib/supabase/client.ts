import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

// Singleton instance to prevent multiple clients
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

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
        // Use default cookie handling but ensure proper domain for subdomains
        getAll() {
          return document.cookie.split('; ').map(cookie => {
            const [name, ...rest] = cookie.split('=')
            return { name, value: rest.join('=') }
          }).filter(c => c.name)
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const isProduction = window.location.hostname.includes('tektonstable.com')
            const domain = isProduction ? '.tektonstable.com' : undefined
            
            let cookieStr = `${name}=${value}`
            cookieStr += `; path=/`
            cookieStr += `; SameSite=Lax`
            
            if (isProduction) {
              cookieStr += `; Secure`
              if (domain) {
                cookieStr += `; domain=${domain}`
              }
            }
            
            // Set max age to 1 year
            cookieStr += `; max-age=${60 * 60 * 24 * 365}`
            
            document.cookie = cookieStr
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
