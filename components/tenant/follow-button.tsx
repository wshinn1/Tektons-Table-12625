"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { followTenant, unfollowTenant } from "@/app/actions/follower"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, UserCheck, Clock } from "lucide-react"

interface FollowButtonProps {
  tenantId: string
  initialStatus: string | null
  isLoggedIn: boolean
}

export function FollowButton({ tenantId, initialStatus, isLoggedIn }: FollowButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFollow = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in or create an account to follow this missionary.",
        variant: "destructive",
      })
      // TODO: Redirect to login page
      return
    }

    setIsLoading(true)

    if (status === "approved") {
      // Unfollow
      const result = await unfollowTenant(tenantId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setStatus(null)
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this missionary.",
        })
      }
    } else {
      // Follow
      const result = await followTenant(tenantId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setStatus("pending")
        toast({
          title: "Follow Request Sent",
          description: "Your request is pending approval from the missionary.",
        })
      }
    }

    setIsLoading(false)
  }

  if (status === "pending") {
    return (
      <Button variant="outline" disabled>
        <Clock className="mr-2 h-4 w-4" />
        Pending
      </Button>
    )
  }

  if (status === "approved") {
    return (
      <Button variant="outline" onClick={handleFollow} disabled={isLoading}>
        <UserCheck className="mr-2 h-4 w-4" />
        Following
      </Button>
    )
  }

  return (
    <Button onClick={handleFollow} disabled={isLoading}>
      <UserPlus className="mr-2 h-4 w-4" />
      Follow
    </Button>
  )
}
