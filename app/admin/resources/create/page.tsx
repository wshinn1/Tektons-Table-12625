import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ResourceEditor } from "@/components/admin/resources/resource-editor"

export default async function CreateResourcePage() {
  const adminClient = createAdminClient()

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
        <h1 className="text-3xl font-bold text-gray-900">Create Resource</h1>
        <p className="mt-1 text-gray-500">Add a new fundraising resource or educational content</p>
      </div>

      <ResourceEditor categories={categories || []} />
    </div>
  )
}
