import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CategoryManager } from "@/components/admin/resources/category-manager"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const supabase = await createServerClient()

  const { data: categories, error } = await supabase
    .from("resource_categories")
    .select("*, resource_count:resource_category_assignments(count)")
    .order("display_order", { ascending: true })

  console.log("[v0] Categories fetched:", categories?.length || 0, "Error:", error?.message || "none")

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resource Categories</h1>
            <p className="mt-1 text-gray-500">Create and manage categories for your resources</p>
          </div>
        </div>
      </div>

      <CategoryManager initialCategories={categories || []} />
    </div>
  )
}
