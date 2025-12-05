"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { updateNonprofitStatus } from "@/app/actions/nonprofit"
import { useToast } from "@/hooks/use-toast"

interface NonprofitSettingsFormProps {
  tenantId: string
  initialData: {
    isRegisteredNonprofit: boolean
    nonprofitName?: string | null
    nonprofitEin?: string | null
    nonprofitAddress?: string | null
    nonprofitExemptionLetterUrl?: string | null
  }
}

export function NonprofitSettingsForm({ tenantId, initialData }: NonprofitSettingsFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isNonprofit, setIsNonprofit] = useState(initialData.isRegisteredNonprofit)
  const [nonprofitName, setNonprofitName] = useState(initialData.nonprofitName || "")
  const [nonprofitEin, setNonprofitEin] = useState(initialData.nonprofitEin || "")
  const [nonprofitAddress, setNonprofitAddress] = useState(initialData.nonprofitAddress || "")
  const [exemptionLetterUrl, setExemptionLetterUrl] = useState(initialData.nonprofitExemptionLetterUrl || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateNonprofitStatus(tenantId, {
        isRegisteredNonprofit: isNonprofit,
        nonprofitName: isNonprofit ? nonprofitName : null,
        nonprofitEin: isNonprofit ? nonprofitEin : null,
        nonprofitAddress: isNonprofit ? nonprofitAddress : null,
        nonprofitExemptionLetterUrl: isNonprofit ? exemptionLetterUrl : null,
      })

      if (result.success) {
        toast({
          title: "Non-profit status updated",
          description: "Your tax-deductibility settings have been saved.",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update non-profit status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Tax-Deductibility Status</CardTitle>
          <CardDescription>
            Configure whether donations to your site are tax-deductible based on your non-profit status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only enable this if you are operating as or through a registered 501(c)(3) organization. Incorrect claims
              of tax-deductibility may have legal consequences.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="is-nonprofit" className="text-base font-semibold">
                Registered Non-Profit Organization
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable if donations are made to a 501(c)(3) and are tax-deductible
              </p>
            </div>
            <Switch id="is-nonprofit" checked={isNonprofit} onCheckedChange={setIsNonprofit} />
          </div>

          {isNonprofit && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="nonprofit-name">
                  Legal Non-Profit Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nonprofit-name"
                  value={nonprofitName}
                  onChange={(e) => setNonprofitName(e.target.value)}
                  placeholder="e.g., Global Missions Foundation"
                  required={isNonprofit}
                />
                <p className="text-xs text-muted-foreground">The official legal name of the 501(c)(3) organization</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nonprofit-ein">
                  EIN (Tax ID) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nonprofit-ein"
                  value={nonprofitEin}
                  onChange={(e) => setNonprofitEin(e.target.value)}
                  placeholder="XX-XXXXXXX"
                  required={isNonprofit}
                />
                <p className="text-xs text-muted-foreground">The IRS-issued Employer Identification Number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nonprofit-address">Official Non-Profit Address</Label>
                <Textarea
                  id="nonprofit-address"
                  value={nonprofitAddress}
                  onChange={(e) => setNonprofitAddress(e.target.value)}
                  placeholder="123 Mission Street, City, State, ZIP"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exemption-letter">IRS Determination Letter URL (Optional)</Label>
                <Input
                  id="exemption-letter"
                  type="url"
                  value={exemptionLetterUrl}
                  onChange={(e) => setExemptionLetterUrl(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Link to your IRS 501(c)(3) determination letter for donor verification
                </p>
              </div>

              <Alert variant="default" className="bg-green-50 dark:bg-green-950/20 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  When enabled, donors will see that their donations are tax-deductible and will receive receipts from{" "}
                  {nonprofitName || "your organization"}.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
