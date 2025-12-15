import type React from "react"
import type { Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { SentryInit } from "@/components/sentry-init"
import { GoogleAnalytics } from "@/components/google-analytics"
import { SupportChatbot } from "@/components/support-chatbot" // Added import for SupportChatbot
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import "./globals.css"

const _geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist",
  adjustFontFallback: true,
})
const _geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist-mono",
  adjustFontFallback: true,
})

// Default TektonsTable branding
const DEFAULT_FAVICON = "/images/android-chrome-512x512.png"
const DEFAULT_OG_IMAGE = "/images/tektons-20table-whitebg.png"
const DEFAULT_SITE_TITLE = "Long Term Funding Support"
const DEFAULT_SITE_DESCRIPTION = "Support missionaries and ministries with recurring donations through Tekton's Table"

export async function generateMetadata() {
  const headersList = await headers()
  const host = headersList.get("host") || ""

  // Extract subdomain from host
  const parts = host.split(".")
  let subdomain = ""

  // Check for tenant subdomain (e.g., wesshinn.tektonstable.com)
  if (host.includes("tektonstable.com") && parts.length >= 3 && parts[0] !== "www") {
    subdomain = parts[0]
  } else if (host.includes("localhost") && parts.length > 1) {
    subdomain = parts[0]
  }

  // If this is a tenant subdomain, fetch tenant branding
  if (subdomain && subdomain !== "www" && subdomain !== "tektonstable") {
    try {
      const supabase = createAdminClient()
      const { data: tenant } = await supabase
        .from("tenants")
        .select("full_name, favicon_url, og_image_url, site_title, site_description")
        .eq("subdomain", subdomain)
        .maybeSingle()

      if (tenant) {
        const tenantName = tenant.full_name || subdomain
        const siteTitle = tenant.site_title || DEFAULT_SITE_TITLE
        const siteDescription = tenant.site_description || DEFAULT_SITE_DESCRIPTION
        const faviconUrl = tenant.favicon_url || DEFAULT_FAVICON
        const ogImageUrl = tenant.og_image_url || DEFAULT_OG_IMAGE

        const title = `${siteTitle} | ${tenantName}`
        const siteUrl = `https://${subdomain}.tektonstable.com`

        return {
          title,
          description: siteDescription,
          icons: {
            icon: faviconUrl,
            apple: faviconUrl,
          },
          openGraph: {
            title,
            description: siteDescription,
            url: siteUrl,
            siteName: `${tenantName} - TektonsTable`,
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: tenantName,
              },
            ],
            locale: "en_US",
            type: "website",
          },
          twitter: {
            card: "summary_large_image" as const,
            title,
            description: siteDescription,
            images: [ogImageUrl],
          },
          metadataBase: new URL(siteUrl),
        }
      }
    } catch (error) {
      console.error("Error fetching tenant metadata:", error)
    }
  }

  // Default metadata for main tektonstable.com site
  return {
    title: "Tekton's Table - Missionary Fundraising Platform",
    description: "Multi-tenant missionary fundraising platform with zero subscription fees",
    generator: "v0.app",
    icons: {
      icon: [
        {
          url: "/icon-light-32x32.png",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/icon-dark-32x32.png",
          media: "(prefers-color-scheme: dark)",
        },
        {
          url: "/icon.svg",
          type: "image/svg+xml",
        },
      ],
      apple: "/apple-icon.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Tekton's Table",
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com" />

        <style
          dangerouslySetInnerHTML={{
            __html: `
          body { opacity: 1; }
          .font-display { font-family: var(--font-geist); }
          h1, h2, h3 { text-rendering: optimizeSpeed; }
        `,
          }}
        />
      </head>
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}>
        <SentryInit />
        <GoogleAnalytics />
        {children}
        <SupportChatbot />
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
