"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { deleteTenantAccount } from "@/app/actions/tenant-settings"
import { AlertTriangle } from "lucide-react"

export function DeleteTenantButton({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteTenant = async () => {
    if (
      !confirm(
        `Are you absolutely sure you want to delete ${tenantName}'s account?\n\nThis will permanently delete:\n• All their donations and supporter data\n• All posts, goals, and content\n• All newsletters and settings\n• Their user account and login\n\nThis action CANNOT be undone.`,
      )
    ) {
      return
    }

    const confirmText = prompt('Type "DELETE" to confirm:')
    if (confirmText !== "DELETE") {
      alert("Deletion cancelled")
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteTenantAccount(tenantId)
      alert(`${result.deletedTenant}'s account and all data has been permanently deleted.`)
      router.push("/admin/tenants")
    } catch (error: any) {
      alert(`Failed to delete tenant: ${error.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Delete Tenant Account</h3>
          <p className="mt-1 text-sm text-red-700">
            Permanently delete this tenant, their user account, and all associated data including donations, supporters,
            posts, and settings. This action cannot be undone.
          </p>
        </div>
      </div>
      <Button onClick={handleDeleteTenant} disabled={isDeleting} variant="destructive">
        {isDeleting ? "Deleting Account..." : "Delete Tenant & User Account"}
      </Button>
    </div>
  )
}
