"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { saveNewsletter, sendNewsletter, scheduleNewsletter } from "@/app/actions/newsletters"
import { Save, Send, Clock, Loader2 } from "lucide-react"
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

export default function NewsletterEditor({
  newsletter = null,
}: {
  newsletter?: any
}) {
  const router = useRouter()
  const emailEditorRef = useRef<EditorRef | null>(null)

  const [subject, setSubject] = useState(newsletter?.subject || "")
  const [language, setLanguage] = useState(newsletter?.language || "en")
  const [segment, setSegment] = useState(newsletter?.segment || "all")
  const [scheduledFor, setScheduledFor] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [editorReady, setEditorReady] = useState(false)

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

  const handleSaveDraft = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject line")
      return
    }

    if (!editorReady) {
      toast.error("Editor is still loading")
      return
    }

    setIsSaving(true)
    try {
      const { html, design } = await getEditorContent()

      const result = await saveNewsletter({
        id: newsletter?.id,
        subject,
        content: html,
        design_json: JSON.stringify(design),
        language,
        segment,
        status: "draft",
      })

      if (result.success) {
        toast.success("Draft saved")
        router.push("/dashboard/newsletters")
      } else {
        toast.error(result.error || "Failed to save draft")
      }
    } catch (error) {
      toast.error("Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendNow = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject line")
      return
    }

    if (!editorReady) {
      toast.error("Editor is still loading")
      return
    }

    setIsSending(true)
    try {
      const { html, design } = await getEditorContent()

      if (!html || html.trim() === "<html><head></head><body></body></html>") {
        toast.error("Please add some content to your newsletter")
        setIsSending(false)
        return
      }

      const result = await sendNewsletter({
        id: newsletter?.id,
        subject,
        content: html,
        design_json: JSON.stringify(design),
        language,
        segment,
      })

      if (result.success) {
        toast.success(`Newsletter sent to ${result.count} supporters`)
        router.push("/dashboard/newsletters")
      } else {
        toast.error(result.error || "Failed to send newsletter")
      }
    } catch (error) {
      toast.error("Failed to send newsletter")
    } finally {
      setIsSending(false)
    }
  }

  const handleSchedule = async () => {
    if (!subject.trim() || !scheduledFor) {
      toast.error("Please fill in subject and schedule time")
      return
    }

    if (!editorReady) {
      toast.error("Editor is still loading")
      return
    }

    try {
      const { html, design } = await getEditorContent()

      const result = await scheduleNewsletter({
        id: newsletter?.id,
        subject,
        content: html,
        design_json: JSON.stringify(design),
        language,
        segment,
        scheduledFor,
      })

      if (result.success) {
        toast.success("Newsletter scheduled")
        router.push("/dashboard/newsletters")
      } else {
        toast.error(result.error || "Failed to schedule newsletter")
      }
    } catch (error) {
      toast.error("Failed to schedule newsletter")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="Enter subject line..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment">Recipient Segment</Label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Supporters</SelectItem>
                  <SelectItem value="monthly_donors">Monthly Donors</SelectItem>
                  <SelectItem value="new_supporters">New Supporters</SelectItem>
                  <SelectItem value="one_time_donors">One-Time Donors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled">Schedule For (Optional)</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
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

      <div className="flex gap-4">
        <Button onClick={handleSaveDraft} variant="outline" disabled={isSaving || isSending || !editorReady}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Draft
        </Button>

        {scheduledFor ? (
          <Button onClick={handleSchedule} disabled={isSaving || isSending || !editorReady}>
            <Clock className="w-4 h-4 mr-2" />
            Schedule Send
          </Button>
        ) : (
          <Button onClick={handleSendNow} disabled={isSaving || isSending || !editorReady}>
            {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Now
          </Button>
        )}
      </div>
    </div>
  )
}
