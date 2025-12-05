import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { createServerClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let messages: UIMessage[] = []

    if (body.messages && Array.isArray(body.messages)) {
      // Normalize messages to UIMessage format
      messages = body.messages.map((msg: any) => {
        // If it's already in UIMessage format with parts
        if (msg.parts) {
          return msg
        }
        // Convert simple content string to UIMessage format
        return {
          id: msg.id || crypto.randomUUID(),
          role: msg.role || "user",
          parts: [{ type: "text", text: msg.content || "" }],
        }
      })
    }

    // Ensure we have at least one message
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    let tenantName = "there"
    let tenantSubdomain = ""
    let userCreatedDays = 999
    let tenantId: string | null = null

    if (user) {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id, name, subdomain, created_at, bio, mission_organization, ministry_focus")
        .eq("user_id", user.id)
        .single()

      if (tenant) {
        tenantId = tenant.id
        tenantName = tenant.name
        tenantSubdomain = tenant.subdomain
        const createdAt = new Date(tenant.created_at)
        userCreatedDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    const host = req.headers.get("host") || ""
    if (!tenantId && host.includes(".")) {
      const subdomain = host.split(".")[0]
      const { data: tenantBySubdomain } = await supabase
        .from("tenants")
        .select("id, name, subdomain, bio, mission_organization, ministry_focus")
        .eq("subdomain", subdomain)
        .single()

      if (tenantBySubdomain) {
        tenantId = tenantBySubdomain.id
        tenantName = tenantBySubdomain.name
        tenantSubdomain = tenantBySubdomain.subdomain
      }
    }

    const lastMessage = messages[messages.length - 1]
    let lastMessageContent = ""
    if (lastMessage?.parts) {
      lastMessageContent = lastMessage.parts
        .map((part: any) => (part.type === "text" ? part.text : ""))
        .join("")
        .toLowerCase()
    } else if (typeof lastMessage?.content === "string") {
      lastMessageContent = lastMessage.content.toLowerCase()
    }

    const isLegalQuery =
      lastMessageContent.includes("terms") ||
      lastMessageContent.includes("conditions") ||
      lastMessageContent.includes("privacy") ||
      lastMessageContent.includes("policy") ||
      lastMessageContent.includes("legal") ||
      lastMessageContent.includes("agreement") ||
      lastMessageContent.includes("acceptable use") ||
      lastMessageContent.includes("refund") ||
      lastMessageContent.includes("liability")

    const { data: helpArticles } = await supabase
      .from("help_articles")
      .select("title, content, category, subcategory")
      .eq("is_published", true)
      .order("category", { ascending: isLegalQuery ? false : true })
      .limit(10)

    let knowledgeBase = ""
    if (helpArticles && helpArticles.length > 0) {
      const keywords = lastMessageContent.split(" ").filter((word) => word.length > 3)

      const relevantArticles = helpArticles.filter((article) => {
        const titleEn =
          typeof article.title === "object" && article.title !== null
            ? article.title.en || ""
            : String(article.title || "")
        const contentEn =
          typeof article.content === "object" && article.content !== null
            ? article.content.en || ""
            : String(article.content || "")
        const articleText = `${titleEn} ${contentEn}`.toLowerCase()

        if (isLegalQuery && article.category === "legal") {
          return true
        }

        return keywords.some((keyword) => articleText.includes(keyword))
      })

      if (relevantArticles.length > 0) {
        knowledgeBase = "\n\n=== KNOWLEDGE BASE ===\n"
        relevantArticles.slice(0, 3).forEach((article) => {
          const titleEn =
            typeof article.title === "object" && article.title !== null
              ? article.title.en || "Untitled"
              : String(article.title || "Untitled")
          const contentEn =
            typeof article.content === "object" && article.content !== null
              ? article.content.en || ""
              : String(article.content || "")

          if (contentEn.length > 0) {
            const maxLength = article.category === "legal" ? 2000 : 1000
            knowledgeBase += `\n## ${titleEn}\n${contentEn.substring(0, maxLength)}...\n`
          }
        })
      }
    }

    let tenantContent = ""
    if (tenantId) {
      const keywords = lastMessageContent.split(" ").filter((word) => word.length > 3)

      const { data: posts } = await supabase
        .from("posts")
        .select("title, excerpt, content")
        .eq("tenant_id", tenantId)
        .eq("is_published", true)
        .limit(5)

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("title, description")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .limit(3)

      if (posts && posts.length > 0) {
        const relevantPosts = posts.filter((post) => {
          const postText = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase()
          return keywords.some((keyword) => postText.includes(keyword))
        })

        if (relevantPosts.length > 0) {
          tenantContent += "\n\n=== RECENT BLOG POSTS ===\n"
          relevantPosts.slice(0, 2).forEach((post) => {
            tenantContent += `\n## ${post.title}\n${post.excerpt || post.content?.substring(0, 300)}...\n`
          })
        }
      }

      if (campaigns && campaigns.length > 0) {
        tenantContent += "\n\n=== ACTIVE CAMPAIGNS ===\n"
        campaigns.forEach((campaign) => {
          tenantContent += `\n## ${campaign.title}\n${campaign.description?.substring(0, 200)}...\n`
        })
      }
    }

    const systemPrompt = `You are Hyperetes, a friendly support helper for Tekton's Table - a platform that helps missionaries raise support.

CRITICAL RULES - FOLLOW THESE EXACTLY:
1. MAX 1-2 sentences per response. That's it. No exceptions.
2. NEVER use bullet points or lists
3. ALWAYS end with a short question to keep chatting
4. Think "quick text message" - not email, not documentation

TONE: Warm, casual, like a helpful friend. Use contractions. Be encouraging.

EXAMPLES OF GOOD RESPONSES:
- "Yep, the platform fee is 3.5%! Want me to explain how it works with Stripe fees?"
- "Oh that's easy - just go to your dashboard settings. Need me to walk you through it?"
- "Great question! We support both one-time and recurring donations. Which are you setting up?"

EXAMPLES OF BAD RESPONSES (NEVER DO THIS):
- Long paragraphs explaining everything
- Bullet points listing features
- Multiple topics in one message
- Responses longer than 2 sentences

The user is ${tenantName}${tenantSubdomain ? ` (${tenantSubdomain}.tektonstable.com)` : ""}.
${userCreatedDays < 7 ? "They're new - be extra welcoming!" : ""}

QUICK FACTS (share ONE at a time, only if asked):
- Platform fee: 3.5%
- Stripe fees: 2.9% + $0.30 (or 2.2% + $0.30 for nonprofits)
- 14 languages supported
- Setup takes ~10 minutes

${knowledgeBase}${tenantContent}`

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      maxTokens: 150,
      temperature: 0.85,
      abortSignal: req.signal,
    })

    if (user && messages.length > 0) {
      if (lastMessageContent) {
        let context = "general"
        if (lastMessageContent.includes("stripe") || lastMessageContent.includes("nonprofit")) {
          context = "stripe-nonprofit-setup"
        } else if (isLegalQuery) {
          context = "legal-terms-privacy"
        }

        // Fire and forget - don't await this as it would delay the response
        supabase.from("chat_logs").insert({
          user_id: user.id,
          tenant_id: tenantSubdomain,
          message: lastMessageContent,
          context: context,
        })
      }
    }

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
