"use client"

import Script from "next/script"
import { useCookieConsent } from "@/components/cookie-consent"

interface GoogleAnalyticsProps {
  gaId?: string
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const consent = useCookieConsent()
  const id = gaId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!id || consent !== "accepted") return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  )
}

// Declare gtag types for TypeScript
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: {
        page_path?: string
        [key: string]: any
      },
    ) => void
    dataLayer: any[]
  }
}
