"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CSVUpload } from "./csv-upload"
import { Button } from "@/components/ui/button"
import { UserMinus, Users } from "lucide-react"
import { unsubscribeEmail } from "@/app/actions/newsletter"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AddFollowerDialog } from "./add-follower-dialog"
import { GroupManager } from "./group-manager"
import { getSubscriberGroups, type SubscriberGroup, setSubscriberPrimaryGroup } from "@/app/actions/subscriber-groups"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Follower {
  id: string
  name: string | null
  email: string
  subscribed_at: string
  status: string
  group_id?: string | null
}

interface FinancialSupporter {
  id: string
  full_name: string | null
  email: string
  total_donated: number
  year_to_date: number
  campaign_name: string | null
}

interface SupportersManagerProps {
  tenantId: string
  followers: Follower[]
  financialSupporters: FinancialSupporter[]
}

export function SupportersManager({ tenantId, followers, financialSupporters }: SupportersManagerProps) {
  const [followersList, setFollowersList] = useState(followers)
  const [groups, setGroups] = useState<SubscriberGroup[]>([])
  const router = useRouter()

  const loadGroups = async () => {
    const fetchedGroups = await getSubscriberGroups(tenantId)
    setGroups(fetchedGroups)
  }

  useEffect(() => {
    loadGroups()
  }, [tenantId])

  const handleUnsubscribe = async (subscriberId: string) => {
    try {
      await unsubscribeEmail(subscriberId)
      toast.success("Subscriber removed")
      setFollowersList((prev) => prev.filter((f) => f.id !== subscriberId))
    } catch (error) {
      toast.error("Failed to remove subscriber")
      console.error(error)
    }
  }

  const handleGroupChange = async (subscriberId: string, groupId: string) => {
    const result = await setSubscriberPrimaryGroup(subscriberId, groupId === "none" ? null : groupId)

    if (result.success) {
      toast.success("Group updated")
      setFollowersList((prev) =>
        prev.map((f) => (f.id === subscriberId ? { ...f, group_id: groupId === "none" ? null : groupId } : f)),
      )
    } else {
      toast.error(result.error || "Failed to update group")
    }
  }

  const handleFollowerAdded = () => {
    router.refresh()
  }

  const handleImportComplete = () => {
    router.refresh()
  }

  const getGroupName = (groupId: string | null | undefined) => {
    if (!groupId) return "Followers"
    const group = groups.find((g) => g.id === groupId)
    return group?.name || "Followers"
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Supporters</h1>
        <p className="text-muted-foreground mt-2">View and manage your followers and financial supporters.</p>
      </div>

      <Tabs defaultValue="followers" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="followers">Followers ({followersList.length})</TabsTrigger>
          <TabsTrigger value="financial">Financial ({financialSupporters.length})</TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" />
            Groups ({groups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <CSVUpload tenantId={tenantId} groups={groups} onImportComplete={handleImportComplete} />
            <AddFollowerDialog tenantId={tenantId} groups={groups} onFollowerAdded={handleFollowerAdded} />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Name</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[150px]">Subscribed</TableHead>
                  <TableHead className="w-[150px]">Group</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followersList && followersList.length > 0 ? (
                  followersList.map((follower) => (
                    <TableRow key={follower.id}>
                      <TableCell className="font-medium">{follower.name || "—"}</TableCell>
                      <TableCell>{follower.email}</TableCell>
                      <TableCell>
                        {follower.subscribed_at ? new Date(follower.subscribed_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={follower.group_id || "none"}
                          onValueChange={(value) => handleGroupChange(follower.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Followers</SelectItem>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            follower.status === "subscribed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {follower.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {follower.status === "subscribed" && (
                          <Button variant="ghost" size="sm" onClick={() => handleUnsubscribe(follower.id)}>
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No followers yet. People who subscribe to your newsletter will appear here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[180px] text-right">Giving Amount</TableHead>
                  <TableHead className="w-[180px] text-right">Amount Year To Date</TableHead>
                  <TableHead className="w-[200px]">Campaign Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialSupporters && financialSupporters.length > 0 ? (
                  financialSupporters.map((supporter) => (
                    <TableRow key={supporter.id}>
                      <TableCell className="font-medium">{supporter.full_name || "—"}</TableCell>
                      <TableCell>{supporter.email}</TableCell>
                      <TableCell className="text-right font-medium">
                        $
                        {Number(supporter.total_donated || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        $
                        {Number(supporter.year_to_date || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>{supporter.campaign_name || "—"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No financial supporters yet. Donors will appear here once they make their first donation.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupManager tenantId={tenantId} groups={groups} onGroupsChange={loadGroups} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
