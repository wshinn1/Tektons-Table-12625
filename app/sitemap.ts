import type { MetadataRoute } from "next"
import { createServerClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/security`,
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
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  // Dynamic pages from database (platform pages)
  let dynamicPages: MetadataRoute.Sitemap = []

  try {
    const supabase = await createServerClient()

    // Get published platform pages
    const { data: pages } = await supabase.from("pages").select("slug, updated_at").eq("is_published", true)

    if (pages) {
      dynamicPages = pages.map((page) => ({
        url: `${baseUrl}/p/${page.slug}`,
        lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    }

    // Get published blog posts
    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .is("tenant_id", null)

    if (blogPosts) {
      const blogPages = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
      dynamicPages = [...dynamicPages, ...blogPages]
    }

    // Get help articles
    const { data: helpArticles } = await supabase
      .from("help_articles")
      .select("slug, category, updated_at")
      .eq("is_published", true)

    if (helpArticles) {
      const helpPages = helpArticles.map((article) => ({
        url: `${baseUrl}/help/${article.category}/${article.slug}`,
        lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
      dynamicPages = [...dynamicPages, ...helpPages]
    }
  } catch (error) {
    console.error("Error generating sitemap:", error)
  }

  return [...staticPages, ...dynamicPages]
}
