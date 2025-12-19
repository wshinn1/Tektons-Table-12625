"use client"

import { useState, useCallback, useEffect } from "react"
import { Puck, type Data } from "@measured/puck"
import { createEmailPuckConfig, defaultEmailTemplate } from "@/lib/puck-email-config"
import { renderPuckToEmailHtml, renderPuckToPlainText } from "@/lib/puck-email-renderer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"
import { Send, Save, Eye, Smartphone, Monitor, Mail, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface SubscriberGroup {
  id: string
  name: string
  subscriber_count?: number
}

interface Newsletter {
  id: string
  subject: string
  content: string
  puck_data?: Data
  preheader?: string
  status: string
}

interface NewsletterPuckEditorProps {
  tenantId: string
  tenantName: string
  newsletter?: Newsletter
  groups?: SubscriberGroup[]
}

function loadPuckStyles() {
  if (typeof window === "undefined") return

  // Check if styles are already loaded
  if (document.getElementById("puck-email-css")) return

  // Use same Puck version as page editor
  const cssFiles = [{ id: "puck-email-css", href: "https://unpkg.com/@measured/puck@0.21.0-canary.c0db75c1/puck.css" }]

  cssFiles.forEach(({ id, href }) => {
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = href
    document.head.appendChild(link)
  })
}

export function NewsletterPuckEditor({ tenantId, tenantName, newsletter, groups = [] }: NewsletterPuckEditorProps) {
  const [subject, setSubject] = useState(newsletter?.subject || "")
  const [preheader, setPreheader] = useState(newsletter?.preheader || "")
  const [puckData, setPuckData] = useState<Data>(newsletter?.puck_data || defaultEmailTemplate)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [newsletterId, setNewsletterId] = useState(newsletter?.id)

  const { toast } = useToast()
  const supabase = createBrowserClient()
  const config = createEmailPuckConfig(tenantName)

  useEffect(() => {
    loadPuckStyles()
  }, [])

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
      // Render HTML from Puck data
      const htmlContent = renderPuckToEmailHtml(puckData, {
        preheaderText: preheader,
        title: subject,
      })

      if (newsletterId) {
        const { error } = await supabase
          .from("tenant_newsletters")
          .update({
            subject,
            content: htmlContent,
            puck_data: puckData,
            preheader,
            updated_at: new Date().toISOString(),
          })
          .eq("id", newsletterId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from("tenant_newsletters")
          .insert({
            tenant_id: tenantId,
            subject,
            content: htmlContent,
            puck_data: puckData,
            preheader,
            status: "draft",
          })
          .select()
          .single()

        if (error) throw error
        setNewsletterId(data.id)
      }

      toast({
        title: "Draft saved",
        description: "Your newsletter draft has been saved",
      })
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for your newsletter",
        variant: "destructive",
      })
      return
    }

    setIsSendingTest(true)
    try {
      const htmlContent = renderPuckToEmailHtml(puckData, {
        preheaderText: preheader,
        title: subject,
      })
      const plainText = renderPuckToPlainText(puckData)

      const response = await fetch("/api/newsletters/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          subject: `[TEST] ${subject}`,
          html: htmlContent,
          text: plainText,
        }),
      })

      if (!response.ok) throw new Error("Failed to send test")

      toast({
        title: "Test email sent",
        description: "Check your inbox for the test email",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleSend = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for your newsletter",
        variant: "destructive",
      })
      return
    }

    // Confirm before sending
    if (!window.confirm("Are you sure you want to send this newsletter to all subscribers?")) {
      return
    }

    setIsSending(true)
    try {
      const htmlContent = renderPuckToEmailHtml(puckData, {
        preheaderText: preheader,
        title: subject,
      })
      const plainText = renderPuckToPlainText(puckData)

      // Save first
      if (newsletterId) {
        await supabase
          .from("tenant_newsletters")
          .update({
            subject,
            content: htmlContent,
            puck_data: puckData,
            preheader,
            status: "sending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", newsletterId)
      }

      const response = await fetch("/api/newsletters/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          subject,
          html: htmlContent,
          text: plainText,
          newsletterId,
        }),
      })

      if (!response.ok) throw new Error("Failed to send")

      toast({
        title: "Newsletter sent",
        description: "Your newsletter has been sent to all subscribers",
      })

      // Redirect to newsletter list
      window.location.href = `/${tenantId}/admin/newsletter`
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

  const handlePuckChange = useCallback((data: Data) => {
    setPuckData(data)
  }, [])

  // Preview modal
  if (showPreview) {
    const previewHtml = renderPuckToEmailHtml(puckData, {
      preheaderText: preheader,
      title: subject,
    })

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <span className="text-sm text-muted-foreground">Preview: {subject || "Untitled"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-muted p-8 flex justify-center">
          <div
            className={`bg-white shadow-lg transition-all duration-300 ${
              previewMode === "mobile" ? "w-[375px]" : "w-[700px]"
            }`}
          >
            <iframe srcDoc={previewHtml} className="w-full h-full min-h-[600px] border-0" title="Email Preview" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href={`/admin/newsletter`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">{newsletter ? "Edit Newsletter" : "New Newsletter"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendTest} disabled={isSendingTest}>
              {isSendingTest ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Test
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
            <Button size="sm" onClick={handleSend} disabled={isSending}>
              {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send Now
            </Button>
          </div>
        </div>

        {/* Subject and Preheader */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="subject" className="text-sm">
              Subject Line
            </Label>
            <Input
              id="subject"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="preheader" className="text-sm">
              Preview Text <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="preheader"
              placeholder="Brief preview shown in inbox..."
              value={preheader}
              onChange={(e) => setPreheader(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <Puck
          config={config}
          data={puckData}
          onChange={handlePuckChange}
          overrides={{
            header: () => null, // Hide default Puck header
          }}
        />
      </div>
    </div>
  )
}
