import { createServerClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
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

        <BlogFilters categories={categories} tags={tags} basePath={`/${tenantSlug}/blog`} />

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <a key={post.id} href={`/${tenantSlug}/blog/${post.slug}`} className="group block">
              <article className="h-full">
                {post.featured_image_url && (
                  <div className="mb-6 aspect-[16/10] w-full overflow-hidden rounded-lg">
                    <img
                      src={post.featured_image_url || "/placeholder.svg"}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div>
                  {post.categories && post.categories.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.categories.map((cat: any) => (
                        <Badge key={cat.category.id} variant="secondary" className="text-xs font-medium pointer-events-none">
                          {cat.category.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <h2 className="mb-3 text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>

                  {post.subtitle && (
                    <p className="mb-4 line-clamp-2 text-base leading-relaxed text-muted-foreground">{post.subtitle}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{post.read_time} min read</span>
                    <span>·</span>
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </article>
            </a>
          ))}
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

        <BlogPagination currentPage={page} totalPages={totalPages} basePath={`/${tenantSlug}/blog`} />
      </div>
    </main>
  )
}
