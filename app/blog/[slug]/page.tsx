import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { BlogPostRenderer } from "@/components/blog/blog-post-renderer"
import { BlogPostHeader } from "@/components/blog/blog-post-header"
import { BlogEngagement } from "@/components/blog/blog-engagement"
import { BlogComments } from "@/components/blog/blog-comments"
import { ReadingProgress } from "@/components/blog/reading-progress"
import { generateBlogJsonLd } from "@/components/blog/blog-seo"
import { BlogPremiumPaywall } from "@/components/blog/blog-premium-paywall"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

async function getBlogPostBySlug(slug: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      categories:blog_post_categories(category:blog_categories(*)),
      tags:blog_post_tags(tag:blog_tags(*)),
      resource_category:resource_categories(id, name, slug, is_premium)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("tenant_id", "platform")
    .single()

  if (error || !data) {
    return null
  }

  // Increment view count
  await supabase.rpc("increment_blog_views", { post_id: data.id })

  return data
}

async function checkPremiumAccess() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { hasAccess: false, isLoggedIn: false, user: null }

  // Check subscription
  const { data: subscription } = await supabase
    .from("premium_subscriptions")
    .select("status, current_period_end, grace_period_end")
    .eq("user_id", user.id)
    .maybeSingle()

  if (subscription) {
    const now = new Date()
    if (subscription.status === "active" || subscription.status === "trialing") {
      return { hasAccess: true, isLoggedIn: true, user }
    }
    if (
      subscription.status === "canceled" &&
      subscription.current_period_end &&
      new Date(subscription.current_period_end) > now
    ) {
      return { hasAccess: true, isLoggedIn: true, user }
    }
    if (
      subscription.status === "past_due" &&
      subscription.grace_period_end &&
      new Date(subscription.grace_period_end) > now
    ) {
      return { hasAccess: true, isLoggedIn: true, user }
    }
  }

  // Check comped access
  const { data: comped } = await supabase
    .from("comped_access")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (comped && (!comped.expires_at || new Date(comped.expires_at) > new Date())) {
    return { hasAccess: true, isLoggedIn: true, user }
  }

  return { hasAccess: false, isLoggedIn: true, user }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"
  const url = `${baseUrl}/blog/${post.slug}`
  const description = post.meta_description || post.subtitle || `Read ${post.title} on our blog`

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      url: url,
      siteName: "Tekton's Table",
      images: post.featured_image_url
        ? [
            {
              url: post.featured_image_url,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      type: "article",
      publishedTime: post.published_at,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [post, accessInfo] = await Promise.all([getBlogPostBySlug(slug), checkPremiumAccess()])

  if (!post) {
    notFound()
  }

  const isPremiumPost = post.is_premium === true
  const canViewContent = !isPremiumPost || accessInfo.hasAccess

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"
  const postUrl = `${baseUrl}/blog/${post.slug}`

  const jsonLd = generateBlogJsonLd(
    {
      title: post.title,
      subtitle: post.subtitle,
      slug: post.slug,
      featuredImageUrl: post.featured_image_url,
      metaDescription: post.meta_description,
      publishedAt: post.published_at,
      author: { email: post.author_id || "Anonymous" },
      tenantId: post.tenant_id,
    },
    baseUrl,
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen bg-background">
        <ReadingProgress />

        <article className="mx-auto max-w-[680px] px-5 py-12 sm:px-6 md:py-16 lg:py-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Blog</span>
          </Link>

          {isPremiumPost && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium Content
            </Badge>
          )}

          <BlogPostHeader
            title={post.title}
            subtitle={post.subtitle}
            authorId={post.author_id}
            publishedAt={post.published_at}
            readTime={post.read_time}
          />

          <BlogEngagement postId={post.id} postTitle={post.title} postUrl={postUrl} />

          {post.featured_image_url && post.show_featured_image !== false && (
            <figure className="-mx-5 my-10 sm:-mx-6 md:-mx-[calc((100vw-680px)/2)] md:my-12 lg:my-14">
              <img
                src={post.featured_image_url || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </figure>
          )}

          {canViewContent ? (
            <div className="blog-content">
              <BlogPostRenderer content={post.content} />
            </div>
          ) : (
            <BlogPremiumPaywall post={post} isLoggedIn={accessInfo.isLoggedIn} />
          )}

          {/* Only show tags and comments if user can view content */}
          {canViewContent && (
            <>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-16 flex flex-wrap gap-3 border-t border-border pt-10">
                  {post.tags.map((tagItem: any) => (
                    <span
                      key={tagItem.tag.id}
                      className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      {tagItem.tag.name}
                    </span>
                  ))}
                </div>
              )}

              <BlogComments postId={post.id} />
            </>
          )}
        </article>
      </main>
    </>
  )
}
