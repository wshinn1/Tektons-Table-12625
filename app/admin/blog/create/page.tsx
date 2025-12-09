import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminPostEditor } from "@/components/admin/blog/admin-post-editor"

export default async function CreateBlogPostPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: resourceCategories } = await supabase.from("resource_categories").select("*").order("display_order")

  // Keep blog_categories for backward compatibility
  const { data: blogCategories } = await supabase.from("blog_categories").select("*").order("name")

  const { data: tags } = await supabase.from("blog_tags").select("*").order("name")

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Blog Post</h1>
      <AdminPostEditor
        categories={blogCategories || []}
        resourceCategories={resourceCategories || []}
        tags={tags || []}
      />
    </div>
  )
}
