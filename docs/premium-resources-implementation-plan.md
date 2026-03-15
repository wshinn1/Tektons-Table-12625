# Premium Resources Implementation Plan

## Overview

Transform TektonsTable into a **fundraising education platform** by adding premium resources ($4.99/month subscription) alongside the existing donation platform functionality.

---

## Business Model Summary

| Aspect | Decision |
|--------|----------|
| **Content Creator** | Super Admin only (tenant contributions in future) |
| **Revenue** | Platform keeps 100% of $4.99/month |
| **Pricing** | $4.99/month subscription |
| **Location** | Resources only on tektonstable.com (not tenant sites) |
| **Tenant Access** | 1 free month, then $4.99/month like everyone else |
| **Free Resources** | Separate "Free Resources" category to entice subscriptions |

---

## Feature Requirements

### 1. Blog Categories System (Super Admin Dashboard)

**Location:** `tektonstable.com/admin/categories`

| Feature | Description |
|---------|-------------|
| Create categories | Name, slug, description, icon |
| Edit categories | Full CRUD - add, edit, delete categories |
| Category types | `free` or `premium` (admin-configurable) |
| Premium flag | Requires active subscription to access |
| Ordering | Drag-and-drop or manual sort order |
| Assign to posts | Multi-select categories per resource/post |

**Note:** Categories are NOT hardcoded - super admin has full control to create, edit, and remove categories as needed.

---

### 2. Premium Resources Subscription

**Stripe Integration:**

| Component | Details |
|-----------|---------|
| Product | "TektonsTable Premium Resources" |
| Price | $4.99/month recurring |
| Billing | Monthly, auto-renew |
| Payment | Stripe Checkout |
| Management | Customer portal for cancel/update |

**Subscription States:**
- `active` - Full access to premium resources
- `trialing` - Free trial period (1 month)
- `past_due` - Payment failed, grace period (7 days)
- `canceled` - No access to premium content
- `comped` - Manually granted free access

---

### 3. Free Access Management

**Two types of free access:**

#### A. Tenant Free Month (Automatic)
- When a tenant account is created, automatically grant 1 month free
- After 1 month, prompt to subscribe at $4.99/month
- Track via `tenant_premium_trial_ends_at` timestamp

#### B. Manual Comp Access (Admin Controlled)
- Super admin can grant free access to any user
- Set custom duration (1 month, 3 months, 1 year, lifetime)
- Track via `comped_access` table with `expires_at`
- Admin UI to search users and grant/revoke access

**Location:** `tektonstable.com/admin/comped-access`

---

### 4. Subscription Account Management

**User Subscription Dashboard:** `tektonstable.com/account/subscription`

| Feature | Description |
|---------|-------------|
| View subscription status | Active, trial, past_due, canceled |
| View billing history | Past invoices and payments |
| Update payment method | Via Stripe Customer Portal |
| Cancel subscription | Self-service cancellation |
| Reactivate subscription | Easy resubscribe after cancellation |
| Pay past-due balance | One-click payment to restore access |

**Past-Due Payment Recovery:**
- When payment fails, show clear message with amount owed
- "Pay Now" button to immediately submit payment
- 7-day grace period before access revoked
- Easy path to restore subscription after grace period

---

### 5. Access Control Flow

\`\`\`
User visits premium resource
        │
        ▼
   Is user logged in?
        │
   NO ──┴── YES
   │         │
   ▼         ▼
 Login   Has active subscription?
 prompt       │
         NO ──┴── YES
         │         │
         ▼         ▼
    Has comped   Show full
    access?      content
         │
    NO ──┴── YES
    │         │
    ▼         ▼
  Show      Show full
  paywall   content
  + preview
\`\`\`

---

### 6. Paywall Experience

**When user hits paywall:**
1. Show resource title, featured image, and first 200 words
2. Blur/fade remaining content
3. Display subscription CTA card:
   - "Unlock Premium Resources"
   - "$4.99/month - Cancel anytime"
   - Benefits list (150,000+ words, 15+ resources, etc.)
   - "Start Reading" button → Stripe Checkout
4. Show 3 free resource previews as alternative

**Searchability:**
- Premium resources ARE searchable (titles, excerpts visible)
- Full content hidden behind paywall
- Encourages discovery and subscription conversion

---

### 7. Content Format & Editor

**TipTap Editor Capabilities:**
- Handles 200,000+ words without performance issues
- Your 25,000-word articles will work perfectly
- Character/word count extension available
- Rich text formatting, images, embeds supported

**Content Import Workflow:**
1. Copy content from Google Docs
2. Paste into TipTap editor (preserves formatting)
3. Upload featured image via Vercel Blob
4. Add images within content as needed
5. Assign categories and publish

---

## URL Structure

**Resource URLs:** `/resources/category/[category-slug]/[article-slug]`

**Examples:**
- `/resources/category/fundraising-fundamentals/the-art-of-donor-communication`
- `/resources/category/free-resources/getting-started-guide`
- `/resources/category/ministry-leadership/building-your-team`

---

## Database Schema

### New Tables

\`\`\`sql
-- Blog/Resource Categories
CREATE TABLE resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_premium BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Resources/Blog Posts
CREATE TABLE platform_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  author_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  is_premium BOOLEAN DEFAULT false,
  read_time_minutes INTEGER,
  word_count INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource to Category mapping (many-to-many)
CREATE TABLE resource_category_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES platform_resources(id) ON DELETE CASCADE,
  category_id UUID REFERENCES resource_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_id, category_id)
);

-- Premium Subscriptions
CREATE TABLE premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(20) NOT NULL, -- active, trialing, past_due, canceled, comped
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comped/Free Access Grants
CREATE TABLE comped_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  granted_by UUID REFERENCES auth.users(id),
  reason TEXT,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = lifetime
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Premium Trials (automatic 1 month)
ALTER TABLE tenants ADD COLUMN premium_trial_ends_at TIMESTAMPTZ;
ALTER TABLE tenants ADD COLUMN premium_trial_used BOOLEAN DEFAULT false;

-- Resource Read Progress (optional, for future)
CREATE TABLE resource_read_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES platform_resources(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, resource_id)
);
\`\`\`

---

## Stripe Configuration

### Products to Create

| Product | Price | Type |
|---------|-------|------|
| TektonsTable Premium Resources | $4.99 | Monthly recurring |

### Webhook Events Required

**Events to add in Stripe Dashboard:**

Go to **Stripe Dashboard → Developers → Webhooks → Select your endpoint** and add these events:

| Event | Purpose | Currently Handled? |
|-------|---------|-------------------|
| `checkout.session.completed` | Activate new subscription | YES (update handler) |
| `customer.subscription.created` | Record new subscription | Add new handler |
| `customer.subscription.updated` | Status changes (active, past_due, etc.) | **ADD NEW** |
| `customer.subscription.deleted` | Mark subscription canceled | YES (update handler) |
| `invoice.payment_succeeded` | Extend subscription period | Add new handler |
| `invoice.payment_failed` | Mark past_due, send reminder email | **ADD NEW** |
| `customer.subscription.trial_will_end` | Send trial ending reminder (3 days before) | **ADD NEW** |

**Webhook Endpoint:** `https://tektonstable.com/api/webhooks/stripe`

**Note:** You do NOT need a new webhook endpoint. We'll add handlers for the new events in the existing webhook route.

### Payment Failure Flow

\`\`\`
Payment Fails
     │
     ▼
invoice.payment_failed webhook received
     │
     ├── Update subscription status to 'past_due'
     ├── Send "Payment Failed" email
     │     - Explain what happened
     │     - Link to update payment method
     │     - Mention 7-day grace period
     │
     ▼
Day 3: Send reminder email
     │
     ▼
Day 7: Access revoked if still unpaid
     │
     ▼
User can easily resubscribe from /account/subscription
\`\`\`

---

## Implementation Phases

### Phase 1: Database & Categories (Day 1)
- [ ] Create database migration script
- [ ] Run migration to create tables
- [ ] Add RLS policies for security

### Phase 2: Super Admin Category Management (Day 1-2)
- [ ] Create `/admin/categories` page
- [ ] Category CRUD operations (create, read, update, delete)
- [ ] Category list with premium badge indicator
- [ ] Drag-and-drop reordering

### Phase 3: Resource Management (Day 2-3)
- [ ] Create `/admin/resources` page
- [ ] Resource list with filters (status, category, premium)
- [ ] Resource editor with TipTap (handles 25,000+ words)
- [ ] Category assignment (multi-select)
- [ ] Featured image upload (Vercel Blob)
- [ ] Auto-calculate word count and read time
- [ ] Draft/Publish workflow

### Phase 4: Stripe Subscription Setup (Day 3)
- [ ] Create Stripe Product "TektonsTable Premium Resources"
- [ ] Create Stripe Price $4.99/month recurring
- [ ] Implement Stripe Checkout flow
- [ ] Implement Stripe Customer Portal
- [ ] Update webhook handler for new events:
  - [ ] `customer.subscription.updated`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.trial_will_end`

### Phase 5: Public Resources Pages (Day 4)
- [ ] Create `/resources` listing page
- [ ] Create `/resources/category/[slug]/[article-slug]` detail page
- [ ] Category filtering and navigation
- [ ] Premium content paywall
- [ ] Free content preview (200 words + blur)
- [ ] Subscription CTA component

### Phase 6: User Subscription Account (Day 4-5)
- [ ] Create `/account/subscription` page
- [ ] View subscription status and billing history
- [ ] Cancel/reactivate subscription
- [ ] Pay past-due balance (easy one-click payment)
- [ ] Update payment method (Stripe Portal)

### Phase 7: Access Control (Day 5)
- [ ] `checkPremiumAccess()` helper function
- [ ] Middleware for premium routes
- [ ] Tenant free trial logic (auto-grant on signup)
- [ ] Trial expiration checks

### Phase 8: Comped Access Admin (Day 5-6)
- [ ] Create `/admin/comped-access` page
- [ ] Search users by email
- [ ] Grant access form (duration selector)
- [ ] Active comps list with expiration
- [ ] Revoke access functionality

### Phase 9: Email Notifications (Day 6)
- [ ] Subscription welcome email
- [ ] Trial ending soon (7 days before)
- [ ] Trial ended
- [ ] Payment failed (with update link)
- [ ] Payment failed reminder (Day 3)
- [ ] Subscription canceled
- [ ] Comp access granted

### Phase 10: Polish & Launch (Day 6-7)
- [ ] Mobile responsive testing
- [ ] SEO optimization for resource pages
- [ ] Upload initial resources
- [ ] Test full flow end-to-end

---

## File Structure

\`\`\`
app/
├── (platform)/
│   ├── resources/
│   │   ├── page.tsx                              # Resource listing
│   │   └── category/
│   │       └── [category-slug]/
│   │           └── [article-slug]/
│   │               └── page.tsx                  # Resource detail
│   ├── account/
│   │   └── subscription/
│   │       └── page.tsx                          # User subscription management
│   └── subscribe/
│       └── premium/
│           └── page.tsx                          # Premium subscription checkout
├── admin/
│   ├── categories/
│   │   └── page.tsx                              # Category management
│   ├── resources/
│   │   ├── page.tsx                              # Resource list
│   │   ├── new/
│   │   │   └── page.tsx                          # Create resource
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx                      # Edit resource
│   └── comped-access/
│       └── page.tsx                              # Manage free access grants
├── api/
│   ├── stripe/
│   │   ├── premium-checkout/
│   │   │   └── route.ts                          # Create checkout session
│   │   └── premium-portal/
│   │       └── route.ts                          # Customer portal session
│   └── webhooks/
│       └── stripe/
│           └── route.ts                          # Handle subscription webhooks (update existing)

actions/
├── category-actions.ts                           # Category CRUD
├── resource-actions.ts                           # Resource CRUD
├── premium-subscription-actions.ts               # Subscription management
└── comped-access-actions.ts                      # Comp access management

components/
├── admin/
│   ├── category-form.tsx
│   ├── category-list.tsx
│   ├── resource-editor.tsx
│   ├── resource-list.tsx
│   └── comped-access-form.tsx
├── resources/
│   ├── resource-card.tsx
│   ├── resource-grid.tsx
│   ├── category-nav.tsx
│   ├── premium-paywall.tsx
│   └── subscription-cta.tsx
└── premium/
    └── access-gate.tsx                           # Wrapper for premium content

lib/
├── premium-access.ts                             # Access checking utilities
└── stripe-premium.ts                             # Stripe subscription helpers
\`\`\`

---

## Email Templates Needed

| Email | Trigger | Timing |
|-------|---------|--------|
| Subscription Welcome | After successful checkout | Immediate |
| Trial Starting | When tenant account created | Immediate |
| Trial Ending Soon | Before trial ends | 7 days before |
| Trial Ended | When trial expires | On expiration |
| Payment Failed | On invoice.payment_failed | Immediate |
| Payment Reminder | Still past_due | 3 days after failure |
| Subscription Canceled | On cancellation | Immediate |
| Comp Access Granted | When admin grants access | Immediate |
| Comp Access Expiring | Before comp ends | 7 days before |

---

## Security Considerations

1. **RLS Policies** - Premium content only accessible with valid subscription
2. **Webhook Verification** - Always verify Stripe webhook signatures
3. **Content Protection** - Don't send full content to client without access check
4. **Rate Limiting** - Prevent abuse of free preview

---

## Questions Resolved

| Question | Answer |
|----------|--------|
| Category names hardcoded? | No - admin can create/edit/delete categories |
| Content format? | Google Docs - copy/paste into TipTap |
| TipTap word limit? | Handles 200,000+ words - 25K articles are fine |
| Featured images? | Will upload featured images + images within posts |
| Grace period? | 7 days with email reminders |
| Tenant notification? | Yes - email setup after implementation |
| Self-service cancel? | Yes - full subscription account management |
| Past-due payments? | Easy one-click payment to restore access |
| URL structure? | `/resources/category/[slug]/[article-slug]` |
| Search visibility? | Premium resources searchable, content behind paywall |
| Trial start? | When tenant creates account |

---

## Ready to Build?

Once you confirm the plan, I'll start with **Phase 1: Database & Categories** and work through each phase systematically.

**Estimated total time:** 6-7 days of focused development

**To start:** Just say "Let's start" or "Begin Phase 1"
