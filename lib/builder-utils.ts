import { builder } from "@builder.io/sdk"

// Initialize Builder.io with your public API ID
if (process.env.NEXT_PUBLIC_BUILDER_API_ID) {
  builder.init(process.env.NEXT_PUBLIC_BUILDER_API_ID)
}

export { builder }

export async function getBuilderContent(model: string, options?: any) {
  if (!process.env.NEXT_PUBLIC_BUILDER_API_ID) {
    console.warn("Builder.io API ID not found")
    return null
  }

  try {
    const content = await builder.get(model, options).promise()
    return content
  } catch (error) {
    console.error("Error fetching Builder.io content:", error)
    return null
  }
}
