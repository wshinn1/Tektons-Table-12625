import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function GivingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { tenant: tenantSlug } = await params
  const { session_id } = await searchParams

  const supabase = await createServerClient()
  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", tenantSlug).single()

  if (!tenant) {
    redirect("/")
  }

  const headersList = await headers()
  const tenantSubdomain = headersList.get("x-tenant-subdomain") || ""
  const isSubdomain = tenantSubdomain === tenantSlug
  const basePath = isSubdomain ? "" : `/${tenantSlug}`

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mb-4 text-3xl font-bold">Thank You for Your Gift!</h1>
        <p className="mb-6 text-muted-foreground">
          Your donation has been processed successfully. You should receive a receipt email shortly.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <a href={`${basePath}/`}>Return to Homepage</a>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <a href={`${basePath}/giving`}>Make Another Gift</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
