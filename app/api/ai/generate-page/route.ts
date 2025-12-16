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

When given a prompt, generate a JSON object with this structure:
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
- HeadingBlock: {title, level: "h1"|"h2"|"h3"|"h4", align: "left"|"center"|"right"}
- TextBlock: {content, align: "left"|"center"|"right"}
- ButtonBlock: {label, href, variant: "default"|"secondary"|"outline", size: "sm"|"default"|"lg"}
- ImageBlock: {src, alt, width, height, rounded: "none"|"sm"|"md"|"lg"|"full"}
- CardBlock: {title, description, content}
- HeroBlock: {title, subtitle, buttonText, buttonHref, backgroundColor, textColor, align: "left"|"center"|"right"}
- FeatureGridBlock: {title, subtitle, features: JSON.stringify([{title, description, icon}])}
- CTABlock: {title, subtitle, buttonText, buttonHref, backgroundColor, textColor}
- ContactFormBlock: {title, submitText, successMessage}
- DonationBlock: {title, description, amounts: "25,50,100,250", buttonText}
- SpacerBlock: {height: "16"|"32"|"64"|"96"}
- DividerBlock: {color, thickness: "1"|"2"|"4"}

IMPORTANT: 
- Only output valid JSON, no markdown, no code blocks, no explanations.
- Use appropriate blocks for the requested content.
- Set reasonable default values for all props.
- For images, use /placeholder.svg?height=X&width=Y&query=description`

    console.log("[v0] Calling generateText with model: openai/gpt-4o")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      system: systemPrompt,
      prompt: `Generate Puck blocks configuration for: ${prompt}`,
    })

    console.log("[v0] Generated text length:", text?.length)

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

      console.log("[v0] Parsed Puck data:", JSON.stringify(puckData, null, 2))
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
