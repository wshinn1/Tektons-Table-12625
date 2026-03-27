"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect, useState } from "react"

interface PostHogProviderProps {
  children: React.ReactNode
  subdomain: string
}

export function PostHogProvider({ children, subdomain }: PostHogProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.warn("[PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY environment variable")
      return
    }

    if (typeof window !== "undefined" && !isInitialized) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        persistence: "localStorage+cookie",
        loaded: (ph) => {
          // Register tenant subdomain as a super property on all events
          ph.register({ tenant: subdomain })
          setIsInitialized(true)
        },
      })
    }

    return () => {
      // Clean up on unmount if needed
    }
  }, [subdomain, isInitialized])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
