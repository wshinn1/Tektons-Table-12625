"use client"

import type React from "react"
import { useChat } from "ai/react"
import { DefaultChatTransport } from "ai"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, X, Search, Home, HelpCircle, Sun, ExternalLink } from "lucide-react"

const HELP_ARTICLES = [
  { title: "Complete Setup Guide (10 Minutes)", slug: "complete-setup-guide" },
  { title: "How to Accept Donations", slug: "how-to-accept-donations" },
  { title: "Connecting Your Stripe Account", slug: "connecting-stripe-account" },
  { title: "Setting Up Recurring Donations", slug: "recurring-donations" },
  { title: "Creating Fundraising Goals", slug: "creating-fundraising-goals" },
  { title: "International Payments & Stripe Setup", slug: "international-payments-stripe" },
  { title: "How Tektons Table Works", slug: "how-tektons-table-works" },
]

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showNotificationBadge, setShowNotificationBadge] = useState(true)
  const [showHelpArticles, setShowHelpArticles] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [chatError, setChatError] = useState<string | null>(null)
  const pathname = usePathname()

  const sendSoundRef = useRef<HTMLAudioElement | null>(null)
  const receiveSoundRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevStatusRef = useRef<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const chatHook = useChat({
    transport: new DefaultChatTransport({ api: "/api/support/chat" }),
    onError: (error) => {
      console.error("[v0] Chat error:", error)
      setChatError(error.message || "An error occurred. Please try again.")
    },
  })

  useEffect(() => {
    setIsMounted(true)

    // Create audio elements for sound effects
    sendSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=",
    )
    receiveSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAAB/f39/f39/f39/gICAgICAgICBgYGBgYGCgoKCgoODg4ODg4SEhISEhYWFhYWGhoaGhoaHh4eHh4iIiIiIiImJiYmJiYmJiYmZmZmZmZmZmZmpqampqampqam5ubm5ubm5ubm5ycnJycnJycnJ2dnZ2dnZ2dnZ6enp6enp6enp+fn5+fn5+fn6CgoKCgoKCgoKGhoaGhoaGhoaKioqKioqKioqOjo6Ojo6Ojo6SkpKSkpKSko6OjoqKioaGgoJ+fn56enZ2cm5uampmZmJeXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAQECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==",
    )

    // Set volume
    if (sendSoundRef.current) sendSoundRef.current.volume = 0.3
    if (receiveSoundRef.current) receiveSoundRef.current.volume = 0.2
  }, [])

  const messages = chatHook.messages
  const sendMessage = chatHook.sendMessage
  const status = chatHook.status

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (prevStatusRef.current === "streaming" && status === "ready" && messages.length > 0) {
      receiveSoundRef.current?.play().catch(() => {})
    }
    prevStatusRef.current = status
  }, [status, messages.length])

  useEffect(() => {
    if (showHelpArticles) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [showHelpArticles])

  if (!isMounted) {
    return null
  }

  if (pathname === "/example") {
    return null
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedInput = (inputValue || "").trim()
    if (!trimmedInput) {
      return
    }

    setChatError(null)

    sendSoundRef.current?.play().catch(() => {})
    sendMessage({ text: trimmedInput })
    setInputValue("")
  }

  const handleOpenChat = () => {
    setIsOpen(true)
    setShowNotificationBadge(false)
  }

  const handleSearchHelp = () => {
    setShowHelpArticles(true)
    sendSoundRef.current?.play().catch(() => {})
  }

  const handleSendMessage = () => {
    window.open("/support", "_blank")
  }

  const isLoading = status === "streaming" || status === "submitted"

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl z-50 transition-all duration-300 hover:scale-110 bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center group animate-subtle-bounce"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2} />

          {showNotificationBadge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-lg">
              1
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:max-h-[calc(100vh-48px)] flex flex-col shadow-2xl z-50 bg-white sm:rounded-2xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4 sm:p-6 pb-10 sm:pb-12">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <X className="h-6 w-6 sm:h-5 sm:w-5" />
            </button>

            <div className="flex gap-2 mb-3 sm:mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-400 flex items-center justify-center text-base sm:text-xl">
                👤
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-400 flex items-center justify-center text-base sm:text-xl">
                💬
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-400 flex items-center justify-center text-base sm:text-xl">
                ✨
              </div>
            </div>

            <div className="relative">
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Hi there</h2>
              <h3 className="text-white text-xl sm:text-2xl font-semibold">How can we help?</h3>

              <div className="absolute -right-2 sm:-right-4 -bottom-4 sm:-bottom-6">
                <Sun className="h-16 w-16 sm:h-20 sm:w-20 text-yellow-300 transform rotate-12" />
              </div>
            </div>
          </div>

          <div className="px-3 sm:px-4 -mt-5 sm:-mt-6 mb-3 sm:mb-4 relative z-10">
            <button
              onClick={handleSearchHelp}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg transition-all duration-200 flex items-center justify-between group"
            >
              <span className="font-medium text-sm sm:text-base">Search for help</span>
              <Search className="h-5 w-5 text-blue-600 transform group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-4 space-y-3 sm:space-y-4">
            {chatError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
                <p className="font-medium mb-1">Chat Error</p>
                <p className="text-xs">{chatError}</p>
                <p className="text-xs mt-2 text-gray-600">
                  You can still browse our{" "}
                  <a href="/help" target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">
                    help articles
                  </a>
                  .
                </p>
              </div>
            )}

            {messages.length === 0 && !showHelpArticles && !chatError && (
              <div className="text-center text-sm py-4 px-4">
                <p className="text-gray-500">
                  Start a conversation by typing a message below or using the quick actions above.
                </p>
              </div>
            )}

            {showHelpArticles && messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-3 sm:px-4 py-3 shadow-sm max-w-[90%] sm:max-w-[85%]">
                    <p className="text-sm font-medium text-gray-800 mb-3">Here are our help articles:</p>
                    <div className="space-y-2">
                      {HELP_ARTICLES.map((article) => (
                        <a
                          key={article.slug}
                          href={`/help/article/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline group"
                        >
                          <span>{article.title}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Click any article to open it in a new tab</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              let textContent = ""
              if (message.parts && Array.isArray(message.parts)) {
                textContent = message.parts
                  .map((part: any) => {
                    if (part.type === "text" && part.text) return part.text
                    if (typeof part === "string") return part
                    return ""
                  })
                  .filter(Boolean)
                  .join("")
              } else if (typeof message.content === "string") {
                textContent = message.content
              } else if (Array.isArray(message.content)) {
                textContent = message.content
                  .map((part: any) => {
                    if (typeof part === "string") return part
                    if (part.text) return part.text
                    return ""
                  })
                  .filter(Boolean)
                  .join("")
              }

              return (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{textContent}</div>
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form ref={formRef} onSubmit={handleFormSubmit} className="p-3 sm:p-4 border-t bg-gray-50 pb-safe">
            <div className="flex gap-2">
              <Input
                name="message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading || !!chatError}
                className="flex-1 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm"
              />
              <Button
                type="submit"
                disabled={isLoading || !(inputValue || "").trim() || !!chatError}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 h-10 w-10 flex-shrink-0"
              >
                <span className="text-lg">→</span>
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-around border-t bg-white py-2 sm:py-3 pb-safe">
            <button className="flex flex-col items-center gap-0.5 sm:gap-1 text-blue-600 p-2">
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="flex flex-col items-center gap-0.5 sm:gap-1 text-gray-400 hover:text-blue-600 transition-colors relative p-2"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Messages</span>
              {messages.length > 0 && (
                <span className="absolute top-0 right-1 sm:right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {messages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => window.open("https://tektonstable.com/help", "_blank")}
              className="flex flex-col items-center gap-0.5 sm:gap-1 text-gray-400 hover:text-blue-600 transition-colors p-2"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Help</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
