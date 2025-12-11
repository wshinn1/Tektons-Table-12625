import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert web designer that generates clean, modern HTML for page sections.
    
When given a prompt, generate semantic HTML with inline styles that:
- Uses modern design principles (clean typography, good spacing, visual hierarchy)
- Is responsive and looks good on all devices
- Uses a consistent color palette with purple (#7c3aed) as the primary color
- Includes appropriate placeholder images using /placeholder.svg?height=X&width=Y&query=description
- Uses flexbox for layouts
- Has proper padding and margins

IMPORTANT: Only output the raw HTML, no markdown, no code blocks, no explanations.
The HTML should be ready to insert directly into a page builder.`

    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: systemPrompt,
      prompt: `Create a page section for: ${prompt}`,
    })

    // Clean up the response - remove any markdown code blocks if present
    let html = text.trim()
    if (html.startsWith("```")) {
      html = html.replace(/^```html?\n?/, "").replace(/\n?```$/, "")
    }

    return Response.json({
      html,
      message: `I've created a ${prompt.toLowerCase().includes("section") ? "section" : "component"} for you. You can now customize it using the visual editor.`,
    })
  } catch (error) {
    console.error("[v0] AI generation error:", error)
    return Response.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
