import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BannerEditor } from "@/components/admin/banner-editor"

export const dynamic = "force-dynamic"

export default async function BannerPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is super admin
  const { data: superAdmin } = await supabase.from("super_admins").select("*").eq("user_id", user.id).single()

  if (!superAdmin) {
    redirect("/dashboard")
  }

  // Fetch announcement banner content
  const { data: bannerData } = await supabase
    .from("site_content")
    .select("*")
    .eq("section", "announcement_banner")
    .single()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Announcement Banner</h1>
          <p className="text-muted-foreground mt-2">
            Edit the announcement banner that appears above the navigation on the homepage.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <BannerEditor initialData={bannerData} />
      </div>
    </div>
  )
}
