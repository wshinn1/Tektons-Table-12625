"use server"

import { createServerClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

export async function getPageMetadata(pageKey: string): Promise<Metadata> {
  const supabase = await createServerClient()

  // Fetch page-specific metadata
  const { data: pageData } = await supabase
    .from("page_metadata")
    .select("*")
    .eq("page_key", pageKey)
    .eq("is_active", true)
    .single()

  // Fetch global site settings as fallback
  const { data: siteSettings } = await supabase
    .from("system_settings")
    .select("setting_value")
    .eq("setting_key", "site_metadata")
    .single()

  const globalMetadata = siteSettings?.setting_value || {}

  // If using custom metadata for this page
  if (pageData && !pageData.use_global_defaults) {
    return {
      title: pageData.title || globalMetadata.title || "Tektons Table",
      description: pageData.description || globalMetadata.description,
      keywords: pageData.keywords,
      openGraph: {
        title: pageData.og_title || pageData.title || globalMetadata.title,
        description: pageData.og_description || pageData.description || globalMetadata.description,
        images: pageData.og_image_url
          ? [{ url: pageData.og_image_url }]
          : globalMetadata.og_image
            ? [{ url: globalMetadata.og_image }]
            : undefined,
        type: pageData.og_type || "website",
      },
      twitter: {
        card: pageData.twitter_card || globalMetadata.twitter_card || "summary_large_image",
        title: pageData.twitter_title || pageData.og_title || pageData.title || globalMetadata.title,
        description:
          pageData.twitter_description || pageData.og_description || pageData.description || globalMetadata.description,
        images: pageData.twitter_image_url
          ? [pageData.twitter_image_url]
          : pageData.og_image_url
            ? [pageData.og_image_url]
            : globalMetadata.og_image
              ? [globalMetadata.og_image]
              : undefined,
        site: globalMetadata.twitter_site || "@tektonstable",
      },
      icons: {
        icon: globalMetadata.favicon_url || "/favicon.ico",
      },
    }
  }

  // Use global defaults
  return {
    title: globalMetadata.title || "Tektons Table",
    description: globalMetadata.description || "Free fundraising platform for missionaries",
    openGraph: {
      title: globalMetadata.title || "Tektons Table",
      description: globalMetadata.description || "Free fundraising platform for missionaries",
      images: globalMetadata.og_image ? [{ url: globalMetadata.og_image }] : undefined,
      type: "website",
    },
    twitter: {
      card: globalMetadata.twitter_card || "summary_large_image",
      title: globalMetadata.title || "Tektons Table",
      description: globalMetadata.description || "Free fundraising platform for missionaries",
      images: globalMetadata.og_image ? [globalMetadata.og_image] : undefined,
      site: globalMetadata.twitter_site || "@tektonstable",
    },
    icons: {
      icon: globalMetadata.favicon_url || "/favicon.ico",
    },
  }
}
