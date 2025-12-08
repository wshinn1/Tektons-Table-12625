import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CreditCard } from "lucide-react"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container max-w-6xl py-4">
          <nav className="flex items-center gap-6">
            <Link
              href="/account/subscription"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Subscription
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}
