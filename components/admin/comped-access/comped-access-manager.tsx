"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog"
import { Gift, Search, UserPlus, X, Clock, Infinity, AlertTriangle, Users } from "lucide-react"
import { format, formatDistanceToNow, isPast, isBefore, addDays } from "date-fns"
import { grantCompedAccess, revokeCompedAccess, searchUsers } from "@/app/actions/comped-access"
import { toast } from "sonner"

interface CompedAccess {
  id: string
  user_id: string
  reason: string | null
  starts_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
  user: { id: string; email: string } | null
  granted_by_user: { id: string; email: string } | null
}

interface CompedAccessManagerProps {
  initialCompedAccess: CompedAccess[]
  stats: {
    active: number
    permanent: number
    expiringSoon: number
  }
  currentUserId: string
}

const DURATION_OPTIONS = [
  { value: "1_month", label: "1 Month" },
  { value: "3_months", label: "3 Months" },
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
  { value: "lifetime", label: "Lifetime (Permanent)" },
]

export function CompedAccessManager({ initialCompedAccess, stats, currentUserId }: CompedAccessManagerProps) {
  const [compedAccess, setCompedAccess] = useState<CompedAccess[]>(initialCompedAccess)
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [selectedAccess, setSelectedAccess] = useState<CompedAccess | null>(null)
  const [revokeReason, setRevokeReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Grant form state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ id: string; email: string }[]>([])
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null)
  const [duration, setDuration] = useState("1_month")
  const [reason, setReason] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    const result = await searchUsers(searchQuery)
    setIsSearching(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setSearchResults(result.users || [])
  }

  const handleGrant = async () => {
    if (!selectedUser) {
      toast.error("Please select a user")
      return
    }

    setIsLoading(true)
    const result = await grantCompedAccess({
      userId: selectedUser.id,
      duration,
      reason: reason.trim() || undefined,
      grantedBy: currentUserId,
    })
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(`Comped access granted to ${selectedUser.email}`)
    setIsGrantDialogOpen(false)
    resetGrantForm()

    // Refresh the list
    if (result.compedAccess) {
      setCompedAccess([result.compedAccess as CompedAccess, ...compedAccess])
    }
  }

  const handleRevoke = async () => {
    if (!selectedAccess) return

    setIsLoading(true)
    const result = await revokeCompedAccess({
      id: selectedAccess.id,
      revokedBy: currentUserId,
      reason: revokeReason.trim() || undefined,
    })
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Comped access revoked")
    setIsRevokeDialogOpen(false)
    setSelectedAccess(null)
    setRevokeReason("")

    // Remove from list
    setCompedAccess(compedAccess.filter((ca) => ca.id !== selectedAccess.id))
  }

  const resetGrantForm = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedUser(null)
    setDuration("1_month")
    setReason("")
  }

  const getExpiryStatus = (expiresAt: string | null) => {
    if (!expiresAt) return { label: "Permanent", variant: "default" as const, icon: Infinity }

    const expiry = new Date(expiresAt)
    if (isPast(expiry)) return { label: "Expired", variant: "destructive" as const, icon: AlertTriangle }
    if (isBefore(expiry, addDays(new Date(), 7)))
      return { label: "Expiring Soon", variant: "warning" as const, icon: Clock }
    return { label: formatDistanceToNow(expiry, { addSuffix: true }), variant: "secondary" as const, icon: Clock }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Comps</div>
              <div className="text-2xl font-bold">{stats.active}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Infinity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Permanent</div>
              <div className="text-2xl font-bold">{stats.permanent}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Expiring in 30 Days</div>
              <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setIsGrantDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Grant Comped Access
        </Button>
      </div>

      {/* Active Comps List */}
      {compedAccess.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <Gift className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">No comped access grants</h3>
            <p className="mt-2 text-sm text-gray-600">
              Grant free premium access to users for promotions, VIPs, or special circumstances
            </p>
            <Button className="mt-4" onClick={() => setIsGrantDialogOpen(true)}>
              Grant First Comp
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {compedAccess.map((access) => {
            const expiryStatus = getExpiryStatus(access.expires_at)
            const ExpiryIcon = expiryStatus.icon

            return (
              <Card key={access.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{access.user?.email || "Unknown User"}</span>
                      <Badge variant={expiryStatus.variant === "warning" ? "outline" : expiryStatus.variant}>
                        <ExpiryIcon className="mr-1 h-3 w-3" />
                        {expiryStatus.label}
                      </Badge>
                    </div>

                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      {access.reason && <p>Reason: {access.reason}</p>}
                      <p>
                        Granted {format(new Date(access.created_at), "MMM d, yyyy")}
                        {access.granted_by_user && ` by ${access.granted_by_user.email}`}
                      </p>
                      {access.expires_at && (
                        <p>Expires: {format(new Date(access.expires_at), "MMM d, yyyy 'at' h:mm a")}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={() => {
                      setSelectedAccess(access)
                      setIsRevokeDialogOpen(true)
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Revoke
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Grant Access Dialog */}
      <Dialog
        open={isGrantDialogOpen}
        onOpenChange={(open) => {
          setIsGrantDialogOpen(open)
          if (!open) resetGrantForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Comped Access</DialogTitle>
            <DialogDescription>Give a user free premium access to all resources</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User Search */}
            {!selectedUser ? (
              <div className="space-y-2">
                <Label>Search User by Email</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="user@example.com"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setSearchResults([])
                        }}
                      >
                        {user.email}
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <p className="text-sm text-gray-500">No users found</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Selected User</Label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{selectedUser.email}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                placeholder="e.g., VIP supporter, contest winner, beta tester..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGrantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrant} disabled={!selectedUser || isLoading}>
              {isLoading ? "Granting..." : "Grant Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Comped Access</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately remove premium access for <strong>{selectedAccess?.user?.email}</strong>. They will
              need to subscribe to regain access.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label>Reason for Revocation (Optional)</Label>
            <Textarea
              className="mt-2"
              placeholder="e.g., Promotion ended, user requested removal..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={2}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedAccess(null)
                setRevokeReason("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleRevoke} disabled={isLoading}>
              {isLoading ? "Revoking..." : "Revoke Access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
