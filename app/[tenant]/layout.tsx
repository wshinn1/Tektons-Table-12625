"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { flushSync } from "react-dom"
import { TenantNavbar } from "@/components/tenant/tenant-navbar"
import { TenantAdminSidebar } from "@/components/tenant/tenant-admin-sidebar"
import { TenantAdminMobileMenu } from "@/components/tenant/tenant-admin-mobile-menu"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import * as Sentry from "@sentry/nextjs"
import { Montserrat, Bebas_Neue, Raleway } from "next/font/google"
import { GoogleAnalytics } from "@/components/google-analytics"
import { Suspense } from "react"
import cn from "classnames"
import { getMenuItemsByLocation } from "@/app/actions/tenant-menu"
import { TenantHead } from "@/components/tenant/tenant-head"

const montserrat = Montserrat({
  weight: ["900"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
})

const bebasNeue = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  preload: true,
  fallback: ["Impact", "sans-serif"],
})

const raleway = Raleway({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
})

interface Campaign {
  id: string
  title: string
  slug: string
  current_amount: number
  goal_amount: number
  status: string
  show_in_menu: boolean
}

interface NavItem {
  id: string
  label: string
  url: string
  open_in_new_tab?: boolean
}

interface TenantLayoutProps {
  children: React.ReactNode
  params: any
}

const defaultNavItems: NavItem[] = [
  { id: "home", label: "Home", url: "/" },
  { id: "about", label: "About", url: "/about" },
  { id: "support", label: "Support", url: "/giving" },
  { id: "subscribe", label: "Subscribe", url: "/subscribe" },
  { id: "contact", label: "Contact", url: "/contact" },
]

export default function TenantLayout({ children, params }: TenantLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tenantSlug = params.tenant as string

  const isBlogPostPage = pathname?.includes("/blog/") && !pathname?.endsWith("/blog")
  const isAdminPage = pathname?.includes("/admin")

  const isPreviewUrlPattern = tenantSlug && tenantSlug.match(/^preview-[a-z0-9-]{20,}$/)

  const [subdomain, setSubdomain] = useState<string>("")
  const [user, setUser] = useState<User | null>(null)
  const [isTenantOwner, setIsTenantOwner] = useState(false)
  const [isDonor, setIsDonor] = useState(false)
  const [tenantName, setTenantName] = useState<string>("")
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems)
  const [isInIframe, setIsInIframe] = useState(false)
  const [isEmbedMode, setIsEmbedMode] = useState(false)
  const [pageBuilderEnabled, setPageBuilderEnabled] = useState(false)
  const [navbarVisible, setNavbarVisible] = useState(true)
  const [branding, setBranding] = useState<{
    faviconUrl: string | null
    ogImageUrl: string | null
    siteTitle: string | null
    siteDescription: string | null
  }>({
    faviconUrl: null,
    ogImageUrl: null,
    siteTitle: null,
    siteDescription: null,
  })

  const ownershipVerifiedRef = useRef(false)
  const [isPersistedAdmin, setIsPersistedAdmin] = useState(false)
  const authCheckInProgressRef = useRef(false)
  const lastAuthCheckRef = useRef<number>(0)
  const pathnameRef = useRef(pathname)
  const [isNavigating, setIsNavigating] = useState(false) // Changed from ref to state
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const hostname = window.location.hostname
    const parts = hostname.split(".")
    const detectedSubdomain = parts.length >= 3 ? parts[0] : ""
    setSubdomain(detectedSubdomain)

    if (detectedSubdomain) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const stored = localStorage.getItem(`tenant-owner-${detectedSubdomain}`)
          if (stored) {
            try {
              const {
                tenantId: cachedTenantId,
                userId: cachedUserId,
                tenantName: cachedName,
                pageBuilderEnabled: cachedPageBuilderEnabled,
                timestamp,
              } = JSON.parse(stored)
              const isExpired = Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000
              if (!isExpired && cachedTenantId && cachedUserId) {
                setTenantId(cachedTenantId)
                setTenantName(cachedName)
                setPageBuilderEnabled(cachedPageBuilderEnabled || false)
                setIsPersistedAdmin(true)
                setIsTenantOwner(true)
                setIsCheckingAuth(false)
                console.log("[v0] Loaded cached admin session with pageBuilderEnabled:", cachedPageBuilderEnabled)
              } else if (isExpired) {
                localStorage.removeItem(`tenant-owner-${detectedSubdomain}`)
              }
            } catch (e) {
              localStorage.removeItem(`tenant-owner-${detectedSubdomain}`)
            }
          }
        }
      } catch (e) {
        // Silently handle localStorage errors
      }
    }

    const tenantData = document.getElementById("tenant-data")?.getAttribute("data-tenant-id")
    if (tenantData) {
      setTenantId(tenantData)
    }

    const inIframe = window.self !== window.top
    setIsInIframe(inIframe)

    const embedParam = searchParams.get("embed") === "true"
    setIsEmbedMode(embedParam || inIframe)

    if (inIframe || embedParam) {
      document.documentElement.classList.add("embedded-mode")
    }

    return () => {
      document.documentElement.classList.remove("embedded-mode")
    }
  }, [searchParams])

  useEffect(() => {
    // When pathname changes, we just finished navigating
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
    }
    setIsNavigating(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      if (link && link.href && !link.target && link.href.startsWith(window.location.origin)) {
        // Internal navigation - set navigating state immediately
        setIsNavigating(true)
        // Clear after 2 seconds in case navigation doesn't complete
        navigationTimeoutRef.current = setTimeout(() => {
          setIsNavigating(false)
        }, 2000)
      }
    }

    // Use capture phase to intercept before React handles it
    document.addEventListener("click", handleClick, true)
    return () => {
      document.removeEventListener("click", handleClick, true)
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (pathname !== pathnameRef.current) {
      console.log("[v0] TenantLayout: Route changing from", pathnameRef.current, "to", pathname)
      setIsNavigating(true) // Set state immediately so auth check sees it
      pathnameRef.current = pathname

      // Clear navigation flag after transition completes
      const timer = setTimeout(() => {
        setIsNavigating(false)
        console.log("[v0] TenantLayout: Navigation complete")
      }, 1500) // Increased to 1.5s for safety

      return () => clearTimeout(timer)
    }
  }, [pathname])

  const checkDonorStatus = useCallback(async (currentUser: User, currentTenantId: string) => {
    const supabase = createBrowserClient()
    try {
      const { data: supporter } = await supabase
        .from("supporters")
        .select("id")
        .eq("tenant_id", currentTenantId)
        .eq("email", currentUser.email)
        .maybeSingle()

      setIsDonor(!!supporter)
    } catch (error) {
      console.error("Error checking donor status:", error)
      setIsDonor(false)
    }
  }, [])

  const checkTenantOwnership = useCallback(
    async (currentUser: User | null, currentSubdomain: string) => {
      if (isNavigating) {
        console.log("[v0] TenantLayout: Skipping auth check during navigation")
        return
      }

      console.log("[v0] TenantLayout: checkTenantOwnership called:", {
        hasUser: !!currentUser,
        subdomain: currentSubdomain,
        authInProgress: authCheckInProgressRef.current,
        timeSinceLastCheck: Date.now() - lastAuthCheckRef.current,
      })

      if (authCheckInProgressRef.current) {
        console.log("[v0] TenantLayout: Auth check already in progress, skipping")
        return
      }

      const now = Date.now()
      if (now - lastAuthCheckRef.current < 30000) {
        console.log("[v0] TenantLayout: Recent auth check (within 30s), skipping")
        return
      }
      lastAuthCheckRef.current = now

      if (!currentUser || !currentSubdomain) {
        console.log("[v0] TenantLayout: No user or subdomain, clearing auth state")
        setIsTenantOwner(false)
        setIsDonor(false)
        setIsCheckingAuth(false)
        ownershipVerifiedRef.current = false
        setIsPersistedAdmin(false)
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem(`tenant-owner-${currentSubdomain}`)
          }
        } catch (e) {
          // Silently handle localStorage errors
        }
        return false
      }

      console.log("[v0] TenantLayout: Starting auth check...")
      authCheckInProgressRef.current = true

      const supabase = createBrowserClient()

      try {
        const { data: tenant, error } = await supabase
          .from("tenants")
          .select(
            "id, subdomain, full_name, email, page_builder_enabled, favicon_url, og_image_url, site_title, site_description",
          )
          .eq("subdomain", currentSubdomain)
          .maybeSingle()

        if (error) {
          setIsTenantOwner(false)
          setIsCheckingAuth(false)
          ownershipVerifiedRef.current = false
          authCheckInProgressRef.current = false
          return false
        }

        if (tenant) {
          setTenantId(tenant.id)
          setTenantName(tenant.full_name || tenant.subdomain)
          console.log("[v0] Tenant data:", {
            subdomain: tenant.subdomain,
            page_builder_enabled: tenant.page_builder_enabled,
          })
          setPageBuilderEnabled(tenant.page_builder_enabled || false)
          setBranding({
            faviconUrl: tenant.favicon_url,
            ogImageUrl: tenant.og_image_url,
            siteTitle: tenant.site_title,
            siteDescription: tenant.site_description,
          })
          const isOwner = tenant.email?.toLowerCase() === currentUser.email?.toLowerCase()
          setIsTenantOwner(isOwner)
          setIsPersistedAdmin(isOwner)

          if (!isOwner) {
            await checkDonorStatus(currentUser, tenant.id)
          } else {
            try {
              if (typeof window !== "undefined" && window.localStorage) {
                localStorage.setItem(
                  `tenant-owner-${currentSubdomain}`,
                  JSON.stringify({
                    tenantId: tenant.id,
                    userId: currentUser.id,
                    tenantName: tenant.full_name || tenant.subdomain,
                    pageBuilderEnabled: tenant.page_builder_enabled || false,
                    timestamp: Date.now(),
                  }),
                )
                console.log("[v0] Saved admin session to cache with pageBuilderEnabled:", tenant.page_builder_enabled)
              }
            } catch (e) {
              // Silently handle localStorage errors
            }
          }

          setIsCheckingAuth(false)
          ownershipVerifiedRef.current = true
          authCheckInProgressRef.current = false
          return isOwner
        } else {
          setIsTenantOwner(false)
          setIsCheckingAuth(false)
          ownershipVerifiedRef.current = false
          authCheckInProgressRef.current = false
          return false
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            context: "tenant_ownership_check",
            subdomain: currentSubdomain,
          },
        })
        setIsTenantOwner(false)
        setIsCheckingAuth(false)
        ownershipVerifiedRef.current = false
        authCheckInProgressRef.current = false
        return false
      }
    },
    [checkDonorStatus, isNavigating], // Added isNavigating to deps
  )

  const refreshSession = useCallback(async () => {
    if (!subdomain) return

    const supabase = createBrowserClient()

    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        if (error.message.includes("invalid") || error.message.includes("expired")) {
          setUser(null)
          setIsTenantOwner(false)
          setIsDonor(false)
          ownershipVerifiedRef.current = false
          setIsPersistedAdmin(false)
          try {
            if (typeof window !== "undefined" && window.localStorage) {
              localStorage.removeItem(`tenant-owner-${subdomain}`)
            }
          } catch (e) {
            // Silently handle localStorage errors
          }
        }
        return
      }

      if (currentUser) {
        setUser(currentUser)
        if (!ownershipVerifiedRef.current || user?.id !== currentUser.id) {
          await checkTenantOwnership(currentUser, subdomain)
        }
      } else if (user) {
        setUser(null)
        setIsTenantOwner(false)
        setIsDonor(false)
        ownershipVerifiedRef.current = false
        setIsPersistedAdmin(false)
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem(`tenant-owner-${subdomain}`)
          }
        } catch (e) {
          // Silently handle localStorage errors
        }
      }
    } catch (error) {
      // Silently handle refresh errors
    }
  }, [subdomain, user, checkTenantOwnership])

  useEffect(() => {
    if (!subdomain) return

    const handleFocus = () => {
      const lastCheck = sessionStorage.getItem("lastAuthCheck")
      const now = Date.now()
      if (!lastCheck || now - Number.parseInt(lastCheck) > 5 * 60 * 1000) {
        console.log("[v0] Refreshing session after focus")
        refreshSession()
        sessionStorage.setItem("lastAuthCheck", now.toString())
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const lastCheck = sessionStorage.getItem("lastAuthCheck")
        const now = Date.now()
        if (!lastCheck || now - Number.parseInt(lastCheck) > 5 * 60 * 1000) {
          console.log("[v0] Refreshing session after visibility change")
          refreshSession()
          sessionStorage.setItem("lastAuthCheck", now.toString())
        }
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const intervalId = setInterval(
      () => {
        if (document.visibilityState === "visible") {
          console.log("[v0] Periodic session refresh")
          refreshSession()
        }
      },
      30 * 60 * 1000,
    )

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(intervalId)
    }
  }, [subdomain, refreshSession])

  useEffect(() => {
    if (tenantId && subdomain) {
      Sentry.setTag("tenant_subdomain", subdomain)
      Sentry.setTag("tenant_id", tenantId)
      Sentry.setContext("tenant", {
        subdomain,
        tenantId,
        tenantName,
        isTenantOwner,
      })

      fetchActiveCampaigns(tenantId)
      fetchNavItems(tenantId)
    }
  }, [tenantId, subdomain, tenantName, isTenantOwner])

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
      })
    } else {
      Sentry.setUser(null)
    }
  }, [user])

  const fetchNavItems = async (currentTenantId: string) => {
    try {
      const items = await getMenuItemsByLocation(currentTenantId, "navbar")
      if (items && items.length > 0) {
        setNavItems(
          items.map((item) => ({
            id: item.id,
            label: item.label,
            url: item.url,
            open_in_new_tab: item.open_in_new_tab,
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching nav items:", error)
    }
  }

  const fetchActiveCampaigns = async (currentTenantId: string) => {
    const supabase = createBrowserClient()

    try {
      const { data, error } = await supabase
        .from("tenant_campaigns")
        .select("id, title, slug, current_amount, goal_amount, status, show_in_menu")
        .eq("tenant_id", currentTenantId)
        .eq("status", "active")
        .eq("show_in_menu", true)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        return
      }

      if (data) {
        setCampaigns(data)
      }
    } catch (error) {
      // Silently handle campaign fetch errors
    }
  }

  useEffect(() => {
    if (!subdomain) {
      return
    }

    const supabase = createBrowserClient()

    const initAuth = async () => {
      try {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const access_token = params.get("access_token")
        const refresh_token = params.get("refresh_token")

        if (access_token && refresh_token) {
          window.history.replaceState(null, "", window.location.pathname)

          try {
            const response = await fetch("/api/auth/transfer-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ access_token, refresh_token }),
            })

            if (response.ok) {
              await new Promise((resolve) => setTimeout(resolve, 1000))

              const {
                data: { user: currentUser },
              } = await supabase.auth.getUser()

              if (currentUser) {
                setUser(currentUser)
                await checkTenantOwnership(currentUser, subdomain)
                return
              }
            }
          } catch (error) {
            Sentry.captureException(error, {
              tags: { context: "session_transfer" },
            })
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        const currentUser = session?.user ?? null
        setUser(currentUser)
        await checkTenantOwnership(currentUser, subdomain)
      } catch (error) {
        Sentry.captureException(error, {
          tags: { context: "auth_initialization" },
        })
        setIsCheckingAuth(false)
        authCheckInProgressRef.current = false
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        console.log("[v0] Sign out detected, clearing state")
        flushSync(() => {
          setUser(null)
          setIsTenantOwner(false)
          setIsDonor(false)
          setCampaigns([])
          setIsCheckingAuth(false)
          ownershipVerifiedRef.current = false
          setIsPersistedAdmin(false)
        })

        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem(`tenant-owner-${subdomain}`)
          }
        } catch (e) {
          // Silently handle localStorage errors
        }
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        await checkTenantOwnership(currentUser, subdomain)
      } else if (event === "USER_UPDATED") {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await checkTenantOwnership(currentUser, subdomain)
        }
      }
    })

    if (isInIframe) {
      const sendHeight = () => {
        const height = document.documentElement.scrollHeight
        window.parent.postMessage({ type: "setHeight", height }, "*")
      }

      sendHeight()

      const observer = new ResizeObserver(sendHeight)
      observer.observe(document.body)

      window.addEventListener("message", (e) => {
        if (e.data.type === "getHeight") {
          sendHeight()
        }
      })

      const handleClick = () => {
        setTimeout(sendHeight, 100)
      }

      document.addEventListener("click", handleClick)

      return () => {
        subscription.unsubscribe()
        observer.disconnect()
        document.removeEventListener("click", handleClick)
      }
    } else {
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [subdomain, router, isInIframe, checkTenantOwnership])

  useEffect(() => {
    if (isCheckingAuth) {
      const timeout = setTimeout(() => {
        console.log("[v0] Auth check timeout reached")
        setIsCheckingAuth(false)
        authCheckInProgressRef.current = false
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [isCheckingAuth])

  useEffect(() => {
    const fetchTenantSettings = async () => {
      const hostname = window.location.hostname
      const parts = hostname.split(".")
      const detectedSubdomain = parts.length >= 3 ? parts[0] : ""

      if (!detectedSubdomain) return

      const supabase = createBrowserClient()
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id, full_name, page_builder_enabled, favicon_url, og_image_url, site_title, site_description")
        .eq("subdomain", detectedSubdomain)
        .maybeSingle()

      if (tenant) {
        console.log("[v0] Tenant settings fetched:", {
          subdomain: detectedSubdomain,
          page_builder_enabled: tenant.page_builder_enabled,
        })
        setTenantId(tenant.id)
        setTenantName(tenant.full_name || detectedSubdomain)
        setPageBuilderEnabled(tenant.page_builder_enabled || false)
        setBranding({
          faviconUrl: tenant.favicon_url,
          ogImageUrl: tenant.og_image_url,
          siteTitle: tenant.site_title,
          siteDescription: tenant.site_description,
        })
      }
    }

    fetchTenantSettings()
  }, [])

  if (isPreviewUrlPattern) {
    return <>{children}</>
  }

  if (isAdminPage) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <div className={`min-h-screen bg-gray-100 ${montserrat.variable} ${bebasNeue.variable} ${raleway.variable}`}>
          <GoogleAnalytics />
          <TenantHead
            tenantName={tenantName}
            faviconUrl={branding.faviconUrl}
            ogImageUrl={branding.ogImageUrl}
            siteTitle={branding.siteTitle}
            siteDescription={branding.siteDescription}
            subdomain={subdomain}
          />
          {tenantId && <div id="tenant-data" data-tenant-id={tenantId} className="hidden" />}

          <div className="md:hidden">
            <TenantAdminMobileMenu
              subdomain={subdomain}
              tenantName={tenantName}
              user={user}
              pageBuilderEnabled={pageBuilderEnabled}
            >
              {children}
            </TenantAdminMobileMenu>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:block">
            <TenantAdminSidebar
              subdomain={subdomain}
              tenantName={tenantName}
              user={user}
              pageBuilderEnabled={pageBuilderEnabled}
            />
            <main className="min-h-screen transition-all duration-300 md:ml-64">{children}</main>
          </div>
        </div>
      </Suspense>
    )
  }

  if (isCheckingAuth && isAdminPage) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gray-100 ${montserrat.variable} ${bebasNeue.variable} ${raleway.variable}`}
      >
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={`min-h-screen bg-gray-50 ${montserrat.variable} ${bebasNeue.variable} ${raleway.variable}`}>
        <GoogleAnalytics />
        <TenantHead
          tenantName={tenantName}
          faviconUrl={branding.faviconUrl}
          ogImageUrl={branding.ogImageUrl}
          siteTitle={branding.siteTitle}
          siteDescription={branding.siteDescription}
          subdomain={subdomain}
        />
        {tenantId && <div id="tenant-data" data-tenant-id={tenantId} className="hidden" />}
        {!isAdminPage && (
          <TenantNavbar
            tenantName={tenantName}
            navItems={navItems}
            user={user}
            isTenantOwner={isTenantOwner}
            isDonor={isDonor}
            campaigns={campaigns}
            isCheckingAuth={isCheckingAuth}
          />
        )}
        <main className={cn("w-full", !isAdminPage && "pt-14 md:pt-0")}>{children}</main>
      </div>
    </Suspense>
  )
}
