import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"
import { generateText, createOpenAI } from "ai"

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const image = formData.get("image") as File
    const additionalPrompt = formData.get("prompt") as string

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Upload image to Blob for analysis
    const imageBuffer = await image.arrayBuffer()
    const blob = await put(`screenshots/${Date.now()}-${image.name}`, imageBuffer, {
      access: "public",
    })

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Generate code using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: blob.url,
            },
            {
              type: "text",
              text: `You are an expert frontend developer. Analyze this screenshot and generate a React component that recreates the design.

Requirements:
- Use Next.js 16 and React 19
- Use Tailwind CSS for styling (include all classes inline)
- Make it responsive (mobile-first)
- Use semantic HTML
- Include proper alt text for images
- Use placeholder images (/placeholder.svg?height=X&width=X) where needed
- Make all text editable by using clear variable names
- Export as a default function component

${additionalPrompt ? `Additional requirements: ${additionalPrompt}` : ""}

Return ONLY the JSX code, no explanations or markdown code blocks.`,
            },
          ],
        },
      ],
    })

    // Clean up the generated code
    let cleanedCode = text.trim()
    // Remove markdown code blocks if present
    cleanedCode = cleanedCode.replace(/^```(?:tsx?|jsx?)?\n?/gm, "").replace(/```$/gm, "")

    return NextResponse.json({
      code: cleanedCode,
      imageUrl: blob.url,
    })
  } catch (error) {
    console.error("Error generating section:", error)
    return NextResponse.json({ error: "Failed to generate section" }, { status: 500 })
  }
}
