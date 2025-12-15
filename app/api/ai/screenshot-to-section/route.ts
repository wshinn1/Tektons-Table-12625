import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { screenshotUrl, description } = await request.json()

    if (!screenshotUrl) {
      return NextResponse.json({ error: "Screenshot URL is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: screenshotUrl,
            },
            {
              type: "text",
              text: `Analyze this website section screenshot and generate a JSON response with the following structure:

{
  "name": "Descriptive name for this section",
  "category": "hero|features|testimonials|pricing|cta|footer|content|gallery|stats|team|faq|contact",
  "description": "Brief description of what this section does",
  "editableFields": [
    {
      "id": "field_id",
      "label": "Human readable label",
      "type": "text|textarea|image|color|button|link|number|boolean",
      "defaultValue": "The actual content from the screenshot",
      "placeholder": "Helpful placeholder text"
    }
  ],
  "html": "Complete Tailwind CSS HTML that recreates this section. Use placeholder variables like {{field_id}} for editable content. Make it responsive with mobile-first design. Use modern Tailwind classes.",
  "suggestedColors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "text": "#hexcode"
  }
}

Important guidelines:
1. Extract ALL text content visible in the screenshot as editable fields
2. Identify images and make them editable with type "image"
3. Identify buttons and links, make them editable
4. The HTML should use Tailwind CSS classes only (no custom CSS)
5. Use semantic HTML elements
6. Make the section fully responsive
7. Use placeholder images with format: /placeholder.svg?height=X&width=Y&query=description
8. Replace actual text with {{field_id}} placeholders that map to editableFields
${description ? `\nAdditional context: ${description}` : ""}

Return ONLY valid JSON, no markdown code blocks.`,
            },
          ],
        },
      ],
    })

    // Parse the AI response
    let sectionData
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedText = text.trim()
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7)
      }
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3)
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3)
      }
      sectionData = JSON.parse(cleanedText.trim())
    } catch (parseError) {
      console.error("Failed to parse AI response:", text)
      return NextResponse.json({ error: "Failed to parse AI response", rawResponse: text }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      section: sectionData,
    })
  } catch (error) {
    console.error("Screenshot to section error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process screenshot" },
      { status: 500 },
    )
  }
}
