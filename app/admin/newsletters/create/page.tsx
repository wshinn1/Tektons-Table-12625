import { Suspense } from "react"
import { NewsletterEditor } from "@/components/admin/crm/newsletter-editor"

export default function CreateNewsletterPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Newsletter</h1>
        <p className="text-muted-foreground mt-1">Design and send newsletters to your contact groups</p>
      </div>

      <Suspense fallback={<div>Loading editor...</div>}>
        <NewsletterEditor />
      </Suspense>
    </div>
  )
}
