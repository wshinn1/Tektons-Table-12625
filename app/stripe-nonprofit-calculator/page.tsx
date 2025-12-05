import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, DollarSign } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nonprofit Fee Calculator - Tektons Table",
  description: "Calculate how much you save with Stripe's nonprofit discount rate",
}

export default function NonprofitCalculator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nonprofit Fee Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See exactly how much you'll save with Stripe's nonprofit discount rate (2.2% + $0.30 vs 2.9% + $0.30)
          </p>
        </div>

        <NonprofitFeeCalculator />
      </div>
    </div>
  )
}

function NonprofitFeeCalculator() {
  return (
    <div className="space-y-8">
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Calculate Your Savings</h2>

        <div className="space-y-6">
          <div>
            <Label htmlFor="monthly-donations">Expected Monthly Donations</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="monthly-donations" type="number" placeholder="5000" defaultValue="5000" className="pl-10" />
            </div>
          </div>

          <FeeComparison amount={5000} />
          <AnnualSavings amount={5000} />
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <PresetCard amount={1000} />
        <PresetCard amount={5000} />
        <PresetCard amount={10000} />
      </div>

      <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          How to Get Nonprofit Pricing
        </h3>
        <ol className="space-y-3 text-sm text-muted-foreground mb-6">
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            <span>Gather your IRS 501(c)(3) Determination Letter and EIN</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            <span>Create your Stripe account through Tektons Table</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            <span>Apply for nonprofit pricing in Stripe Dashboard</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">4.</span>
            <span>Upload your 501(c)(3) documentation</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">5.</span>
            <span>Get approved in 1-3 business days - done!</span>
          </li>
        </ol>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/help/article/stripe-nonprofit-discount">Read Full Guide</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

function FeeComparison({ amount }: { amount: number }) {
  const standardStripeFee = amount * 0.029 + 0.3
  const nonprofitStripeFee = amount * 0.022 + 0.3
  const platformFee = amount * 0.035

  const standardTotal = standardStripeFee + platformFee
  const nonprofitTotal = nonprofitStripeFee + platformFee

  const standardYouReceive = amount - standardTotal
  const nonprofitYouReceive = amount - nonprofitTotal

  const savings = standardTotal - nonprofitTotal

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <div className="p-6 border rounded-lg bg-muted/30">
        <div className="text-sm text-muted-foreground mb-2">Standard Pricing</div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Donation Amount</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Stripe Fee (2.9% + $0.30)</span>
            <span>-${standardStripeFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Platform Fee (3.5%)</span>
            <span>-${platformFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>You Receive</span>
            <span>${standardYouReceive.toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Total fees: {((standardTotal / amount) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="p-6 border-2 border-green-500 rounded-lg bg-green-50 relative">
        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
          NONPROFIT RATE
        </div>
        <div className="text-sm text-muted-foreground mb-2">Nonprofit Pricing</div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Donation Amount</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Stripe Fee (2.2% + $0.30)</span>
            <span>-${nonprofitStripeFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Platform Fee (3.5%)</span>
            <span>-${platformFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-lg font-bold text-green-600">
            <span>You Receive</span>
            <span>${nonprofitYouReceive.toFixed(2)}</span>
          </div>
          <div className="text-xs text-green-700 font-semibold">
            Total fees: {((nonprofitTotal / amount) * 100).toFixed(2)}% • Save ${savings.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnnualSavings({ amount }: { amount: number }) {
  const standardStripeFee = amount * 0.029 + 0.3
  const nonprofitStripeFee = amount * 0.022 + 0.3
  const monthlySavings = standardStripeFee - nonprofitStripeFee
  const annualSavings = monthlySavings * 12

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-1">Your Annual Savings</div>
        <div className="text-4xl font-bold text-green-600 mb-2">${annualSavings.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">
          That's ${monthlySavings.toFixed(2)} saved every month with nonprofit pricing
        </div>
      </div>
    </div>
  )
}

function PresetCard({ amount }: { amount: number }) {
  const standardStripeFee = amount * 0.029 + 0.3
  const nonprofitStripeFee = amount * 0.022 + 0.3
  const monthlySavings = standardStripeFee - nonprofitStripeFee
  const annualSavings = monthlySavings * 12

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="text-center space-y-3">
        <div className="text-sm text-muted-foreground">${amount.toLocaleString()}/month</div>
        <div className="text-3xl font-bold text-green-600">${annualSavings.toFixed(0)}</div>
        <div className="text-xs text-muted-foreground">saved annually</div>
      </div>
    </Card>
  )
}
