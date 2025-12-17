import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const query = searchParams.get("query") || ""

  const supabase = await createClient()

  try {
    switch (type) {
      case "blog-posts": {
        // Fetch blog posts for this tenant
        let queryBuilder = supabase
          .from("blog_posts")
          .select("id, title, slug, featured_image_url, excerpt, status, published_at")
          .eq("tenant_id", tenantId)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(50)

        if (query) {
          queryBuilder = queryBuilder.ilike("title", `%${query}%`)
        }

        const { data, error } = await queryBuilder

        if (error) throw error

        return NextResponse.json(
          data?.map((post) => ({
            value: post.id,
            label: post.title,
            slug: post.slug,
            image: post.featured_image_url,
            excerpt: post.excerpt,
          })) || [],
        )
      }

      case "blog-categories": {
        // Fetch blog categories for this tenant
        const { data, error } = await supabase
          .from("blog_categories")
          .select("id, name, slug, description")
          .eq("tenant_id", tenantId)
          .order("name")

        if (error) throw error

        return NextResponse.json(
          data?.map((cat) => ({
            value: cat.id,
            label: cat.name,
            slug: cat.slug,
            description: cat.description,
          })) || [],
        )
      }

      case "media": {
        // Fetch media from media library
        let queryBuilder = supabase
          .from("media_library")
          .select("id, url, filename, alt_text, mime_type")
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: false })
          .limit(100)

        if (query) {
          queryBuilder = queryBuilder.ilike("filename", `%${query}%`)
        }

        const { data, error } = await queryBuilder

        if (error) throw error

        return NextResponse.json(
          data?.map((media) => ({
            value: media.url,
            label: media.filename,
            url: media.url,
            alt: media.alt_text,
            type: media.mime_type,
          })) || [],
        )
      }

      case "pages": {
        // Fetch tenant pages
        const { data, error } = await supabase
          .from("tenant_pages")
          .select("id, title, slug, status")
          .eq("tenant_id", tenantId)
          .eq("status", "published")
          .order("title")

        if (error) throw error

        return NextResponse.json(
          data?.map((page) => ({
            value: page.slug,
            label: page.title,
            slug: page.slug,
          })) || [],
        )
      }

      case "campaigns": {
        const { data, error } = await supabase
          .from("tenant_campaigns")
          .select("id, title, slug, description, goal_amount, current_amount, status, suggested_amounts, end_date")
          .eq("tenant_id", tenantId)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json(
          data?.map((campaign) => ({
            value: campaign.id,
            label: campaign.title,
            slug: campaign.slug,
            description: campaign.description,
            goalAmount: campaign.goal_amount,
            currentAmount: campaign.current_amount,
            suggestedAmounts: campaign.suggested_amounts,
            endDate: campaign.end_date,
          })) || [],
        )
      }

      case "giving-settings": {
        const { data, error } = await supabase
          .from("tenant_giving_settings")
          .select("id, suggested_amounts, goal_amount, thank_you_message, fee_model, suggested_tip_percent")
          .eq("tenant_id", tenantId)
          .single()

        if (error && error.code !== "PGRST116") throw error

        if (data) {
          return NextResponse.json([
            {
              value: "main",
              label: "Main Giving Page",
              suggestedAmounts: data.suggested_amounts,
              goalAmount: data.goal_amount,
              feeModel: data.fee_model,
              suggestedTipPercent: data.suggested_tip_percent,
            },
          ])
        }

        return NextResponse.json([])
      }

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Puck external fields error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
