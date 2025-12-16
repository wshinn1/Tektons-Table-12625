"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"
import { Send, Save } from "lucide-react"

interface NewsletterComposerProps {
  tenantId: string
  newsletterId?: string
  initialSubject?: string
  initialContent?: string
}

export function NewsletterComposer({
  tenantId,
  newsletterId,
  initialSubject = "",
  initialContent = "",
}: NewsletterComposerProps) {
  const [subject, setSubject] = useState(initialSubject)
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleSaveDraft = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for your newsletter",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      if (newsletterId) {
        await supabase
          .from("newsletters")
          .update({ subject, content, updated_at: new Date().toISOString() })
          .eq("id", newsletterId)
      } else {
        await supabase.from("newsletters").insert({ tenant_id: tenantId, subject, content, status: "draft" })
      }

      toast({
        title: "Draft saved",
        description: "Your newsletter draft has been saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter both subject and content",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/newsletters/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, subject, content, newsletterId }),
      })

      if (!response.ok) throw new Error("Failed to send")

      toast({
        title: "Newsletter sent",
        description: "Your newsletter has been sent to all subscribers",
      })

      setSubject("")
      setContent("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send newsletter",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compose Newsletter</CardTitle>
        <CardDescription>Create and send an email to your subscribers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Enter newsletter subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Write your newsletter content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="min-h-[300px]"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send Newsletter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
