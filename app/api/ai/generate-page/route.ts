import { generateText, createOpenAI } from "ai"
import { Response } from "node-fetch"

export async function POST(request: Request) {
  console.log("[v0] AI generate-page API called")

  try {
    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { prompt } = body

    if (!prompt) {
      console.log("[v0] No prompt provided")
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert web designer that generates clean, modern HTML for page sections.
    
When given a prompt, generate semantic HTML with inline styles that:
- Uses modern design principles (clean typography, good spacing, visual hierarchy)
- Is responsive and looks good on all devices
- Uses a consistent color palette with purple (#7c3aed) as the primary color
- Includes appropriate placeholder images using /placeholder.svg?height=X&width=Y&query=description
- Uses flexbox for layouts with flex-direction: row for side-by-side columns
- Has proper padding and margins
- Wraps content in a <section> tag

IMPORTANT: Only output the raw HTML, no markdown, no code blocks, no explanations.
The HTML should be ready to insert directly into a page builder.`

    console.log("[v0] Calling generateText with model: gpt-4o")

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Generate a complete HTML page based on this description: ${prompt}`,
    })

    console.log("[v0] Generated text length:", text?.length)

    // Clean up the response - remove any markdown code blocks if present
    let html = text.trim()
    if (html.startsWith("```")) {
      html = html.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
    }

    console.log("[v0] Returning HTML response")

    return Response.json({
      html,
      message: `I've created a ${prompt.toLowerCase().includes("section") ? "section" : "component"} for you. You can now customize it using the visual editor.`,
    })
  } catch (error) {
    console.error("[v0] AI generation error:", error)
    return Response.json(
      {
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
