"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSubscribers, addSubscriber, unsubscribeEmail, getAllEmailRecipients } from "@/app/actions/newsletter"
import { toast } from "sonner"
import { UserMinus, Mail, RefreshCw } from "lucide-react"

interface Subscriber {
  id: string
  email: string
  name: string | null
  subscribed_at: string
}

export function SubscribersList({ tenantId }: { tenantId: string }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [allRecipients, setAllRecipients] = useState<Array<{ email: string; name: string | null }>>([])
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)

  useEffect(() => {
    loadSubscribers()
    loadAllRecipients()
  }, [tenantId])

  const loadSubscribers = async () => {
    try {
      const data = await getSubscribers(tenantId)
      setSubscribers(data)
    } catch (error) {
      toast.error("Failed to load subscribers")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllRecipients = async () => {
    setIsLoadingRecipients(true)
    try {
      const data = await getAllEmailRecipients(tenantId)
      setAllRecipients(data)
    } catch (error) {
      console.error("Failed to load all recipients:", error)
    } finally {
      setIsLoadingRecipients(false)
    }
  }

  const handleAddSubscriber = async () => {
    if (!newEmail) {
      toast.error("Please enter an email address")
      return
    }

    setIsAdding(true)
    try {
      await addSubscriber(tenantId, newEmail, newName || undefined)
      toast.success("Follower added and subscribed to emails")
      setNewEmail("")
      setNewName("")
      loadSubscribers()
      loadAllRecipients()
    } catch (error) {
      toast.error("Failed to add subscriber")
      console.error(error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleUnsubscribe = async (subscriberId: string) => {
    try {
      await unsubscribeEmail(subscriberId)
      toast.success("Subscriber removed")
      loadSubscribers()
      loadAllRecipients()
    } catch (error) {
      toast.error("Failed to remove subscriber")
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Subscriber Manually</CardTitle>
          <CardDescription>Add individual subscribers to your email list (automatically subscribed)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="subscriber@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input id="name" placeholder="John Doe" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleAddSubscriber} disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Subscriber"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Email Recipients ({allRecipients.length})</CardTitle>
              <CardDescription>Followers and financial supporters who will receive your newsletters</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadAllRecipients} disabled={isLoadingRecipients}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingRecipients ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRecipients ? (
            <p className="text-sm text-muted-foreground">Loading recipients...</p>
          ) : allRecipients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No email recipients yet. Add followers or receive donations to build your list!
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allRecipients.map((recipient, index) => (
                <div key={`${recipient.email}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{recipient.name || recipient.email}</p>
                    {recipient.name && <p className="text-sm text-muted-foreground">{recipient.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Followers Only ({subscribers.length})</CardTitle>
          <CardDescription>Manage your newsletter followers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading subscribers...</p>
          ) : subscribers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No followers yet. Add some to get started!</p>
          ) : (
            <div className="space-y-2">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{subscriber.name || subscriber.email}</p>
                      {subscriber.name && <p className="text-sm text-muted-foreground">{subscriber.email}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleUnsubscribe(subscriber.id)}>
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
