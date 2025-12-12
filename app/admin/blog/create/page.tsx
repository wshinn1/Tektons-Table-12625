import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminPostEditor } from "@/components/admin/blog/admin-post-editor"

export default async function CreateBlogPostPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  let resourceCategories = []
  let blogCategories = []
  let tags = []

  try {
    const { data: resCats } = await supabase.from("resource_categories").select("*").order("display_order")
    resourceCategories = resCats || []
  } catch (error) {
    console.error("[v0] Error fetching resource categories:", error)
  }

  try {
    const { data: blogCats } = await supabase.from("blog_categories").select("*").order("name")
    blogCategories = blogCats || []
  } catch (error) {
    console.error("[v0] Error fetching blog categories:", error)
  }

  try {
    const { data: blogTags } = await supabase.from("blog_tags").select("*").order("name")
    tags = blogTags || []
  } catch (error) {
    console.error("[v0] Error fetching blog tags:", error)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Blog Post</h1>
      <AdminPostEditor categories={blogCategories} resourceCategories={resourceCategories} tags={tags} />
    </div>
  )
}
