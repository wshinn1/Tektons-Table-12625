import Link from "next/link"
import Image from "next/image"
import { Crown } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  subtitle: string | null
  slug: string
  featured_image_url: string | null
  published_at: string
  author_name: string | null
  is_premium?: boolean
  resource_category?: {
    name: string
  } | null
}

interface BlogFeaturedPostSectionProps {
  post: BlogPost | null
  className?: string
}

export function BlogFeaturedPostSection({ post, className = "" }: BlogFeaturedPostSectionProps) {
  if (!post) {
    return null
  }

  return (
    <section className={`py-12 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/blog/${post.slug}`}
          className="group block bg-white border border-gray-100 transition-all duration-300 hover:shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Content Side */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 order-2 md:order-1">
              {/* Category & Meta */}
              <div className="flex items-center gap-3 mb-6">
                {post.resource_category && (
                  <span
                    className={`${post.is_premium ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-black"} text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5`}
                  >
                    {post.is_premium && <Crown className="h-3 w-3" />}
                    {post.resource_category.name}
                  </span>
                )}
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {post.author_name && (
                  <span className="text-sm text-gray-500 uppercase tracking-wider">{post.author_name}</span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4 text-balance">
                {post.title}
              </h2>

              {/* Subtitle */}
              {post.subtitle && (
                <p className="text-lg text-gray-600 leading-relaxed mb-8 line-clamp-3">{post.subtitle}</p>
              )}

              {/* Read More Button */}
              <div>
                <span className="inline-flex items-center gap-2 border border-black text-black px-6 py-3 text-sm font-medium uppercase tracking-wide transition-colors duration-300 group-hover:bg-black group-hover:text-white">
                  Read More
                </span>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative aspect-[4/3] md:aspect-auto order-1 md:order-2">
              {post.featured_image_url ? (
                <Image
                  src={post.featured_image_url || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
