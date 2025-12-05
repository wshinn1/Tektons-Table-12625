"use client"

import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck } from "lucide-react"
import { useState } from "react"

interface BlogPostFollowButtonProps {
  tenantId: string
  tenantName: string
}

export function BlogPostFollowButton({ tenantId, tenantName }: BlogPostFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    setIsLoading(true)
    // TODO: Implement follow functionality in Phase 4
    // For now, just toggle the state
    setIsFollowing(!isFollowing)
    setIsLoading(false)
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleFollow}
      disabled={isLoading}
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  )
}
