import Link from "next/link"
import Image from "next/image"
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

interface BlogMasonrySectionProps {
  posts: BlogPost[]
  columns?: 2 | 3
  rows?: 2 | 3
  className?: string
  tenantSlug?: string
}

export function BlogMasonrySection({ posts, columns = 2, rows = 2, className = "", tenantSlug }: BlogMasonrySectionProps) {
  const maxPosts = columns * rows
  const displayPosts = posts.slice(0, maxPosts)

  if (displayPosts.length === 0) {
    return null
  }

  const gridClass = columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"

  return (
    <section className={`py-12 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`grid ${gridClass} gap-8`}>
          {displayPosts.map((post, index) => {
            const blogCategories = post.categories?.map((c) => c.category.name).filter(Boolean) || []
            const postUrl = tenantSlug ? `/${tenantSlug}/blog/${post.slug}` : `/blog/${post.slug}`

            return (
              <article key={post.id} className="bg-white transition-shadow duration-300 hover:shadow-xl">
                {/* Image - clickable */}
                <Link href={postUrl} className="block">
                  <div className="aspect-video w-full overflow-hidden bg-gray-100 relative group">
                    {post.resource_category && (
                      <div className="absolute top-4 left-4 z-10">
                        <div
                          className={`${post.is_premium ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-black"} text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2`}
                        >
                          {post.is_premium && <Crown className="h-3 w-3" />}
                          {post.resource_category.name}
                        </div>
                      </div>
                    )}
                    {!post.resource_category && blogCategories.length > 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider">
                          {blogCategories.join(", ")}
                        </div>
                      </div>
                    )}
                    {post.featured_image_url ? (
                      <Image
                        src={post.featured_image_url || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        sizes={columns === 3 ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, 50vw"}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={index < 2}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-4 text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-wider">
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="space-y-3">
                    <Link href={postUrl} className="block hover:text-primary transition-colors">
                      <h2 className="text-xl md:text-2xl leading-tight uppercase tracking-wide font-black text-balance">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="flex justify-center">
                      <div className="w-12 h-1 bg-orange-500"></div>
                    </div>
                  </div>
                  {post.subtitle && (
                    <p className="text-gray-600 text-pretty line-clamp-3 leading-relaxed text-base">{post.subtitle}</p>
                  )}
                  <div className="pt-4">
                    <Link
                      href={postUrl}
                      className="relative inline-flex items-center gap-2 border border-black text-black px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wide overflow-hidden transition-colors duration-300 group"
                    >
                      <span className="absolute inset-0 bg-[#7DD3E8] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                      <span className="relative z-10">READ MORE</span>
                      <ChevronRight className="h-4 w-4 relative z-10" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
