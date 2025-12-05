// Special page for Builder.io visual editing preview
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Builder.io Preview",
  robots: "noindex, nofollow",
}

export const dynamic = "force-dynamic"

export default async function BuilderPreviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Builder.io Preview</h1>
        <p className="text-gray-500 mb-8">This page is used for Builder.io visual editing.</p>
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Drag and drop components here to build your section.</p>
        </div>
      </div>
    </div>
  )
}
