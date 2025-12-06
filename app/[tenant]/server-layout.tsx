import type React from "react"
import type { Metadata } from "next"
import { createServerClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

// Default TektonsTable branding
const DEFAULT_FAVICON = "/images/android-chrome-512x512.png"
const DEFAULT_OG_IMAGE = "/images/tektons-20table-whitebg.png"
const DEFAULT_SITE_TITLE = "Long Term Funding Support"
const DEFAULT_SITE_DESCRIPTION = "Support missionaries and ministries with recurring donations through Tekton's Table"

async function getTenantFromHost(): Promise<{
  subdomain: string
  tenant: {
    full_name: string
    favicon_url: string | null
    og_image_url: string | null
    site_title: string | null
    site_description: string | null
  } | null
}> {
  const headersList = await headers()
  const host = headersList.get("host") || ""

  // Extract subdomain from host
  const parts = host.split(".")
  let subdomain = ""

  if (host.includes("localhost")) {
    // For localhost, check if there's a subdomain pattern
    subdomain = parts.length > 1 ? parts[0] : ""
  } else if (parts.length >= 3) {
    subdomain = parts[0]
  }

  if (!subdomain) {
    return { subdomain: "", tenant: null }
  }

  try {
    const supabase = await createServerClient()
    const { data: tenant } = await supabase
      .from("tenants")
      .select("full_name, favicon_url, og_image_url, site_title, site_description")
      .eq("subdomain", subdomain)
      .maybeSingle()

    return { subdomain, tenant }
  } catch (error) {
    console.error("Error fetching tenant for metadata:", error)
    return { subdomain, tenant: null }
  }
}

export async function generateTenantMetadata(): Promise<Metadata> {
  const { subdomain, tenant } = await getTenantFromHost()

  const tenantName = tenant?.full_name || subdomain || "TektonsTable"
  const siteTitle = tenant?.site_title || DEFAULT_SITE_TITLE
  const siteDescription = tenant?.site_description || DEFAULT_SITE_DESCRIPTION
  const faviconUrl = tenant?.favicon_url || DEFAULT_FAVICON
  const ogImageUrl = tenant?.og_image_url || DEFAULT_OG_IMAGE

  const title = `${siteTitle} | ${tenantName}`
  const siteUrl = subdomain ? `https://${subdomain}.tektonstable.com` : "https://tektonstable.com"

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
      card: "summary_large_image",
      title,
      description: siteDescription,
      images: [ogImageUrl],
    },
    metadataBase: new URL(siteUrl),
  }
}

// Default export
export default function ServerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
