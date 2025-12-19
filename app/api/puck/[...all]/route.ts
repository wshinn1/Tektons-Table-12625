import { puckHandler } from "@puckeditor/cloud-client"
import { createPuckConfig } from "@/lib/puck-config"

const handler = async (request: Request) => {
  const config = createPuckConfig()

  try {
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
    throw error
  }
}

// Export all HTTP methods that Puck AI might use
export const POST = handler
export const GET = handler
export const PUT = handler
export const DELETE = handler

export const dynamic = "force-dynamic"
