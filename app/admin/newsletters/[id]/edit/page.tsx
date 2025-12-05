import { Suspense } from "react"
import { NewsletterEditor } from "@/components/admin/crm/newsletter-editor"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/auth"

export default async function EditNewsletterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin())) {
    redirect("/admin")
  }

  const { data: newsletter } = await supabase.from("admin_newsletters").select("*").eq("id", id).single()

  if (!newsletter) {
    redirect("/admin/newsletters")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Newsletter</h1>
        <p className="text-muted-foreground mt-1">Update your newsletter design and content</p>
      </div>

      <Suspense fallback={<div>Loading editor...</div>}>
        <NewsletterEditor newsletter={newsletter} />
      </Suspense>
    </div>
  )
}
