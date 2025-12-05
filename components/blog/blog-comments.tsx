"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Send } from "lucide-react"

interface Comment {
  id: string
  blog_post_id: string
  author_id: string
  parent_comment_id: string | null
  content: string
  status: string
  created_at: string
  author: {
    email: string
    user_metadata: {
      full_name?: string
      avatar_url?: string
    }
  }
  replies?: Comment[]
}

interface BlogCommentsProps {
  postId: string
}

export function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()
    fetchUser()
  }, [postId])

  async function fetchUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  async function fetchComments() {
    // Fetch top-level comments
    const { data: topLevelComments } = await supabase
      .from("blog_post_comments")
      .select(
        `
        *,
        author:author_id (
          email,
          raw_user_meta_data
        )
      `,
      )
      .eq("blog_post_id", postId)
      .eq("status", "published")
      .is("parent_comment_id", null)
      .order("created_at", { ascending: false })

    if (!topLevelComments) return

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const { data: replies } = await supabase
          .from("blog_post_comments")
          .select(
            `
          *,
          author:author_id (
            email,
            raw_user_meta_data
          )
        `,
          )
          .eq("parent_comment_id", comment.id)
          .eq("status", "published")
          .order("created_at", { ascending: true })

        return {
          ...comment,
          author: {
            email: comment.author.email,
            user_metadata: comment.author.raw_user_meta_data || {},
          },
          replies: replies?.map((reply) => ({
            ...reply,
            author: {
              email: reply.author.email,
              user_metadata: reply.author.raw_user_meta_data || {},
            },
          })),
        }
      }),
    )

    setComments(commentsWithReplies as Comment[])
  }

  async function handleSubmitComment() {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)

    const { error } = await supabase.from("blog_post_comments").insert({
      blog_post_id: postId,
      author_id: user.id,
      content: newComment.trim(),
      status: "published",
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } else {
      setNewComment("")
      fetchComments()
      toast({
        title: "Comment posted",
        description: "Your comment has been published",
      })
    }

    setIsSubmitting(false)
  }

  async function handleSubmitReply(parentId: string) {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to reply",
        variant: "destructive",
      })
      return
    }

    if (!replyContent.trim()) return

    setIsSubmitting(true)

    const { error } = await supabase.from("blog_post_comments").insert({
      blog_post_id: postId,
      author_id: user.id,
      parent_comment_id: parentId,
      content: replyContent.trim(),
      status: "published",
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    } else {
      setReplyContent("")
      setReplyTo(null)
      fetchComments()
      toast({
        title: "Reply posted",
        description: "Your reply has been published",
      })
    }

    setIsSubmitting(false)
  }

  function getInitials(name: string, email: string) {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <div id="comments-section" className="mt-16 border-t border-border pt-8">
      <h2 className="mb-8 text-2xl font-bold">Comments ({comments.length})</h2>

      {/* New comment form */}
      <div className="mb-8">
        <Textarea
          placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
          className="mb-3"
          rows={3}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment} disabled={!user || isSubmitting || !newComment.trim()}>
            <Send className="mr-2 h-4 w-4" />
            Post Comment
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            {/* Top-level comment */}
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.author.user_metadata.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {getInitials(comment.author.user_metadata.full_name || "", comment.author.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {comment.author.user_metadata.full_name || comment.author.email}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto p-0 text-xs"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                >
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Reply
                </Button>

                {/* Reply form */}
                {replyTo === comment.id && (
                  <div className="mt-4">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="mb-2"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={!replyContent.trim()}>
                        <Send className="mr-2 h-3 w-3" />
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-14 space-y-4 border-l-2 border-border pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.author.user_metadata.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {getInitials(reply.author.user_metadata.full_name || "", reply.author.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {reply.author.user_metadata.full_name || reply.author.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
