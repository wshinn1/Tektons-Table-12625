import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BlogPageEditorClient } from "@/components/admin/blog-page-editor-client"

export default async function BlogPageEditorPage() {
  const supabase = await createServerClient()

  // Check for super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: superAdmin } = await supabase.from("super_admins").select("id").eq("user_id", user.id).single()

  if (!superAdmin) redirect("/")

  // Fetch blog page sections
  const { data: sections } = await supabase
    .from("blog_page_sections")
    .select("*")
    .order("display_order", { ascending: true })

  // Fetch published blog posts for selection
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug")
    .eq("status", "published")
    .eq("tenant_id", "platform")
    .order("published_at", { ascending: false })
    .limit(50)

  return (
    <div className="container mx-auto py-8 px-4">
      <BlogPageEditorClient sections={sections || []} posts={posts || []} />
    </div>
  )
}
