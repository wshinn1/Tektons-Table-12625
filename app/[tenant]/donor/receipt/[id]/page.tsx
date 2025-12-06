import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PrintButton } from "@/components/donor/print-button"

export default async function DonationReceipt({
  params,
}: {
  params: { tenant: string; id: string }
}) {
  const { tenant: subdomain, id: donationId } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/donor-login?redirect=/donor/receipt/${donationId}`)
  }

  // Get tenant info
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, subdomain, profile_image_url, nonprofit_ein, nonprofit_name, is_registered_nonprofit")
    .eq("subdomain", subdomain)
    .single()

  if (!tenant) {
    redirect(`/${subdomain}`)
  }

  // Get the donation
  const { data: donation } = await supabase
    .from("tenant_donations")
    .select("*")
    .eq("id", donationId)
    .eq("tenant_id", tenant.id)
    .single()

  if (!donation) {
    notFound()
  }

  // Verify the donation belongs to this user
  const { data: financialSupporter } = await supabase
    .from("tenant_financial_supporters")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .single()

  // Check if user owns this donation
  const isOwner = donation.supporter_id === financialSupporter?.id

  if (!isOwner) {
    // Also check by email in supporter_profiles
    const { data: supporterProfile } = await supabase
      .from("supporter_profiles")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("email", user.email)
      .single()

    if (donation.supporter_id !== supporterProfile?.id) {
      redirect(`/${subdomain}/donor`)
    }
  }

  const receiptDate = new Date(donation.donated_at)
  const receiptNumber = `TT-${receiptDate.getFullYear()}-${donation.id.slice(0, 8).toUpperCase()}`

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/${subdomain}/donor`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Giving
          </Link>
        </Button>

        <Card className="print:shadow-none print:border-0">
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-4">
              {tenant.profile_image_url ? (
                <img
                  src={tenant.profile_image_url || "/placeholder.svg"}
                  alt={tenant.full_name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{tenant.full_name?.charAt(0) || "T"}</span>
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">Donation Receipt</CardTitle>
            <p className="text-muted-foreground">Thank you for your generous support!</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Receipt Number</p>
                <p className="font-medium">{receiptNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">
                  {receiptDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Donation Amount */}
            <div className="bg-muted/50 p-6 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">Donation Amount</p>
              <p className="text-4xl font-bold mt-2">${donation.amount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {donation.type === "recurring" ? "Monthly Recurring Gift" : "One-Time Gift"}
              </p>
            </div>

            {/* Recipient Info */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Recipient Organization</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{tenant.nonprofit_name || tenant.full_name}</p>
                {tenant.is_registered_nonprofit && tenant.nonprofit_ein && (
                  <p className="text-muted-foreground">EIN: {tenant.nonprofit_ein}</p>
                )}
              </div>
            </div>

            {/* Tax Deductibility Notice */}
            <div className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                {tenant.is_registered_nonprofit ? (
                  <p className="text-blue-800">
                    <strong>Tax-Deductible Donation:</strong> This donation may be tax-deductible to the extent allowed
                    by law. No goods or services were provided in exchange for this contribution. Please consult your
                    tax advisor.
                  </p>
                ) : (
                  <p className="text-blue-800">
                    <strong>Note:</strong> This receipt is for your records. Please consult your tax advisor regarding
                    the deductibility of this donation.
                  </p>
                )}
              </div>
            </div>

            {/* Transaction ID */}
            <div className="text-xs text-muted-foreground text-center border-t pt-6">
              <p>Transaction ID: {donation.stripe_payment_id || donation.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Print/Download Actions */}
        <div className="flex justify-center gap-4 mt-6 print:hidden">
          <PrintButton />
        </div>
      </div>
    </div>
  )
}
