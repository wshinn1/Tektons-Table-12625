import { getPageBySlugForEdit } from "@/app/actions/pages"
import { notFound, redirect } from "next/navigation"

export default async function PageBuilderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlugForEdit(slug)

  if (!page) {
    notFound()
  }

  // Redirect to section editor if this is a sections-based page
  if (page.editor_type === "sections") {
    redirect(`/admin/pages/${slug}/edit`)
  }

  redirect("/admin/pages")
}
