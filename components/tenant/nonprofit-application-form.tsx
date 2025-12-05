"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock, XCircle, Upload } from "lucide-react"
import { submitNonprofitApplication } from "@/app/actions/nonprofit"
import { useToast } from "@/hooks/use-toast"

interface NonprofitApplicationFormProps {
  tenantId: string
  initialData: {
    nonprofitStatus: "none" | "pending" | "approved" | "rejected"
    nonprofitName?: string | null
    nonprofitEin?: string | null
    nonprofitAddress?: string | null
    nonprofitExemptionLetterUrl?: string | null
    nonprofitRejectionReason?: string | null
    nonprofitSubmittedAt?: string | null
    nonprofitVerifiedAt?: string | null
  }
}

export function NonprofitApplicationForm({ tenantId, initialData }: NonprofitApplicationFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [nonprofitName, setNonprofitName] = useState(initialData.nonprofitName || "")
  const [nonprofitEin, setNonprofitEin] = useState(initialData.nonprofitEin || "")
  const [nonprofitAddress, setNonprofitAddress] = useState(initialData.nonprofitAddress || "")
  const [exemptionLetterUrl, setExemptionLetterUrl] = useState(initialData.nonprofitExemptionLetterUrl || "")

  const status = initialData.nonprofitStatus

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await submitNonprofitApplication(tenantId, {
        nonprofitName,
        nonprofitEin,
        nonprofitAddress,
        nonprofitExemptionLetterUrl: exemptionLetterUrl,
      })

      if (result.success) {
        toast({
          title: "Application submitted",
          description: "Your non-profit application has been submitted for review. You'll be notified once reviewed.",
        })
        // Reload page to show pending status
        window.location.reload()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tax-Deductibility Status</CardTitle>
            <CardDescription>Submit your 501(c)(3) non-profit information for verification</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only submit if you are operating as or through a registered 501(c)(3) organization. Applications will be
            reviewed by our team to verify non-profit status before tax-deductibility is enabled.
          </AlertDescription>
        </Alert>

        {status === "approved" && (
          <Alert variant="default" className="bg-green-50 dark:bg-green-950/20 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Your non-profit status has been verified. Donations to your site are now displayed as tax-deductible.
              {initialData.nonprofitVerifiedAt && (
                <span className="block text-xs mt-1">
                  Approved on {new Date(initialData.nonprofitVerifiedAt).toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "pending" && (
          <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Your application is under review. We'll notify you once it's been reviewed (typically within 2-3 business
              days).
              {initialData.nonprofitSubmittedAt && (
                <span className="block text-xs mt-1">
                  Submitted on {new Date(initialData.nonprofitSubmittedAt).toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "rejected" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Your application was not approved.
              {initialData.nonprofitRejectionReason && (
                <span className="block mt-1 font-medium">Reason: {initialData.nonprofitRejectionReason}</span>
              )}
              <span className="block text-xs mt-2">You may resubmit with corrected information.</span>
            </AlertDescription>
          </Alert>
        )}

        {(status === "none" || status === "rejected") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nonprofit-name">
                Legal Non-Profit Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nonprofit-name"
                value={nonprofitName}
                onChange={(e) => setNonprofitName(e.target.value)}
                placeholder="e.g., Global Missions Foundation"
                required
              />
              <p className="text-xs text-muted-foreground">The official legal name as registered with the IRS</p>
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
                pattern="[0-9]{2}-[0-9]{7}"
                required
              />
              <p className="text-xs text-muted-foreground">Format: XX-XXXXXXX (we'll verify this with IRS records)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nonprofit-address">
                Official Non-Profit Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="nonprofit-address"
                value={nonprofitAddress}
                onChange={(e) => setNonprofitAddress(e.target.value)}
                placeholder="123 Mission Street, City, State, ZIP"
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">The official address registered with the IRS</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exemption-letter">
                IRS Determination Letter URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exemption-letter"
                type="url"
                value={exemptionLetterUrl}
                onChange={(e) => setExemptionLetterUrl(e.target.value)}
                placeholder="https://..."
                required
              />
              <p className="text-xs text-muted-foreground">
                <Upload className="h-3 w-3 inline mr-1" />
                Link to your IRS 501(c)(3) determination letter (upload to Google Drive/Dropbox and paste the share
                link)
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </form>
        )}

        {status === "pending" && (
          <div className="pt-4 border-t">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium">Submitted Information:</p>
              <div className="grid gap-1">
                <p>
                  <span className="font-medium">Organization:</span> {initialData.nonprofitName}
                </p>
                <p>
                  <span className="font-medium">EIN:</span> {initialData.nonprofitEin}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {initialData.nonprofitAddress}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
