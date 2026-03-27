"use client"

import { SupportPageChat } from "@/components/support-page-chat"
import { SupportContactModal } from "@/components/support-contact-modal"
import Link from "next/link"
import {
  BookOpen,
  DollarSign,
  CreditCard,
  Settings,
  Users,
  BarChart,
  Mail,
  MessageSquare,
  HelpCircle,
} from "lucide-react"
import { Component, useEffect, useState, type ReactNode } from "react"

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError)
      return (
        <div className="p-8 text-center text-muted-foreground border rounded-lg">
          <p>Chat is temporarily unavailable. Please use the contact form below.</p>
        </div>
      )
    return this.props.children
  }
}

const QUICK_TOPICS = [
  {
    title: "Getting Started",
    description: "Set up your fundraising page",
    icon: BookOpen,
    helpSlug: "getting-started",
    question: "How do I get started with my fundraising page?",
  },
  {
    title: "Payments & Stripe",
    description: "Connect and manage payments",
    icon: CreditCard,
    helpSlug: "financial-management",
    question: "How do I connect my Stripe account and accept donations?",
  },
  {
    title: "Fees & Pricing",
    description: "Understand platform costs",
    icon: DollarSign,
    helpSlug: "financial-management",
    question: "What are the platform fees and how do they work?",
  },
  {
    title: "Customization",
    description: "Personalize your page",
    icon: Settings,
    helpSlug: "settings-customization",
    question: "How can I customize the design of my fundraising page?",
  },
  {
    title: "Supporters",
    description: "Manage your donors",
    icon: Users,
    helpSlug: "supporters",
    question: "How do I manage my supporters and view donation history?",
  },
  {
    title: "Analytics",
    description: "Track your progress",
    icon: BarChart,
    helpSlug: "analytics",
    question: "How do I track my fundraising analytics and progress?",
  },
]

interface HelpArticle {
  id: string
  title: { en: string } | string
  slug: string
}

export function SupportPageContent() {
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] SupportPageContent: Mounted, fetching articles")

    async function fetchArticles() {
      setLoading(true)
      try {
        const response = await fetch("/api/help-articles")
        console.log("[v0] SupportPageContent: API response status:", response.status)
        if (!response.ok) {
          throw new Error("Failed to fetch articles")
        }
        const data = await response.json()
        console.log("[v0] SupportPageContent: Fetched articles:", data?.length)
        setArticles(data || [])
      } catch (error) {
        console.error("[v0] SupportPageContent: Error fetching articles:", error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  console.log("[v0] SupportPageContent: Rendering, articles:", articles?.length, "loading:", loading)

  return (
    <>
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">How can we help you today?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ask our AI assistant anything about Tekton's Table, or browse our help resources below.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* AI Chat Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <ErrorBoundary>
            <SupportPageChat />
          </ErrorBoundary>
        </div>

        {/* Quick Topics Grid */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-semibold mb-6 text-center">Browse by Topic</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_TOPICS.map((topic) => {
              const Icon = topic.icon
              return (
                <Link
                  key={topic.title}
                  href={`/help/category/${topic.helpSlug}`}
                  className="group flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Popular Articles */}
        {articles && articles.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-xl font-semibold mb-4 text-center">Popular Articles</h2>
            <div className="bg-card border rounded-lg divide-y">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/help/article/${article.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-accent transition-colors"
                >
                  <span className="font-medium">
                    {typeof article.title === "object" ? article.title.en : article.title}
                  </span>
                  <span className="text-primary">Read →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Contact Options Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-semibold mb-6 text-center">Still need help?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Contact Form */}
            <SupportContactModal>
              <button className="w-full p-6 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all text-left">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground">Send us a message and we'll respond within 24 hours</p>
              </button>
            </SupportContactModal>

            {/* Help Center */}
            <Link
              href="/help"
              className="p-6 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Help Center</h3>
              <p className="text-sm text-muted-foreground">Browse our complete knowledge base and guides</p>
            </Link>

            {/* Live Chat */}
            <button
              onClick={() => {
                const chatButton = document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement
                if (chatButton) chatButton.click()
              }}
              className="w-full p-6 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all text-left"
            >
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our AI assistant in real-time</p>
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Help Center</span>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <span>How It Works</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <span>Pricing</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
