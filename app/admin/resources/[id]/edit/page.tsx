import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ResourceEditor } from "@/components/admin/resources/resource-editor"

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const adminClient = createAdminClient()

  const { data: resource, error } = await adminClient
    .from("platform_resources")
    .select(`
      *,
      categories:resource_category_assignments(
        category_id,
        category:resource_categories(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error || !resource) {
    notFound()
  }

  const { data: categories } = await adminClient
    .from("resource_categories")
    .select("*")
    .order("display_order", { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/resources"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Resources
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Resource</h1>
        <p className="mt-1 text-gray-500">Update this fundraising resource</p>
      </div>

      <ResourceEditor resource={resource} categories={categories || []} />
    </div>
  )
}
