"use client"

import { BlogHeroSliderSection } from "./blog-hero-slider-section"
import { BlogFeaturedPostSection } from "./blog-featured-post-section"
import { BlogMasonrySection } from "./blog-masonry-section"

interface BlogSection {
  id: string
  section_type: string
  title?: string
  subtitle?: string
  content?: any
  is_active?: boolean
  display_order?: number
}

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

interface BlogSectionRendererProps {
  sections: BlogSection[]
  posts: BlogPost[]
  featuredPostId?: string | null
}

export function BlogSectionRenderer({ sections, posts, featuredPostId }: BlogSectionRendererProps) {
  // Get featured post either by ID or first post
  const featuredPost = featuredPostId ? posts.find((p) => p.id === featuredPostId) || posts[0] : posts[0]

  // Get posts excluding featured for masonry
  const masonryPosts = posts.filter((p) => p.id !== featuredPost?.id)

  return (
    <>
      {sections
        .filter((s) => s.is_active !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map((section) => {
          switch (section.section_type) {
            case "blog_hero_slider":
              return (
                <BlogHeroSliderSection
                  key={section.id}
                  posts={posts.slice(0, 4)}
                  tagline={section.content?.tagline || "TEKTON'S TABLE, personal editorial daily magazine."}
                  highlightWord={section.content?.highlightWord || "editorial"}
                />
              )

            case "blog_featured_post":
              const selectedPost = section.content?.featuredPostId
                ? posts.find((p) => p.id === section.content.featuredPostId)
                : featuredPost
              return <BlogFeaturedPostSection key={section.id} post={selectedPost || null} />

            case "blog_masonry":
              return (
                <BlogMasonrySection
                  key={section.id}
                  posts={masonryPosts}
                  columns={section.content?.columns || 2}
                  rows={section.content?.rows || 2}
                />
              )

            default:
              return null
          }
        })}
    </>
  )
}
