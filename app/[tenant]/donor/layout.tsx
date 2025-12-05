"use client"

import type React from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter, usePathname } from "next/navigation"
import { TenantDonorSidebar } from "@/components/tenant/tenant-donor-sidebar"
import { useEffect, useState, useCallback, use } from "react"
import { flushSync } from "react-dom"

export default function DonorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = use(params)
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [tenant, setTenant] = useState<any>(null)
  const [supporter, setSupporter] = useState<any>(null)
  const [isPersistedDonor, setIsPersistedDonor] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cacheKey = `donor_cache_${tenantSlug}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { userId, tenantId, supporterEmail, timestamp } = JSON.parse(cached)
          const age = Date.now() - timestamp
          const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

          if (age < maxAge) {
            setIsPersistedDonor(true)
            console.log("[v0] Loaded donor cache for", supporterEmail)
          } else {
            localStorage.removeItem(cacheKey)
            console.log("[v0] Donor cache expired, cleared")
          }
        }
      } catch (error) {
        console.error("[v0] Failed to load donor cache:", error)
      }
    }
  }, [tenantSlug])

  const checkDonorAuth = useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      console.log("[v0] No user, redirecting to donor login")
      setIsCheckingAuth(false)
      router.push(`/auth/donor-login`)
      return
    }

    setUser(currentUser)

    // Get tenant info
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id, full_name, subdomain")
      .eq("subdomain", tenantSlug)
      .single()

    if (!tenantData) {
      console.log("[v0] Tenant not found")
      setIsCheckingAuth(false)
      router.push("/")
      return
    }

    setTenant(tenantData)

    // Get supporter info for this tenant
    const { data: supporterData } = await supabase
      .from("supporters")
      .select("full_name, email")
      .eq("tenant_id", tenantData.id)
      .eq("email", currentUser.email)
      .single()

    setSupporter(supporterData)

    // Check if user has donated to this tenant
    const { data: donations } = await supabase
      .from("donations")
      .select("id")
      .eq("tenant_id", tenantData.id)
      .eq("email", currentUser.email)
      .limit(1)

    if (!donations || donations.length === 0) {
      console.log("[v0] User hasn't donated to this tenant")
      setIsCheckingAuth(false)
      router.push("/")
      return
    }

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const cacheKey = `donor_cache_${tenantSlug}`
        const cache = {
          userId: currentUser.id,
          tenantId: tenantData.id,
          supporterEmail: currentUser.email,
          timestamp: Date.now(),
        }
        localStorage.setItem(cacheKey, JSON.stringify(cache))
        console.log("[v0] Cached donor state")
      } catch (error) {
        console.error("[v0] Failed to cache donor state:", error)
      }
    }

    setIsPersistedDonor(true)
    setIsCheckingAuth(false)
  }, [tenantSlug, router])

  useEffect(() => {
    checkDonorAuth()
  }, [checkDonorAuth])

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth state changed:", event)

      if (event === "SIGNED_OUT") {
        // Clear donor cache
        if (typeof window !== "undefined" && window.localStorage) {
          try {
            const cacheKey = `donor_cache_${tenantSlug}`
            localStorage.removeItem(cacheKey)
            console.log("[v0] Cleared donor cache on signout")
          } catch (error) {
            console.error("[v0] Failed to clear donor cache:", error)
          }
        }

        flushSync(() => {
          setUser(null)
          setTenant(null)
          setSupporter(null)
          setIsPersistedDonor(false)
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [tenantSlug])

  if (!user && !isPersistedDonor) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <TenantDonorSidebar
        tenantName={tenant?.full_name || tenant?.subdomain || tenantSlug}
        tenantSlug={tenantSlug}
        donorName={supporter?.full_name}
        donorEmail={supporter?.email || user?.email}
      />
      <main className="ml-16 lg:ml-64 transition-all duration-300">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
