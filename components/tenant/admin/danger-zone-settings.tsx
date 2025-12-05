"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requestAccountDeletion } from "@/app/actions/tenant-settings"

export function DangerZoneSettings({ tenantId }: { tenantId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRequestDeletion = async () => {
    if (
      !confirm(
        "Are you sure you want to request account deletion? This will notify the platform administrators. Your account will remain active until an admin approves the request.",
      )
    ) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await requestAccountDeletion(tenantId)
      setSuccess(true)
      alert("Account deletion request submitted. You will receive an email confirmation within 24 hours.")
    } catch (error: any) {
      setError(error.message || "Failed to request deletion")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Danger Zone</CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="font-semibold text-red-900">Request Account Deletion</h3>
          <p className="mt-2 text-sm text-red-700">
            Once you request deletion, an administrator will review your request. Your account and all associated data
            will be permanently deleted after approval. This action cannot be undone.
          </p>
          <Button
            onClick={handleRequestDeletion}
            disabled={isDeleting || success}
            variant="destructive"
            className="mt-4"
          >
            {isDeleting ? "Submitting Request..." : success ? "Request Submitted" : "Request Account Deletion"}
          </Button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">Deletion request submitted successfully!</p>}
        </div>
      </CardContent>
    </Card>
  )
}
