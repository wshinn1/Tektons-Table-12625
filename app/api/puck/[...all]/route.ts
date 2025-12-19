import { puckHandler } from "@puckeditor/cloud-client"
import { createPuckConfig } from "@/lib/puck-config"

const config = createPuckConfig()

const handler = async (request: Request) => {
  console.log("[v0] Puck API handler called")
  console.log("[v0] Request method:", request.method)
  console.log("[v0] Request URL:", request.url)
  console.log("[v0] PUCK_API_KEY exists:", !!process.env.PUCK_API_KEY)
  console.log("[v0] Config components:", config?.components ? Object.keys(config.components) : "none")

  try {
    const response = await puckHandler(request, {
      apiKey: process.env.PUCK_API_KEY,
      config,
      ai: {
        context:
          "You are creating pages for a nonprofit organization website. Focus on creating engaging landing pages with hero sections, feature grids, testimonials, impact stories, donation calls-to-action, and community engagement sections. Create diverse, well-structured pages with different block types.",
      },
    })

    console.log("[v0] Puck handler response status:", response.status)
    return response
  } catch (error) {
    console.error("[v0] Puck handler error:", error)
    throw error
  }
}

// Export all HTTP methods that Puck AI might use
export const POST = handler
export const GET = handler
export const PUT = handler
export const DELETE = handler
