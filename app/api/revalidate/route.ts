import { revalidateTag, revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-prismic-secret")
  if (secret !== process.env.PRISMIC_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Revalidate all Prismic content
    revalidateTag("prismic")

    // Revalidate homepage
    revalidatePath("/")

    // If specific document type is provided, revalidate related pages
    if (body.type) {
      console.log("[v0] Revalidating Prismic content type:", body.type)

      // Revalidate all pages that might use this content
      revalidatePath("/", "page")
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      paths: ["/"],
    })
  } catch (error) {
    console.error("[v0] Error revalidating:", error)
    return NextResponse.json({ message: "Error revalidating", error: String(error) }, { status: 500 })
  }
}
