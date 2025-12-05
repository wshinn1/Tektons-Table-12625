import { getDraftPage } from "@/app/actions/drafts"
import { DraftEditor } from "@/components/admin/drafts/draft-editor"
import { notFound } from "next/navigation"

export default async function EditDraftPage({ params }: { params: { id: string } }) {
  const { id } = await params

  try {
    const draft = await getDraftPage(id)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Draft Page</h1>
          <p className="text-gray-600 mt-1">{draft.title}</p>
        </div>

        <DraftEditor draft={draft} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
