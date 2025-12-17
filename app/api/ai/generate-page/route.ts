import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("[v0] AI generate-page API called")

  try {
    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { prompt } = body

    if (!prompt) {
      console.log("[v0] No prompt provided")
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert web designer that generates Puck page builder JSON configurations.

When given a prompt, generate a JSON object with this EXACT structure:
{
  "content": [
    {
      "type": "BlockName",
      "props": { /* block properties */ }
    }
  ],
  "root": {
    "props": {}
  }
}

Available blocks:
- HeadingBlock: {title: "string", level: "h1"|"h2"|"h3"|"h4", align: "left"|"center"|"right"}
- TextBlock: {content: "string", align: "left"|"center"|"right"}
- RichTextBlock: {content: "string"}
- ButtonBlock: {label: "string", href: "string", variant: "default"|"secondary"|"outline", size: "sm"|"default"|"lg"}
- LinkBlock: {text: "string", href: "string", external: boolean}
- ImageBlock: {src: "string", alt: "string", width: number, height: number, rounded: "none"|"sm"|"md"|"lg"|"full"}
- VideoBlock: {src: "string", poster: "string", autoplay: boolean, loop: boolean}
- EmbedBlock: {code: "string"}
- ContainerBlock: {maxWidth: "sm"|"md"|"lg"|"xl"|"2xl"|"full", padding: "none"|"sm"|"md"|"lg"}
- ColumnsBlock: {columns: 2|3|4, gap: "sm"|"md"|"lg"}
- CardBlock: {title: "string", description: "string", content: "string"}
- SpacerBlock: {height: "16"|"32"|"64"|"96"}
- DividerBlock: {color: "string", thickness: "1"|"2"|"4"}
- HeroBlock: {title: "string", subtitle: "string", buttonText: "string", buttonHref: "string", backgroundColor: "string", textColor: "string", align: "left"|"center"|"right"}
- FeatureGridBlock: {title: "string", subtitle: "string", features: [{title: "string", description: "string", icon: "string"}]} 
- TestimonialBlock: {quote: "string", author: "string", role: "string", avatar: "string"}
- CTABlock: {title: "string", subtitle: "string", buttonText: "string", buttonHref: "string", backgroundColor: "string", textColor: "string"}
- ContactFormBlock: {title: "string", submitText: "string", successMessage: "string"}
- DonationBlock: {title: "string", description: "string", amounts: "string", buttonText: "string"}

CRITICAL LANDING PAGE RULES:
1. Generate 4-6 DIFFERENT blocks for a landing page
2. ALWAYS start with ONE HeroBlock
3. Add ONE FeatureGridBlock or benefits section
4. Include ONE TestimonialBlock for social proof
5. End with ONE CTABlock
6. Add SpacerBlock between major sections
7. NEVER repeat the same block type multiple times (especially CTABlock or ContactFormBlock)
8. Use ContactFormBlock ONLY if explicitly asked for a contact form

CRITICAL JSON RULES:
- Output ONLY valid JSON with actual primitive values
- NEVER use JavaScript functions like JSON.stringify(), JSON.parse(), etc.
- For array properties, provide the ACTUAL array: [{"title": "Feature", "description": "Text", "icon": "✓"}]
- For string properties, provide the ACTUAL string: "Get Started Today"
- For number properties, provide the ACTUAL number: 400
- For boolean properties, provide the ACTUAL boolean: true or false
- Do NOT wrap values in any functions

EXAMPLE LANDING PAGE (use as template):
{
  "content": [
    {
      "type": "HeroBlock",
      "props": {
        "title": "Transform Your Business Today",
        "subtitle": "Join thousands of successful companies",
        "buttonText": "Get Started Free",
        "buttonHref": "#signup",
        "backgroundColor": "#1e40af",
        "textColor": "#ffffff",
        "align": "center"
      }
    },
    {
      "type": "SpacerBlock",
      "props": { "height": "64" }
    },
    {
      "type": "FeatureGridBlock",
      "props": {
        "title": "Why Choose Us",
        "subtitle": "Everything you need to succeed",
        "features": [
          {"title": "Fast Setup", "description": "Get started in minutes", "icon": "⚡"},
          {"title": "24/7 Support", "description": "We're here to help", "icon": "💬"},
          {"title": "Secure", "description": "Bank-level security", "icon": "🔒"}
        ]
      }
    },
    {
      "type": "SpacerBlock",
      "props": { "height": "64" }
    },
    {
      "type": "TestimonialBlock",
      "props": {
        "quote": "This product changed everything for us!",
        "author": "Jane Smith",
        "role": "CEO at TechCorp",
        "avatar": "/professional-headshot.png"
      }
    },
    {
      "type": "SpacerBlock",
      "props": { "height": "64" }
    },
    {
      "type": "CTABlock",
      "props": {
        "title": "Ready to Get Started?",
        "subtitle": "Join our community today",
        "buttonText": "Sign Up Now",
        "buttonHref": "#signup",
        "backgroundColor": "#059669",
        "textColor": "#ffffff"
      }
    }
  ],
  "root": {
    "props": {}
  }
}`

    console.log("[v0] Calling generateText with model: openai/gpt-4o")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      system: systemPrompt,
      prompt: `Generate a Puck blocks configuration for: ${prompt}

Remember:
- Use 4-6 DIFFERENT block types
- Do NOT repeat blocks (especially CTABlock or ContactFormBlock)
- Start with HeroBlock for landing pages
- Use actual JSON values, NO JavaScript functions
- Follow the landing page template structure`,
      responseFormat: { type: "json_object" },
    })

    console.log("[v0] Generated text length:", text?.length)
    console.log("[v0] Raw AI response:", text)

    let puckData
    try {
      // Clean up the response - remove any markdown code blocks if present
      let cleanedText = text.trim()
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```json?\n?/, "").replace(/\n?```$/, "")
      }

      puckData = JSON.parse(cleanedText)

      // Ensure proper structure
      if (!puckData.content) {
        puckData = { content: [], root: { props: {} } }
      }
      if (!puckData.root) {
        puckData.root = { props: {} }
      }

      console.log("[v0] Parsed Puck data successfully")
      console.log("[v0] Number of blocks:", puckData.content.length)
      console.log("[v0] Block types:", puckData.content.map((b: any) => b.type).join(", "))
    } catch (parseError) {
      console.error("[v0] Failed to parse AI response as JSON:", parseError)
      // Fallback to a simple heading block
      puckData = {
        content: [
          {
            type: "HeadingBlock",
            props: {
              title: "AI generation failed - please try again",
              level: "h2",
              align: "center",
            },
          },
        ],
        root: { props: {} },
      }
    }

    console.log("[v0] Returning Puck data")

    return NextResponse.json({
      data: puckData,
      message: "Content generated! The blocks have been added to your canvas.",
    })
  } catch (error) {
    console.error("[v0] AI generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
