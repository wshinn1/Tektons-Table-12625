"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// Track if PostHog has been initialized globally (singleton pattern)
let posthogInitialized = false

interface PostHogProviderProps {
  children: React.ReactNode
  subdomain: string
}

function PostHogPageView({ subdomain }: { subdomain: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()
  const lastPath = useRef<string>("")

  useEffect(() => {
    if (!ph) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    
    // Only capture if path actually changed
    if (url !== lastPath.current) {
      lastPath.current = url
      ph.capture("$pageview", {
        $current_url: window.location.href,
        tenant: subdomain,
      })
    }
  }, [pathname, searchParams, ph, subdomain])

  return null
}

export function PostHogProvider({ children, subdomain }: PostHogProviderProps) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    
    if (!key) {
      console.warn("[PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY environment variable")
      return
    }

    // Only initialize once globally
    if (typeof window !== "undefined" && !posthogInitialized) {
      posthogInitialized = true
      
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false, // We handle this manually to include tenant
        capture_pageleave: true,
        autocapture: true,
        persistence: "localStorage+cookie",
        loaded: (ph) => {
          // Register tenant subdomain as a super property on all events
          ph.register({ tenant: subdomain })
        },
      })
    } else if (posthogInitialized) {
      // Update tenant property if it changes
      posthog.register({ tenant: subdomain })
    }
  }, [subdomain])

  // Don't render provider if no key
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView subdomain={subdomain} />
      {children}
    </PHProvider>
  )
}
