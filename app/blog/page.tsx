import Link from "next/link"
import Image from "next/image"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { BlogFilters } from "@/components/blog/blog-filters"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Montserrat, Bebas_Neue, Raleway } from "next/font/google"
import { MarketingNav } from "@/components/marketing-nav"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-montserrat",
  display: "swap",
})

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
})

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-raleway",
  display: "swap",
})

const POSTS_PER_PAGE = 4

async function getCategories() {
  const supabase = await createServerClient()
  const { data } = await supabase.from("blog_categories").select("*").order("name")
  return data || []
}

async function getTags() {
  const supabase = await createServerClient()
  const { data } = await supabase.from("blog_tags").select("*").order("name")
  return data || []
}

async function getPublishedBlogPosts(filters: {
  search?: string
  category?: string
  tag?: string
  page?: number
}) {
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
    .eq("tenant_id", "platform")

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`)
  }

  if (filters.category) {
    const { data: categoryData } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", filters.category)
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
    const { data: tagData } = await supabase.from("blog_tags").select("id").eq("slug", filters.tag).single()

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

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; tag?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number.parseInt(params.page || "1")
  const { posts, total } = await getPublishedBlogPosts({
    search: params.search,
    category: params.category,
    tag: params.tag,
    page,
  })

  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  const categories = await getCategories()
  const tags = await getTags()

  return (
    <>
      <MarketingNav />
      <main className={`min-h-screen bg-background ${montserrat.variable} ${bebasNeue.variable} ${raleway.variable}`}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <header className="mb-16 text-center">
            <h1 className="mb-4 text-6xl font-black tracking-tight font-montserrat">Blog</h1>
            <p className="text-xl text-muted-foreground font-raleway">Stories, updates, and insights from our team</p>
          </header>

          <BlogFilters categories={categories} tags={tags} basePath="/blog" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, index) => {
              const postCategories = post.categories?.map((cat: any) => cat.category?.name).filter(Boolean) || []

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white transition-all duration-300 hover:shadow-xl"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    {postCategories.length > 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider font-raleway">
                          {postCategories.join(", ")}
                        </div>
                      </div>
                    )}
                    {post.featured_image_url ? (
                      <Image
                        src={post.featured_image_url || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={index < 2}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                  </div>
                  <div className="p-8 space-y-4 text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-bebas">
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div className="space-y-3">
                      <h2 className="text-2xl text-balance leading-tight uppercase tracking-wide font-montserrat font-black">
                        {post.title}
                      </h2>
                      <div className="flex justify-center">
                        <div className="w-12 h-1 bg-orange-500"></div>
                      </div>
                    </div>
                    {post.subtitle && (
                      <p className="text-muted-foreground text-pretty line-clamp-3 leading-relaxed font-raleway text-lg">
                        {post.subtitle}
                      </p>
                    )}
                    <div className="pt-4">
                      <span className="relative inline-flex items-center gap-2 border border-black text-black px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wide overflow-hidden transition-colors duration-300 font-raleway group/btn">
                        <span className="absolute inset-0 bg-[#7DD3E8] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                        <span className="relative z-10">READ MORE</span>
                        <ChevronRight className="h-4 w-4 relative z-10" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {posts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground font-raleway">
                {params.search || params.category || params.tag
                  ? "No blog posts found matching your filters."
                  : "No blog posts published yet. Check back soon!"}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-12 font-raleway">
              <Button
                variant="outline"
                size="sm"
                className="text-black font-raleway bg-transparent"
                asChild={page > 1}
                disabled={page === 1}
              >
                {page > 1 ? (
                  <Link
                    href={`/blog?page=${page - 1}${params.category ? `&category=${params.category}` : ""}${params.tag ? `&tag=${params.tag}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </span>
                )}
              </Button>
              <span className="text-sm text-black px-4 font-raleway">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-black font-raleway bg-transparent"
                asChild={page < totalPages}
                disabled={page === totalPages}
              >
                {page < totalPages ? (
                  <Link
                    href={`/blog?page=${page + 1}${params.category ? `&category=${params.category}` : ""}${params.tag ? `&tag=${params.tag}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <span>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
