"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useEffect, useRef, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

let posthogInitialized = false

interface PostHogProviderProps {
  children: React.ReactNode
  subdomain: string
}

function PostHogPageViewInner({ subdomain }: { subdomain: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (!ph) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    if (lastPath.current === null) {
      lastPath.current = url
      return
    }

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

    if (typeof window !== "undefined" && !posthogInitialized) {
      posthogInitialized = true

      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
        persistence: "localStorage+cookie",
        loaded: (ph) => {
          ph.register({ tenant: subdomain })
          ph.capture("$pageview", {
            $current_url: window.location.href,
            tenant: subdomain,
          })
        },
      })
    } else if (posthogInitialized) {
      posthog.register({ tenant: subdomain })
    }
  }, [subdomain])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageViewInner subdomain={subdomain} />
      </Suspense>
      {children}
    </PHProvider>
  )
}
