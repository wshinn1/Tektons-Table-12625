import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostEditor } from "@/components/dashboard/post-editor"

export default async function NewPostPage() {
  console.log("[v0] NewPostPage: Starting")

  const supabase = await createServerClient()
  console.log("[v0] NewPostPage: Supabase client created")

  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log("[v0] NewPostPage: User fetched", user?.id)

  if (!user) {
    console.log("[v0] NewPostPage: No user, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] NewPostPage: Fetching tenant for user", user.id)
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] NewPostPage: Tenant result", { tenant: tenant?.id, error: tenantError?.message })

  if (!tenant) {
    console.log("[v0] NewPostPage: No tenant, redirecting to onboarding")
    redirect("/onboarding")
  }

  console.log("[v0] NewPostPage: Fetching categories for tenant", tenant.id)
  // Get categories and topics
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("name")

  console.log("[v0] NewPostPage: Categories fetched", { count: categories?.length, error: catError?.message })

  console.log("[v0] NewPostPage: Fetching topics for tenant", tenant.id)
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("name")

  console.log("[v0] NewPostPage: Topics fetched", { count: topics?.length, error: topicsError?.message })

  console.log("[v0] NewPostPage: Rendering page")
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <PostEditor tenantId={tenant.id} categories={categories || []} topics={topics || []} />
    </div>
  )
}
