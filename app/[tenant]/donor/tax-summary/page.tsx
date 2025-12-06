"use client"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, FileText } from "lucide-react"
import Link from "next/link"

export default async function TaxSummary({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/donor-login?redirect=/donor/tax-summary`)
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

  // Get financial supporter record
  const { data: financialSupporter } = await supabase
    .from("tenant_financial_supporters")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .single()

  // Get all donations for the current year and previous year
  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1

  const { data: currentYearDonations } = await supabase
    .from("tenant_donations")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("supporter_id", financialSupporter?.id || "00000000-0000-0000-0000-000000000000")
    .eq("status", "completed")
    .gte("donated_at", `${currentYear}-01-01`)
    .lte("donated_at", `${currentYear}-12-31`)
    .order("donated_at", { ascending: false })

  const { data: previousYearDonations } = await supabase
    .from("tenant_donations")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("supporter_id", financialSupporter?.id || "00000000-0000-0000-0000-000000000000")
    .eq("status", "completed")
    .gte("donated_at", `${previousYear}-01-01`)
    .lte("donated_at", `${previousYear}-12-31`)
    .order("donated_at", { ascending: false })

  const currentYearTotal = (currentYearDonations || []).reduce((sum, d) => sum + (d.amount || 0), 0)
  const previousYearTotal = (previousYearDonations || []).reduce((sum, d) => sum + (d.amount || 0), 0)

  const YearSummary = ({
    year,
    donations,
    total,
  }: {
    year: number
    donations: any[]
    total: number
  }) => (
    <Card className="print:shadow-none print:border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{year} Tax Summary</span>
          <span className="text-2xl">${total.toFixed(2)}</span>
        </CardTitle>
        <CardDescription>
          {donations.length} donation{donations.length !== 1 ? "s" : ""} made in {year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No donations recorded for {year}</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground border-b pb-2">
              <span>Date</span>
              <span>Type</span>
              <span className="text-right">Amount</span>
            </div>
            {donations.map((donation) => (
              <div key={donation.id} className="grid grid-cols-3 text-sm py-2 border-b border-dashed">
                <span>
                  {new Date(donation.donated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="capitalize">{donation.type.replace("_", "-")}</span>
                <span className="text-right font-medium">${donation.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-sm font-bold pt-2">
              <span>Total</span>
              <span></span>
              <span className="text-right">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/${subdomain}/donor`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Giving
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8 print:mb-4">
          <div className="flex items-center gap-4 mb-4">
            {tenant.profile_image_url ? (
              <img
                src={tenant.profile_image_url || "/placeholder.svg"}
                alt={tenant.full_name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">Tax Summary</h1>
              <p className="text-muted-foreground">Donations to {tenant.full_name}</p>
            </div>
          </div>
          {tenant.is_registered_nonprofit && tenant.nonprofit_ein && (
            <p className="text-sm text-muted-foreground">Organization EIN: {tenant.nonprofit_ein}</p>
          )}
        </div>

        {/* Year Summaries */}
        <div className="space-y-6">
          <YearSummary year={currentYear} donations={currentYearDonations || []} total={currentYearTotal} />
          <YearSummary year={previousYear} donations={previousYearDonations || []} total={previousYearTotal} />
        </div>

        {/* Tax Notice */}
        <Card className="mt-6 print:mt-4">
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              {tenant.is_registered_nonprofit ? (
                <p className="text-blue-800">
                  <strong>Tax-Deductible Donations:</strong> These donations may be tax-deductible to the extent allowed
                  by law. No goods or services were provided in exchange for these contributions. This summary is
                  provided for your records. Please consult your tax advisor.
                </p>
              ) : (
                <p className="text-blue-800">
                  <strong>Note:</strong> This summary is provided for your records. Please consult your tax advisor
                  regarding the deductibility of these donations.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Print Actions */}
        <div className="flex justify-center gap-4 mt-6 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Summary
          </Button>
        </div>
      </div>
    </div>
  )
}
