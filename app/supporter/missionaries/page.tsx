import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function SupporterMissionariesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/supporter-login")
  }

  // Get all missionaries this supporter has donated to
  const { data: missionaries } = await supabase
    .from("donations")
    .select(`
      tenant_id,
      tenants (
        id,
        name,
        subdomain,
        tagline
      )
    `)
    .eq("email", user.email)
    .order("created_at", { ascending: false })

  // Deduplicate missionaries
  const uniqueMissionaries = missionaries?.reduce((acc, curr) => {
    if (!acc.find((m: any) => m.tenants?.id === curr.tenants?.id)) {
      acc.push(curr)
    }
    return acc
  }, [] as any[])

  return (
    <div className="container mx-auto py-8 px-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Missionaries I Support</h1>
        <p className="text-muted-foreground">View all the missionaries you've donated to</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {!uniqueMissionaries || uniqueMissionaries.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              You haven't supported any missionaries yet
            </CardContent>
          </Card>
        ) : (
          uniqueMissionaries.map((missionary) => (
            <Card key={missionary.tenants?.id}>
              <CardHeader>
                <CardTitle>{missionary.tenants?.name}</CardTitle>
                <CardDescription>{missionary.tenants?.tagline || "Missionary"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href={`https://${missionary.tenants?.subdomain}.tektonstable.com`} target="_blank">
                    Visit Site
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
