/**
 * Blog List View Component
 * 
 * Displays blog posts in a vertical list layout with horizontal cards.
 */
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Crown } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  subtitle: string | null
  slug: string
  featured_image_url: string | null
  published_at: string
  is_premium?: boolean
  resource_category?: {
    name: string
  } | null
  categories?: Array<{
    category: {
      id: string
      name: string
      slug: string
    }
  }> | null
}

interface BlogListViewProps {
  posts: BlogPost[]
  className?: string
  tenantSlug?: string
}

export function BlogListView({ posts, className = "", tenantSlug }: BlogListViewProps) {
  if (posts.length === 0) {
    return (
      <section className={`py-12 px-6 ${className}`}>
        <div className="max-w-4xl mx-auto text-center text-gray-500">
          No posts found.
        </div>
      </section>
    )
  }

  return (
    <section className={`py-12 px-6 ${className}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {posts.map((post, index) => {
          const blogCategories = post.categories?.map((c) => c.category.name).filter(Boolean) || []
          const postUrl = tenantSlug ? `/${tenantSlug}/blog/${post.slug}` : `/blog/${post.slug}`

          return (
            <Link
              key={post.id}
              href={postUrl}
              className="group flex flex-col md:flex-row bg-white border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-gray-200"
            >
              {/* Image */}
              <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0 aspect-video md:aspect-[4/3] overflow-hidden bg-gray-100">
                {post.resource_category && (
                  <div className="absolute top-3 left-3 z-10">
                    <div
                      className={`${post.is_premium ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-black"} text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5`}
                    >
                      {post.is_premium && <Crown className="h-3 w-3" />}
                      {post.resource_category.name}
                    </div>
                  </div>
                )}
                {!post.resource_category && blogCategories.length > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-black text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                      {blogCategories[0]}
                    </div>
                  </div>
                )}
                {post.featured_image_url ? (
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-6 md:p-8 flex-1">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <h2 className="text-xl md:text-2xl font-black leading-tight uppercase tracking-wide mb-3 text-balance group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="text-gray-600 line-clamp-2 leading-relaxed text-base mb-4">{post.subtitle}</p>
                )}
                <div className="mt-auto">
                  <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-black group-hover:text-primary transition-colors">
                    Read More
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
