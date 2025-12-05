# AI Support Contact Page - Implementation Plan

## Overview
Build an AI-powered contact/support page that uses RAG (Retrieval Augmented Generation) to answer user questions by searching help articles, with smart escalation to email support when needed.

---

## Phase 1: Database Schema & Setup
**Goal:** Prepare data structures for support conversations and feedback

### Tasks:
1. **Create `support_conversations` table in Supabase**
   - Fields: 
     - `id` (uuid, primary key)
     - `user_email` (text, nullable)
     - `conversation_history` (jsonb) - stores full chat messages
     - `status` (text) - 'open' or 'resolved'
     - `escalated_at` (timestamp)
     - `resolved_at` (timestamp, nullable)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)
   - RLS policies for admin access only

2. **Create vector embeddings for help articles (optional but recommended)**
   - Use Upstash Vector to store help article embeddings
   - Enables semantic search for better RAG accuracy
   - Each article gets embedded and indexed by slug

3. **Set up rate limiting structure in Redis**
   - Track conversation counts per IP/session
   - Prevent abuse (limit: 10 messages per session)
   - Key format: `support:ratelimit:{ip}:{date}`

---

## Phase 2: Backend API Routes
**Goal:** Create server actions and API routes for AI chat

### Tasks:
1. **`/api/support/chat` - Main chat endpoint**
   - Accepts user message
   - Searches help articles (RAG)
   - Calls AI SDK with context
   - Returns AI response with relevant article links
   - Implements streaming for real-time responses

2. **`/api/support/escalate` - Escalate to human**
   - Captures full conversation
   - Sends email to admin via Resend
   - Stores in `support_conversations` table
   - Returns confirmation message

3. **Server action for help article search**
   - Query Supabase for relevant articles by keywords
   - Or use Upstash Vector for semantic search
   - Return top 3-5 most relevant articles
   - Include article title, slug, and content excerpt

---

## Phase 3: Frontend UI Components
**Goal:** Build beautiful, responsive chat interface

### Tasks:
1. **Create `/contact/page.tsx`**
   - ChatGPT-style interface
   - Message bubbles (user vs AI)
   - Typing indicator with animated dots
   - Suggested questions/topics before chat starts
   - "Start new conversation" button

2. **`<ChatMessage>` component**
   - Displays user/AI messages
   - Shows timestamps
   - Links to referenced help articles
   - "Was this helpful?" feedback buttons
   - Markdown rendering for AI responses

3. **`<EscalationForm>` component**
   - Shows when user requests human support
   - Captures email, priority, additional context
   - Displays conversation summary
   - Confirmation after submission

4. **`<SuggestedTopics>` component**
   - Shows common questions before chat starts
   - Links to help categories
   - Quick-start conversation starters
   - Example: "How do I connect Stripe?", "Setting up donations"

---

## Phase 4: AI Logic & RAG Implementation
**Goal:** Make the AI helpful and accurate

### Tasks:
1. **Implement RAG pipeline**
   - User question → Search help articles → Build context
   - Include article titles, content snippets in AI prompt
   - Add system prompt with tone/behavior guidelines
   - System prompt should be helpful, concise, and missionary-focused

2. **Create smart escalation detection**
   - Keywords: "talk to human", "contact support", "not working", "help me"
   - Sentiment analysis for frustrated users
   - Automatic escalation triggers
   - Offer escalation after 3-4 back-and-forth messages

3. **Response enhancement**
   - Format AI responses with markdown
   - Add "See also" links to help articles
   - Include "Still need help? Contact support" button
   - Keep responses concise (2-3 paragraphs max)

---

## Phase 5: Admin Dashboard (Optional)
**Goal:** Manage escalated conversations

### Tasks:
1. **`/admin/support/page.tsx`**
   - List all support conversations
   - Filter by status (open/resolved)
   - View full conversation history
   - Mark as resolved button
   - Search by email or date

2. **Email notifications**
   - Instant email when conversation escalated
   - Include full chat history
   - User contact info and timestamp
   - Template: Professional support ticket format

---

## Phase 6: Polish & Testing
**Goal:** Ensure great UX and reliability

### Tasks:
1. Add loading states and error handling
2. Rate limiting implementation with user-friendly messages
3. Mobile responsiveness testing
4. Analytics tracking:
   - Conversation starts
   - Escalations count
   - Resolution rate
   - Most common questions
5. A/B test suggested questions
6. Accessibility audit (keyboard navigation, screen readers)

---

## Technical Stack Summary

- **AI:** Vercel AI SDK with OpenAI (streaming responses)
- **RAG Search:** Supabase full-text search OR Upstash Vector (semantic search)
- **Storage:** Supabase (conversations, help articles), Redis (rate limiting)
- **Email:** Resend for escalation notifications
- **UI:** Shadcn chat components with Tailwind CSS
- **Rate Limiting:** Upstash Redis

---

## Estimated Effort

- **Core functionality (Phases 1-4):** 4-6 hours
- **Admin dashboard (Phase 5):** 2-3 hours  
- **Polish (Phase 6):** 1-2 hours
- **Total:** 7-11 hours of development time

---

## Key Features

- Instant AI responses using your help documentation
- Smart escalation to email when needed
- Rate limiting to prevent abuse (10 messages per session)
- Beautiful chat UI similar to ChatGPT
- Captures full conversation context for support tickets
- Mobile-friendly responsive design
- Markdown support for rich formatting
- Referenced help articles inline
- Admin dashboard for managing escalated tickets

---

## Implementation Order (Recommended)

1. **Start with Phase 3** - Build the UI first to visualize the experience
2. **Phase 4** - Implement AI chat with mock data
3. **Phase 1** - Add database tables
4. **Phase 2** - Wire up real backend logic
5. **Phase 5** - Add admin dashboard
6. **Phase 6** - Polish and optimize

---

## Success Metrics

- **Response Accuracy:** AI successfully answers 70%+ of questions
- **Escalation Rate:** Less than 30% of conversations escalate to human
- **User Satisfaction:** "Was this helpful?" positive rate above 80%
- **Response Time:** AI responds in under 3 seconds
- **Support Load Reduction:** Decrease in direct support emails by 40%+

---

## Future Enhancements (Post-MVP)

- Multi-language support (Spanish, etc.)
- Voice input for questions
- Conversation history for logged-in users
- AI learns from resolved support tickets
- Integration with knowledge base suggestions
- Automated follow-up emails
- User feedback loop to improve AI responses
