import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/donation-tiers"

export default async function SupporterGivingPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/supporter-login")
  }

  // Get all donations for this supporter
  const { data: donations } = await supabase
    .from("donations")
    .select(`
      *,
      tenants (
        name,
        subdomain
      )
    `)
    .eq("email", user.email)
    .order("created_at", { ascending: false })

  const totalGiven = (donations?.reduce((sum, d) => sum + d.amount, 0) || 0) * 100
  const recurringTotal = (donations?.filter((d) => d.subscription_id).reduce((sum, d) => sum + d.amount, 0) || 0) * 100
  const oneTimeTotal = (donations?.filter((d) => !d.subscription_id).reduce((sum, d) => sum + d.amount, 0) || 0) * 100

  return (
    <div className="container mx-auto py-8 px-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Giving History</h1>
        <p className="text-muted-foreground">View all your donations and support</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Given</CardTitle>
            <CardDescription>All-time giving</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalGiven)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recurring Support</CardTitle>
            <CardDescription>Monthly commitments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(recurringTotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>One-Time Gifts</CardTitle>
            <CardDescription>Special donations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(oneTimeTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Your complete giving history</CardDescription>
        </CardHeader>
        <CardContent>
          {!donations || donations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No donations yet</p>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{donation.tenants?.name || "Unknown Missionary"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(donation.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {donation.subscription_id && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Recurring</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(donation.amount * 100)}</p>
                    <p className="text-sm text-muted-foreground capitalize">{donation.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
