import { generateText } from "ai"

// Simple health check endpoint to verify AI SDK is working
export async function GET() {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: "Say 'OK' and nothing else",
      maxTokens: 10,
    })

    return Response.json({
      status: "ok",
      model: "openai/gpt-4o-mini",
      response: text,
    })
  } catch (error) {
    return Response.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
