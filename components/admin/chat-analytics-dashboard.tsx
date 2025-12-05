"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, TrendingUp, ThumbsUp, FileText, Plus, Search } from "lucide-react"
import { toast } from "sonner"

type CommonQuestion = {
  question_normalized: string
  example_question: string
  frequency: number
  satisfaction_rate: number
  last_asked: string
  has_article: boolean
}

type ChatLog = {
  id: string
  user_question: string
  bot_response: string
  created_at: string
  helpful_rating: number | null
  converted_to_article: boolean
}

type Stats = {
  totalChats: number
  chatsLast7Days: number
  satisfactionRate: number
}

export function ChatAnalyticsDashboard({
  commonQuestions,
  recentChats,
  stats,
}: {
  commonQuestions: CommonQuestion[]
  recentChats: ChatLog[]
  stats: Stats
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuestion, setSelectedQuestion] = useState<CommonQuestion | null>(null)
  const [showCreateArticle, setShowCreateArticle] = useState(false)
  const [articleTitle, setArticleTitle] = useState("")
  const [articleContent, setArticleContent] = useState("")
  const [articleCategory, setArticleCategory] = useState("getting-started")

  const filteredQuestions = commonQuestions.filter((q) =>
    q.example_question.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateArticle = async (question: CommonQuestion) => {
    setSelectedQuestion(question)
    setArticleTitle(question.example_question)
    setShowCreateArticle(true)
  }

  const handleSubmitArticle = async () => {
    try {
      const response = await fetch("/api/admin/help/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: { en: articleTitle },
          content: { en: articleContent },
          category: articleCategory,
          is_published: true,
        }),
      })

      if (response.ok) {
        toast.success("Help article created successfully!")
        setShowCreateArticle(false)
        setArticleTitle("")
        setArticleContent("")
        window.location.reload()
      } else {
        toast.error("Failed to create article")
      }
    } catch (error) {
      toast.error("Error creating article")
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Chat Analytics</h1>
          <p className="text-muted-foreground">
            Track common questions and create help articles from user conversations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalChats}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last 7 Days</p>
                <p className="text-2xl font-bold text-foreground">{stats.chatsLast7Days}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.satisfactionRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Common Questions Section */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Common Questions</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium text-foreground">{q.example_question}</p>
                    {q.has_article && (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">
                        Has Article
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Asked {q.frequency}x</span>
                    <span>•</span>
                    <span>{(q.satisfaction_rate * 100).toFixed(0)}% satisfied</span>
                    <span>•</span>
                    <span>Last: {new Date(q.last_asked).toLocaleDateString()}</span>
                  </div>
                </div>
                {!q.has_article && (
                  <Button size="sm" onClick={() => handleCreateArticle(q)} className="ml-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Article
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Create Article Modal */}
        {showCreateArticle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Create Help Article</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateArticle(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Article Title</label>
                  <Input
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="How do I..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={articleCategory}
                    onChange={(e) => setArticleCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  >
                    <option value="getting-started">Getting Started</option>
                    <option value="donations">Donations</option>
                    <option value="newsletters">Newsletters</option>
                    <option value="blog">Blog</option>
                    <option value="financials">Financials</option>
                    <option value="customization">Customization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                  <Textarea
                    value={articleContent}
                    onChange={(e) => setArticleContent(e.target.value)}
                    placeholder="Provide a detailed answer..."
                    rows={10}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmitArticle} className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Article
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateArticle(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
