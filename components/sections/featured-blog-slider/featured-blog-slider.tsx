"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image_url: string | null
  published_at: string
  categories: Array<{ name: string; slug: string }>
}

interface FeaturedBlogSliderProps {
  selectedCategories?: string[] // Array of category slugs
  sectionTitle?: string
  showArrows?: boolean
}

export function FeaturedBlogSlider({
  selectedCategories = [],
  sectionTitle = "FEATURED POSTS",
  showArrows = true,
}: FeaturedBlogSliderProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (selectedCategories.length > 0) {
          params.append("categories", selectedCategories.join(","))
        }

        const response = await fetch(`/api/blog/featured?${params}`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching featured posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [selectedCategories])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    const maxIndex = Math.max(0, posts.length - 4)
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : prev))
  }

  const visiblePosts = posts.slice(currentIndex, currentIndex + 4)

  // Get the first category for the title link
  const categorySlug = selectedCategories[0] || ""
  const categoryName = posts[0]?.categories[0]?.name || sectionTitle

  if (isLoading) {
    return (
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-muted animate-pulse rounded" />
              <div className="h-10 w-10 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return (
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto text-center text-muted-foreground">No featured posts found.</div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/blog${categorySlug ? `?category=${categorySlug}` : ""}`}
            className="group flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            {sectionTitle}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {showArrows && posts.length > 4 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="rounded-full bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex >= posts.length - 4}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visiblePosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block space-y-4">
              {/* Featured Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                {post.featured_image_url ? (
                  <Image
                    src={post.featured_image_url || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}

                {/* Category Badge */}
                {post.categories.length > 0 && (
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-black text-white">
                      {post.categories[0].name}
                    </span>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
