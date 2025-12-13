import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoriesParam = searchParams.get("categories")
    const categories = categoriesParam ? categoriesParam.split(",") : []

    const supabase = await createServerClient()

    // Filter by categories if provided
    if (categories.length > 0) {
      const { data: categoryIds } = await supabase.from("blog_categories").select("id").in("slug", categories)

      if (categoryIds && categoryIds.length > 0) {
        const ids = categoryIds.map((c) => c.id)

        const { data: postIds } = await supabase
          .from("blog_post_categories")
          .select("blog_post_id")
          .in("category_id", ids)

        if (postIds && postIds.length > 0) {
          const postIdsList = postIds.map((p) => p.blog_post_id)

          const { data: posts, error } = await supabase
            .from("blog_posts")
            .select(`
              id,
              title,
              slug,
              excerpt,
              featured_image_url,
              published_at,
              blog_post_categories!inner(
                blog_categories!inner(
                  name,
                  slug
                )
              )
            `)
            .eq("status", "published")
            .in("id", postIdsList)
            .order("published_at", { ascending: false })
            .limit(12)

          if (error) {
            console.error("[v0] Error fetching featured posts:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
          }

          // Transform the data to flatten categories
          const transformedPosts = posts?.map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            featured_image_url: post.featured_image_url,
            published_at: post.published_at,
            categories:
              post.blog_post_categories?.map((bpc: any) => ({
                name: bpc.blog_categories.name,
                slug: bpc.blog_categories.slug,
              })) || [],
          }))

          return NextResponse.json({ posts: transformedPosts })
        }
      }

      // No posts found for these categories
      return NextResponse.json({ posts: [] })
    }

    // No category filter - fetch all published posts
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        published_at,
        blog_post_categories(
          blog_categories(
            name,
            slug
          )
        )
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(12)

    if (error) {
      console.error("[v0] Error fetching featured posts:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to flatten categories
    const transformedPosts = posts?.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      published_at: post.published_at,
      categories:
        post.blog_post_categories?.map((bpc: any) => ({
          name: bpc.blog_categories.name,
          slug: bpc.blog_categories.slug,
        })) || [],
    }))

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error("[v0] Featured posts API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
