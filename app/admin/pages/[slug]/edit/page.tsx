import { getPageWithSections, getSectionTemplates } from "@/app/actions/pages"
import { PageEditor } from "@/components/admin/page-editor/page-editor"

export default async function EditPagePage({ params }: { params: { slug: string } }) {
  const { page, sections } = await getPageWithSections(params.slug)
  const templates = await getSectionTemplates()

  return (
    <div className="p-8">
      <PageEditor page={page} sections={sections} templates={templates} />
    </div>
  )
}
