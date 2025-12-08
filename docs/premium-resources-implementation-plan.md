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
| Category types | `free` or `premium` |
| Premium flag | Requires active subscription to access |
| Ordering | Drag-and-drop or manual sort order |
| Assign to posts | Multi-select categories per resource/post |

**Categories to create at launch:**
- Free Resources (free)
- Fundraising Fundamentals (premium)
- Donor Relations (premium)
- Ministry Leadership (premium)
- Communication & Marketing (premium)
- Spiritual Formation (premium)

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
- `past_due` - Payment failed, grace period
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

### 4. Access Control Flow

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

### 5. Paywall Experience

**When user hits paywall:**
1. Show resource title, featured image, and first 200 words
2. Blur/fade remaining content
3. Display subscription CTA card:
   - "Unlock Premium Resources"
   - "$4.99/month - Cancel anytime"
   - Benefits list (150,000+ words, 15+ resources, etc.)
   - "Start Reading" button → Stripe Checkout
4. Show 3 free resource previews as alternative

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

## Implementation Phases

### Phase 1: Database & Categories (Day 1)
- [ ] Create database migration script
- [ ] Run migration to create tables
- [ ] Seed initial categories (free + premium)
- [ ] Add RLS policies for security

### Phase 2: Super Admin Category Management (Day 1-2)
- [ ] Create `/admin/categories` page
- [ ] Category CRUD operations (create, read, update, delete)
- [ ] Category list with premium badge indicator
- [ ] Drag-and-drop reordering

### Phase 3: Resource Management (Day 2-3)
- [ ] Create `/admin/resources` page
- [ ] Resource list with filters (status, category, premium)
- [ ] Resource editor with rich text (TipTap)
- [ ] Category assignment (multi-select)
- [ ] Featured image upload (Vercel Blob)
- [ ] Auto-calculate word count and read time
- [ ] Draft/Publish workflow

### Phase 4: Stripe Subscription Setup (Day 3)
- [ ] Create Stripe Product "TektonsTable Premium Resources"
- [ ] Create Stripe Price $4.99/month recurring
- [ ] Implement Stripe Checkout flow
- [ ] Implement Stripe Customer Portal
- [ ] Webhook handling for subscription events

### Phase 5: Public Resources Pages (Day 4)
- [ ] Create `/resources` listing page
- [ ] Create `/resources/[slug]` detail page
- [ ] Category filtering and navigation
- [ ] Premium content paywall
- [ ] Free content preview (200 words + blur)
- [ ] Subscription CTA component

### Phase 6: Access Control (Day 5)
- [ ] `checkPremiumAccess()` helper function
- [ ] Middleware for premium routes
- [ ] Tenant free trial logic (auto-grant on signup)
- [ ] Trial expiration checks

### Phase 7: Comped Access Admin (Day 5-6)
- [ ] Create `/admin/comped-access` page
- [ ] Search users by email
- [ ] Grant access form (duration selector)
- [ ] Active comps list with expiration
- [ ] Revoke access functionality

### Phase 8: Polish & Launch (Day 6-7)
- [ ] Email templates (subscription confirm, trial ending, etc.)
- [ ] Analytics tracking (views, conversions)
- [ ] SEO optimization for resource pages
- [ ] Mobile responsive testing
- [ ] Upload initial 15 resources

---

## File Structure

\`\`\`
app/
├── (platform)/
│   ├── resources/
│   │   ├── page.tsx                    # Resource listing
│   │   └── [slug]/
│   │       └── page.tsx                # Resource detail
│   └── subscribe/
│       └── premium/
│           └── page.tsx                # Premium subscription page
├── admin/
│   ├── categories/
│   │   └── page.tsx                    # Category management
│   ├── resources/
│   │   ├── page.tsx                    # Resource list
│   │   ├── new/
│   │   │   └── page.tsx                # Create resource
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx            # Edit resource
│   └── comped-access/
│       └── page.tsx                    # Manage free access grants
├── api/
│   ├── stripe/
│   │   └── premium-checkout/
│   │       └── route.ts                # Create checkout session
│   └── webhooks/
│       └── stripe/
│           └── route.ts                # Handle subscription webhooks (update existing)
actions/
├── category-actions.ts                  # Category CRUD
├── resource-actions.ts                  # Resource CRUD
├── premium-subscription-actions.ts      # Subscription management
└── comped-access-actions.ts            # Comp access management

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
    └── access-gate.tsx                  # Wrapper for premium content

lib/
├── premium-access.ts                    # Access checking utilities
└── stripe-premium.ts                    # Stripe subscription helpers
\`\`\`

---

## Stripe Configuration

### Products to Create

| Product | Price | Type |
|---------|-------|------|
| TektonsTable Premium Resources | $4.99 | Monthly recurring |

### Webhook Events to Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create/activate subscription record |
| `customer.subscription.created` | Record new subscription |
| `customer.subscription.updated` | Update status (active, past_due, etc.) |
| `customer.subscription.deleted` | Mark subscription canceled |
| `invoice.payment_succeeded` | Extend subscription period |
| `invoice.payment_failed` | Mark past_due, send reminder |

---

## Access Check Logic

\`\`\`typescript
// lib/premium-access.ts

export async function checkPremiumAccess(userId: string): Promise<{
  hasAccess: boolean
  reason: 'subscription' | 'trial' | 'comped' | 'none'
  expiresAt?: Date
}> {
  // 1. Check active subscription
  const subscription = await getActiveSubscription(userId)
  if (subscription?.status === 'active') {
    return { hasAccess: true, reason: 'subscription' }
  }

  // 2. Check comped access
  const comp = await getActiveComp(userId)
  if (comp && (!comp.expires_at || new Date(comp.expires_at) > new Date())) {
    return { 
      hasAccess: true, 
      reason: 'comped', 
      expiresAt: comp.expires_at 
    }
  }

  // 3. Check tenant trial (if user is a tenant)
  const tenant = await getTenantByUserId(userId)
  if (tenant?.premium_trial_ends_at) {
    if (new Date(tenant.premium_trial_ends_at) > new Date()) {
      return { 
        hasAccess: true, 
        reason: 'trial', 
        expiresAt: tenant.premium_trial_ends_at 
      }
    }
  }

  return { hasAccess: false, reason: 'none' }
}
\`\`\`

---

## UI/UX Specifications

### Premium Badge
- Small gold/amber badge with lock icon
- Appears on category cards and resource cards
- Text: "Premium" or lock icon only

### Paywall Card
- Clean white card with subtle shadow
- Headline: "Unlock Premium Resources"
- Subhead: "Access 150,000+ words of fundraising wisdom"
- Price: "$4.99/month" with "Cancel anytime" note
- Benefits list (4-5 bullet points)
- CTA button: "Start Reading" (primary color)
- Secondary link: "Browse Free Resources"

### Resource Card
- Featured image (16:9 aspect ratio)
- Category badge (top left)
- Premium lock icon (top right, if premium)
- Title (truncated to 2 lines)
- Excerpt (truncated to 3 lines)
- Read time + word count
- "Read Now" or "Unlock" button

---

## Email Templates Needed

| Email | Trigger |
|-------|---------|
| Subscription Welcome | After successful checkout |
| Trial Starting | When tenant gets free month |
| Trial Ending Soon | 7 days before trial ends |
| Trial Ended | When trial expires |
| Payment Failed | On invoice.payment_failed |
| Subscription Canceled | On cancellation |
| Comp Access Granted | When admin grants access |
| Comp Access Expiring | 7 days before comp ends |

---

## Analytics to Track

| Metric | Purpose |
|--------|---------|
| Resource views | Popular content |
| Paywall impressions | Conversion funnel |
| Checkout starts | Conversion funnel |
| Successful subscriptions | Revenue |
| Churn rate | Retention |
| Trial → Paid conversion | Marketing effectiveness |

---

## Security Considerations

1. **RLS Policies** - Premium content only accessible with valid subscription
2. **Webhook Verification** - Always verify Stripe webhook signatures
3. **Content Protection** - Don't send full content to client without access check
4. **Rate Limiting** - Prevent abuse of free preview

---

## Future Enhancements (Not in V1)

- [ ] Tenant resource contributions (revenue share model)
- [ ] Annual subscription option ($49/year - 2 months free)
- [ ] Resource downloads (PDF versions)
- [ ] Resource bookmarking/favorites
- [ ] Reading progress tracking
- [ ] Resource search
- [ ] Related resources suggestions
- [ ] Comments/discussion on resources
- [ ] Resource ratings
- [ ] Referral program (drive 10+ subs = revenue share)

---

## Launch Checklist

- [ ] All 15 resources uploaded and categorized
- [ ] 3-5 free resources available
- [ ] Stripe products/prices created
- [ ] Webhooks configured and tested
- [ ] Email templates created
- [ ] Paywall tested end-to-end
- [ ] Mobile responsive verified
- [ ] Analytics tracking verified
- [ ] Announcement blog post written
- [ ] Email to existing tenants about free trial

---

## Questions to Resolve Before Starting

1. **Categories** - Confirm the category names and which are free vs premium
2. **Trial notification** - Email tenants about their free month, or surprise them?
3. **Grace period** - How long after payment failure before revoking access? (Suggest 7 days)
4. **Content format** - Are your 15 resources in a specific format (Word, Google Docs, Markdown)?
5. **Images** - Do resources have featured images, or should we generate placeholders?

---

## Ready to Build?

Once you confirm the plan, I'll start with **Phase 1: Database & Categories** and work through each phase systematically. Each phase will be a separate task in the todo list.

Estimated total time: **5-7 days** of focused development.
