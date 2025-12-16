import { CardContent } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DeleteTenantButton } from "@/components/admin/delete-tenant-button"

export const dynamic = "force-dynamic"

interface TenantDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    redirect("/admin/tenants")
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  const { data: tenant, error: tenantError } = await supabase.from("tenants").select("*").eq("id", id).single()

  if (tenantError || !tenant) {
    redirect("/admin/tenants")
  }

  const { data: donations } = await supabase
    .from("donations")
    .select("id, amount, platform_fee, tip_amount, created_at, supporters(full_name, email)")
    .eq("tenant_id", id)
    .order("created_at", { ascending: false })

  const allDonations = donations || []
  const totalDonations = allDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
  const totalPlatformFees = allDonations.reduce((sum, d) => sum + (d.platform_fee || 0), 0)
  const totalTips = allDonations.reduce((sum, d) => sum + (d.tip_amount || 0), 0)
  const uniqueSupporterIds = new Set(allDonations.map((d) => d.supporters?.email).filter(Boolean))
  const recentDonations = allDonations.slice(0, 10)

  const siteUrl = `https://${tenant.subdomain}.tektonstable.com`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/tenants" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Tenants
          </Link>
          <h1 className="text-3xl font-bold mt-2">{tenant.full_name}</h1>
          <p className="text-muted-foreground">{tenant.email}</p>
        </div>
        <Button asChild>
          <Link href={siteUrl} target="_blank" rel="noopener noreferrer">
            Visit Site →
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Donations</div>
          <div className="text-3xl font-bold mt-2">${totalDonations.toLocaleString()}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Platform Fees</div>
          <div className="text-3xl font-bold mt-2 text-blue-600">${totalPlatformFees.toLocaleString()}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Tips</div>
          <div className="text-3xl font-bold mt-2">${totalTips.toLocaleString()}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Supporters</div>
          <div className="text-3xl font-bold mt-2">{uniqueSupporterIds.size}</div>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Organization</div>
            <div className="font-medium">{tenant.mission_organization || "Not specified"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="font-medium">{tenant.location || "Not specified"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Platform Fee</div>
            <div className="font-medium">{tenant.platform_fee_percentage}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Site URL</div>
            <Link href={siteUrl} target="_blank" className="font-medium text-blue-600 hover:underline">
              {siteUrl}
            </Link>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="flex gap-2 mt-1">
              {tenant.is_active ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
              {!tenant.onboarding_completed && <Badge variant="outline">Onboarding</Badge>}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Member Since</div>
            <div className="font-medium">{new Date(tenant.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </Card>

      {/* Recent Donations */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
        <div className="space-y-2">
          {recentDonations.length > 0 ? (
            recentDonations.map((donation: any) => (
              <div key={donation.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{donation.supporters?.full_name || "Anonymous"}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${donation.amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    Fee: ${(donation.platform_fee || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No donations yet</p>
          )}
        </div>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteTenantButton tenantId={id} tenantName={tenant.full_name} />
        </CardContent>
      </Card>
    </div>
  )
}
