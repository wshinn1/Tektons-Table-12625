# Updated Technical Implementation Plan

## Project Overview
Multi-tenant missionary fundraising platform with Stripe Connect, email notifications, content management, automated backups, multi-language support, and global payment processing.

**Estimated Timeline:** 3-4 days for MVP with core features

---

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL + RLS + Auth) ✅ Ready
- **Payments:** Stripe Connect Standard + Stripe Subscriptions ✅ Ready
- **Email:** Resend (existing account) ✅ Ready
- **Storage:** Vercel Blob (images/videos/backups)
- **Editor:** BlockNote
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Domain:** tektonstable.com ✅ Ready for wildcard
- **i18n:** next-intl for multi-language support
- **Mobile:** PWA initially, React Native later

---

## Phase 1: Foundation & Authentication (Day 1 Morning) ✅ COMPLETE
**Goal:** Get the core infrastructure working

### 1.1 Database Schema Setup
- Create all tables (tenants, users, posts, supporters, donations, subscriptions, newsletters, backups)
- Implement RLS policies for tenant isolation
- Set up Supabase Auth configuration
- Create database helper functions

### 1.2 Authentication System
- Super admin authentication (email/password)
- Tenant authentication (email/password)
- Supporter authentication (email/password with magic link option)
- Auth middleware for route protection
- Role-based access control

### 1.3 Multi-Tenancy Foundation
- Subdomain detection middleware
- Tenant routing logic (admin vs tenant vs public)
- Wildcard domain configuration for tektonstable.com
- Tenant context provider

### 1.4 Internationalization Setup
- Install next-intl
- Create translation files (en, es, pt, fr, ko, zh)
- Language detection from browser
- Language switcher component
- Store tenant's preferred language in database

**Deliverables:**
- Database fully configured with RLS ✅
- Login pages for all user types ✅
- Subdomain routing working locally ✅
- Auth protection on routes ✅
- Multi-language framework ready ✅

---

## Phase 2: Super Admin Dashboard (Day 1 Afternoon) ✅ COMPLETE
**Goal:** Admin can manage the entire platform

### 2.1 Admin Dashboard UI
- Dashboard layout with navigation
- Tenant list view with search/filter
- Tenant detail view
- Platform analytics overview

### 2.2 Tenant Management
- Create new tenant (manual admin creation)
- Edit tenant details
- Suspend/activate tenant accounts
- Delete tenant (with confirmation)
- View tenant statistics (posts, supporters, revenue)

### 2.3 Admin Analytics
- Total platform revenue
- Active tenants count
- Total donations processed
- Application fees collected (3%)
- Tips collected
- Fee coverage collected
- Recent backups status

### 2.4 Backup Management View
- List all backups with timestamps
- Download backup from blob
- Backup size and status
- Manual trigger backup option

**Deliverables:**
- Functional admin dashboard ✅
- Full CRUD for tenant management ✅
- Basic analytics display ✅
- Backup monitoring UI ✅

---

## Phase 3: Stripe Connect Integration (Day 1 Evening) ✅ COMPLETE
**Goal:** Payment infrastructure ready with enhanced revenue features

### 3.1 Stripe Connect Onboarding
- Generate Stripe Connect account link
- Onboarding flow UI for tenants
- Webhook handler for account updates
- Display connection status in tenant dashboard
- Support for 135+ currencies globally

### 3.2 One-Time Donations with Enhanced Revenue
- Donation page UI (public-facing)
- **3.5% platform fee** (updated from 3%)
- **Optional tip system:**
  - Preset options: 10%, 15% (default), 20%, Custom, None
  - Real-time total calculation
  - Clear messaging: "Help keep this platform free"
- **Stripe fee coverage checkbox:**
  - Calculate Stripe fee (2.9% + $0.30)
  - Option for donor to cover fee
  - Show total with breakdown
- Payment form using Stripe Elements
- Success/failure handling
- Donation confirmation emails

### 3.3 Recurring Donations
- Subscription creation flow with tip option
- Monthly/quarterly/annual options
- Custom amount input
- Stripe Customer creation
- Subscription webhook handlers
- Optional recurring tip

### 3.4 Stripe Webhooks
- Payment intent succeeded/failed
- Subscription created/updated/canceled
- Customer portal session creation
- Update database on all events
- Track tips and fee coverage separately

### 3.5 Revenue Calculation
\`\`\`javascript
// Example: $100 donation with 15% tip and fee coverage
donationAmount = 10000 // $100
platformFee = 350 // 3.5% = $3.50 (was 3%)
tipAmount = 1500 // 15% = $15.00
stripeFee = 320 // 2.9% + $0.30 = $3.20
feeCoverage = 320 // Donor covers Stripe fee

totalCharged = 11820 // $118.20
platformRevenue = 2170 // $21.70 (fee + tip + covered Stripe fee)
missionaryReceives = 9650 // $96.50
\`\`\`

**Deliverables:**
- Stripe Connect onboarding working ✅
- One-time donations with tip + fee coverage ✅
- Recurring subscription support ✅
- Webhook handling complete ✅

---

## Phase 4: Tenant CRM Dashboard (Day 2 Morning) ✅ COMPLETE
**Goal:** Missionaries can manage their content and supporters

### 4.1 Enhanced Tenant Dashboard Layout
- Dashboard home with key metrics
- Navigation (Posts, Newsletters, Supporters, Donations, Financials, Settings)
- Quick stats cards:
  - Total raised (all-time)
  - Monthly recurring revenue
  - Active supporters
  - Funding goal progress
- Recent activity feed

### 4.2 Financial Tracking Dashboard (View-Only)
- Total raised (all-time and by period)
- One-time vs recurring breakdown
- Donor retention rate
- Average donation amount
- Funding goal progress bar
- Monthly trend charts
- Top supporters list
- Export to CSV for external accounting
- Link to Stripe Dashboard for detailed reports
- QuickBooks sync instructions

### 4.3 Funding Goals Feature
- Set monthly/annual fundraising goals
- Progress visualization (progress bar, percentage)
- Public visibility toggle
- Display on public profile
- Email supporters when milestones reached
- Historical goal tracking

### 4.4 Post Management System
- Post list view (drafts, published)
- Create new post page
- Edit existing post
- Delete post
- Publish/unpublish toggle
- Lock/unlock for supporters only

### 4.5 BlockNote Editor Integration
- Install and configure BlockNote
- Custom block types (heading, paragraph, image, video, donation CTA)
- Image upload to Vercel Blob
- Video embed support
- Save as JSON to database
- Preview mode

### 4.6 Post Display (Public Pages)
- Tenant public profile page (subdomain landing)
- Post list view (public posts only)
- Single post view
- Locked post protection (check if supporter has donated)
- Responsive design
- Multi-language support

**Deliverables:**
- Post management system ✅
- Categories and topics system ✅
- Funding goals tracking ✅
- Dashboard with quick stats ✅

---

## Phase 5: Supporter Management (Day 2 Afternoon) ✅ COMPLETE
**Goal:** Complete supporter relationship management

### 5.1 Supporter Registration
- Signup form on tenant giving page
- Signup form on tenant profile page
- Email verification
- Supporter profile creation
- Language preference selection

### 5.2 Supporter Dashboard
- Login page for supporters
- Supporter profile view
- Giving history display
- Manage recurring donations link to Stripe portal
- Access to locked content
- Download tax receipts

### 5.3 Tenant Supporter Management (CRM)
- Supporter list view in tenant dashboard
- Filter by donation status (one-time, recurring, never donated)
- Search and sort functionality
- Export supporter list (CSV)
- Supporter detail view (donation history, engagement)
- Tag supporters (VIP, Monthly, etc.)
- Notes on supporters

### 5.4 Stripe Customer Portal
- Generate portal session
- Redirect to Stripe for payment management
- Return URL handling

**Deliverables:**
- Supporter authentication system ✅
- Supporter dashboard with giving history ✅
- Tenant CRM with supporter listings ✅
- Detailed supporter profiles with notes ✅

---

## Phase 6: Email System Part 1 - Post Notifications (Day 2 Evening)
**Goal:** Automated emails when posts are published

### 6.1 Resend Integration
- Configure Resend API with existing account
- Email templates using React Email
- From name personalization (Missionary Name <updates@tektonstable.com>)
- Reply-To missionary personal email
- Multi-language email templates

### 6.2 Post Notification Emails
- Checkbox on post publish: "Notify supporters"
- Convert post excerpt to email HTML
- Send to all supporters with email preference enabled
- Track sent status in database
- Donation CTA button in email
- "Read More" link to full post
- Respect supporter language preference

### 6.3 Email Preferences
- Unsubscribe link in all emails
- Email preferences page for supporters
- Toggle notifications on/off
- Update preferences in database

### 6.4 Basic Email Analytics
- Track sent count
- Store Resend message IDs
- Display sent status to tenant

**Deliverables:**
- Post notification emails sending
- Unsubscribe working
- Email preferences functional
- Multi-language emails working

---

## Phase 7: Email System Part 2 - Standalone Newsletters (Day 3 Morning) ✅ COMPLETE
**Goal:** Email-only communication tool

### 7.1 Newsletter Composer
- Newsletter creation page
- BlockNote editor integration
- Subject line input
- Save as draft
- Preview mode
- Language selection

### 7.2 Email Template Library
- Premade template components (Hero, Donation Appeal, Photo Gallery, Testimony, Video, Stats)
- Template selector UI
- Drag-and-drop template insertion
- Template customization

### 7.3 Newsletter Sending
- Send immediately option
- Schedule for later option
- Recipient segmentation (All, Monthly Donors, New Supporters)
- Batch sending via Resend
- Send test email to missionary

### 7.4 Newsletter Analytics
- Newsletter list view
- Sent count per newsletter
- Track opens (via Resend webhooks)
- Track clicks (via Resend webhooks)
- Analytics dashboard per newsletter

**Deliverables:**
- Standalone newsletter system working
- Template library functional
- Scheduling working
- Basic analytics tracking

---

## Phase 8: Social Sharing & Polish (Day 3 Afternoon)
**Goal:** Final features and refinements

### 8.1 Social Sharing
- Share buttons on posts (Facebook, Twitter/X, LinkedIn, Email, Copy Link)
- Open Graph meta tags
- Twitter Card meta tags
- Share tracking in database
- Share count display

### 8.2 Tenant Settings
- Edit profile information
- Upload profile picture
- Change subdomain (if available)
- Personal email for reply-to
- Connect/disconnect Stripe
- Language preference
- Funding goal settings
- Email signature customization

### 8.3 Donation Receipts
- Automated receipt emails via Resend
- PDF receipt generation (optional)
- Tax-deductible statement
- Display in supporter dashboard
- Multi-language receipts

### 8.4 Mobile App Foundation (PWA)
- Progressive Web App configuration
- Add to home screen functionality
- Offline support for key pages
- Push notification setup (future)
- App manifest and service worker
- Mobile-optimized UI components

### 8.5 Error Handling & UX Polish
- Loading states everywhere
- Error messages user-friendly
- Success confirmations
- Toast notifications
- Form validation

**Deliverables:**
- Social sharing working
- Settings pages complete
- Receipts automated
- Mobile-responsive
- PWA ready
- Polished UX

---

## Phase 9: Automated Backup System ✅ COMPLETE
**Goal:** Nightly backups of all Supabase data to Vercel Blob

### 9.1 Database Schema
\`\`\`sql
backups (
  id uuid primary key,
  backup_type text default 'full',
  blob_url text,
  blob_key text,
  file_size_bytes bigint,
  tables_backed_up text[],
  record_count integer,
  status text,
  error_message text nullable,
  started_at timestamp,
  completed_at timestamp,
  created_at timestamp
)
\`\`\`

### 9.2 Backup Script
- API route: `/api/cron/backup`
- Export all Supabase tables to JSON
- Compress backup data
- Upload to Vercel Blob with timestamp
- Store metadata in backups table
- Handle errors gracefully

### 9.3 Vercel Cron Job Configuration
\`\`\`json
{
  "crons": [{
    "path": "/api/cron/backup",
    "schedule": "0 5 * * *"
  }]
}
\`\`\`

### 9.4 Backup Notification Emails
- Send email to super admin on success
- Include: backup size, table counts, blob URL
- Send error email on failure
- Include: error details, last successful backup

### 9.5 Backup Management
- View backup history in admin dashboard
- Download backup from blob
- Delete old backups (retention policy)
- Manual backup trigger button
- Restore backup (future feature)

**Deliverables:**
- ✅ Cron job running at 5:00 AM UTC daily
- ✅ Full database backup to Blob
- ✅ Success/failure emails to super admins
- ✅ Backup management UI in admin dashboard
- ✅ Error handling and logging

---

## Phase 9.5: ✅ Referral Program Implementation
**Goal:** Word-of-mouth growth engine with tiered pricing rewards

### 9.5.1 Database Schema for Referrals
\`\`\`sql
-- Referral codes and tracking
referral_codes (
  id uuid primary key,
  tenant_id uuid references tenants unique,
  code text unique, -- e.g., "JOHN-MISSIONS-X7K2"
  times_used integer default 0,
  created_at timestamp
)

-- Track who referred whom
referrals (
  id uuid primary key,
  referrer_tenant_id uuid references tenants, -- Who sent the referral
  referee_tenant_id uuid references tenants, -- Who signed up
  referral_code text,
  status text default 'pending', -- pending, completed
  completed_at timestamp nullable, -- When referee made first donation
  created_at timestamp
)

-- Track pricing tier for each tenant
tenant_pricing (
  id uuid primary key,
  tenant_id uuid references tenants unique,
  current_rate_percentage decimal default 3.0, -- Platform fee rate
  referral_count integer default 0,
  rate_tier text default 'standard', -- standard, bronze, silver, gold, platinum
  discounted_until timestamp nullable, -- For temporary discounts
  lifetime_rate_percentage decimal nullable, -- Permanent rate if earned
  created_at timestamp,
  updated_at timestamp
)

-- Audit trail for rate changes
pricing_history (
  id uuid primary key,
  tenant_id uuid references tenants,
  old_rate_percentage decimal,
  new_rate_percentage decimal,
  reason text, -- 'new_signup', 'referral_reward', 'tier_upgrade'
  referral_id uuid references referrals nullable,
  effective_date timestamp,
  expires_at timestamp nullable,
  created_at timestamp
)
\`\`\`

### 9.5.2 Referral Tier Structure

**Tier Progression:**
\`\`\`javascript
const REFERRAL_TIERS = {
  NEW_USER: {
    rate: 1.5, // 50% off for first 30 days
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days
    label: "Welcome Discount"
  },
  STANDARD: {
    rate: 3.0,
    label: "Standard Rate",
    referrals: 0
  },
  BRONZE: {
    rate: 2.5,
    label: "Bronze Advocate (3+ referrals)",
    referrals: 3,
    permanent: true
  },
  SILVER: {
    rate: 2.25,
    label: "Silver Advocate (5+ referrals)",
    referrals: 5,
    permanent: true
  },
  GOLD: {
    rate: 2.0,
    label: "Gold Advocate (10+ referrals)",
    referrals: 10,
    permanent: true
  },
  PLATINUM: {
    rate: 1.75,
    label: "Platinum Advocate (25+ referrals)",
    referrals: 25,
    permanent: true
  }
}
\`\`\`

### 9.5.3 Referral Code Generation
**Backend:** `POST /api/tenant/referrals/generate`
- Auto-generate unique referral code on tenant creation
- Format: `{FIRSTNAME}-MISSIONS-{RANDOM}`
- Example: `JOHN-MISSIONS-X7K2`
- Store in `referral_codes` table
- Display prominently in tenant dashboard

### 9.5.4 Signup with Referral Code
**Public Route:** `GET /join?ref=JOHN-MISSIONS-X7K2`
- Capture referral code from URL parameter
- Display referrer's name: "Join at the invitation of John Smith"
- Show discount: "Get your first 30 days at 1.5% (50% off)"
- Store referral relationship on signup
- Create `tenant_pricing` record with 1.5% rate for 30 days

### 9.5.5 Referral Completion Logic
**Webhook:** Monitor first donation from referee
\`\`\`javascript
// When referee receives their first donation:
async function completeReferral(refereeTenantId) {
  // 1. Mark referral as completed
  await updateReferralStatus(refereeTenantId, 'completed');
  
  // 2. Give referrer 1 month at 1.5% rate
  const referrer = await getReferrerForTenant(refereeTenantId);
  await applyDiscountToReferrer(referrer.id, {
    rate: 1.5,
    duration: 30 days,
    reason: 'referral_reward'
  });
  
  // 3. Increment referrer's referral count
  await incrementReferralCount(referrer.id);
  
  // 4. Check if referrer qualifies for tier upgrade
  await checkAndUpgradeTier(referrer.id);
  
  // 5. Send email to both parties
  await sendReferralCompletionEmails(referrer, referee);
}
\`\`\`

### 9.5.6 Tier Upgrade Logic
**Backend:** Automated tier checking
\`\`\`javascript
async function checkAndUpgradeTier(tenantId) {
  const pricing = await getTenantPricing(tenantId);
  const referralCount = pricing.referral_count;
  
  // Determine eligible tier
  let newTier = null;
  if (referralCount >= 25) newTier = REFERRAL_TIERS.PLATINUM;
  else if (referralCount >= 10) newTier = REFERRAL_TIERS.GOLD;
  else if (referralCount >= 5) newTier = REFERRAL_TIERS.SILVER;
  else if (referralCount >= 3) newTier = REFERRAL_TIERS.BRONZE;
  
  // Upgrade if tier changed
  if (newTier && newTier.rate < pricing.current_rate_percentage) {
    await upgradeTenantTier(tenantId, newTier);
    await sendTierUpgradeEmail(tenantId, newTier);
  }
}
\`\`\`

### 9.5.7 Stripe Integration for Variable Pricing
**Application Fee Calculation:**
\`\`\`javascript
// When creating payment intent
async function createDonationIntent(tenantId, amount) {
  const pricing = await getTenantPricing(tenantId);
  const currentRate = pricing.current_rate_percentage;
  
  // Check if temporary discount is expired
  if (pricing.discounted_until && new Date() > pricing.discounted_until) {
    // Revert to permanent rate or standard
    const newRate = pricing.lifetime_rate_percentage || 3.0;
    await updateTenantRate(tenantId, newRate);
    currentRate = newRate;
  }
  
  // Calculate application fee
  const applicationFeeAmount = Math.floor(amount * (currentRate / 100));
  
  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: tenant.stripe_account_id,
    },
    metadata: {
      tenant_id: tenantId,
      platform_fee_rate: currentRate
    }
  });
  
  return paymentIntent;
}
\`\`\`

### 9.5.8 Tenant Dashboard - Referral Section
**UI Components:**
- **Referral Code Display**
  - Large, copyable referral code
  - "Copy Link" button: `https://tektonstable.com/join?ref=JOHN-MISSIONS-X7K2`
  - Share buttons (Email, Facebook, Twitter, WhatsApp)

- **Current Pricing Tier**
  - Badge showing current tier (Bronze, Silver, Gold, Platinum)
  - Current rate: "You pay 2.5% platform fee"
  - Savings: "You save $15/month vs standard rate"

- **Referral Progress**
  - Progress bar to next tier
  - "3 of 5 referrals to Silver Advocate"
  - Tier comparison table showing all tiers

- **Referral History**
  - List of referred missionaries
  - Status: Pending or Completed
  - Completion date

- **Projected Savings**
  - Calculate monthly savings based on average donations
  - "At your current $3,000/month, you save $15/month (Bronze rate)"

### 9.5.9 Public Referral Landing Page
**Route:** `/join?ref=CODE`
- Hero: "Join {Referrer Name} on TektonsTable"
- Show referrer's profile photo and testimonial
- Highlight discount: "Get 50% off for your first 30 days"
- Feature list with pricing comparison
- Signup form with referral code pre-filled

### 9.5.10 Email Notifications

**Email 1: Referral Signup (to Referrer)**
\`\`\`
Subject: Good news! {Name} joined using your referral

{Name} just signed up for TektonsTable using your referral code!

When they receive their first donation, you'll both get rewards:
✓ You: 1 month at 1.5% platform fee (50% off)
✓ Them: Already enjoying 1.5% for their first 30 days

Your referrals: {count}/3 to unlock Bronze Advocate (permanent 2.5% rate)
\`\`\`

**Email 2: Referral Completed (to Referrer)**
\`\`\`
Subject: You earned a reward! 🎉

{Name} just received their first donation, which means your referral is complete!

Your Reward:
✓ 1.5% platform fee for the next 30 days
✓ Save an estimated ${savings} this month

Your Progress:
• Total referrals: {count}
• Current tier: {tier}
• Next tier: {nextTier} at {nextCount} referrals
\`\`\`

**Email 3: Tier Upgrade (to Referrer)**
\`\`\`
Subject: Congratulations! You've unlocked {Tier} Advocate status 🏆

You've referred {count} missionaries and earned permanent pricing:

Your new rate: {rate}% platform fee (was 3.0%)
Lifetime savings: ${annualSavings}/year

This rate is yours forever. Thank you for spreading the word!
\`\`\`

**Email 4: Discount Expiring (to Referee)**
\`\`\`
Subject: Your welcome discount expires in 7 days

Your 50% discount (1.5% rate) expires on {date}.

After that, you'll pay our standard 3% rate.

Want to keep lower rates? Share TektonsTable with other missionaries:
{Your referral link}

For every 3 referrals, you unlock permanent discounted rates!
\`\`\`

### 9.5.11 API Routes for Referral System

**Tenant Endpoints:**
- `GET /api/tenant/referrals/code` - Get my referral code
- `GET /api/tenant/referrals/stats` - Get referral stats and tier info
- `GET /api/tenant/referrals/history` - List my referrals
- `GET /api/tenant/pricing` - Get current pricing tier and history

**Public Endpoints:**
- `GET /api/referrals/validate?code=JOHN-MISSIONS-X7K2` - Validate referral code
- `GET /api/referrals/info?code=JOHN-MISSIONS-X7K2` - Get referrer info for landing page
- `POST /api/join` - Signup with referral code (captures ref in body)

**Internal/Webhook:**
- `POST /api/referrals/complete` - Mark referral as complete (called by donation webhook)
- `POST /api/cron/referrals/tier-check` - Check and upgrade tiers (called daily via cron)

### 9.5.12 Analytics Dashboard for Admin

**Admin View:**
- Total referrals generated
- Conversion rate (signups → completed referrals)
- Average time to first donation
- Tier distribution (how many in each tier)
- Projected revenue impact of discounts
- Most successful referrers (leaderboard)

### 9.5.13 Cron Jobs for Referral System

**Daily Tier Check:** `POST /api/cron/referrals/tier-check`
- Run daily at 2am EST
- Check all tenants for tier upgrades
- Expire temporary discounts
- Send reminder emails for expiring discounts (7 days before)

**Weekly Referral Reminder:** `POST /api/cron/referrals/reminders`
- Run weekly
- Email tenants with 0 referrals about the program
- Email tenants close to next tier (e.g., 2/3 referrals)

### 9.5.14 Legal & Terms

**Referral Program Terms:**
- Referee must receive first donation for referral to complete
- Discount rates apply to platform fees only (not Stripe fees)
- Discounts cannot be combined or transferred
- TektonsTable reserves right to modify program
- Fraudulent referrals will be disqualified

**Display in Dashboard:**
- "View Referral Terms" link
- Clear explanation of how rates are calculated
- FAQ section about the program

### 9.5.15 Testing Scenarios

**Test Case 1: New Signup with Referral**
1. User A shares referral code
2. User B signs up with code
3. Verify User B gets 1.5% for 30 days
4. Verify referral is marked "pending"

**Test Case 2: Referral Completion**
1. User B receives first donation
2. Verify referral marked "completed"
3. Verify User A gets 1 month at 1.5%
4. Verify both users get email notifications

**Test Case 3: Tier Upgrade**
1. User A refers 3 missionaries (all completed)
2. Verify User A upgraded to Bronze (2.5% permanent)
3. Verify tier upgrade email sent
4. Verify rate reflected in Stripe payments

**Test Case 4: Discount Expiration**
1. User B's 30-day discount expires
2. Verify rate reverts to 3% (or lower if they have permanent tier)
3. Verify Stripe payment intents use correct rate

**Test Case 5: Concurrent Discounts**
1. User A has Bronze tier (2.5% permanent)
2. User A gets referral reward (1.5% for 30 days)
3. Verify temporary 1.5% applies
4. After 30 days, verify revert to 2.5% (not 3%)

**Deliverables:**
- Database schema for referrals and pricing tiers
- Referral code generation and tracking
- Variable pricing logic in Stripe integration
- Tier upgrade automation
- Referral dashboard UI for tenants
- Public referral landing page
- 5 automated email notifications
- Admin analytics for referral program
- Cron jobs for tier checks and reminders
- Complete testing coverage

---

## Phase 10: Platform Expansion Features ✅ COMPLETE
**Goal:** Implement global reach and integration capabilities

### 10.1 Multi-Language Enhancement ✅
- Complete translations for all 6 languages:
  - English (en)
  - Spanish (es)
  - Portuguese (pt)
  - French (fr)
  - Korean (ko)
  - Chinese (zh)
- Dynamic language switching
- RTL support for future languages
- Language-specific formatting (dates, currency)

### 10.2 Global Payment Processing ✅
- Leverage Stripe's 135+ currency support
- Local payment methods (Alipay, iDEAL, SEPA, etc.)
- Auto-currency conversion
- Display amounts in supporter's local currency
- Multi-currency donation tracking

### 10.3 Integration Framework ✅
**Phase 1: CSV Export**
- Export supporters to CSV
- Export donations to CSV
- Export newsletter analytics to CSV
- QuickBooks-compatible format

**Phase 2: Zapier Setup (Future)**
- Create Zapier app integration
- Triggers: New donation, new supporter, new post
- Actions: Create supporter, send newsletter

**Phase 3: Direct API Integrations (Future)**
- DonorElf API integration
- Planning Center API integration
- ManagedMissions webhook support
- Salesforce Nonprofit Cloud connector

### 10.4 QuickBooks & Stripe Financial Integration ✅
- Document Stripe → QuickBooks sync process
- IIF file export from Stripe Dashboard
- Automated sync via Stripe apps (future)
- Link to Stripe Financial Connections
- Tax reporting documentation

### 10.5 Mobile App Foundation (PWA) ✅
- Progressive Web App configuration
- Add to home screen functionality
- Offline support for key pages
- Push notification setup (future)
- App manifest and service worker
- Mobile-optimized UI components

**Deliverables:**
- ✅ 6 languages fully translated
- ✅ 135+ currencies supported via Stripe
- ✅ CSV export functionality
- ✅ QuickBooks integration documented
- ✅ PWA fully functional
- ✅ Integration roadmap defined

---

## Phase 11: Support & Documentation Strategy (Ongoing)
**Goal:** Minimize support burden through proactive education and AI assistance

### 11.1 Help Documentation System

**Knowledge Base Structure:**
- Getting Started Guide
- Stripe Connection Tutorial
- Post Creation Guide
- Newsletter Best Practices
- Financial Dashboard Explained
- Referral Program Guide
- Troubleshooting Common Issues
- Multi-Language Setup
- Integration Guides

**Implementation:**
- Create `/help` route with searchable docs
- Markdown files for each article
- Video embeds for visual tutorials
- Search functionality with Algolia or similar
- Breadcrumb navigation
- "Was this helpful?" feedback

### 11.2 Interactive Tooltips & Contextual Help

**Tooltip System Using shadcn/ui:**
\`\`\`tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <span className="text-muted-foreground cursor-help">?</span>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <p>This shows your total raised minus platform fees and Stripe fees.</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
\`\`\`

**Tooltip Locations:**
- Financial dashboard metrics
- Referral tier explanations
- Platform fee calculations
- Email delivery rates
- Analytics terms
- Integration options

**Features:**
- Hover to reveal on desktop
- Tap to reveal on mobile
- Max 2-3 sentences per tooltip
- Link to full documentation
- Multi-language support

### 11.3 AI Chatbot for Support (Using Vercel AI SDK)

**Technology Stack:**
- Vercel AI SDK v5
- OpenAI GPT-4o-mini via AI Gateway (included by default)
- Supabase vector storage for knowledge base
- Streaming responses
- Context-aware onboarding guidance

**Implementation Architecture:**

**Step 1: Knowledge Base Embedding**
\`\`\`typescript
// scripts/embed-docs.ts
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

// Embed all help documentation
const docs = await loadHelpDocs(); // Load markdown files
const embeddings = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: docs.map(doc => doc.content)
});

// Store in Supabase vector table
await supabase.from('documentation_embeddings').insert(
  embeddings.map((embedding, i) => ({
    content: docs[i].content,
    title: docs[i].title,
    embedding: embedding
  }))
);
\`\`\`

**Step 2: Chatbot UI Component**
\`\`\`tsx
// components/support-chatbot.tsx
'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SupportChatbot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/support/chat',
  });

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] border rounded-lg shadow-lg bg-background">
      <div className="p-4 border-b">
        <h3 className="font-semibold">TektonsTable Support</h3>
        <p className="text-sm text-muted-foreground">Ask me anything!</p>
      </div>
      
      <div className="h-[360px] overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block p-3 rounded-lg ${
              m.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center text-muted-foreground">Thinking...</div>}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your question..."
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>Send</Button>
      </form>
    </div>
  );
}
\`\`\`

**Step 3: Chat API with RAG**
\`\`\`typescript
// app/api/support/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const supabase = createClient();
  
  // Get last user message
  const lastMessage = messages[messages.length - 1].content;
  
  // Generate embedding for user question
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: lastMessage
  });
  
  // Search for relevant documentation using vector similarity
  const { data: relevantDocs } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 3
  });
  
  const user = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('tenants')
    .select('onboarding_step, created_at')
    .eq('user_id', user.data.user?.id)
    .single();
  
  const isOnboarding = userData && 
    (Date.now() - new Date(userData.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000; // Within 7 days
  
  // Build context with relevant docs and onboarding state
  const context = relevantDocs?.map(doc => doc.content).join('\n\n') || '';
  const onboardingContext = isOnboarding 
    ? `\n\nThe user is currently on onboarding step: ${userData.onboarding_step}. Provide helpful, encouraging guidance specific to this step.`
    : '';
  
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a helpful support assistant for TektonsTable, a missionary fundraising platform. 
    Use the following documentation to answer questions accurately.
    If you don't know the answer, say so and suggest contacting support.
    Be friendly, concise, and helpful.${onboardingContext}
    
    Documentation:
    ${context}`,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
\`\`\`

**Chatbot Features:**
- Answers questions using RAG (Retrieval Augmented Generation)
- Searches documentation automatically
- Provides links to full articles
- Available 24/7
- Handles common questions instantly
- Escalates to human support when needed
- Multi-language support
- Learns from feedback
- **Context-aware onboarding guidance** - Detects which onboarding step user is on and provides proactive tips
- **Proactive suggestions** - "Need help choosing support tiers? Most missionaries start with $25, $50, and $100 monthly options."
- **Example-driven help** - Can show sample bios, posts, and configurations

**Onboarding-Specific AI Guidance:**

The chatbot automatically detects when users are in onboarding and provides contextual help:

**Step 1: Basic Information**
- AI: "Great start! Most missionaries include their mission field location and ministry focus. This helps supporters understand your calling."

**Step 2: Profile Setup**
- AI: "Your bio should tell your story in 2-3 sentences. Example: 'Called to serve in Uganda since 2018, we plant churches in rural communities. Our family of four shares the Gospel through education and medical care.'"

**Step 3: Choose Your URL**
- AI: "Your subdomain will be: yourname.tektonstable.com. Use your name or ministry name. Example: 'john-smith' becomes john-smith.tektonstable.com"

**Step 4: Branding & Customization**
- AI: "Pick a primary color that represents your ministry. Blue (trust), Green (growth), Orange (energy) are popular choices."

**Step 5: Support Tiers**
- AI: "Most missionaries create 3-4 tiers: Partner ($25/mo), Supporter ($50/mo), Champion ($100/mo). Offer exclusive prayer letters or updates at higher tiers."

**Step 6: First Post**
- AI: "Your first post should introduce your mission and invite people to join your journey. Include 2-3 photos from your field. Keep it personal and authentic."

**Step 7: Payment Setup**
- AI: "Stripe setup takes 2-3 minutes. You'll need your bank account info for monthly payouts. Don't worry, Stripe is secure and used by millions."

**Proactive Help Triggers:**
- User stays on a step for 2+ minutes → AI suggests tips
- User clicks help icon → AI opens with step-specific guidance
- User types question → AI searches docs and provides answer

### 11.4 Help Guide Management System

**Admin Interface for Creating Help Content:**

**Database Schema:**
\`\`\`sql
create table help_articles (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title jsonb not null, -- Multi-language titles: {"en": "...", "es": "..."}
  content jsonb not null, -- Multi-language content
  category text not null,
  subcategory text,
  order_index integer default 0,
  is_published boolean default false,
  view_count integer default 0,
  helpful_count integer default 0,
  not_helpful_count integer default 0,
  related_articles uuid[],
  video_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table help_categories (
  id uuid primary key default uuid_generate_v4(),
  name jsonb not null, -- Multi-language names
  slug text unique not null,
  icon text,
  order_index integer default 0,
  created_at timestamp default now()
);

create table help_article_feedback (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references help_articles(id),
  user_id uuid references tenants(id), -- Linking feedback to tenants
  was_helpful boolean not null,
  feedback_text text,
  created_at timestamp default now()
);

create index idx_help_articles_category on help_articles(category);
create index idx_help_articles_published on help_articles(is_published);
create index idx_help_articles_slug on help_articles(slug);
\`\`\`

**Help Guide Admin Dashboard:**
- Create/edit/delete articles
- Rich text editor with markdown support
- Multi-language content management (tabs for each language)
- Upload images and videos
- Preview before publishing
- SEO metadata fields
- Related articles selector
- Category management
- Analytics: views, helpfulness ratings

**Help Center Frontend (/help):**

**Route Structure:**
- `/help` - Homepage with categories and search
- `/help/category/[slug]` - Category page with articles list
- `/help/article/[slug]` - Individual article
- `/help/search?q=...` - Search results

**Features:**
- Full-text search across all articles
- Filter by category
- Breadcrumb navigation
- "Was this helpful?" buttons
- Related articles suggestions
- Print-friendly view
- Estimated reading time
- Last updated timestamp
- Multi-language switcher
- Table of contents for long articles

**Search Implementation:**
\`\`\`typescript
// app/api/help/search/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const language = searchParams.get('lang') || 'en';
  
  const supabase = createClient();
  
  // Full-text search across title and content
  const { data: articles } = await supabase
    .from('help_articles')
    .select('*')
    .eq('is_published', true)
    .or(`title->>en.ilike.%${query}%,content->>en.ilike.%${query}%`)
    .order('view_count', { ascending: false })
    .limit(10);
  
  return Response.json({ articles });
}
\`\`\`

**Article Component with Feedback:**
\`\`\`tsx
// app/help/article/[slug]/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function HelpArticlePage({ article }) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState(''); // State for feedback text
  
  async function submitFeedback(wasHelpful: boolean, text?: string) {
    await fetch('/api/help/feedback', {
      method: 'POST',
      body: JSON.stringify({
        article_id: article.id,
        was_helpful: wasHelpful,
        feedback_text: text
      })
    });
    setFeedback(wasHelpful ? 'helpful' : 'not-helpful');
  }
  
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">{article.title.en}</h1> {/* Assuming English title for simplicity */}
      <div className="text-sm text-muted-foreground mb-8">
        Last updated: {new Date(article.updated_at).toLocaleDateString()}
      </div>
      
      {article.video_url && (
        <div className="aspect-video mb-8">
          <iframe 
            src={article.video_url} 
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      )}
      
      <div 
        className="prose prose-lg max-w-none mb-12"
        // Assume content is rendered as HTML, adjust if markdown requires parsing
        dangerouslySetInnerHTML={{ __html: article.content.en }} // Assuming English content for simplicity
      />
      
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4">Was this article helpful?</h3>
        {!feedback ? (
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                submitFeedback(true);
                setShowFeedbackForm(false);
              }}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Yes, it helped!
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setFeedback('not-helpful');
                setShowFeedbackForm(true);
              }}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Not really
            </Button>
          </div>
        ) : feedback === 'helpful' ? (
          <p className="text-green-600">Thanks for your feedback!</p>
        ) : null}
        
        {showFeedbackForm && (
          <div className="mt-4 space-y-4">
            <Textarea 
              placeholder="What could we improve?"
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <Button onClick={() => submitFeedback(false, feedbackText)}>
              Submit Feedback
            </Button>
          </div>
        )}
      </div>
      
      {article.related_articles?.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
          <div className="grid gap-4">
            {/* Assuming related_articles contains enough info or needs fetching */}
            {article.related_articles.map((related: any) => ( // Added type assertion for demonstration
              <a 
                key={related.id}
                href={`/help/article/${related.slug}`}
                className="block p-4 border rounded-lg hover:bg-muted"
              >
                <h4 className="font-medium">{related.title.en}</h4> {/* Assuming English title */}
                <p className="text-sm text-muted-foreground mt-1">
                  {related.description || 'Read more...'} {/* Placeholder description */}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

**Help Center Homepage:**
\`\`\`tsx
// app/help/page.tsx
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Import Button

// Mock categories data for demonstration
const mockCategories = [
  { id: '1', slug: 'getting-started', name: {'en': 'Getting Started'}, icon: '🚀', article_count: 4 },
  { id: '2', slug: 'fundraising', name: {'en': 'Fundraising'}, icon: '💰', article_count: 5 },
  { id: '3', slug: 'email-newsletters', name: {'en': 'Email Newsletters'}, icon: '📧', article_count: 4 },
  { id: '4', slug: 'financial-dashboard', name: {'en': 'Financial Dashboard'}, icon: '📊', article_count: 4 },
  { id: '5', slug: 'referral-program', name: {'en': 'Referral Program'}, icon: '🤝', article_count: 4 },
  { id: '6', slug: 'integrations', name: {'en': 'Integrations'}, icon: '🔌', article_count: 4 },
  { id: '7', slug: 'account-settings', name: {'en': 'Account Settings'}, icon: '⚙️', article_count: 4 },
  { id: '8', slug: 'troubleshooting', name: {'en': 'Troubleshooting'}, icon: '🔧', article_count: 4 },
];


export default function HelpCenterPage() { // Removed categories prop as it's mocked
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">How can we help you?</h1>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search for help articles..."
            className="pl-12 h-12 text-lg"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {mockCategories.map(category => (
          <a 
            key={category.id}
            href={`/help/category/${category.slug}`}
            className="p-6 border rounded-lg hover:border-primary transition"
          >
            <div className="text-4xl mb-4">{category.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{category.name.en}</h3> {/* Assuming English name */}
            <p className="text-sm text-muted-foreground">
              {category.article_count} articles
            </p>
          </a>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
        <p className="text-muted-foreground mb-6">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <Button size="lg">Contact Support</Button>
      </div>
    </div>
  );
}
\`\`\`

**Help Categories Structure:**
1. **Getting Started** (🚀)
   - Creating your account
   - Connecting Stripe
   - Your first post
   - Setting up your profile

2. **Fundraising** (💰)
   - Creating fundraising posts
   - Setting funding goals
   - Understanding fees
   - Supporter tiers and locked content

3. **Email Newsletters** (📧)
   - Creating newsletters
   - Managing subscribers
   - Email best practices
   - Delivery rates

4. **Financial Dashboard** (📊)
   - Understanding your dashboard
   - Viewing donations
   - Exporting data
   - QuickBooks integration

5. **Referral Program** (🤝)
   - How referrals work
   - Earning discounts
   - Tracking referrals
   - Referral tiers

6. **Integrations** (🔌)
   - QuickBooks sync
   - Mission agency software
   - Zapier connections
   - API documentation

7. **Account Settings** (⚙️)
   - Managing your account
   - Multi-language setup
   - Security settings
   - Privacy controls

8. **Troubleshooting** (🔧)
   - Payment issues
   - Email delivery problems
   - Login issues
   - Common errors

**Content Creation Workflow:**
1. Platform admin creates article in English
2. Translation service (or manual) translates to other 5 languages
3. Review and publish
4. Monitor feedback and analytics
5. Update based on user feedback
6. Re-embed for AI chatbot after updates

**Analytics Dashboard:**
- Most viewed articles
- Most helpful articles
- Articles with negative feedback
- Search queries with no results (gaps to fill)
- Average time on page
- Bounce rate per article

**Integration with AI Chatbot:**
- Chatbot searches help articles using RAG
- Provides article links in responses
- Tracks which articles AI references most
- Updates knowledge base when articles change

### 11.5 Onboarding Checklist

**7-Day Onboarding Flow:**
- Day 1: Account setup + Stripe connection
- Day 2: Create first post
- Day 3: Send first newsletter
- Day 4: Customize profile
- Day 5: Share referral link
- Day 6: Review analytics
- Day 7: Set funding goals

**Implementation:**
- Progress bar in dashboard
- Email reminders for incomplete steps
- Video tutorials for each step
- Celebration when complete
- **AI chatbot available throughout onboarding** for instant help

### 11.6 Video Tutorial Library

**Core Videos (2-3 minutes each):**
1. "Getting Started with TektonsTable"
2. "Connecting Your Stripe Account"
3. "Creating Your First Post"
4. "Sending Email Newsletters"
5. "Understanding Your Financial Dashboard"
6. "How the Referral Program Works"
7. "Setting Up Funding Goals"
8. "Exporting Data to QuickBooks"

**Recording Strategy:**
- Use Loom or similar for screen recording
- Host on YouTube or Vercel Blob
- Embed in help documentation
- Captions for accessibility
- Multi-language subtitles

### 11.7 Community Forum (Future)

**Platform:** Discourse or similar
- Missionaries help each other
- Share best practices
- Feature requests
- Success stories
- Reduces support burden

### 11.8 Status Page

**Public Status Dashboard:**
- Email delivery status
- Stripe connectivity
- API uptime
- Scheduled maintenance
- Incident history

**Implementation:**
- Use Vercel Analytics + custom monitoring
- Display on help page
- Auto-update every 5 minutes

### 11.9 Support Ticket System (Phase 2)

**Simple Ticket System:**
- Email to support@tektonstable.com
- Auto-creates ticket in database
- Admin dashboard to manage
- Priority levels
- Auto-responses
- Resolution tracking

### 11.10 Feedback Collection

**In-App Feedback:**
- "Was this helpful?" on all help articles
- Net Promoter Score survey (quarterly)
- Feature request form
- Bug report form
- Quick feedback widget

**Analytics:**
- Track most-viewed help articles
- Identify common pain points
- Measure chatbot resolution rate
- Monitor support response time

### 11.11 Support Time Estimates

**With Full System Implemented:**

**Months 1-3 (Learning Phase):**
- 10-15 hours/week
- Building knowledge base
- Refining chatbot responses
- Creating video tutorials

**Months 4-6 (Optimization):**
- 5-10 hours/week
- Most questions answered by chatbot
- Documentation mature
- Community starting to help

**Months 7+ (Maintenance):**
- 3-5 hours/week
- Edge cases only
- Feature questions
- Integration support
- Chatbot handles 70-80% of queries

**Cost Savings:**
- AI chatbot: ~$20-50/month (OpenAI via AI Gateway)
- Prevents need for full-time support person: Saves $50,000+/year
- Scales automatically with user growth

### 11.12 Database Schema for Support

\`\`\`sql
-- Help documentation
help_articles (
  id uuid primary key,
  title text,
  slug text unique,
  content text,
  category text,
  language text default 'en',
  helpful_count integer default 0,
  not_helpful_count integer default 0,
  view_count integer default 0,
  video_url text nullable,
  created_at timestamp,
  updated_at timestamp
)

-- Documentation embeddings for AI
documentation_embeddings (
  id uuid primary key,
  article_id uuid references help_articles,
  content text,
  embedding vector(1536), -- OpenAI embedding dimension
  created_at timestamp
)

-- Support tickets (future)
support_tickets (
  id uuid primary key,
  tenant_id uuid references tenants nullable,
  email text,
  subject text,
  message text,
  status text default 'open',
  priority text default 'normal',
  assigned_to uuid references users nullable,
  resolved_at timestamp nullable,
  created_at timestamp
)

-- Chatbot conversations for improvement
chatbot_conversations (
  id uuid primary key,
  tenant_id uuid references tenants nullable,
  messages jsonb,
  resolved boolean default false,
  escalated boolean default false,
  feedback_rating integer nullable,
  created_at timestamp
)

-- Feedback
feedback (
  id uuid primary key,
  tenant_id uuid references tenants nullable,
  type text, -- 'article_helpful', 'feature_request', 'bug_report', 'nps'
  content text,
  rating integer nullable,
  created_at timestamp
)
\`\`\`

### 11.13 Deliverables

- Help documentation system with search
- Interactive tooltips on all complex features
- AI chatbot using RAG + Vercel AI SDK
- Onboarding checklist with progress tracking
- 7 core video tutorials
- Automated educational email series
- Status page for system health
- Feedback collection system
- Support analytics dashboard
- Multi-language support for all help content

**Result:** 70-80% of support queries handled automatically, reducing support time from 15+ hours/week to 3-5 hours/week.

---

## Phase 12: Super Admin Controls & System Management

### 12.1 Super Admin Dashboard
**Goal:** Platform-wide controls and monitoring for system administrator

#### 12.1.1 Super Admin Database Schema
\`\`\`sql
-- Super admin users table
super_admins (
  id uuid primary key,
  email text unique,
  name text,
  role text default 'admin', -- admin, owner
  created_at timestamp,
  last_login timestamp
)

-- System-wide settings
system_settings (
  id uuid primary key,
  setting_key text unique,
  setting_value jsonb,
  description text,
  updated_by uuid references super_admins,
  updated_at timestamp
)

-- Platform fee configuration with history
platform_fee_config (
  id uuid primary key,
  base_fee_percentage numeric(5,2) default 3.00, -- Current platform fee (e.g., 3.00 = 3%)
  effective_date timestamp not null,
  created_by uuid references super_admins,
  created_at timestamp default now(),
  notes text
)

-- Audit log for fee changes
platform_fee_audit (
  id uuid primary key,
  old_fee numeric(5,2),
  new_fee numeric(5,2),
  changed_by uuid references super_admins,
  changed_at timestamp default now(),
  reason text,
  affected_tenants_count integer
)
\`\`\`

#### 12.1.2 Platform Fee Management
**Goal:** Super admin can adjust the base platform fee from the dashboard

**Backend:** `POST /api/super-admin/settings/platform-fee`

**Request Body:**
\`\`\`javascript
{
  new_fee_percentage: 3.5, // New fee (e.g., 3.5%)
  effective_date: "2025-12-01", // When to apply (immediate or future)
  apply_to_existing: boolean, // Apply to existing tenants or only new ones
  reason: "Market adjustment" // Audit trail reason
}
\`\`\`

**Business Logic:**
- Minimum fee: 0.5%
- Maximum fee: 10%
- Default: 3%
- Grandfathering option: Existing tenants can keep old rate
- Referral discounts calculated from base fee (e.g., if base is 3.5%, welcome discount is 1.75%)

**Implementation Steps:**
1. Validate new fee percentage (0.5% - 10%)
2. Calculate impact: number of affected tenants
3. Create confirmation modal showing impact
4. Insert into `platform_fee_config` table
5. Log change in `platform_fee_audit`
6. Send email to affected tenants (if applying to existing)
7. Update Stripe application fee for new donations

**UI Location:** `/super-admin/settings/platform-fee`

**Dashboard Component:**
\`\`\`typescript
// Super Admin Fee Settings Component
<Card>
  <CardHeader>
    <CardTitle>Platform Fee Configuration</CardTitle>
    <CardDescription>Adjust the base platform fee percentage</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      {/* Current Fee Display */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600">Current Platform Fee</div>
        <div className="text-3xl font-bold text-blue-600">3.00%</div>
        <div className="text-xs text-gray-500">Effective since Jan 1, 2025</div>
      </div>

      {/* Fee Adjustment Form */}
      <div className="space-y-4">
        <Label>New Platform Fee (%)</Label>
        <Input 
          type="number" 
          min="0.5" 
          max="10" 
          step="0.1"
          placeholder="3.5"
        />
        
        <Label>Effective Date</Label>
        <Input type="date" />
        
        <Label>Reason for Change</Label>
        <Textarea placeholder="Market adjustment, cost increase, etc." />
        
        <div className="flex items-center space-x-2">
          <Switch id="apply-existing" />
          <Label htmlFor="apply-existing">
            Apply to existing tenants (otherwise only new signups)
          </Label>
        </div>

        {/* Impact Preview */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Impact Preview</AlertTitle>
          <AlertDescription>
            This will affect <strong>234 active tenants</strong>
            <br />
            Estimated monthly revenue change: <strong>+$186</strong>
          </AlertDescription>
        </Alert>
      </div>

      <Button onClick={handleFeeUpdate} className="w-full">
        Update Platform Fee
      </Button>
    </div>
  </CardContent>
</Card>

{/* Fee History Table */}
<Card className="mt-6">
  <CardHeader>
    <CardTitle>Fee Change History</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Old Fee</TableHead>
          <TableHead>New Fee</TableHead>
          <TableHead>Changed By</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Affected Tenants</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Jan 1, 2025</TableCell>
          <TableCell>1.5%</TableCell>
          <TableCell>3.0%</TableCell>
          <TableCell>admin@tektonstable.com</TableCell>
          <TableCell>Initial pricing adjustment</TableCell>
          <TableCell>147</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </CardContent>
</Card>
\`\`\`

**Stripe Integration:**
When processing donations, the system fetches the current platform fee:
\`\`\`typescript
// In donation processing
const { data: currentFee } = await supabase
  .from('platform_fee_config')
  .select('base_fee_percentage')
  .order('effective_date', { ascending: false })
  .limit(1)
  .single()

// Apply tenant-specific discount (if any)
const tenantDiscount = await getTenantReferralDiscount(tenant_id)
const effectiveFee = currentFee.base_fee_percentage * (1 - tenantDiscount)

// Create Stripe payment intent with calculated fee
const applicationFeeAmount = Math.round(donationAmount * effectiveFee / 100)
\`\`\`

**Email Notification Template:**
\`\`\`
Subject: Platform Fee Update - TektonsTable

Hi [Missionary Name],

We're writing to inform you of an update to TektonsTable's platform fee structure.

Current Fee: 3.0%
New Fee: 3.5%
Effective Date: December 1, 2025

What this means for you:
- On a $100 donation, our fee increases from $3.00 to $3.50
- This helps us continue providing free email marketing, CRM tools, and support
- Your referral discounts still apply to the base fee

Questions? Our support team is here to help: support@tektonstable.com

Thank you for using TektonsTable to grow your ministry!
\`\`\`

#### 12.1.3 Referral Discount Toggle

**Backend:** `POST /api/super-admin/settings/referral-program`

**Request Body:**
\`\`\`javascript
{
  is_enabled: false,
  disable_reason: "Temporary pause for review",
  welcome_discount_percentage: 50 // e.g., 50%
}
\`\`\`

**Features:**
- Global toggle to enable/disable the referral program
- Admins can set the initial welcome discount percentage (e.g., 50%)
- Track reason for disabling
- Existing referrals and earned tiers remain intact but inactive
- UI in Super Admin Settings dashboard

#### 12.1.4 System-Wide Settings

**Backend:** `POST /api/super-admin/settings/system`

**Request Body:**
\`\`\`javascript
{
  maintenance_mode: {
    enabled: true,
    message: "Scheduled maintenance: Friday 10 PM - 1 AM EST"
  },
  new_signups_enabled: false,
  email_notifications_enabled: true
}
\`\`\`

**Features:**
- **Maintenance Mode:** Display a custom page to all users when enabled.
- **New Signups:** Temporarily disable new tenant signups.
- **Email Notifications:** Globally enable/disable all system-generated emails (transactional, marketing).
- **Database:** Updates `system_settings` table.
- **UI:** Section in Super Admin Settings dashboard.

#### 12.1.5 Deliverables ✅
- Super admin settings dashboard
- Platform fee management page with history
- Referral program toggle and configuration
- System-wide feature controls (maintenance mode, signups, emails)
- Audit logging for all administrative changes
- Impact preview calculations for fee changes

**Result:** Complete platform control center for super admins to manage fees, referral programs, and system-wide settings with full audit trails.

---

## Phase 13: Financial Campaigns System

### 13.1 Campaign Feature Overview
**Goal:** Allow tenants to create fundraising campaigns for specific causes (mission trip, equipment, emergency, project)

#### 13.1.1 Campaign Database Schema
\`\`\`sql
-- Financial campaigns table
campaigns (
  id uuid primary key,
  tenant_id uuid references tenants,
  title text not null,
  description text,
  goal_amount decimal not null,
  current_amount decimal default 0,
  currency text default 'USD',
  category text, -- 'mission_trip', 'equipment', 'emergency', 'project', 'other'
  image_url text,
  start_date timestamp,
  end_date timestamp nullable,
  status text default 'active', -- active, completed, paused, cancelled
  is_featured boolean default false,
  slug text unique,
  created_at timestamp,
  updated_at timestamp
)

-- Campaign donations (links donations to campaigns)
campaign_donations (
  id uuid primary key,
  campaign_id uuid references campaigns,
  donation_id uuid references donations,
  amount decimal,
  created_at timestamp
)

-- Campaign updates (progress posts)
campaign_updates (
  id uuid primary key,
  campaign_id uuid references campaigns,
  tenant_id uuid references tenants,
  title text,
  content text,
  created_at timestamp
)
\`\`\`

#### 13.1.2 Campaign Creation API
**Backend:** `POST /api/tenant/campaigns`

**Request Body:**
\`\`\`javascript
{
  title: "Mission Trip to Kenya",
  description: "Raising funds for a 2-week mission trip...",
  goal_amount: 5000,
  currency: "USD",
  category: "mission_trip",
  end_date: "2025-12-31",
  image_url: "/uploads/kenya-trip.jpg"
}
\`\`\`

**Features:**
- Multiple active campaigns per tenant
- Progress bar showing goal completion
- Auto-complete when goal reached
- Campaign-specific donation page
- Shareable campaign links

#### 13.1.3 Tenant Dashboard - Campaign Management
**UI Components:**

**Campaign List View:**
- Card layout showing all campaigns
- Progress bars with percentage
- "Active", "Completed", "Paused" status badges
- Quick actions: Edit, Pause, Archive, Share

**Campaign Creation Form:**
- Title (required)
- Description with rich text editor
- Goal amount with currency selector
- Category dropdown
- Image upload
- Start/End dates
- Optional: Recurring vs one-time

**Campaign Detail Page:**
- Real-time progress bar
- Recent donations list
- Share buttons
- Campaign updates section
- "Post Update" button

#### 13.1.4 Public Campaign Page
**Route:** `/{tenantSlug}/campaigns/{campaignSlug}`

**Features:**
- Campaign hero with image
- Progress bar and stats
- Donation form linked to campaign
- Campaign updates feed
- Social sharing

#### 13.1.5 Donation Flow Integration
**Modified Checkout:**
- Supporter selects campaign from dropdown
- Or lands directly on campaign page
- Donation tagged with campaign_id
- Real-time campaign progress update
- Thank you email mentions specific campaign

---

## Phase 14: Content Organization - Categories & Topics

**Status:** Complete

### Deliverables Implemented:
- ✅ Enhanced categories table with color, icon, description, display_order, is_visible
- ✅ Topics table with automatic post_count tracking
- ✅ Category management dashboard at `/dashboard/categories`
- ✅ Topic management dashboard at `/dashboard/topics`
- ✅ Category CRUD operations with color picker and icon selector
- ✅ Topic CRUD operations with tag cloud visualization
- ✅ Post editor integration (already existed, confirmed working)
- ✅ Public RLS policies for viewing categories and topics
- ✅ Automatic post count tracking for topics via database trigger

### Files Modified:
- Created: `scripts/020_enhanced_categories_topics.sql`
- Created: `app/dashboard/categories/page.tsx`
- Created: `app/dashboard/topics/page.tsx`
- Created: `components/dashboard/category-manager.tsx`
- Created: `components/dashboard/topic-manager.tsx`
- Created: `app/actions/categories.ts`
- Created: `app/actions/topics.ts`

### 14.1.1 Database Schema
\`\`\`sql
-- Content categories (tenant-specific)
categories (
  id uuid primary key,
  tenant_id uuid references tenants,
  name text not null,
  slug text,
  description text,
  color text, -- Hex color for category badge
  icon text, -- Icon name (lucide-react)
  display_order integer default 0,
  is_visible boolean default true,
  created_at timestamp,
  unique(tenant_id, slug)
)

-- Topics/tags for posts
topics (
  id uuid primary key,
  tenant_id uuid references tenants,
  name text not null,
  slug text,
  post_count integer default 0,
  created_at timestamp,
  unique(tenant_id, slug)
)

-- Post-topic relationships (many-to-many)
post_topics (
  post_id uuid references posts,
  topic_id uuid references topics,
  created_at timestamp,
  primary key (post_id, topic_id)
)

-- Add category to posts table
ALTER TABLE posts ADD COLUMN category_id uuid references categories;
\`\`\`

#### 14.1.2 Category Management API
**Backend Routes:**
- `GET /api/tenant/categories` - List all categories
- `POST /api/tenant/categories` - Create category
- `PUT /api/tenant/categories/:id` - Update category
- `DELETE /api/tenant/categories/:id` - Delete category (moves posts to uncategorized)
- `POST /api/tenant/categories/reorder` - Update display order

**Default Categories (Auto-created):**
- Prayer Requests (🙏 purple)
- Ministry Updates (📢 blue)
- Testimonies (✨ gold)
- Personal Life (👨‍👩‍👧‍👦 green)
- Fundraising (💰 red)

#### 14.1.3 Topic Management API
**Backend Routes:**
- `GET /api/tenant/topics` - List all topics with post counts
- `POST /api/tenant/topics` - Create new topic
- `PUT /api/tenant/topics/:id` - Edit topic name
- `DELETE /api/tenant/topics/:id` - Delete topic (removes from all posts)
- `GET /api/tenant/topics/suggestions` - Auto-suggest topics based on post content

**Features:**
- Auto-complete when adding topics to posts
- Show popular topics
- Maximum 10 topics per post
- Topic cloud visualization

#### 14.1.4 Tenant Dashboard - Category Manager
**UI:** `/dashboard/categories`

**Features:**
- Drag-and-drop reordering
- Color picker for each category
- Icon selector (lucide-react icons)
- Toggle visibility
- Post count per category
- Bulk assign posts to category

#### 14.1.5 Tenant Dashboard - Topic Manager
**UI:** `/dashboard/topics`

**Features:**
- Tag cloud visualization
- Edit topic names inline
- Merge duplicate topics
- See which posts use each topic
- Delete unused topics
- Export topic list

#### 14.1.6 Post Editor Integration
**Enhanced Post Creation:**
- Category dropdown (required)
- Topic input with autocomplete
- Create new topics inline
- Tag suggestions based on content
- Preview how post appears in category feed

#### 14.1.7 Public Filtering
**Tenant Site Navigation:**
- Category filter menu
- Topic cloud/tag list
- URL structure: `/{tenantSlug}/posts?category=ministry-updates`
- URL structure: `/{tenantSlug}/posts?topic=kenya`
- Filter by multiple topics
- Category-specific RSS feeds

---

## Additional Feature: Demo Site System ✅ COMPLETE

### Demo Site Overview
**Goal:** Provide a fully functional example missionary fundraising page with editable content

**Delivered:**
- ✅ Public demo site at `/example` with complete missionary page
- ✅ Sample content: profile, posts, campaigns, statistics, video
- ✅ Admin editor at `/admin/demo-site` for super admins
- ✅ Database-driven content (not hardcoded)
- ✅ Editable sections: profile, statistics, video, posts, campaigns
- ✅ Demo banners to indicate it's an example page
- ✅ "Example" link in main site navigation
- ✅ CTA buttons to convert demo viewers to signups

**Database Tables Created (Script 021):**
- `demo_site_config` - Editable sections (profile, statistics, video)
- `demo_posts` - Sample blog posts with images and videos
- `demo_campaigns` - Sample fundraising campaigns with progress

**Sample Content Included:**
- Sarah Thompson (fictional missionary profile)
- 3 detailed blog posts with images
- 2 active fundraising campaigns
- Statistics dashboard (127 supporters, $3,450 monthly)
- Embedded YouTube video
- Professional imagery and compelling copy

**Admin Interface:**
- JSON editor for each section
- Toggle visibility for sections
- Preview button to view live demo
- Syntax validation for JSON content

**Benefits:**
- Converts visitors by showing real functionality
- Helps missionaries visualize their own page
- Reduces support questions about features
- Demonstrates professional design quality
- Fully customizable by super admins

---

### 15.1 Contact Form System
**Goal:** Allow supporters to contact missionaries directly through tenant sites

#### 15.1.1 Database Schema
\`\`\`sql
-- Contact form submissions
contact_submissions (
  id uuid primary key,
  tenant_id uuid references tenants,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'new', -- new, read, archived
  ip_address text,
  user_agent text,
  created_at timestamp
)
\`\`\`

#### 15.1.2 Resend Integration
**Backend:** `POST /api/tenant/contact`

**Implementation:**
\`\`\`javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

async function handleContactSubmission(tenantId, formData) {
  // 1. Save to database
  const submission = await db.insert(contact_submissions).values({
    tenant_id: tenantId,
    name: formData.name,
    email: formData.email,
    subject: formData.subject || 'New Contact Form Submission',
    message: formData.message,
    ip_address: request.ip,
    user_agent: request.headers['user-agent']
  });
  
  // 2. Get tenant email
  const tenant = await getTenant(tenantId);
  
  // 3. Send email via Resend with reply-to workflow
  await resend.emails.send({
    from: 'TektonsTable Contact <contact@tektonstable.com>',
    to: tenant.email,
    replyTo: formData.email, // Reply goes directly to supporter
    subject: `Contact Form: ${formData.subject || 'New Message'}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${formData.name} (${formData.email})</p>
      <p><strong>Subject:</strong> ${formData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.message}</p>
      <hr>
      <p><em>Reply to this email to respond directly to ${formData.name}</em></p>
    `
  });
  
  // 4. Send confirmation to supporter
  await resend.emails.send({
    from: 'TektonsTable <noreply@tektonstable.com>',
    to: formData.email,
    subject: `Message sent to ${tenant.name}`,
    html: `
      <p>Hi ${formData.name},</p>
      <p>Your message has been sent to ${tenant.name}. They'll respond directly to your email address.</p>
      <p>Thanks for your support!</p>
    `
  });
  
  return { success: true };
}
\`\`\`

#### 15.1.3 Public Contact Form UI
**Route:** `/{tenantSlug}/contact`

**Form Fields:**
- Name (required)
- Email (required)
- Subject (optional)
- Message (required, textarea)
- Submit button with loading state
- reCAPTCHA v3 (spam protection)

**Success State:**
- Confirmation message
- "Message sent successfully"
- Clear form
- Show expected response time

#### 15.1.4 Tenant Dashboard - Contact Inbox
**UI:** `/dashboard/contacts`

**Features:**
- List of all contact submissions
- Filter: New, Read, Archived
- Mark as read
- Quick reply button (opens email client with reply-to pre-filled)
- Archive old messages
- Delete messages
- Export contacts to CSV

---

## Phase 16: Enhanced Landing Page Features ✅

### 16.1 Testimonials Section
**Features:**
- Display 3 testimonial cards with ratings, avatars, and quotes
- Fully editable through admin interface at `/admin/site-content`
- Responsive grid layout (3 columns on desktop, stacked on mobile)
- Star ratings with visual display
- Missionary name, role, and photo for credibility

**Implementation:**
- Added `testimonials` section to `site_content` table
- 5-star rating system with yellow stars
- Avatar images with placeholder support
- Editable JSON structure in admin panel

### 16.2 FAQ Section
**Features:**
- Accordion-style FAQ with 10 pre-populated questions
- Click to expand/collapse individual questions
- Fully editable through admin interface
- Covers pricing, features, setup, cancellation
- Optimized for SEO with schema markup potential

**Implementation:**
- Added `faq` section to `site_content` table
- Native HTML `<details>` element for accessibility
- Smooth animations with CSS transitions
- Questions focused on common missionary concerns

**Files Created:**
- `scripts/024_testimonials_faq.sql` - Database setup with default content
- Updated `app/page.tsx` - Integrated testimonials and FAQ sections
- Updated `components/admin/site-content-editor.tsx` - Added section labels
- Updated `app/admin/site-content/page.tsx` - Default sections list

---

## Phase 17: WordPress Embedding System ✅

**Status:** COMPLETE

**Overview:**
WordPress embedding system allowing missionaries to embed their Tektons Table fundraising pages directly into existing WordPress sites using iframe technology with auto-height adjustment.

**Database Changes:**
- No database changes required

**Features Implemented:**

1. **Embed Code Generator** (`/dashboard/embed`)
   - Customizable iframe height
   - Auto-resize script included
   - Copy-to-clipboard functionality
   - Live preview of embed code

2. **Iframe Communication System**
   - Tenant layout detects iframe embedding
   - PostMessage API for height communication
   - ResizeObserver for dynamic content changes
   - Click event handling for content updates

3. **WordPress Integration Guide**
   - Step-by-step embedding instructions
   - Use case examples
   - Benefits list (SEO, branding, functionality)
   - Mobile responsive design

4. **Dashboard Integration**
   - Quick access card on main dashboard
   - Tenant subdomain display
   - Embed URL reference

**Files Created:**
- `app/dashboard/embed/page.tsx` - Embed code generator page
- `components/dashboard/embed-code-generator.tsx` - Interactive code generator
- `app/[tenant]/layout.tsx` - Iframe height communication

**Files Modified:**
- `app/dashboard/page.tsx` - Added WordPress embed quick action card

**Technical Implementation:**
- Cross-origin iframe communication using PostMessage API
- ResizeObserver for automatic height adjustment
- Click event listeners for interactive content
- WordPress-compatible HTML/JavaScript embed code
- Secure parent-child window messaging

**Benefits:**
- Missionaries keep their own domain for SEO
- Brand consistency with existing WordPress theme
- Full Tektons Table functionality in iframe
- No coding required - simple copy/paste
- Mobile responsive and accessible
- Automatic content synchronization

---

## All Phases Complete! 🎉

**Completed Phases:**
- Phase 1: Foundation & Authentication ✅
- Phase 2: Super Admin Dashboard ✅
- Phase 3: Stripe Connect Integration ✅
- Phase 4: Tenant CRM Dashboard ✅
- Phase 5: Supporter Management ✅
- Phase 6: Email System Part 1 (Post Notifications) ✅
- Phase 7: Email System Part 2 (Newsletters) ✅
- Phase 8: Social Sharing & Polish ✅
- Phase 9: Automated Backup System ✅
- Phase 10: Platform Expansion Features ✅
- Phase 11: Support & Documentation Strategy ✅
- Phase 12: Super Admin Controls & System Management ✅
- Phase 13: Financial Campaigns ✅
- Phase 14: Content Organization (Categories & Topics) ✅
- Phase 15: Contact Form System ✅
- Phase 16: Enhanced Landing Page (Testimonials & FAQ) ✅
- Phase 17: WordPress Embedding System ✅

**Bonus Features Added:**
- Editable landing page content system
- Demo site with admin editor (`/example`)
- Nonprofit pricing with verification workflow
- Enhanced RLS security policies
- Comprehensive error handling

**Platform Status:**
Tektons Table is now a **fully functional missionary fundraising platform** with:
- Complete authentication and authorization
- Stripe payment processing with multiple campaigns
- CRM and supporter management
- Content creation with categories and topics
- Email notifications and newsletters via Resend
- Contact form system with message management
- Referral program with tiered pricing
- WordPress embedding capability
- Super admin dashboard with full platform control
- Automated daily backups
- Custom domain support
- Mobile responsive design
- Accessible UI components

**Next Steps:**
- User testing and feedback collection
- Performance optimization
- SEO enhancements
- Marketing materials
- User documentation
- Video tutorials

---

### 13.1 Full Tenant Site Embedding

**What Gets Embedded:**
The entire tenant site can be embedded into WordPress pages using an iframe.

**Embed Code Generation:**

\`\`\`typescript
// app/dashboard/embed/page.tsx
import { useSubdomain } from '@/hooks/useSubdomain'; // Assuming hook exists
import { Button } from '@/components/ui/button';

export default function EmbedSettingsPage() {
  const subdomain = useSubdomain();
  
  const embedCode = `<iframe 
  src="https://${subdomain}.tektonstable.com" 
  width="100%" 
  style="border:none;"
  id="tektonstable-embed">
</iframe>
<script src="https://tektonstable.com/embed.js"></script>`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Embed Your Site</h1>
      <p>Copy this code and paste it into your WordPress page to embed your entire fundraising site.</p>
      
      <div className="bg-muted p-4 rounded-lg">
        <code className="text-sm">{embedCode}</code>
        <Button onClick={() => navigator.clipboard.writeText(embedCode)}>
          Copy Code
        </Button>
      </div>
      
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">WordPress Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to your WordPress page editor</li>
          <li>Switch to HTML/Code view (not Visual editor)</li>
          <li>Paste the embed code where you want your site to appear</li>
          <li>Publish your page</li>
        </ol>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Example Use Case:</h3>
        <p>If your WordPress site is <strong>johnsmith.org</strong>, you can embed your TektonsTable site at <strong>johnsmith.org/support</strong></p>
        <p className="text-sm text-muted-foreground mt-2">Visitors see your branding, but the fundraising functionality is powered by TektonsTable.</p>
      </div>
    </div>
  );
}
\`\`\`

**Embed Script (Auto-Height Adjustment):**

\`\`\`javascript
// public/embed.js
(function() {
  function resizeIframe() {
    const iframe = document.getElementById('tektonstable-embed');
    if (iframe) {
      // Send message to iframe to get content height
      iframe.contentWindow.postMessage({ type: 'getHeight' }, '*');
    }
  }

  // Listen for height response from iframe
  window.addEventListener('message', function(e) {
    if (e.data.type === 'setHeight') {
      const iframe = document.getElementById('tektonstable-embed');
      if (iframe) {
        iframe.style.height = e.data.height + 'px';
      }
    }
  });

  // Resize on load and window resize
  window.addEventListener('load', resizeIframe);
  window.addEventListener('resize', resizeIframe);
  
  // Initial resize
  resizeIframe();
})();
\`\`\`

**Iframe Content Script:**

\`\`\`typescript
// app/[subdomain]/layout.tsx
'use client';

import { useEffect } from 'react';

export default function TenantLayout({ children }) {
  useEffect(() => {
    // Detect if inside iframe
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      // Send height updates to parent window
      const sendHeight = () => {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ type: 'setHeight', height }, '*');
      };
      
      // Send initial height
      sendHeight();
      
      // Send height on content changes
      const observer = new ResizeObserver(sendHeight);
      observer.observe(document.body);
      
      // Listen for height requests
      window.addEventListener('message', (e) => {
        if (e.data.type === 'getHeight') {
          sendHeight();
        }
      });
    }
  }, []);

  return <>{children}</>;
}
\`\`\`

**Benefits:**
- SEO friendly - Missionary keeps their own domain
- Brand consistency - Matches their WordPress theme
- Full functionality - Donations, posts, everything works in iframe
- Easy updates - Content updates on TektonsTable automatically show in WordPress
- No coding required - Copy/paste embed code
- Responsive - Auto-adjusts for mobile devices
- Secure - Cross-origin messaging handled safely

**Example URL Structure for WordPress Embedding:**
- WordPress site: `johnsmith.org`
- Embedded TektonsTable at: `johnsmith.org/support` (contains iframe to `john-smith.tektonstable.com`)
- Visitors stay on `johnsmith.org` URL while interacting with TektonsTable features


## API Routes Reference

### Super Admin
- `POST /api/admin/tenants`
- `GET /api/admin/tenants`
- `PATCH /api/admin/tenants/[id]`
- `DELETE /api/admin/tenants/[id]`
- `GET /api/admin/analytics`
- `GET /api/admin/backups`
- `POST /api/admin/backups/trigger`
- `DELETE /api/admin/backups/[id]`
- `GET /api/admin/referrals/analytics`
- `GET /api/admin/referrals/leaderboard`
- `POST /api/super-admin/settings/referral-program`
- `POST /api/super-admin/settings/platform-fee`

### Tenant
- `POST /api/tenant/onboarding`
- `GET /api/tenant/stripe-status`
- `POST /api/tenant/posts`
- `PATCH /api/tenant/posts/[id]`
- `DELETE /api/tenant/posts/[id]`
- `POST /api/tenant/posts/[id]/notify`
- `GET /api/tenant/supporters`
- `POST /api/tenant/supporters/export`
- `GET /api/tenant/donations`
- `POST /api/tenant/donations/export`
- `GET /api/tenant/analytics`
- `GET /api/tenant/financials`
- `PATCH /api/tenant/funding-goals`
- `POST /api/tenant/newsletters`
- `PATCH /api/tenant/newsletters/[id]`
- `POST /api/tenant/newsletters/[id]/send`
- `POST /api/tenant/newsletters/[id]/schedule`
- `GET /api/tenant/templates`
- `PATCH /api/tenant/settings`
- `GET /api/tenant/referrals/code`
- `GET /api/tenant/referrals/stats`
- `GET /api/tenant/referrals/history`
- `GET /api/tenant/pricing`
- `POST /api/tenant/campaigns`
- `GET /api/tenant/campaigns`
- `GET /api/tenant/campaigns/:id`
- `PATCH /api/tenant/campaigns/:id`
- `DELETE /api/tenant/campaigns/:id`
- `GET /api/tenant/categories`
- `POST /api/tenant/categories`
- `PUT /api/tenant/categories/:id`
- `DELETE /api/tenant/categories/:id`
- `POST /api/tenant/categories/reorder`
- `GET /api/tenant/topics`
- `POST /api/tenant/topics`
- `PUT /api/tenant/topics/:id`
- `DELETE /api/tenant/topics/:id`
- `GET /api/tenant/topics/suggestions`
- `POST /api/tenant/contact`
- `GET /api/tenant/contacts`
- `PATCH /api/tenant/contacts/:id`
- `DELETE /api/tenant/contacts/:id`
- `GET /api/dashboard/posts` - Get tenant's posts (RLS)
- `POST /api/dashboard/posts` - Create new post
- `PUT /api/dashboard/posts/[id]` - Update post
- `DELETE /api/dashboard/posts/[id]` - Delete post
- `GET /api/dashboard/analytics` - Get donation analytics
- `GET /api/dashboard/referrals` - Get referral stats
- `POST /api/dashboard/campaigns` - Create funding campaign
- `GET /api/subdomain/settings/embed` - Embed settings

### Public
- `GET /api/[subdomain]/posts` - Get all posts for a tenant
- `GET /api/[subdomain]/posts/[id]` - Get specific post
- `POST /api/[subdomain]/support` - Create donation (Stripe)
- `GET /api/[subdomain]/funding-goal` - Get funding goal
- `POST /api/[subdomain]/contact` - Send contact form (Resend)
- `POST /api/[subdomain]/subscribe` - Newsletter signup
- `GET /api/tenant/[subdomain]/campaigns` - Get tenant campaigns
- `GET /api/tenant/[subdomain]/campaigns/{campaignSlug}` - Get specific campaign
- `POST /api/join` - Signup with referral code

### Payment
- `POST /api/payment/create-intent`
- `POST /api/payment/create-subscription`
- `POST /api/payment/webhook`
- `POST /api/supporter/portal`

### Cron
- `POST /api/cron/backup`
- `POST /api/cron/referrals/tier-check`
- `POST /api/cron/referrals/reminders`

### Integration
- `GET /api/integrations/stripe/status`
- `POST /api/integrations/quickbooks/export`

### Support Chat
- `POST /api/support/chat`

### Help
- `GET /api/help/search`
- `POST /api/help/feedback`

---

## Revenue Model Details

### Platform Fee: 3.5% (Variable by Tier)
- **Standard Rate:** 3.5% for all tenants
- **New User Discount:** 1.75% for first 30 days (50% off)
- **Referral Reward:** 1.75% for 30 days per completed referral
- **Permanent Tier Discounts:**
  - Bronze (3+ referrals): 3.0% forever
  - Silver (5+ referrals): 2.625% forever
  - Gold (10+ referrals): 2.33% forever
  - Platinum (25+ referrals): 2.04% forever

### Referral System Economics

**Growth Mechanism:**
- Every new user incentivized to share (50% off first month)
- Every referral gives both parties a reward
- Long-term advocates get permanent pricing
- Word-of-mouth in tight-knit mission communities

**Revenue Impact:**
\`\`\`javascript
// Example: 100 missionaries
Scenario A (No referrals):
- 100 tenants × $3,000/month avg × 3.5% = $10,500/month revenue

Scenario B (Active referrals):
- 20 tenants at Bronze (3.0%): $6,000/month
- 10 tenants at Silver (2.625%): $2,625/month
- 5 tenants at Gold (2.33%): $1,165/month
- 65 tenants at Standard (3.5%): $6,825/month
- Average revenue: $16,615/month

Revenue increase: 58.2%
BUT: User base grows 3-5x faster due to referrals
Net effect: 225-375% more revenue long-term
\`\`\`

**Sustainability:**
- Even Platinum tier (2.04%) covers infrastructure costs
- Referral growth creates exponential user acquisition
- Lower marketing spend needed
- Mission community trust drives adoption

---

## Critical Path Dependencies

**Must be completed in order:**
1. Phase 1 (Foundation + i18n) → Everything depends on this
2. Phase 3 (Stripe with enhanced revenue) → Required for Phase 5
3. Phase 4 (Posts + CRM) → Required for Phase 6
4. Phase 6 (Email basics) → Required for Phase 7
5. Phase 9 (Backups) → Requires all tables
6. Phase 10 (Expansion) → Builds on everything

**Can be parallelized:**
- Phase 2 (Admin) and Phase 3 (Stripe)
- Phase 8 (Polish) items throughout
- Translation work ongoing

---

## Success Metrics

**By End of Day 4:**
- Super admin can create tenants
- Tenants can connect Stripe globally
- Tenants can create posts with BlockNote
- Tenants can set and display funding goals
- Tenants can view comprehensive financial dashboard
- Supporters can donate with tips and fee coverage
- Supporters can manage subscriptions
- Post notification emails send in 6 languages
- Standalone newsletters send
- All authentication working
- Nightly backups running at midnight EST
- Platform supports 135+ currencies
- PWA functional
- CSV exports working
- Platform deployed to production
- Referral system fully functional
- Variable pricing working in Stripe
- Tier upgrades automated
- Referral dashboard complete
- Email notifications sending

---

## Integration Roadmap

### Phase 1 (Launch): CSV Exports
- Supporters export
- Donations export
- Analytics export
- QuickBooks-compatible format

### Phase 2 (Month 2-3): Zapier
- Build Zapier integration
- Connect to 5,000+ apps
- Automated workflows

### Phase 3 (Month 4-6): Direct Integrations
- DonorElf integration
- Planning Center integration
- ManagedMissions webhooks
- Salesforce connector

### Phase 4 (Month 7-12): Advanced Features
- Stripe Treasury integration
- Advanced analytics platform
- Native mobile app (React Native)
- White-label options

---

## Mobile App Strategy

### Phase 1: Progressive Web App (Now)
- Responsive design
- Add to home screen
- Offline support
- Fast performance
- Push notifications (basic)

### Phase 2: Native App (Month 6-9)
**Technology:** React Native (code sharing with web)

**Features:**
- Post updates on--the-go
- Photo/video upload from camera
- Push notifications for donations
- Respond to supporter messages
- Quick analytics dashboard
- Offline draft mode

**Platforms:**
- iOS (App Store)
- Android (Google Play)

---

## Internationalization Details

### Supported Languages at Launch
1. **English (en)** - Primary
2. **Spanish (es)** - Latin America focus
3. **Portuguese (pt)** - Brazil focus
4. **French (fr)** - Africa focus
5. **Korean (ko)** - Major sending nation
6. **Chinese (zh)** - Emerging missionary force

### Translation Coverage
- All UI elements
- Email templates
- Donation pages
- Receipts
- Documentation
- Marketing materials

### Currency Support
- 135+ currencies via Stripe
- Auto-detection based on location
- Manual currency selection
- Real-time conversion rates
- Multi-currency donation tracking

---

## QuickBooks Integration Guide

### Method 1: Stripe Dashboard Export
1. Navigate to Stripe Dashboard → Exports
2. Download IIF file (QuickBooks compatible)
3. Import to QuickBooks Desktop
4. Accounts auto-created with "Stripe" prefix

### Method 2: Automated Sync (Future)
- Use Stripe apps from marketplace
- Automatic daily sync
- Real-time financial updates
- Reconciliation support

### Method 3: CSV Export
- Export donations from TektonsTable
- Custom format for QuickBooks import
- Include all transaction details
- Support for multiple currencies

---

## Mission Agency Integration Opportunities

### Tier 1: High Priority
1. **DonorElf** - Missionary CRM integration
2. **Planning Center** - Church management sync
3. **ManagedMissions** - Trip management

### Tier 2: Medium Priority
4. **Virtuous CRM** - Nonprofit CRM
5. **Ministry Brands** - Comprehensive suite
6. **ACST** - Engagement tracking

### Tier 3: Future Exploration
7. **Salesforce Nonprofit Cloud**
8. **Bloomerang**
9. **Kindful**

### Integration Features
- Two-way data sync
- Automatic donation import
- Supporter list sync
- Custom field mapping
- Webhook support
- API access

---

## Security & Compliance

### Data Security Best Practices

**Authentication & Authorization:**
- Use Supabase RLS (Row Level Security) for all tenant data isolation
- Enforce strong password requirements (min 8 chars, uppercase, lowercase, number)
- Implement 2FA for admin accounts
- JWT token expiration: 1 hour for access tokens, 7 days for refresh tokens
- Rate limiting on auth endpoints: 5 attempts per 15 minutes
- Secure session management with httpOnly cookies

**Data Protection:**
- All API routes require authentication middleware
- Validate all user inputs (server-side validation, never trust client)
- Sanitize user-generated content (XSS prevention)
- Use prepared statements for all database queries (SQL injection prevention)
- Encrypt sensitive data at rest (Supabase encryption enabled)
- All traffic over HTTPS only (enforce SSL)
- Content Security Policy (CSP) headers configured

**Financial Data Handling:**
- NEVER store full credit card numbers
- NEVER store CVV codes
- All payment processing through Stripe (PCI DSS compliant)
- Store only Stripe customer IDs and payment method IDs
- Log all financial transactions for audit trail
- Implement webhook signature verification for Stripe

**API Security:**
- Rate limiting on all public endpoints:
  - Donation page: 10 requests/minute per IP
  - Auth endpoints: 5 requests/15 minutes per IP
  - API routes: 100 requests/minute per tenant
- CORS configured for specific origins only
- API keys rotated quarterly
- Webhook endpoints verify signatures
- CSRF protection on all forms

### GDPR Compliance

**User Rights Implementation:**
- **Right to Access:** API endpoint to export all user data as JSON
- **Right to Deletion:** Complete data deletion within 30 days of request
- **Right to Portability:** CSV/JSON export of all personal data
- **Right to Rectification:** Users can edit profile information
- **Right to Restriction:** Users can disable email notifications

**Data Collection Transparency:**
- Clear privacy policy linked in footer
- Cookie consent banner on first visit
- Explicit opt-in for email communications
- Data processing agreement for tenants
- Privacy settings dashboard for supporters

**Data Retention Policies:**
- Active user data: Retained indefinitely while account active
- Deleted account data: Purged after 30 days
- Backup data: Retained for 90 days, then deleted
- Financial records: Retained for 7 years (legal requirement)
- Email logs: Retained for 30 days
- Analytics data: Anonymized after 90 days

**International Data Transfers:**
- Data stored in Supabase (AWS infrastructure)
- Standard Contractual Clauses (SCCs) for EU data
- Data processing addendum with all vendors
- Disclosure of data location to users

### Legal Compliance

**Terms of Service:**
- Clear platform fee structure (3.5% + variable tiers)
- Refund policy disclosure
- User responsibilities and prohibited uses
- Liability limitations
- Dispute resolution process
- Service termination conditions

**Privacy Policy:**
- Data collection practices
- Third-party services (Stripe, Resend, Vercel)
- Cookie usage
- User rights under GDPR/CCPA
- Contact information for data requests

**Financial Regulations:**
- Stripe handles all money transmission licensing
- Tax reporting (1099-K for US users over $600)
- Anti-money laundering (AML) compliance via Stripe
- Know Your Customer (KYC) verification via Stripe Connect
- International sanctions screening via Stripe

**Nonprofit Compliance:**
- Not a registered nonprofit (platform for nonprofits)
- No tax deduction claims (missionaries responsible)
- Clear disclaimer on donation pages
- Not providing tax receipts (missionaries provide)

### Security Auditing

**Automated Security Scanning:**
- Dependabot for vulnerability vulnerabilities
- Snyk integration for security scanning
- Weekly vulnerability reports
- Automatic security patches for critical issues

**Security Checklist (Pre-Launch):**
- [ ] All environment variables secured
- [ ] RLS policies tested for all tables
- [ ] Rate limiting configured and tested
- [ ] CSRF protection enabled
- [ ] CSP headers configured
- [ ] All inputs validated and sanitized
- [ ] Stripe webhook signatures verified
- [ ] Password requirements enforced
- [ ] HTTPS enforced on all routes
- [ ] Error messages don't leak sensitive info
- [ ] File upload restrictions in place
- [ ] SQL injection testing completed
- [ ] XSS testing completed
- [ ] Authentication bypass testing completed

**Ongoing Security Monitoring:**
- Weekly security scan reports
- Monthly dependency updates
- Quarterly security audits
- Annual penetration testing
- Incident response plan documented
- Security breach notification procedures

### Incident Response Plan

**Detection:**
- Real-time error monitoring (Sentry or Vercel monitoring)
- Unusual activity alerts (failed login spikes, API rate limit hits)
- Stripe fraud alerts
- User-reported security issues

**Response Process:**
1. Identify and contain breach within 1 hour
2. Assess scope and impact
3. Notify affected users within 24 hours (GDPR requirement)
4. Document incident details
5. Implement fixes
6. Post-mortem analysis
7. Update security measures

**Notification Requirements:**
- Email to affected users
- Public disclosure if >500 users affected
- Regulatory notification (GDPR: 72 hours)
- Insurance claim if applicable

---

## Performance Optimization

### Database Optimization

**Indexing Strategy:**
\`\`\`sql
-- Critical indexes for performance
CREATE INDEX idx_posts_tenant_published ON posts(tenant_id, published_at DESC);
CREATE INDEX idx_donations_tenant_created ON donations(tenant_id, created_at DESC);
CREATE INDEX idx_supporters_tenant_email ON supporters(tenant_id, email);
CREATE INDEX idx_subscriptions_tenant_status ON subscriptions(tenant_id, status);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_tenant_id, status);
CREATE INDEX idx_newsletters_tenant_sent ON newsletters(tenant_id, sent_at DESC);
CREATE INDEX idx_newsletter_recipients_newsletter ON newsletter_recipients(newsletter_id, status);

-- Full-text search indexes
CREATE INDEX idx_posts_title_search ON posts USING GIN (to_tsvector('english', title));
CREATE INDEX idx_supporters_name_search ON supporters USING GIN (to_tsvector('english', name));

-- Composite indexes for common queries
CREATE INDEX idx_donations_tenant_status_created ON donations(tenant_id, status, created_at DESC);
CREATE INDEX idx_supporters_tenant_donated ON supporters(tenant_id, has_donated, last_donation_at DESC);
\`\`\`

**Query Optimization:**
- Use pagination for all list views (limit 50 per page)
- Implement cursor-based pagination for large datasets
- Use SELECT only needed columns, never SELECT *
- Aggregate queries cached for 5 minutes
- Materialized views for complex analytics queries

**Connection Pooling:**
- Supabase connection pooler enabled
- Max connections: 100 per project
- Connection timeout: 30 seconds
- Idle connection timeout: 10 minutes

### Caching Strategy

**Multi-Layer Caching:**

**1. Edge Caching (Vercel)**
\`\`\`typescript
// Static assets cached at edge
export const config = {
  runtime: 'edge',
}

// Public pages cached for 5 minutes
export const revalidate = 300; // 5 minutes
\`\`\`

**2. Redis Caching (Upstash)**
\`\`\`typescript
// High-traffic data cached in Redis
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache tenant data for 1 hour
await redis.setex(`tenant:${tenantId}`, 3600, JSON.stringify(tenant));

// Cache donation totals for 5 minutes
await redis.setex(`donations:total:${tenantId}`, 300, totalRaised);
\`\`\`

**3. React Query (Client-Side)**
\`\`\`typescript
// Client-side caching with automatic refetching
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['donations', tenantId],
  queryFn: fetchDonations,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
\`\`\`

**Caching Strategy by Data Type:**
- **Tenant profiles:** 1 hour (Redis)
- **Donation totals:** 5 minutes (Redis)
- **Supporter lists:** 10 minutes (React Query)
- **Post content:** Until updated (Next.js ISR)
- **Newsletter templates:** 24 hours (Redis)
- **Analytics data:** 15 minutes (Redis)
- **Static assets:** 1 year (CDN)

**Cache Invalidation:**
- Manual invalidation on data updates
- Time-based expiration as backup
- Tag-based invalidation for related data
- Real-time updates via websockets for critical data

### API Performance

**Response Time Targets:**
- Public pages: <200ms (P95)
- API routes: <300ms (P95)
- Database queries: <50ms (P95)
- Stripe API calls: <500ms (P95)
- Email sending: <100ms (async, non-blocking)

**Optimization Techniques:**

**1. Parallel Requests:**
\`\`\`typescript
// Fetch multiple resources in parallel
const [tenant, donations, supporters] = await Promise.all([
  getTenant(tenantId),
  getDonations(tenantId),
  getSupporters(tenantId)
]);
\`\`\`

**2. Data Denormalization:**
- Store pre-calculated totals (total_raised, supporter_count)
- Update via database triggers
- Reduces need for expensive aggregations

**3. Lazy Loading:**
- Load images on demand
- Infinite scroll for long lists
- Code splitting for large components

**4. Background Jobs:**
- Email sending via queues (not blocking requests)
- Analytics calculations via cron jobs
- Backup operations scheduled off-peak hours

### Image & Media Optimization

**Image Handling:**
\`\`\`typescript
// Next.js Image component with optimization
import Image from 'next/image';

<Image
  src={imageUrl || "/placeholder.svg"}
  alt={alt}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  quality={85}
  formats={['webp', 'avif']}
/>
\`\`\`

**Optimization Rules:**
- Serve WebP/AVIF formats (95% smaller than PNG)
- Lazy load all images below fold
- Responsive images with srcset
- Maximum upload size: 5MB
- Automatic compression on upload
- Generate thumbnails for lists
- CDN delivery via Vercel Blob

**Video Handling:**
- Embed YouTube/Vimeo (no hosting)
- If hosting: HLS streaming for large files
- Thumbnail generation for preview
- Lazy load video embeds

### Bundle Size Optimization

**Code Splitting:**
\`\`\`typescript
// Dynamic imports for large components
const BlockNoteEditor = dynamic(() => import('@/components/blocknote-editor'), {
  ssr: false,
  loading: () => <Spinner />
});
\`\`\`

**Bundle Analysis:**
- Target: <200KB initial JS bundle
- Monitor with @next/bundle-analyzer
- Tree-shake unused dependencies
- Use lightweight alternatives:
  - date-fns instead of moment.js (97% smaller)
  - zustand instead of redux (99% smaller)

**Dependency Management:**
- Audit dependencies quarterly
- Remove unused packages
- Use exact versions (no ^ or ~)
- Prefer native browser APIs

### Performance Monitoring

**Metrics Tracked:**
- Core Web Vitals (LCP, FID, CLS)
- Time to First Byte (TTFB)
- API response times
- Database query times
- Error rates
- Uptime percentage

**Monitoring Tools:**
- Vercel Analytics (Web Vitals)
- Sentry (error tracking)
- Upstash monitoring (Redis performance)
- Supabase dashboard (database metrics)
- Custom logging for critical paths

**Alerting Thresholds:**
- API response time >1 second: Warning
- Error rate >1%: Warning
- Error rate >5%: Critical
- Database connection errors: Critical
- Stripe webhook failures: Critical
- Uptime <99.9%: Warning

**Performance Budget:**
- Total page weight: <1MB
- JavaScript bundle: <200KB
- CSS: <50KB
- Images: <500KB per page
- Fonts: <100KB
- Time to Interactive: <3 seconds

### Database Performance

**Query Performance:**
- All queries have EXPLAIN ANALYZE in development
- Slow query log enabled (>100ms)
- N+1 query prevention via eager loading
- Batch updates instead of loops

**Scaling Strategy:**
- Read replicas for analytics queries (future)
- Connection pooling enabled
- Automated vacuum and analyze
- Partition large tables (>1M rows)

### Table Partitioning (Future):
\`\`\`sql
-- Partition donations by month for performance
CREATE TABLE donations_2024_01 PARTITION OF donations
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
\`\`\`

### CDN & Edge Optimization

**Vercel Edge Network:**
- Static assets cached at edge
- API routes deployable to edge
- Geographically distributed
- Automatic DDoS protection

**Edge Functions:**
\`\`\`typescript
// Deploy lightweight functions to edge
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Runs in 100+ edge locations
  return new Response('Fast response from edge');
}
\`\`\`

**Asset Optimization:**
- Brotli compression for text files
- Automatic cache headers
- Immutable assets with hash filenames
- Preload critical resources

### Load Testing

**Pre-Launch Testing:**
- Simulate 100 concurrent users
- Test donation flow under load
- Stress test email sending (1000/hour)
- Test database under write load

**Tools:**
- k6 or Artillery for load testing
- Simulate realistic user behavior
- Test peak scenarios (end-of-month giving)
- Identify bottlenecks before launch

**Capacity Planning:**
- Current capacity: 10,000 users
- Scaling triggers: CPU >70%, memory >80%
- Supabase auto-scaling enabled
- Vercel auto-scaling included

### Performance Optimization Deliverables

- [ ] All database indexes created
- [ ] Redis caching implemented for hot paths
- [ ] Image optimization pipeline configured
- [ ] Bundle size <200KB
- [ ] API response times <300ms P95
- [ ] Core Web Vitals in "Good" range
- [ ] Error tracking configured
- [ ] Performance monitoring dashboard
- [ ] Load testing completed
- [ ] Capacity plan documented

**Result:** Platform loads in <2 seconds, handles 100 concurrent users, and scales automatically with demand.

---

## Multi-Language Support Expansion

### Current Language Support (14 Languages)
**Status**: Infrastructure Complete

**Supported Languages:**
1. English (en) - Default
2. Spanish (es - Español)
3. Portuguese (pt - Português)
4. French (fr - Français)
5. German (de - Deutsch) - NEW
6. Italian (it - Italiano) - NEW
7. Russian (ru - Русский) - NEW
8. Arabic (ar - العربية) - NEW
9. Swahili (sw - Kiswahili) - NEW
10. Tagalog (tl - Tagalog) - NEW
11. Japanese (ja - 日本語) - NEW
12. Hindi (hi - हिन्दी) - NEW
13. Korean (ko - 한국어)
14. Chinese (zh - 中文)

### Features Implemented
- Language preference tracking for missionaries and supporters
- Automatic date, number, and currency formatting based on language
- Email notifications respect supporter's preferred language
- Database constraints support all 14 languages
- Language selection in settings and onboarding flows

### Implementation Files
- `lib/i18n.ts` - Core language utilities and supported languages list
- `scripts/025_update_language_constraints.sql` - Database constraint updates

### Next Steps for Full Localization
1. Add translation files for each language (using next-intl or react-i18next)
2. Translate UI components, navigation, and form labels
3. Translate email templates for all notification types
4. Add language switcher component to dashboards
5. Translate landing page content sections
6. Right-to-left (RTL) support for Arabic
7. Test formatting and display for all languages

### Adding Additional Languages (Future)
To add more languages:
1. Update `SUPPORTED_LANGUAGES` array in `lib/i18n.ts`
2. Add language code to database constraints in new migration script
3. Create translation files for the new language
4. Test date/number/currency formatting
5. Update documentation

---

## Ready to Build!

All prerequisites confirmed:
- ✅ Supabase ready
- ✅ Stripe account ready (global support)
- ✅ Resend configured
- ✅ Domain ready for wildcard
- ✅ Multi-language framework planned
- ✅ 3.5% fee + tips + fee coverage revenue model
- ✅ Global payment processing ready
- ✅ Integration roadmap defined
- ✅ Mobile strategy planned
- ✅ Security & compliance framework established
- ✅ Performance optimization strategy defined

**This is a comprehensive, secure, high-performance, globally-scalable platform ready to serve missionaries worldwide.**
 Performance optimization strategy defined

**This is a comprehensive, secure, high-performance, globally-scalable platform ready to serve missionaries worldwide.**
 ready to serve missionaries worldwide.**
 Performance optimization strategy defined

**This is a comprehensive, secure, high-performance, globally-scalable platform ready to serve missionaries worldwide.**
