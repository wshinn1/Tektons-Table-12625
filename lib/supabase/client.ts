import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

// Singleton instance to prevent multiple clients
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

// Detect Safari browser (has stricter cookie handling with ITP)
function isSafariBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

// Helper to build cookie string with proper domain for cross-subdomain auth
function buildCookieString(name: string, value: string, options?: { maxAge?: number }): string {
  const hostname = window.location.hostname
  const isProduction = hostname.includes('tektonstable.com')
  const isSafari = isSafariBrowser()
  
  let cookieStr = `${name}=${value}; path=/; SameSite=Lax`
  
  if (isProduction) {
    // Use root domain to share cookies across all subdomains
    cookieStr += `; domain=.tektonstable.com; Secure`
  }
  
  // Set max age (default 1 year, but Safari ITP limits to 7 days for some cookies)
  // Use a shorter max-age for Safari to work within ITP limits
  const maxAge = options?.maxAge ?? (isSafari ? 60 * 60 * 24 * 7 : 60 * 60 * 24 * 365)
  cookieStr += `; max-age=${maxAge}`
  
  return cookieStr
}

// Helper to get auth from localStorage (Safari fallback)
function getAuthFromLocalStorage(cookieName: string): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    // Check for our Safari fallback token
    const fallback = localStorage.getItem('supabase-auth-token')
    if (fallback && cookieName.includes('auth-token')) {
      return fallback
    }
    return null
  } catch {
    return null
  }
}

// Helper to store auth in localStorage (Safari fallback)
function storeAuthInLocalStorage(name: string, value: string): void {
  if (typeof localStorage === 'undefined') return
  if (!name.includes('auth-token')) return
  try {
    localStorage.setItem('supabase-auth-token', value)
  } catch {
    // Ignore localStorage errors
  }
}

export function createBrowserClient(forceNew = false) {
  // Allow forcing a new client to ensure fresh auth state
  if (browserClient && !forceNew) {
    return browserClient
  }
  
  const isSafari = isSafariBrowser()
  
  browserClient = createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Parse all cookies from document.cookie
          const cookies = document.cookie.split('; ').filter(Boolean).map(cookie => {
            const [name, ...rest] = cookie.split('=')
            return { name, value: rest.join('=') }
          })
          
          // For Safari, also check localStorage fallback if no auth cookies found
          if (isSafari) {
            const hasAuthCookie = cookies.some(c => c.name.includes('auth-token'))
            if (!hasAuthCookie) {
              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
              const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || ''
              const fallbackValue = getAuthFromLocalStorage(`sb-${projectRef}-auth-token`)
              if (fallbackValue) {
                console.log("[v0] Safari: Using localStorage fallback for auth")
                cookies.push({ name: `sb-${projectRef}-auth-token`, value: fallbackValue })
              }
            }
          }
          
          return cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = buildCookieString(name, value, options)
            
            // For Safari, also store in localStorage as fallback
            if (isSafari) {
              storeAuthInLocalStorage(name, value)
            }
          })
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        // Use localStorage for Safari as additional storage
        storage: isSafari ? {
          getItem: (key: string) => {
            // Try cookies first, then localStorage
            const cookies = document.cookie.split('; ').filter(Boolean)
            for (const cookie of cookies) {
              const [name, ...rest] = cookie.split('=')
              if (name === key) {
                return rest.join('=')
              }
            }
            // Fallback to localStorage for Safari
            try {
              return localStorage.getItem(key)
            } catch {
              return null
            }
          },
          setItem: (key: string, value: string) => {
            // Set both cookie and localStorage for Safari
            document.cookie = buildCookieString(key, value)
            try {
              localStorage.setItem(key, value)
            } catch {
              // Ignore
            }
          },
          removeItem: (key: string) => {
            // Remove from both
            document.cookie = `${key}=; path=/; max-age=0`
            try {
              localStorage.removeItem(key)
            } catch {
              // Ignore
            }
          }
        } : undefined,
      }
    }
  )
  
  return browserClient
}

// Alias for backward compatibility - use the same function reference
export const createClient = createBrowserClient
