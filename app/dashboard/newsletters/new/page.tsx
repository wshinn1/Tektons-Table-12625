import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function NewNewsletterPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  redirect("/dashboard")
}
