"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Pencil, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cancelRecurringDonation, updateRecurringAmount } from "@/app/actions/donor-actions"

interface ManageRecurringClientProps {
  tenantId: string
  subdomain: string
  stripeAccountId: string | null
  stripeCustomerId: string | null
  currentAmount: number
}

export function ManageRecurringClient({
  tenantId,
  subdomain,
  stripeAccountId,
  stripeCustomerId,
  currentAmount,
}: ManageRecurringClientProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [newAmount, setNewAmount] = useState(currentAmount.toString())
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleUpdateAmount = async () => {
    const amount = Number.parseFloat(newAmount)
    if (isNaN(amount) || amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount of at least $1",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateRecurringAmount({
        tenantId,
        stripeAccountId: stripeAccountId || "",
        stripeCustomerId: stripeCustomerId || "",
        newAmount: amount,
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Amount updated",
          description: `Your monthly donation has been updated to $${amount.toFixed(2)}`,
        })
        setUpdateDialogOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update amount. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      const result = await cancelRecurringDonation({
        tenantId,
        stripeAccountId: stripeAccountId || "",
        stripeCustomerId: stripeCustomerId || "",
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Subscription cancelled",
          description: "Your monthly donation has been cancelled.",
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 bg-transparent">
            <Pencil className="mr-2 h-4 w-4" />
            Update Amount
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Monthly Amount</DialogTitle>
            <DialogDescription>
              Change your monthly donation amount. The new amount will be applied starting with your next billing cycle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="amount">New Monthly Amount</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="pl-7"
                placeholder="50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAmount} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Amount"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="flex-1">
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Subscription
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Monthly Giving?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your monthly donation? Your support makes a real difference. You can
              always restart your giving at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Giving</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
