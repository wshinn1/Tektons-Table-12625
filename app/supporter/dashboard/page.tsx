import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmailPreferences } from "@/components/supporter/email-preferences"

export default async function SupporterDashboard() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/supporter-login")
  }

  // Get all supporter records for this email across all tenants
  const { data: supporters } = await supabase
    .from("supporters")
    .select("*, tenants(full_name, subdomain, profile_image_url)")
    .eq("email", user.email)

  // Get all donations across all tenants for this email
  const { data: donations } = await supabase
    .from("donations")
    .select("*, tenants(full_name, subdomain), supporters!inner(email)")
    .eq("supporters.email", user.email)
    .order("created_at", { ascending: false })

  // Get supporter profile
  const { data: supporterProfile } = await supabase
    .from("supporter_profiles")
    .select("*")
    .eq("email", user.email)
    .single()

  const totalDonated = donations?.reduce((sum, d) => sum + Number.parseFloat(d.amount || "0"), 0) || 0

  // Group tenants by unique tenant_id
  const uniqueTenants = Array.from(new Map(supporters?.map((s) => [s.tenant_id, s.tenants]) || []).values())

  // Calculate recurring monthly total
  const monthlyRecurring =
    supporters
      ?.filter((s) => s.is_recurring)
      .reduce((sum, s) => sum + Number.parseFloat(s.recurring_amount || "0"), 0) || 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supporter Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {supporters?.[0]?.full_name || supporterProfile?.full_name || user.email}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Given</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalDonated.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{donations?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{uniqueTenants.length}</p>
              <p className="text-sm text-muted-foreground">
                {uniqueTenants.length === 1 ? "Missionary" : "Missionaries"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Giving</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${monthlyRecurring.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Missionaries You Support</CardTitle>
            <CardDescription>Your current missionary partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            {uniqueTenants.length === 0 && donations?.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">You haven't made any donations yet</p>
                <p className="text-sm text-muted-foreground">Start supporting missionaries to see your impact here</p>
                <Button asChild>
                  <a href="/">Browse Missionaries</a>
                </Button>
              </div>
            )}

            {uniqueTenants.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {uniqueTenants.map((tenant: any, index) => {
                  const tenantSupporter = supporters?.find((s) => s.tenant_id === tenant.id)
                  const tenantDonations = donations?.filter((d) => d.tenant_id === tenant.id) || []
                  const tenantTotal = tenantDonations.reduce((sum, d) => sum + Number.parseFloat(d.amount || "0"), 0)

                  return (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          {tenant.profile_image_url && (
                            <img
                              src={tenant.profile_image_url || "/placeholder.svg"}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{tenant.full_name}</p>
                            <p className="text-sm text-muted-foreground">{tenant.subdomain}.tektonstable.com</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Given:</span>
                            <span className="font-medium">${tenantTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Donations:</span>
                            <span className="font-medium">{tenantDonations.length}</span>
                          </div>
                          {tenantSupporter?.is_recurring && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Monthly:</span>
                              <span className="font-medium text-green-600">
                                ${Number.parseFloat(tenantSupporter.recurring_amount || "0").toFixed(2)}/mo
                              </span>
                            </div>
                          )}
                        </div>
                        <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                          <a
                            href={`https://${tenant.subdomain}.tektonstable.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Site
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              donations && donations.length > 0 && <p className="text-muted-foreground">Loading your missionaries...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your giving history across all missionaries</CardDescription>
          </CardHeader>
          <CardContent>
            {donations && donations.length > 0 ? (
              <div className="space-y-4">
                {donations.slice(0, 10).map((donation) => (
                  <div key={donation.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">${Number.parseFloat(donation.amount || "0").toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{donation.tenants?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{donation.is_recurring ? "Monthly" : "One-time"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{donation.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No donations yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Recurring Donations</CardTitle>
            <CardDescription>Update or cancel your recurring support</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Open Stripe Portal</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Preferences</CardTitle>
            <CardDescription>Manage how you hear from missionaries you support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EmailPreferences
              email={user.email || ""}
              currentPreference={supporterProfile?.email_notifications ?? true}
            />

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                You're subscribed to updates from {uniqueTenants.length}{" "}
                {uniqueTenants.length === 1 ? "missionary" : "missionaries"}
              </p>
              <p className="text-xs text-muted-foreground">
                To unsubscribe from a specific missionary, visit their site and manage your preferences there.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>Manage your email notification settings</CardDescription>
          </CardHeader>
          <CardContent>
            <EmailPreferences
              email={user.email || ""}
              currentPreference={supporters?.[0]?.email_notifications ?? true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
