"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Trash2, Check, Archive } from "lucide-react"
import { updateMessageStatus, deleteContactMessage } from "@/app/actions/contact"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "archived"
  created_at: string
}

export function ContactSubmissionsList({
  submissions,
  tenantId,
}: {
  submissions: ContactSubmission[]
  tenantId: string
}) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("all")

  const filteredSubmissions = submissions.filter((sub) => {
    if (selectedTab === "new") return sub.status === "new"
    if (selectedTab === "read") return sub.status === "read"
    if (selectedTab === "archived") return sub.status === "archived"
    return true
  })

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateMessageStatus(id, "read")
      toast.success("Marked as read")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update message")
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await updateMessageStatus(id, "archived")
      toast.success("Message archived")
      router.refresh()
    } catch (error) {
      toast.error("Failed to archive message")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      await deleteContactMessage(id)
      toast.success("Message deleted")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete message")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">New</Badge>
      case "read":
        return <Badge variant="secondary">Read</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return null
    }
  }

  return (
    <div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
          <TabsTrigger value="new">New ({submissions.filter((s) => s.status === "new").length})</TabsTrigger>
          <TabsTrigger value="read">Read ({submissions.filter((s) => s.status === "read").length})</TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({submissions.filter((s) => s.status === "archived").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages found</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{submission.subject}</CardTitle>
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{submission.name}</span>
                        {" · "}
                        <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                          {submission.email}
                        </a>
                        {" · "}
                        {new Date(submission.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap mb-4">{submission.message}</p>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${submission.email}?subject=Re: ${submission.subject}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Reply
                      </a>
                    </Button>

                    {submission.status === "new" && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(submission.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark Read
                      </Button>
                    )}

                    {submission.status !== "archived" && (
                      <Button size="sm" variant="outline" onClick={() => handleArchive(submission.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                    )}

                    <Button size="sm" variant="outline" onClick={() => handleDelete(submission.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
