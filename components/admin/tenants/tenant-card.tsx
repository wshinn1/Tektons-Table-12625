"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteTenantAccount } from "@/app/actions/tenant-settings"
import { toast } from "sonner"

interface TenantCardProps {
  tenant: {
    tenant_id: string
    full_name: string
    email: string
    subdomain: string
    is_active: boolean
    onboarding_completed: boolean
    mission_organization: string
    location: string
    platform_fee_percentage: number
    total_donations: number
    total_platform_fees: number
    total_tips: number
    last_donation_at: string | null
    donation_count: number
    unique_supporters: number
  }
}

export function TenantCard({ tenant }: TenantCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const siteUrl = `https://${tenant.subdomain}.tektonstable.com`

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteTenantAccount(tenant.tenant_id)
      if (result.success) {
        toast.success(`Deleted tenant: ${result.deletedTenant}`)
        router.refresh()
      } else {
        toast.error("Failed to delete tenant")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tenant")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        {/* Left: Tenant Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold">{tenant.full_name}</h3>
              <p className="text-sm text-muted-foreground">{tenant.email}</p>
            </div>
            {tenant.is_active ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
            {!tenant.onboarding_completed && <Badge variant="outline">Onboarding</Badge>}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{tenant.mission_organization}</span>
            <span>•</span>
            <span>{tenant.location}</span>
            <span>•</span>
            <span>Fee: {tenant.platform_fee_percentage || 3.5}%</span>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={siteUrl} target="_blank" rel="noopener noreferrer">
                🔗 Visit Site
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/tenants/${tenant.tenant_id}`}>View Details</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Tenant Account</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Are you sure you want to delete <strong>{tenant.full_name}</strong>?
                    </p>
                    <p className="text-destructive font-medium">This will permanently delete:</p>
                    <ul className="list-disc list-inside text-sm">
                      <li>Their tenant site ({tenant.subdomain}.tektonstable.com)</li>
                      <li>All donations and supporter records</li>
                      <li>All newsletters and campaigns</li>
                      <li>Their user account and login</li>
                    </ul>
                    <p className="text-destructive font-bold">This action cannot be undone.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Right: Financial Stats */}
        <div className="grid grid-cols-2 gap-4 ml-8">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">${tenant.total_donations.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Donations</div>
          </div>

          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">${tenant.total_platform_fees.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Platform Fees Paid</div>
          </div>

          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{tenant.donation_count}</div>
            <div className="text-xs text-muted-foreground mt-1">Donations</div>
          </div>

          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{tenant.unique_supporters}</div>
            <div className="text-xs text-muted-foreground mt-1">Supporters</div>
          </div>

          {tenant.last_donation_at && (
            <div className="col-span-2 text-center text-xs text-muted-foreground mt-2">
              Last donation: {new Date(tenant.last_donation_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
