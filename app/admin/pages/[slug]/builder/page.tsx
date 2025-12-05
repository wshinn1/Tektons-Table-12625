import { getPageBySlugForEdit } from "@/app/actions/pages"
import { PlatformPageBuilder } from "@/components/admin/platform-page-builder"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function PageBuilderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlugForEdit(slug)

  if (!page) {
    notFound()
  }

  // Redirect to section editor if this is a sections-based page
  if (page.editor_type === "sections") {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          This page uses the Section Builder. Please use the section editor instead.
        </div>
        <Link href={`/admin/pages/${slug}/edit`} className="text-blue-600 hover:underline">
          Go to Section Editor →
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <PlatformPageBuilder page={page} />
    </div>
  )
}
