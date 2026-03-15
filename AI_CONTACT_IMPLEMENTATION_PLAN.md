# AI-Powered Contact Page Implementation Plan
**Project:** Tektons Table  
**Feature:** AI Assistant with RAG + Human Escalation  
**Estimated Time:** 6-8 hours of development

## Overview
Transform the contact page from a traditional form into an intelligent AI assistant that answers questions using help documentation, with seamless escalation to human support when needed.

---

## Phase 1: Database Setup (30 minutes)

### New Tables to Create

#### 1. `ai_contact_conversations`
Stores complete conversation threads for context and support escalation.

\`\`\`sql
CREATE TABLE ai_contact_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  visitor_email TEXT,
  visitor_name TEXT,
  session_id TEXT NOT NULL,
  conversation_history JSONB NOT NULL DEFAULT '[]',
  escalated_to_support BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  escalated_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_conversations_tenant ON ai_contact_conversations(tenant_id);
CREATE INDEX idx_ai_conversations_session ON ai_contact_conversations(session_id);
CREATE INDEX idx_ai_conversations_escalated ON ai_contact_conversations(escalated_to_support);
\`\`\`

#### 2. `ai_contact_rate_limits`
Track rate limits using Upstash Redis keys (optional table for analytics).

#### 3. Extend `help_articles` for Vector Search
Add support for RAG by storing embeddings (optional - can use text search initially).

\`\`\`sql
-- Option A: Simple text search (start here)
ALTER TABLE help_articles ADD COLUMN search_vector TSVECTOR;
CREATE INDEX idx_help_articles_search ON help_articles USING gin(search_vector);

-- Option B: Vector embeddings (advanced)
ALTER TABLE help_articles ADD COLUMN content_embedding vector(1536);
CREATE INDEX ON help_articles USING ivfflat (content_embedding vector_cosine_ops);
\`\`\`

---

## Phase 2: Core AI Components (2-3 hours)

### A. Chat UI Component (`components/tenant/ai-contact-chat.tsx`)

**Features:**
- ChatGPT-like message interface with user/assistant bubbles
- Streaming responses (typewriter effect)
- "Escalate to Support" button appears dynamically
- Rate limit warnings
- Mobile-responsive design

**State Management:**
\`\`\`typescript
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  citedArticles?: { slug: string; title: string }[]
}

const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [isLoading, setIsLoading] = useState(false)
const [sessionId] = useState(() => generateSessionId())
const [showEscalation, setShowEscalation] = useState(false)
\`\`\`

### B. Server Actions (`app/actions/ai-contact.ts`)

#### 1. `sendAIMessage()`
- Rate limit check via Redis (10 messages per hour per IP)
- Search help articles for relevant context
- Call OpenAI with context
- Store conversation in database
- Return streaming response

#### 2. `escalateToSupport()`
- Mark conversation as escalated
- Capture visitor info (name, email)
- Send email to tenant with full conversation context
- Send confirmation email to visitor
- Store in existing `tenant_contact_submissions` table

#### 3. `searchHelpArticles()`
- Full-text search using PostgreSQL tsvector
- Return top 3-5 relevant articles
- Include article slug, title, and excerpt

\`\`\`typescript
export async function sendAIMessage(
  tenantId: string,
  sessionId: string,
  userMessage: string,
  conversationHistory: Message[]
) {
  // 1. Rate limit check
  const rateLimitKey = `ai_contact:${ipAddress}:${tenantId}`
  const requestCount = await redis.incr(rateLimitKey)
  if (requestCount === 1) await redis.expire(rateLimitKey, 3600)
  if (requestCount > 10) return { error: 'Rate limit exceeded' }

  // 2. Search help articles
  const relevantArticles = await searchHelpArticles(tenantId, userMessage)
  
  // 3. Build context
  const context = relevantArticles.map(a => 
    `Article: ${a.title}\n${a.content}`
  ).join('\n\n')
  
  // 4. Call OpenAI
  const stream = await streamText({
    model: 'openai/gpt-4o-mini',
    system: `You are a helpful assistant for ${tenantName}. 
      Use the following help articles to answer questions.
      If you can't answer, suggest contacting support.
      
      ${context}`,
    messages: conversationHistory,
  })
  
  // 5. Store conversation
  await supabase.from('ai_contact_conversations').upsert({
    session_id: sessionId,
    tenant_id: tenantId,
    conversation_history: [...conversationHistory, userMessage],
  })
  
  return { stream, citedArticles: relevantArticles }
}
\`\`\`

---

## Phase 3: RAG Implementation (1-2 hours)

### Option A: Simple Text Search (Recommended Start)
Use PostgreSQL full-text search on `help_articles.content`.

\`\`\`typescript
async function searchHelpArticles(tenantId: string, query: string) {
  const { data } = await supabase
    .from('help_articles')
    .select('slug, title, content')
    .eq('tenant_id', tenantId) // If help is tenant-specific
    .eq('is_published', true)
    .textSearch('search_vector', query)
    .limit(5)
  
  return data || []
}
\`\`\`

### Option B: Semantic Search with Embeddings (Advanced)
Use OpenAI embeddings + vector similarity search.

\`\`\`typescript
// Generate embedding for user query
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: query,
})

// Vector similarity search
const { data } = await supabase.rpc('match_help_articles', {
  query_embedding: embedding.data[0].embedding,
  match_threshold: 0.7,
  match_count: 5,
})
\`\`\`

---

## Phase 4: Rate Limiting with Redis (30 minutes)

### Redis Rate Limit Keys
\`\`\`typescript
// Pattern: ai_contact:{ip}:{tenant_id}
// TTL: 1 hour (3600 seconds)
// Limit: 10 requests per hour

async function checkRateLimit(ip: string, tenantId: string) {
  const redis = createRedisClient()
  const key = `ai_contact:${ip}:${tenantId}`
  
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 3600)
  }
  
  return {
    allowed: count <= 10,
    remaining: Math.max(0, 10 - count),
    resetTime: Date.now() + 3600000
  }
}
\`\`\`

### UI Display
Show remaining requests: "8 questions remaining this hour"

---

## Phase 5: Support Escalation Flow (1 hour)

### Trigger Conditions
1. User explicitly clicks "Contact Support"
2. AI suggests escalation: "I think you should contact support directly"
3. After 5+ messages without resolution

### Escalation UI (`components/tenant/ai-escalation-form.tsx`)
Modal/card that appears over chat:
- Name (required)
- Email (required)
- Additional context (optional textarea)
- "Send to Support" button

### Email Template
\`\`\`typescript
await resend.emails.send({
  from: 'hello@tektonstable.com',
  to: tenant.contact_email_recipients,
  subject: `AI Contact Escalation: ${visitorName}`,
  html: `
    <h2>AI Chat Escalated to Support</h2>
    <p><strong>From:</strong> ${visitorName} (${visitorEmail})</p>
    <p><strong>Reason:</strong> ${escalationReason}</p>
    
    <h3>Conversation History:</h3>
    ${conversationHistory.map(msg => `
      <div>
        <strong>${msg.role}:</strong> ${msg.content}
      </div>
    `).join('')}
    
    <p><a href="mailto:${visitorEmail}">Reply to ${visitorName}</a></p>
  `
})
\`\`\`

---

## Phase 6: Contact Page Redesign (1-2 hours)

### New Page Structure (`app/[tenant]/contact/page.tsx`)

\`\`\`tsx
export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 text-center">
        <h1>How can I help you?</h1>
        <p>Ask a question or get instant answers from our help center</p>
      </section>

      {/* AI Chat Interface */}
      <section className="max-w-4xl mx-auto">
        <AIContactChat tenantId={tenant.id} tenantName={tenant.name} />
      </section>

      {/* Quick Links */}
      <section className="mt-12 grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <FileQuestion className="h-8 w-8" />
            <CardTitle>Browse Help Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/help">View all documentation →</Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Mail className="h-8 w-8" />
            <CardTitle>Email Support</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="mailto:support@example.com">
              support@tektonstable.com
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8" />
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            Usually within 24 hours
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
\`\`\`

---

## Phase 7: Admin Dashboard Updates (30 minutes)

### New Admin Page: AI Conversations (`app/[tenant]/admin/ai-conversations/page.tsx`)

View and analyze AI conversations:
- List all conversations
- Filter by escalated/not escalated
- View full conversation threads
- See which help articles were most cited
- Analytics: Average messages per conversation, escalation rate

### Existing Contact Submissions Page
Add indicator for "Escalated from AI Chat" with conversation history link.

---

## Phase 8: Testing & Polish (1 hour)

### Test Cases
1. ✅ Rate limiting works (11th request blocked)
2. ✅ Relevant help articles retrieved
3. ✅ AI provides accurate answers
4. ✅ Escalation flow sends emails correctly
5. ✅ Mobile responsive design
6. ✅ Streaming responses work smoothly
7. ✅ Session persistence across page reloads
8. ✅ Multiple tenants don't cross-contaminate

### Error Handling
- OpenAI API failures → Fallback message + escalate option
- Rate limit exceeded → Clear message with reset time
- Network errors → Retry button

---

## Implementation Order

**Day 1 (4 hours):**
1. Create database tables ✓
2. Build basic chat UI ✓
3. Implement simple text search RAG ✓
4. Connect to OpenAI API ✓

**Day 2 (4 hours):**
5. Add rate limiting with Redis ✓
6. Build escalation flow + emails ✓
7. Redesign contact page ✓
8. Testing and polish ✓

---

## Environment Variables Required

Already available:
- ✅ `OPENAI_API_KEY`
- ✅ `SUPABASE_URL` / `SUPABASE_ANON_KEY`
- ✅ `RESEND_API_KEY`
- ✅ `KV_REST_API_URL` / `KV_REST_API_TOKEN` (Upstash Redis)

---

## Cost Estimates

**OpenAI API (gpt-4o-mini):**
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Average conversation: ~1000 tokens
- **Cost per conversation: ~$0.001 (0.1 cents)**

**Monthly estimate:** 1000 conversations = $1

**Upstash Redis:**
- Free tier: 10,000 commands/day (sufficient for rate limiting)

**Total monthly cost: ~$1-5**

---

## Success Metrics

After 1 month, track:
- Number of AI conversations
- Average messages per conversation
- Escalation rate (target: <30%)
- Help articles most frequently cited
- User satisfaction (add thumbs up/down on messages)
- Support ticket reduction

---

## Future Enhancements

**Phase 2 (Post-MVP):**
1. **Voice Input** - Allow voice questions
2. **Multi-language** - Support Spanish based on tenant language
3. **Suggested Questions** - Show common questions as quick buttons
4. **Training Dashboard** - Let tenant admins add custom Q&A pairs
5. **Slack Integration** - Notify tenant in Slack for escalations
6. **Chat History** - Authenticated users can view past conversations
7. **Advanced Analytics** - Sentiment analysis, topic clustering

---

## Migration Strategy

### Option A: Full Replacement (Recommended)
- Replace `/contact` page completely with AI chat
- Keep old form as backup at `/contact/form`

### Option B: A/B Test
- 50% of users see AI chat
- 50% see traditional form
- Measure engagement and satisfaction

### Option C: Hybrid
- AI chat as primary interface
- "Prefer traditional form?" link at bottom
- Gradual migration based on user feedback

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI gives wrong answers | Cite sources, allow easy escalation |
| OpenAI API downtime | Fallback to immediate escalation form |
| Rate limit abuse | IP-based limits + CAPTCHA for high traffic |
| Privacy concerns | Clear disclosure, encrypt conversations |
| High costs | Set daily API budget limits, monitor usage |

---

## Conclusion

This AI-powered contact page will:
- ✅ Reduce support burden by answering common questions automatically
- ✅ Provide instant 24/7 assistance
- ✅ Improve user experience with conversational interface
- ✅ Maintain human touch through seamless escalation
- ✅ Leverage existing help documentation investment
- ✅ Cost under $5/month for typical usage

**Ready to build? Let me know and I'll start with Phase 1!**
