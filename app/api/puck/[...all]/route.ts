import { puckHandler } from "@puckeditor/cloud-client"
import { createServerPuckConfig } from "@/lib/puck-config-server"

const handler = async (request: Request) => {
  try {
    const config = createServerPuckConfig()

    const response = await puckHandler(request, {
      apiKey: process.env.PUCK_API_KEY,
      config,
      ai: {
        context:
          "You are creating pages for a nonprofit organization website. Focus on creating engaging landing pages with hero sections, feature grids, testimonials, impact stories, donation calls-to-action, and community engagement sections. Create diverse, well-structured pages with different block types.",
      },
    })

    return response
  } catch (error) {
    console.error("[Puck API] Handler error:", error)
    return new Response(
      JSON.stringify({ error: "Puck API error", message: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

// Export all HTTP methods that Puck AI might use
export const POST = handler
export const GET = handler
export const PUT = handler
export const DELETE = handler

export const dynamic = "force-dynamic"
