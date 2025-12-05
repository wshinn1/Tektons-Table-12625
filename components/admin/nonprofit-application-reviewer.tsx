"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react"
import { approveNonprofitApplication, rejectNonprofitApplication } from "@/app/actions/nonprofit"
import { useToast } from "@/hooks/use-toast"

interface NonprofitApplicationReviewerProps {
  application: {
    id: string
    subdomain: string
    full_name: string
    nonprofit_status: string
    nonprofit_name: string | null
    nonprofit_ein: string | null
    nonprofit_address: string | null
    nonprofit_exemption_letter_url: string | null
    nonprofit_submitted_at: string | null
    nonprofit_verified_at: string | null
    nonprofit_rejection_reason: string | null
  }
}

export function NonprofitApplicationReviewer({ application }: NonprofitApplicationReviewerProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this non-profit application? This will enable tax-deductibility.")) {
      return
    }

    setLoading(true)
    try {
      const result = await approveNonprofitApplication(application.id)
      if (result.success) {
        toast({
          title: "Application approved",
          description: "Tax-deductibility has been enabled for this missionary.",
        })
        window.location.reload()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve application",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await rejectNonprofitApplication(application.id, rejectionReason)
      if (result.success) {
        toast({
          title: "Application rejected",
          description: "The missionary will be notified of the rejection.",
        })
        window.location.reload()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject application",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (application.nonprofit_status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {application.full_name}
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              @{application.subdomain} • Submitted{" "}
              {application.nonprofit_submitted_at
                ? new Date(application.nonprofit_submitted_at).toLocaleDateString()
                : "N/A"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-muted-foreground">Organization Name</Label>
            <p className="font-medium">{application.nonprofit_name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">EIN (Tax ID)</Label>
            <p className="font-medium font-mono">{application.nonprofit_ein}</p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-muted-foreground">Address</Label>
            <p className="font-medium">{application.nonprofit_address}</p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-muted-foreground">IRS Determination Letter</Label>
            {application.nonprofit_exemption_letter_url ? (
              <a
                href={application.nonprofit_exemption_letter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                View Document <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="text-muted-foreground">Not provided</p>
            )}
          </div>
        </div>

        {application.nonprofit_rejection_reason && (
          <div className="pt-4 border-t">
            <Label className="text-destructive">Rejection Reason</Label>
            <p className="text-sm mt-1">{application.nonprofit_rejection_reason}</p>
          </div>
        )}

        {application.nonprofit_status === "pending" && (
          <div className="flex gap-2 pt-4 border-t">
            {!showRejectForm ? (
              <>
                <Button onClick={handleApprove} disabled={loading} className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Application
                </Button>
                <Button onClick={() => setShowRejectForm(true)} variant="outline" disabled={loading} className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </>
            ) : (
              <div className="w-full space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Reason for Rejection</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., EIN verification failed, documentation incomplete..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReject} variant="destructive" disabled={loading} className="flex-1">
                    Confirm Rejection
                  </Button>
                  <Button onClick={() => setShowRejectForm(false)} variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
