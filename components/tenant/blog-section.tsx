import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BlogListView } from "@/components/blog/blog-list-view"
import { Raleway } from "next/font/google"

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-raleway",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
})

interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  excerpt?: string | null
  featured_image_url?: string | null
  published_at: string
  author_name?: string | null
  author_avatar_url?: string | null
  read_time?: number | null
  blog_post_categories?: { blog_categories: { name: string; slug: string } | null }[]
  categories?: { category: { name: string } | null }[]
}

interface TenantBlogSectionProps {
  posts: BlogPost[]
  blogBasePath: string
  viewLayout?: "grid" | "list"
  currentPage?: number
  totalPages?: number
}

function estimateReadTime(excerpt: string | null | undefined): string {
  if (!excerpt) return "3 min read"
  const wordCount = excerpt.split(/\s+/).length
  const estimatedFullWordCount = wordCount * 10
  const minutes = Math.max(2, Math.ceil(estimatedFullWordCount / 200))
  return `${minutes} min read`
}

export function TenantBlogSection({
  posts,
  blogBasePath,
  viewLayout = "grid",
  currentPage = 1,
  totalPages = 1,
}: TenantBlogSectionProps) {
  if (posts.length === 0) return null

  const normalizedPosts = posts.map((post) => ({
    ...post,
    categories: post.categories ?? post.blog_post_categories?.map((c) => ({
      category: c.blog_categories ? { name: c.blog_categories.name } : null,
    })),
  }))

  const Pagination = () =>
    totalPages > 1 ? (
      <div className={`flex items-center justify-center gap-2 pt-8 ${raleway.variable} font-raleway`}>
        <Button
          variant="outline"
          size="sm"
          className="text-gray-700 bg-transparent border-gray-300 hover:bg-gray-50"
          asChild={currentPage > 1}
          disabled={currentPage === 1}
        >
          {currentPage > 1 ? (
            <Link href={`?page=${currentPage - 1}`} prefetch={false}>
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
        <span className="text-sm text-gray-600 px-4">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="text-gray-700 bg-transparent border-gray-300 hover:bg-gray-50"
          asChild={currentPage < totalPages}
          disabled={currentPage === totalPages}
        >
          {currentPage < totalPages ? (
            <Link href={`?page=${currentPage + 1}`} prefetch={false}>
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
    ) : null

  if (viewLayout === "list") {
    return (
      <div className={`space-y-12 ${raleway.variable}`}>
        <BlogListView posts={normalizedPosts} blogBasePath={blogBasePath} />
        <Pagination />
      </div>
    )
  }

  return (
    <div className={`space-y-12 ${raleway.variable}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post, index) => {
          const categories =
            post.blog_post_categories?.map((cat) => cat.blog_categories?.name).filter(Boolean) ||
            post.categories?.map((c) => c.category?.name).filter(Boolean) ||
            []
          const primaryCategory = categories[0] || "Update"

          return (
            <a
              key={post.id}
              href={`${blogBasePath}/${post.slug}`}
              className="group block bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                {post.featured_image_url ? (
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={index < 2}
                    loading={index < 2 ? "eager" : "lazy"}
                    quality={75}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                )}
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-medium">—</span>
                  <span className="text-red-500 text-sm font-medium font-raleway">{primaryCategory}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-snug text-balance font-raleway group-hover:text-gray-700 transition-colors">
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="text-sm text-gray-600 leading-snug font-raleway line-clamp-2">{post.subtitle}</p>
                )}
                <p className="text-sm text-gray-500 font-raleway">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <span className="mx-2">•</span>
                  {post.read_time ? `${post.read_time} min read` : estimateReadTime(post.excerpt)}
                </p>
              </div>
            </a>
          )
        })}
      </div>
      <Pagination />
    </div>
  )
}
