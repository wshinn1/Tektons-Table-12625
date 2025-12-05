"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Send, ArrowLeft, TestTube } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { EditorRef, EmailEditorProps } from "react-email-editor"

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

const UNLAYER_PROJECT_ID = process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID

interface NewsletterEditorProps {
  newsletter?: any
}

export function NewsletterEditor({ newsletter }: NewsletterEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const emailEditorRef = useRef<EditorRef | null>(null)

  const [loading, setLoading] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const [contactGroups, setContactGroups] = useState<any[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>(newsletter?.target_groups || [])

  const [formData, setFormData] = useState({
    subject: newsletter?.subject || "",
    preview_text: newsletter?.preview_text || "",
  })

  const [testEmail, setTestEmail] = useState("")
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    fetchContactGroups()
  }, [])

  async function fetchContactGroups() {
    try {
      const res = await fetch("/api/admin/contact-groups")
      if (res.ok) {
        const data = await res.json()
        setContactGroups(data)
      }
    } catch (error) {
      console.error("Failed to fetch contact groups:", error)
    }
  }

  const onReady: EmailEditorProps["onReady"] = useCallback(
    (unlayer) => {
      setEditorReady(true)
      // Load existing design if editing
      if (newsletter?.design_json) {
        try {
          const design =
            typeof newsletter.design_json === "string" ? JSON.parse(newsletter.design_json) : newsletter.design_json
          unlayer.loadDesign(design)
        } catch (e) {
          console.error("Failed to load design:", e)
        }
      }
    },
    [newsletter?.design_json],
  )

  const getEditorContent = (): Promise<{ html: string; design: any }> => {
    return new Promise((resolve, reject) => {
      const unlayer = emailEditorRef.current?.editor
      if (!unlayer) {
        reject(new Error("Editor not ready"))
        return
      }
      unlayer.exportHtml((data) => {
        resolve({ html: data.html, design: data.design })
      })
    })
  }

  async function handleSave(status: "draft" | "sent") {
    if (!formData.subject) {
      toast({
        title: "Missing fields",
        description: "Please provide a subject",
        variant: "destructive",
      })
      return
    }

    if (!editorReady) {
      toast({
        title: "Editor loading",
        description: "Please wait for the editor to finish loading",
        variant: "destructive",
      })
      return
    }

    if (status === "sent" && selectedGroups.length === 0) {
      toast({
        title: "No recipients",
        description: "Please select at least one contact group",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { html, design } = await getEditorContent()

      if (status === "sent" && (!html || html.trim() === "<html><head></head><body></body></html>")) {
        toast({
          title: "Empty content",
          description: "Please add some content to your newsletter",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const payload = {
        subject: formData.subject,
        preview_text: formData.preview_text,
        content: html,
        design_json: JSON.stringify(design),
        target_groups: selectedGroups,
        status,
      }

      const url = newsletter ? `/api/admin/newsletters/${newsletter.id}` : "/api/admin/newsletters"

      const res = await fetch(url, {
        method: newsletter ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to save newsletter")

      const data = await res.json()

      // If sending immediately, trigger send
      if (status === "sent") {
        await fetch(`/api/admin/newsletters/${data.id}/send`, {
          method: "POST",
        })
      }

      toast({
        title: status === "sent" ? "Newsletter sent!" : "Newsletter saved",
        description:
          status === "sent"
            ? "Your newsletter is being sent to recipients"
            : "You can continue editing or send it later",
      })

      router.push("/admin/newsletters")
    } catch (error) {
      console.error("Error saving newsletter:", error)
      toast({
        title: "Error",
        description: "Failed to save newsletter",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: "Missing email",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    if (!editorReady) {
      toast({
        title: "Editor loading",
        description: "Please wait for the editor to finish loading",
        variant: "destructive",
      })
      return
    }

    setSendingTest(true)
    try {
      const { html } = await getEditorContent()

      const response = await fetch("/api/admin/newsletters/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          subject: formData.subject || "Test Newsletter",
          content: html,
        }),
      })

      if (response.ok) {
        toast({
          title: "Test email sent",
          description: `A test email has been sent to ${testEmail}`,
        })
        setShowTestDialog(false)
        setTestEmail("")
      } else {
        throw new Error("Failed to send test")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Newsletter Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="Your amazing newsletter subject..."
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="preview">Preview Text</Label>
            <Input
              id="preview"
              placeholder="This appears in email previews..."
              value={formData.preview_text}
              onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
            />
          </div>

          <div>
            <Label>Target Contact Groups</Label>
            <div className="border rounded-md p-4 space-y-2 mt-2">
              {contactGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contact groups available</p>
              ) : (
                contactGroups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={group.id}
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={() => toggleGroup(group.id)}
                    />
                    <label
                      htmlFor={group.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {group.name} <span className="text-muted-foreground">({group.member_count || 0} members)</span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <EmailEditor
              ref={emailEditorRef}
              onReady={onReady}
              minHeight={600}
              options={{
                projectId: UNLAYER_PROJECT_ID ? Number.parseInt(UNLAYER_PROJECT_ID) : undefined,
                displayMode: "email",
                features: {
                  textEditor: {
                    spellChecker: true,
                  },
                },
                appearance: {
                  theme: "modern_light",
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={!editorReady}>
              <TestTube className="h-4 w-4 mr-2" />
              Send Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Test Email</DialogTitle>
              <DialogDescription>
                Send a test newsletter to verify it looks good before sending to everyone
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="test-email">Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendTest} disabled={sendingTest}>
                {sendingTest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Test"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button onClick={() => handleSave("draft")} disabled={loading || !editorReady} variant="outline">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </>
          )}
        </Button>
        <Button onClick={() => handleSave("sent")} disabled={loading || !editorReady}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
