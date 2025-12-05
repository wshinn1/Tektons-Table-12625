import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerClient()

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title, subtitle, slug, published_at, meta_description")
    .eq("tenant_id", "platform")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Platform Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Latest blog posts from Platform</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      ?.map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      <description>${escapeXml(post.meta_description || post.subtitle || "")}</description>
    </item>
    `,
      )
      .join("")}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case "&":
        return "&amp;"
      case "'":
        return "&apos;"
      case '"':
        return "&quot;"
      default:
        return c
    }
  })
}
