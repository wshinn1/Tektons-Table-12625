"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Bookmark, Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface BlogEngagementProps {
  postId: string
  postTitle: string
  postUrl: string
}

export function BlogEngagement({ postId, postTitle, postUrl }: BlogEngagementProps) {
  const [reactions, setReactions] = useState(0)
  const [userReactionCount, setUserReactionCount] = useState(0)
  const [comments, setComments] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchEngagementData()
  }, [postId])

  async function fetchEngagementData() {
    const { data: reactionsData } = await supabase
      .from("blog_post_reactions")
      .select("count")
      .eq("blog_post_id", postId)

    const totalClaps = reactionsData?.reduce((sum, r) => sum + (r.count || 0), 0) || 0
    setReactions(totalClaps)

    const { count: commentCount } = await supabase
      .from("blog_post_comments")
      .select("*", { count: "exact", head: true })
      .eq("blog_post_id", postId)
      .eq("status", "published")

    setComments(commentCount || 0)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: userReaction } = await supabase
        .from("blog_post_reactions")
        .select("count")
        .eq("blog_post_id", postId)
        .eq("user_id", user.id)
        .eq("reaction_type", "clap")
        .single()

      setUserReactionCount(userReaction?.count || 0)

      // TODO: Add bookmarks table and fetch bookmark status
      // For now, use localStorage
      const bookmarks = JSON.parse(localStorage.getItem("blog_bookmarks") || "[]")
      setIsBookmarked(bookmarks.includes(postId))
    }
  }

  async function handleClap() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to clap for this post",
        variant: "destructive",
      })
      return
    }

    if (userReactionCount >= 50) {
      toast({
        title: "Maximum claps reached",
        description: "You've given this post 50 claps already!",
      })
      return
    }

    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)

    const newCount = userReactionCount + 1

    const { error } = await supabase.from("blog_post_reactions").upsert(
      {
        blog_post_id: postId,
        user_id: user.id,
        reaction_type: "clap",
        count: newCount,
      },
      {
        onConflict: "blog_post_id,user_id,reaction_type",
      },
    )

    if (!error) {
      setReactions((prev) => prev + 1)
      setUserReactionCount(newCount)
    }
  }

  async function handleBookmark() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      })
      return
    }

    const bookmarks = JSON.parse(localStorage.getItem("blog_bookmarks") || "[]")
    let newBookmarks

    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== postId)
      toast({
        title: "Bookmark removed",
        description: "Post removed from your reading list",
      })
    } else {
      newBookmarks = [...bookmarks, postId]
      toast({
        title: "Post bookmarked",
        description: "Added to your reading list",
      })
    }

    localStorage.setItem("blog_bookmarks", JSON.stringify(newBookmarks))
    setIsBookmarked(!isBookmarked)
  }

  function handleShareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  function handleShareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  function handleShareLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(postUrl)
      setLinkCopied(true)
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      })
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center gap-4 border-y border-border py-4">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 transition-all ${userReactionCount > 0 ? "text-green-600 dark:text-green-400" : ""} ${
          isAnimating ? "scale-125" : ""
        }`}
        onClick={handleClap}
      >
        <Heart
          className={`h-5 w-5 transition-all ${userReactionCount > 0 ? "fill-current" : ""} ${
            isAnimating ? "scale-150" : ""
          }`}
        />
        <span className="flex items-center gap-1">
          {reactions > 0 && <span className="font-medium">{reactions}</span>}
          {userReactionCount > 0 && <span className="text-xs text-muted-foreground">({userReactionCount})</span>}
        </span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => {
          const commentsSection = document.getElementById("comments-section")
          commentsSection?.scrollIntoView({ behavior: "smooth" })
        }}
      >
        <MessageCircle className="h-5 w-5" />
        {comments > 0 && <span>{comments}</span>}
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShareTwitter}>
              <Twitter className="mr-2 h-4 w-4" />
              Share on Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareFacebook}>
              <Facebook className="mr-2 h-4 w-4" />
              Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareLinkedIn}>
              <Linkedin className="mr-2 h-4 w-4" />
              Share on LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              {linkCopied ? <Check className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
              {linkCopied ? "Link copied!" : "Copy link"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmark}
          className={isBookmarked ? "text-blue-600 dark:text-blue-400" : ""}
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  )
}
