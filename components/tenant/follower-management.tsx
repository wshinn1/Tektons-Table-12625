"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { approveFollower, rejectFollower } from "@/app/actions/follower"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CheckCircle, XCircle, UserCheck, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Props {
  tenantId: string
  tenantSlug: string
}

export function FollowerManagement({ tenantId, tenantSlug }: Props) {
  const [followers, setFollowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowers()
  }, [tenantId])

  async function loadFollowers() {
    const supabase = createBrowserClient()

    // Get all followers with their profiles
    const { data: followersData } = await supabase
      .from("tenant_followers")
      .select(
        `
        *,
        follower:supporter_profiles!tenant_followers_follower_id_fkey(*)
      `,
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    setFollowers(followersData || [])
    setLoading(false)
  }

  async function handleApprove(followerId: string) {
    try {
      await approveFollower(tenantId, followerId)
      toast.success("Follower approved!")
      loadFollowers()
    } catch (error) {
      toast.error("Failed to approve follower")
    }
  }

  async function handleReject(followerId: string) {
    try {
      await rejectFollower(tenantId, followerId)
      toast.success("Follower rejected")
      loadFollowers()
    } catch (error) {
      toast.error("Failed to reject follower")
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "?"
    const parts = name.split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const pendingFollowers = followers.filter((f) => f.status === "pending")
  const approvedFollowers = followers.filter((f) => f.status === "approved")
  const rejectedFollowers = followers.filter((f) => f.status === "rejected")

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading followers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <CardTitle>Pending Requests</CardTitle>
            <Badge variant="secondary">{pendingFollowers.length}</Badge>
          </div>
          <CardDescription>Review and approve follower requests</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingFollowers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingFollowers.map((follower) => (
                <div
                  key={follower.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={follower.follower?.avatar_url || "/placeholder.svg"}
                        alt={follower.follower?.full_name}
                      />
                      <AvatarFallback>{getInitials(follower.follower?.full_name || "Unknown")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follower.follower?.full_name || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{follower.follower?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested {formatDistanceToNow(new Date(follower.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(follower.follower_id)} className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(follower.follower_id)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Followers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            <CardTitle>Approved Followers</CardTitle>
            <Badge variant="secondary">{approvedFollowers.length}</Badge>
          </div>
          <CardDescription>Your active followers who can access restricted content</CardDescription>
        </CardHeader>
        <CardContent>
          {approvedFollowers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No approved followers yet</p>
          ) : (
            <div className="space-y-4">
              {approvedFollowers.map((follower) => (
                <div key={follower.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={follower.follower?.avatar_url || "/placeholder.svg"}
                        alt={follower.follower?.full_name}
                      />
                      <AvatarFallback>{getInitials(follower.follower?.full_name || "Unknown")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follower.follower?.full_name || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{follower.follower?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Following since {formatDistanceToNow(new Date(follower.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejected Requests */}
      {rejectedFollowers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <CardTitle>Rejected Requests</CardTitle>
              <Badge variant="secondary">{rejectedFollowers.length}</Badge>
            </div>
            <CardDescription>Previously rejected follower requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejectedFollowers.map((follower) => (
                <div
                  key={follower.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={follower.follower?.avatar_url || "/placeholder.svg"}
                        alt={follower.follower?.full_name}
                      />
                      <AvatarFallback>{getInitials(follower.follower?.full_name || "Unknown")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follower.follower?.full_name || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{follower.follower?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Rejected
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
