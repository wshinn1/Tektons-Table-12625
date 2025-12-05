import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminPostEditor } from "@/components/admin/blog/admin-post-editor"

export default async function CreateBlogPostPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get categories and tags for platform blog
  const { data: categories } = await supabase.from("blog_categories").select("*").order("name")

  const { data: tags } = await supabase.from("blog_tags").select("*").order("name")

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Blog Post</h1>
      <AdminPostEditor categories={categories || []} tags={tags || []} />
    </div>
  )
}
