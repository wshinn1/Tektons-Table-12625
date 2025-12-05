"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Sparkles, RefreshCw, Loader2, CheckCircle, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { escalateChatToHuman } from "@/app/actions/support"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_QUESTIONS = [
  "What is Tekton's Table?",
  "How do I get started?",
  "What does it cost?",
  "How do donations work?",
]

export function SupportPageChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [escalateEmail, setEscalateEmail] = useState("")
  const [escalateName, setEscalateName] = useState("")
  const [escalateMessage, setEscalateMessage] = useState("")
  const [escalateSuccess, setEscalateSuccess] = useState(false)
  const [escalateError, setEscalateError] = useState<string | null>(null)
  const [isEscalating, setIsEscalating] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const bellSoundRef = useRef<HTMLAudioElement | null>(null)
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false)

  useEffect(() => {
    bellSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAAB/f39/f39/f39/gICAgICAgICBgYGBgYGCgoKCgoODg4ODg4SEhISEhYWFhYWGhoaGhoaHh4eHh4iIiIiIiImJiYmJiYmJiYqKioqKioqOjo6Ojo6Ojo6SkpKSkpKSko6OjoqKioaGgoJ+fn56enZ2cm5uampmZmJeXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAQECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==",
    )
    if (bellSoundRef.current) bellSoundRef.current.volume = 0.2
  }, [])

  useEffect(() => {
    if (!userHasScrolledUp && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, userHasScrolledUp])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

      if (isNearBottom) {
        setUserHasScrolledUp(false)
      } else if (scrollHeight - scrollTop - clientHeight > 100) {
        setUserHasScrolledUp(true)
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setUserHasScrolledUp(false)

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      }
      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        const lines = chunk.split("\n")
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue

          if (trimmedLine.startsWith("data: ")) {
            const jsonStr = trimmedLine.slice(6)
            if (jsonStr === "[DONE]") continue
            try {
              const data = JSON.parse(jsonStr)
              // Handle AI SDK v5 format: { type: "text-delta", textDelta: "..." }
              if (data.type === "text-delta" && data.textDelta) {
                accumulatedContent += data.textDelta
                setMessages((prev) => {
                  const updated = [...prev]
                  const lastIndex = updated.length - 1
                  if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: accumulatedContent,
                    }
                  }
                  return updated
                })
              }
              // Also handle legacy format with "delta" for backwards compatibility
              else if (data.type === "text-delta" && data.delta) {
                accumulatedContent += data.delta
                setMessages((prev) => {
                  const updated = [...prev]
                  const lastIndex = updated.length - 1
                  if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: accumulatedContent,
                    }
                  }
                  return updated
                })
              }
            } catch {}
          } else if (trimmedLine.startsWith('0:"')) {
            try {
              // Format: 0:"text content"
              const textContent = trimmedLine.slice(3, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"')
              accumulatedContent += textContent
              setMessages((prev) => {
                const updated = [...prev]
                const lastIndex = updated.length - 1
                if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    content: accumulatedContent,
                  }
                }
                return updated
              })
            } catch {}
          }
        }
      }

      bellSoundRef.current?.play().catch(() => {})
    } catch (err) {
      console.error("Error sending message:", err)
      setError(err instanceof Error ? err.message : "Failed to send message")
      setMessages((prev) => prev.filter((m) => m.content !== "" || m.role !== "assistant"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  const handleNewConversation = () => {
    setMessages([])
    setError(null)
  }

  const formatChatHistory = () => {
    return messages.map((msg) => `${msg.role === "user" ? "USER" : "AI ASSISTANT"}: ${msg.content}`).join("\n\n")
  }

  const handleEscalate = async () => {
    if (!escalateEmail) {
      setEscalateError("Please enter your email address.")
      return
    }
    if (messages.length === 0 && !escalateMessage.trim()) {
      setEscalateError("Please describe what you need help with.")
      return
    }

    setIsEscalating(true)
    setEscalateError(null)

    try {
      let chatHistory = formatChatHistory()
      if (escalateMessage.trim()) {
        chatHistory = `USER MESSAGE:\n${escalateMessage}\n\n${chatHistory ? `PREVIOUS CHAT:\n${chatHistory}` : ""}`
      }

      const result = await escalateChatToHuman({
        email: escalateEmail,
        name: escalateName,
        chatHistory: chatHistory,
      })

      if (result.success) {
        setEscalateSuccess(true)
        setTimeout(() => {
          setShowEscalateModal(false)
          setEscalateSuccess(false)
          setEscalateEmail("")
          setEscalateName("")
          setEscalateMessage("")
        }, 3000)
      } else {
        setEscalateError(result.error || "Failed to send. Please try again.")
      }
    } catch (err) {
      setEscalateError("An unexpected error occurred.")
    } finally {
      setIsEscalating(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="bg-primary/5 border-b px-6 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Tekton's Table - Support</h3>
            <p className="text-sm text-muted-foreground">Ask me anything about Tekton's Table</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEscalateModal(true)} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleNewConversation} title="Start new conversation">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div ref={messagesContainerRef} className="h-[400px] overflow-y-auto p-6 space-y-4 bg-muted/30">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="bg-background rounded-2xl px-4 py-3 shadow-sm max-w-[85%] border">
                  <p className="text-sm">
                    Hey there! I'm Hyperetes, your friendly guide to Tekton's Table. What can I help you with today?
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground mb-3">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                      className="text-xs px-3 py-2 rounded-full bg-background border hover:bg-accent transition-colors text-left disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="bg-background border rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleFormSubmit} className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2 text-center">Error: {error}. Please try again.</p>}
        </form>
      </Card>

      <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Our Support Team
            </DialogTitle>
            <DialogDescription>
              Fill out the form below and we'll get back to you via email within 24 hours.
            </DialogDescription>
          </DialogHeader>

          {escalateSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
              <p className="text-muted-foreground">We've received your message and will respond to your email soon.</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="escalate-name">Your Name</Label>
                <Input
                  id="escalate-name"
                  value={escalateName}
                  onChange={(e) => setEscalateName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="escalate-email">Your Email *</Label>
                <Input
                  id="escalate-email"
                  type="email"
                  value={escalateEmail}
                  onChange={(e) => setEscalateEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="escalate-message">How can we help? *</Label>
                <Textarea
                  id="escalate-message"
                  value={escalateMessage}
                  onChange={(e) => setEscalateMessage(e.target.value)}
                  placeholder="Describe your question or issue..."
                  rows={4}
                  required={messages.length === 0}
                />
              </div>

              {messages.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    Your chat conversation ({messages.length} messages) will also be included for context.
                  </p>
                </div>
              )}

              {escalateError && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{escalateError}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowEscalateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEscalate} disabled={isEscalating}>
                  {isEscalating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
