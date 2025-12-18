import type { MetadataRoute } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap({
  params,
}: {
  params: { tenant: string }
}): Promise<MetadataRoute.Sitemap> {
  const { tenant: subdomain } = params

  if (!subdomain || subdomain === "www" || subdomain === "tektonstable") {
    return []
  }

  const supabase = createAdminClient()
  const baseUrl = `https://${subdomain}.tektonstable.com`

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, published_at")
    .eq("tenant_id", subdomain)
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (posts) {
    posts.forEach((post) => {
      sitemap.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    })
  }

  const { data: campaigns } = await supabase
    .from("tenant_campaigns")
    .select("slug, updated_at")
    .eq("tenant_id", subdomain)
    .eq("status", "active")

  if (campaigns) {
    campaigns.forEach((campaign) => {
      sitemap.push({
        url: `${baseUrl}/campaigns/${campaign.slug}`,
        lastModified: new Date(campaign.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    })
  }

  const { data: pages } = await supabase
    .from("tenant_pages")
    .select("slug, updated_at")
    .eq("tenant_id", subdomain)
    .eq("status", "published")

  if (pages) {
    pages.forEach((page) => {
      sitemap.push({
        url: `${baseUrl}/p/${page.slug}`,
        lastModified: new Date(page.updated_at),
        changeFrequency: "monthly",
        priority: 0.6,
      })
    })
  }

  return sitemap
}
