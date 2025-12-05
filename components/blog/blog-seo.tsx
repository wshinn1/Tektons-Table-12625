import type { Metadata } from "next"

interface BlogPost {
  title: string
  subtitle?: string
  slug: string
  featuredImageUrl?: string
  metaDescription?: string
  publishedAt: string
  author?: {
    email?: string
  }
  tenantId: string
}

export function generateBlogPostMetadata(post: BlogPost, baseUrl: string): Metadata {
  const url =
    post.tenantId === "platform" ? `${baseUrl}/blog/${post.slug}` : `${baseUrl}/${post.tenantId}/blog/${post.slug}`

  const description = post.metaDescription || post.subtitle || `Read ${post.title} on our blog`

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      url: url,
      siteName: post.tenantId === "platform" ? "Platform Blog" : "Blog",
      images: post.featuredImageUrl
        ? [
            {
              url: post.featuredImageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author?.email || "Anonymous"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: post.featuredImageUrl ? [post.featuredImageUrl] : [],
    },
  }
}

export function generateBlogJsonLd(post: BlogPost, baseUrl: string) {
  const url =
    post.tenantId === "platform" ? `${baseUrl}/blog/${post.slug}` : `${baseUrl}/${post.tenantId}/blog/${post.slug}`

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.subtitle,
    image: post.featuredImageUrl,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author?.email || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: post.tenantId === "platform" ? "Platform" : post.tenantId,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }
}
