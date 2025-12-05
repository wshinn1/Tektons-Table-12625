import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HelpArticleManager } from "@/components/admin/help-article-manager"

export default async function ManageHelpArticlesPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Check if user is super admin
  const { data: isSuperAdmin } = await supabase.from("super_admins").select("id").eq("id", user.id).single()

  if (!isSuperAdmin) {
    redirect("/dashboard")
  }

  // Get all help articles
  const { data: articles } = await supabase
    .from("help_articles")
    .select("*")
    .order("category", { ascending: true })
    .order("order_index", { ascending: true })

  // Get categories
  const { data: categories } = await supabase
    .from("help_categories")
    .select("*")
    .order("order_index", { ascending: true })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Help Articles</h1>
        <p className="text-muted-foreground">Create and edit help documentation for the support chatbot</p>
      </div>

      <HelpArticleManager articles={articles || []} categories={categories || []} />
    </div>
  )
}
