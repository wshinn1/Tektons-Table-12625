import { puckHandler } from "@puckeditor/cloud-client"

const handler = (request: Request) => {
  return puckHandler(request, {
    apiKey: process.env.NEXT_PUBLIC_PUCK_AI_KEY || process.env.PUCK_API_KEY,
    ai: {
      context:
        "You are creating pages for a nonprofit organization website. Focus on creating engaging landing pages with hero sections, feature grids, testimonials, impact stories, donation calls-to-action, and community engagement sections. Create diverse, well-structured pages with different block types.",
    },
  })
}

// Export all HTTP methods that Puck AI might use
export const POST = handler
export const GET = handler
export const PUT = handler
export const DELETE = handler
