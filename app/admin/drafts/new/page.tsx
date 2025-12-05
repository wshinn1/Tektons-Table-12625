import { DraftEditor } from "@/components/admin/drafts/draft-editor"

export default function NewDraftPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Draft Page</h1>
        <p className="text-gray-600 mt-1">Design HTML content to plan your frontend components</p>
      </div>

      <DraftEditor />
    </div>
  )
}
