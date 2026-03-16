import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/donation-tiers"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default async function DonorGivingHistory({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${tenantSlug}/auth/donor-login?redirect=/${tenantSlug}/donor/giving`)
  }

  // Get tenant info
  const { data: tenant } = await supabase.from("tenants").select("id, full_name").eq("subdomain", tenantSlug).single()

  if (!tenant) {
    redirect(`/${tenantSlug}`)
  }

  // Get all donations for this donor to this tenant
  const { data: donations } = await supabase
    .from("donations")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .eq("status", "completed") // Added status filter for completed donations only
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalGiven = donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0
  const recurringTotal =
    donations?.filter((d) => d.subscription_id).reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0
  const oneTimeTotal =
    donations?.filter((d) => !d.subscription_id).reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  // Group donations by year
  const donationsByYear: Record<string, typeof donations> = {}
  donations?.forEach((donation) => {
    const year = new Date(donation.created_at).getFullYear().toString()
    if (!donationsByYear[year]) {
      donationsByYear[year] = []
    }
    donationsByYear[year]!.push(donation)
  })

  const years = Object.keys(donationsByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Giving History</h1>
          <p className="text-muted-foreground">Your complete donation history to {tenant.full_name}</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Given</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalGiven * 100)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recurring Gifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(recurringTotal * 100)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">One-Time Gifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(oneTimeTotal * 100)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Donations by Year */}
      {years.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No donations yet</p>
          </CardContent>
        </Card>
      ) : (
        years.map((year) => {
          const yearDonations = donationsByYear[year] || []
          const yearTotal = yearDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0)

          return (
            <Card key={year}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{year}</CardTitle>
                  <p className="text-lg font-bold">{formatCurrency(yearTotal * 100)}</p>
                </div>
                <CardDescription>
                  {yearDonations.length} donation{yearDonations.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {yearDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">
                          {new Date(donation.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          {donation.subscription_id && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Recurring</span>
                          )}
                          <span className="text-xs text-muted-foreground capitalize">{donation.status}</span>
                        </div>
                      </div>
                      <p className="font-bold">{formatCurrency(Number(donation.amount || 0) * 100)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
