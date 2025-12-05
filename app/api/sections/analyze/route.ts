import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const { data: superAdmin } = await supabase.from("super_admins").select("id").eq("user_id", user.id).single()

    if (!superAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Use AI to analyze the screenshot
    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: imageUrl,
            },
            {
              type: "text",
              text: `Analyze this website section screenshot and extract its structure for a page builder.

Return a JSON object with:
1. "sectionType": Best matching type from: hero-centered, hero-split, features-grid, testimonials-carousel, cta-banner, stats-section, pricing-table, content-image, image-gallery, or "custom"
2. "name": A descriptive name for this section
3. "description": Brief description of what this section does
4. "suggestedCategory": One of: hero, features, testimonials, cta, pricing, stats, content, gallery, custom
5. "fields": An object with all the editable content extracted from the image:
   - For text: extract the actual text content
   - For images: use placeholder descriptions like "[Hero background image]"
   - For buttons: extract button text and guess the URL purpose
   - For lists/arrays: extract all items
6. "styles": Suggested styles including:
   - backgroundColor: hex color detected or suggested
   - textColor: hex color for main text
   - accentColor: hex color for buttons/accents
   - padding: suggested padding

Be thorough in extracting ALL visible text content. Return only valid JSON, no markdown.`,
            },
          ],
        },
      ],
    })

    // Parse the AI response
    let analysis
    try {
      // Clean the response - remove any markdown code blocks
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      analysis = JSON.parse(cleanedText)
    } catch (e) {
      console.error("Failed to parse AI response:", text)
      return NextResponse.json(
        {
          error: "Failed to analyze image",
          rawResponse: text,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error analyzing section:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze section",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
