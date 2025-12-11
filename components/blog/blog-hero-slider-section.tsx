"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface BlogPost {
  id: string
  title: string
  slug: string
  featured_image_url: string | null
  published_at: string
  resource_category?: {
    name: string
  } | null
}

interface BlogHeroSliderSectionProps {
  posts: BlogPost[]
  tagline?: string
  highlightWord?: string
}

export function BlogHeroSliderSection({
  posts,
  tagline = "TEKTON'S TABLE, personal editorial daily magazine.",
  highlightWord = "editorial",
}: BlogHeroSliderSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Auto-rotate every 5 seconds if not hovering
  useEffect(() => {
    if (hoveredIndex !== null) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(posts.length, 4))
    }, 5000)
    return () => clearInterval(interval)
  }, [posts.length, hoveredIndex])

  const displayPosts = posts.slice(0, 4)
  const currentImageIndex = hoveredIndex !== null ? hoveredIndex : activeIndex
  const currentPost = displayPosts[currentImageIndex]

  // Split tagline to highlight the word
  const renderTagline = () => {
    if (!highlightWord || !tagline.includes(highlightWord)) {
      return <span>{tagline}</span>
    }
    const parts = tagline.split(highlightWord)
    return (
      <>
        {parts[0]}
        <span className="relative inline-block">
          <span className="relative z-10">{highlightWord}</span>
          <svg className="absolute -inset-2 z-0" viewBox="0 0 200 80" preserveAspectRatio="none">
            <ellipse
              cx="100"
              cy="40"
              rx="95"
              ry="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white/60"
            />
          </svg>
        </span>
        {parts[1]}
      </>
    )
  }

  if (displayPosts.length === 0) {
    return null
  }

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      {/* Background Image with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPost?.id || "placeholder"}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {currentPost?.featured_image_url ? (
            <Image
              src={currentPost.featured_image_url || "/placeholder.svg"}
              alt={currentPost.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between px-8 md:px-16 py-12">
        {/* Tagline */}
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">{renderTagline()}</h1>
        </div>

        {/* Post Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {displayPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="space-y-2">
                <h3
                  className={`text-white text-sm md:text-base font-medium leading-tight transition-opacity ${
                    currentImageIndex === index ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  }`}
                >
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  {post.resource_category && (
                    <span className="bg-white/20 px-2 py-1 uppercase tracking-wider font-semibold">
                      {post.resource_category.name}
                    </span>
                  )}
                  <span>
                    {new Date(post.published_at)
                      .toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                      .toUpperCase()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
