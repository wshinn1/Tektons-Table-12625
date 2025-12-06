"use client"

import { useEffect } from "react"

// Default TektonsTable branding
const DEFAULT_FAVICON = "/images/android-chrome-512x512.png"
const DEFAULT_OG_IMAGE = "/images/tektons-20table-whitebg.png"
const DEFAULT_SITE_TITLE = "Long Term Funding Support"
const DEFAULT_SITE_DESCRIPTION = "Support missionaries and ministries with recurring donations through TektonsTable"

interface TenantHeadProps {
  tenantName: string
  faviconUrl?: string | null
  ogImageUrl?: string | null
  siteTitle?: string | null
  siteDescription?: string | null
  subdomain: string
}

export function TenantHead({
  tenantName,
  faviconUrl,
  ogImageUrl,
  siteTitle,
  siteDescription,
  subdomain,
}: TenantHeadProps) {
  const favicon = faviconUrl || DEFAULT_FAVICON
  const ogImage = ogImageUrl || DEFAULT_OG_IMAGE
  const title = `${siteTitle || DEFAULT_SITE_TITLE} | ${tenantName}`
  const description = siteDescription || DEFAULT_SITE_DESCRIPTION
  const siteUrl = `https://${subdomain}.tektonstable.com`

  // Update favicon dynamically
  useEffect(() => {
    // Remove existing favicons
    const existingLinks = document.querySelectorAll("link[rel*='icon']")
    existingLinks.forEach((link) => link.remove())

    // Add new favicon
    const link = document.createElement("link")
    link.rel = "icon"
    link.type = "image/png"
    link.href = favicon
    document.head.appendChild(link)

    // Add apple touch icon
    const appleLink = document.createElement("link")
    appleLink.rel = "apple-touch-icon"
    appleLink.href = favicon
    document.head.appendChild(appleLink)

    // Update document title
    document.title = title

    // Update or add meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name"
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
      if (meta) {
        meta.content = content
      } else {
        meta = document.createElement("meta")
        meta.setAttribute(attr, name)
        meta.content = content
        document.head.appendChild(meta)
      }
    }

    // Standard meta
    updateMeta("description", description)

    // Open Graph
    updateMeta("og:title", title, true)
    updateMeta("og:description", description, true)
    updateMeta("og:image", ogImage, true)
    updateMeta("og:url", siteUrl, true)
    updateMeta("og:type", "website", true)
    updateMeta("og:site_name", `${tenantName} - TektonsTable`, true)

    // Twitter
    updateMeta("twitter:card", "summary_large_image")
    updateMeta("twitter:title", title)
    updateMeta("twitter:description", description)
    updateMeta("twitter:image", ogImage)

    return () => {
      // Cleanup is handled by React re-render
    }
  }, [favicon, ogImage, title, description, siteUrl, tenantName])

  return null
}
