import Link from "next/link"
import { headers } from "next/headers"
import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { BlogFilters } from "@/components/blog/blog-filters"
import { BlogPagination } from "@/components/blog/blog-pagination"

const POSTS_PER_PAGE = 9

async function getTenant(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("tenants").select("*").eq("subdomain", slug).maybeSingle()

  if (error || !data) return null
  return data
}

async function getCategories(tenantId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("blog_categories").select("*").eq("tenant_id", tenantId).order("name")
  return data || []
}

async function getTags(tenantId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("blog_tags").select("*").eq("tenant_id", tenantId).order("name")
  return data || []
}

async function getTenantBlogPosts(
  tenantId: string,
  filters: {
    search?: string
    category?: string
    tag?: string
    page?: number
  },
) {
  const supabase = await createServerClient()

  let query = supabase
    .from("blog_posts")
    .select(
      `
      *,
      categories:blog_post_categories(category:blog_categories(*)),
      tags:blog_post_tags(tag:blog_tags(*))
    `,
      { count: "exact" },
    )
    .eq("status", "published")
    .eq("tenant_id", tenantId)

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`)
  }

  if (filters.category) {
    const { data: categoryData } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", filters.category)
      .eq("tenant_id", tenantId)
      .single()

    if (categoryData) {
      const { data: postIds } = await supabase
        .from("blog_post_categories")
        .select("post_id")
        .eq("category_id", categoryData.id)

      if (postIds && postIds.length > 0) {
        query = query.in(
          "id",
          postIds.map((p) => p.post_id),
        )
      }
    }
  }

  if (filters.tag) {
    const { data: tagData } = await supabase
      .from("blog_tags")
      .select("id")
      .eq("slug", filters.tag)
      .eq("tenant_id", tenantId)
      .single()

    if (tagData) {
      const { data: postIds } = await supabase.from("blog_post_tags").select("post_id").eq("tag_id", tagData.id)

      if (postIds && postIds.length > 0) {
        query = query.in(
          "id",
          postIds.map((p) => p.post_id),
        )
      }
    }
  }

  const page = filters.page || 1
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  query = query.order("published_at", { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error("Failed to fetch blog posts:", error)
    return { posts: [], total: 0 }
  }

  return { posts: data, total: count || 0 }
}

export default async function TenantBlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ search?: string; category?: string; tag?: string; page?: string }>
}) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenant(tenantSlug)

  // Detect subdomain vs root-domain access.
  // On subdomains, middleware rewrites /blog → /tenant/blog server-side but browser URL stays /blog.
  // Links must use the browser-visible URL format so Next.js client router doesn't get confused.
  const headersList = await headers()
  const hostname = headersList.get("x-forwarded-host") || headersList.get("host") || ""
  const isSubdomainAccess =
    hostname.includes(".tektonstable.com") &&
    !hostname.startsWith("www.") &&
    !hostname.startsWith("admin.")
  const blogBasePath = isSubdomainAccess ? `/blog` : `/${tenantSlug}/blog`

  if (!tenant) {
    notFound()
  }

  const filters = await searchParams
  const page = Number.parseInt(filters.page || "1")
  const { posts, total } = await getTenantBlogPosts(tenant.id, {
    search: filters.search,
    category: filters.category,
    tag: filters.tag,
    page,
  })

  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  const categories = await getCategories(tenant.id)
  const tags = await getTags(tenant.id)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <header className="mb-16 text-center">
          <h1 className="mb-4 text-6xl font-bold tracking-tight">Blog</h1>
          <p className="text-xl text-muted-foreground">Stories, updates, and insights from my ministry</p>
        </header>

        <Suspense fallback={null}>
          <BlogFilters categories={categories} tags={tags} basePath={blogBasePath} />
        </Suspense>

        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => {
            const primaryCategory = post.categories?.[0]?.category?.name || "Update"
            const readTime = post.read_time || 3
            
            return (
              <article key={post.id} className="h-full">
                <a 
                  href={`${blogBasePath}/${post.slug}`} 
                  className="group block bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url || "/placeholder.svg"}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 space-y-3">
                    {/* Category with red dash */}
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-medium">—</span>
                      <span className="text-red-500 text-sm font-medium">
                        {primaryCategory}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 leading-snug text-balance group-hover:text-gray-700 transition-colors">
                      {post.title}
                    </h2>
                    
                    {/* Date and read time */}
                    <p className="text-sm text-gray-500">
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="mx-2">•</span>
                      {readTime} min read
                    </p>
                  </div>
                </a>
              </article>
            )
          })}
        </div>

        {posts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              {filters.search || filters.category || filters.tag
                ? "No blog posts found matching your filters."
                : "No blog posts published yet. Check back soon!"}
            </p>
          </div>
        )}

        <Suspense fallback={null}>
          <BlogPagination currentPage={page} totalPages={totalPages} basePath={blogBasePath} />
        </Suspense>
      </div>
    </main>
  )
}
