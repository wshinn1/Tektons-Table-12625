# Tenant Site Redesign Plan

## Overview

Complete overhaul of tenant dashboard and front-end to create a Medium-inspired blog platform with comprehensive supporter management, email newsletters, and financial support tracking.

**Target URL Pattern:** `*.tektonstable.com`

---

## Phase 1: Frontend Blog Redesign (Medium-Style Layout) ✅ COMPLETE

**Goal:** Transform tenant blog homepage to match the clean, readable Medium-style design

### Tasks

1. **Redesign Tenant Blog Homepage**
   - Create new layout showing 3 most recent posts in vertical scroll format
   - Large hero images for each post
   - Clean typography with proper hierarchy
   - Author info with avatar and name
   - Engagement metrics (read time, date, claps/likes)
   - Smooth reading experience optimized for content consumption

2. **Update Blog Post Display Page**
   - Match exact Medium style from reference screenshots
   - Large title with proper spacing
   - Subtitle below title
   - Author card with Follow button
   - Read time and publish date
   - Engagement stats (claps, comments count)
   - Clean content layout with optimal reading width

3. **Add Empty State**
   - Show "Ready for your first post?" message when no posts exist
   - Include call-to-action for tenant admins to create first post
   - Friendly, encouraging design

4. **Database Updates**
   - Add `subtitle` field to `blog_posts` (text)
   - Add `read_time` field to `blog_posts` (integer, minutes)
   - Add `claps_count` field to `blog_posts` (integer, default 0)
   - Add `views_count` field to `blog_posts` (integer, default 0)

---

## Phase 2: Tenant Sidebar Navigation System ✅ COMPLETE

**Goal:** Create collapsible sidebar menu (similar to admin dashboard) for tenant sites

### Tasks

1. **Build Public Sidebar Component**
   - Collapsible left sidebar with smooth animations
   - Show/hide toggle button for non-logged-in users
   - Responsive design (drawer on mobile, sidebar on desktop)
   - Matches admin dashboard aesthetic

2. **Add Core Navigation Links**
   - Home (blog feed)
   - About page
   - Giving/Support page
   - Campaigns (optional, conditional based on tenant settings)
   - Contact page

3. **Admin Context Menu**
   - When tenant is logged in, show additional admin section in sidebar
   - Separator between public and admin links
   - Visual indicator of admin mode

4. **Database Setup**
   - Create `tenant_navigation_menu` table
     - `id` (uuid, primary key)
     - `tenant_id` (uuid, foreign key)
     - `label` (text)
     - `url` (text)
     - `icon` (text, optional)
     - `order` (integer)
     - `is_visible` (boolean)
     - `created_at`, `updated_at` (timestamps)

---

## Phase 3: Tenant Admin Dashboard ✅ COMPLETE

**Goal:** Full admin dashboard for tenants to manage their site

### Admin Sidebar Menu Structure

1. **Dashboard** (Overview/Home)
2. **Blog Management**
   - Create New Post
   - All Posts
   - Categories & Tags
3. **Giving Page Manager**
4. **Navigation Menu Editor**
5. **Email Newsletter**
6. **Supporters**
   - Followers
   - Financial Supporters
7. **Financial Reports**
8. **Blog Analytics**
9. **Report Scheduler**
10. **User Management**

### Detailed Feature Requirements

#### Blog Management
- Create/edit/delete posts with Tiptap editor
- Draft/publish workflow
- Category and tag management
- Featured image upload
- SEO metadata editing

#### Giving Page Manager
- Configure donation tiers
- Set fundraising goals
- Customize thank you messages
- Progress tracking display settings

#### Navigation Menu Editor
- Drag-and-drop menu item reordering
- Add/edit/delete custom menu items
- Toggle visibility of menu items
- Preview changes before publishing

#### Email Newsletter
- Rich text email composer (Tiptap)
- Send to all subscribers or specific segments
- CSV upload for importing contact lists
- Email template library
- Schedule sending for future dates
- Track open rates and click rates

#### Supporters Dashboard
- View all followers (pending, approved)
- View financial supporters with giving amounts
- Filter and search capabilities
- Export supporter data to CSV

#### Financial Reports
- View giving by supporter
- Monthly recurring donations
- One-time donations
- Year-to-date totals per supporter
- Generate PDF reports

#### Blog Analytics
- Post views over time
- Engagement metrics (claps, comments)
- Top performing posts
- Follower growth chart

#### Report Scheduler
- Configure automated monthly reports
- Email financial supporters their YTD totals
- Customize report templates
- Preview before scheduling

#### User Management
- Approve/reject follower requests
- View follower profiles
- Block/unblock users
- Manage permissions

---

## Phase 4: Content Restriction & Follower System ✅ COMPLETE

**Goal:** Allow tenants to restrict content to followers only with manual approval workflow

### Tasks

1. **Follower Management System**
   - Follow request submission by users
   - Pending approval queue for tenants
   - Manual approval/rejection by tenant
   - Email notifications for status changes

2. **Content Restrictions**
   - Add "Followers Only" toggle to blog post editor
   - Lock icon indicator on restricted posts
   - Login/follow prompt for non-followers attempting to view restricted content
   - Preview first paragraph for non-followers (teaser)

3. **Email Notifications**
   - Send email to tenant when someone requests to follow
   - Include user profile info and approve/reject links
   - Send confirmation email to user when approved
   - Send rejection notice when declined

4. **Follow Button UI**
   - Prominent Follow button on tenant site header
   - Show "Following" status when already following
   - Show "Pending" status when awaiting approval
   - Modal for non-logged-in users to sign up

5. **Database Updates**
   - Create `tenant_followers` table
     - `id` (uuid, primary key)
     - `tenant_id` (uuid, foreign key)
     - `user_id` (uuid, foreign key)
     - `status` (enum: pending, approved, rejected)
     - `requested_at` (timestamp)
     - `approved_at` (timestamp, nullable)
     - `rejected_at` (timestamp, nullable)
     - `created_at`, `updated_at` (timestamps)
   - Add `followers_only` (boolean) to `blog_posts` table

---

## Phase 5: Email Newsletter System ✅ COMPLETE

**Goal:** Full email newsletter with CSV import and sending capabilities

### Tasks

1. **Email Composer**
   - Rich text editor (Tiptap) for creating newsletters
   - Subject line and preview text
   - Template selection (header/footer)
   - Image uploads for newsletter content
   - Save as draft functionality

2. **Contact List Manager**
   - View all subscribers in table format
   - Add subscribers manually
   - Edit subscriber details
   - Unsubscribe management
   - Segment subscribers by tags

3. **CSV Upload**
   - Import existing contact lists via CSV
   - Map CSV columns to subscriber fields
   - Validation and error handling
   - Preview before import
   - Duplicate detection

4. **Send System**
   - Send immediately or schedule for later
   - Test send to tenant email
   - Confirmation before sending
   - Progress tracking during send
   - Integration with Resend API

5. **Analytics**
   - Track email opens
   - Track link clicks
   - Unsubscribe rates
   - Best performing emails

6. **Database Tables**
   - Create `tenant_email_subscribers` table
     - `id` (uuid, primary key)
     - `tenant_id` (uuid, foreign key)
     - `email` (text, unique per tenant)
     - `name` (text, optional)
     - `status` (enum: subscribed, unsubscribed)
     - `subscribed_at` (timestamp)
     - `unsubscribed_at` (timestamp, nullable)
     - `created_at`, `updated_at` (timestamps)
   - Create `tenant_newsletters` table
     - `id` (uuid, primary key)
     - `tenant_id` (uuid, foreign key)
     - `subject` (text)
     - `preview_text` (text, optional)
     - `content` (jsonb, Tiptap JSON)
     - `status` (enum: draft, scheduled, sent)
     - `scheduled_for` (timestamp, nullable)
     - `sent_at` (timestamp, nullable)
     - `recipient_count` (integer)
     - `open_count` (integer)
     - `click_count` (integer)
     - `created_at`, `updated_at` (timestamps)

---

## Phase 6: Giving/Support Pages ✅ COMPLETE

**Goal:** Financial support tracking and display with Stripe integration

### Tasks

1. **Public Giving Page**
   - Show support status with progress bars
   - Display fundraising goals
   - List of giving tiers with benefits
   - Recent supporters (with permission)
   - Impact stories/testimonials
   - Call-to-action buttons for one-time and recurring gifts

2. **Stripe Integration**
   - Set up recurring donations (subscriptions)
   - One-time donation processing
   - Custom donation amounts
   - Secure payment forms
   - Receipt emails via Resend
   - Webhook handling for payment events

3. **Supporter Dashboard (Admin)**
   - View all supporters with giving amounts
   - Filter by amount, date, type (one-time/recurring)
   - Total monthly recurring revenue
   - Lifetime giving per supporter
   - Export to CSV

4. **Financial Report Generator**
   - Create PDF reports with tenant branding
   - Include YTD totals per supporter
   - Monthly giving breakdown
   - Charts and visualizations
   - Download or email reports

5. **Automated Scheduler**
   - Send monthly reports to supporters via email
   - Personalized with supporter's giving history
   - Thank you message from tenant
   - Tax-deductible information
   - Cron job or scheduled background task

6. **Database Tables**
   - Create `tenant_financial_supporters` table
     - `id` (uuid, primary key)
     - `tenant_id` (uuid, foreign key)
     - `user_id` (uuid, foreign key, nullable for guests)
     - `stripe_customer_id` (text)
     - `email` (text)
     - `name` (text)
     - `total_given` (decimal)
     - `monthly_amount` (decimal, nullable for recurring)
     - `first_gift_at` (timestamp)
     - `last_gift_at` (timestamp)
     - `created_at`, `updated_at` (timestamps)
   - Create `tenant_donations` table
     - `id` (uuid, primary key)
     - `tenant_id` (uuid, foreign key)
     - `supporter_id` (uuid, foreign key)
     - `stripe_payment_id` (text)
     - `amount` (decimal)
     - `type` (enum: one_time, recurring)
     - `status` (enum: pending, completed, failed, refunded)
     - `donated_at` (timestamp)
     - `created_at`, `updated_at` (timestamps)

---

## Phase 7: Additional Core Pages 🔄 IN PROGRESS

**Goal:** Create essential tenant pages

### Tasks

1. **About Page**
   - Rich text editor for tenant bio
   - Mission statement section
   - Story/testimony section
   - Photo gallery
   - Social media links
   - Editable in tenant admin dashboard
   - Database: Add `about_content` (jsonb) to `tenant_profiles`

2. **Contact Page**
   - Contact form with fields:
     - Name
     - Email
     - Subject
     - Message
   - Form submission sends email to tenant
   - Success confirmation message
   - Spam protection (honeypot or reCAPTCHA)
   - Database: Store submissions in `tenant_contact_submissions` table

3. **Campaigns Page**
   - Optional feature (toggle in tenant settings)
   - Create multiple fundraising campaigns
   - Each campaign has:
     - Title and description
     - Goal amount
     - Current amount raised
     - Progress bar
     - End date
     - Featured image
   - Campaign detail pages
   - Donate button links to Stripe checkout
   - Database: Create `tenant_campaigns` table
     - `id` (uuid, primary key)
     - `tenant_id` (uuid, foreign key)
     - `title` (text)
     - `description` (text)
     - `goal_amount` (decimal)
     - `current_amount` (decimal, default 0)
     - `featured_image_url` (text, nullable)
     - `end_date` (date, nullable)
     - `status` (enum: active, completed, cancelled)
     - `created_at`, `updated_at` (timestamps)

---

## Complete Database Schema Changes

### New Tables to Create

```sql
-- Tenant navigation menu
CREATE TABLE tenant_navigation_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant followers
CREATE TABLE tenant_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Email subscribers
CREATE TABLE tenant_email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL CHECK (status IN ('subscribed', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- Newsletters
CREATE TABLE tenant_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial supporters
CREATE TABLE tenant_financial_supporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  total_given DECIMAL(10,2) DEFAULT 0,
  monthly_amount DECIMAL(10,2),
  first_gift_at TIMESTAMPTZ,
  last_gift_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations
CREATE TABLE tenant_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  supporter_id UUID REFERENCES tenant_financial_supporters(id) ON DELETE SET NULL,
  stripe_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('one_time', 'recurring')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  donated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE tenant_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  featured_image_url TEXT,
  end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog post engagement
CREATE TABLE blog_post_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('view', 'clap')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions
CREATE TABLE tenant_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Columns to Add to Existing Tables

```sql
-- Add to blog_posts
ALTER TABLE blog_posts
ADD COLUMN subtitle TEXT,
ADD COLUMN read_time INTEGER DEFAULT 5,
ADD COLUMN followers_only BOOLEAN DEFAULT false,
ADD COLUMN claps_count INTEGER DEFAULT 0,
ADD COLUMN views_count INTEGER DEFAULT 0;

-- Add to tenant_profiles
ALTER TABLE tenant_profiles
ADD COLUMN about_content JSONB,
ADD COLUMN contact_email TEXT,
ADD COLUMN show_campaigns BOOLEAN DEFAULT false;
```

---

## Recommended Implementation Order

### Priority 1: Core Blog Experience
1. **Phase 1: Frontend Blog Redesign** (Most visible impact)
   - New Medium-style layout
   - Improved reading experience
   - Empty states

### Priority 2: Navigation & Structure
2. **Phase 2: Sidebar Navigation System** (Core UX improvement)
   - Public navigation
   - Collapsible sidebar
   - Mobile responsiveness

### Priority 3: Content Protection
3. **Phase 4: Follower System** (Enables content restrictions)
   - Follow/approve workflow
   - Content restrictions
   - Email notifications

### Priority 4: Admin Tools
4. **Phase 3: Tenant Admin Dashboard** (Management capabilities)
   - Admin sidebar
   - Blog management tools
   - Basic analytics

### Priority 5: Communication
5. **Phase 5: Email Newsletter System** (Engagement tool)
   - Email composer
   - CSV import
   - Sending system

### Priority 6: Monetization
6. **Phase 6: Giving/Support Pages** (Revenue generation)
   - Stripe integration
   - Donation tracking
   - Financial reports

### Priority 7: Additional Content
7. **Phase 7: Core Pages** (Complete site)
   - About page
   - Contact page
   - Campaigns

---

## Technical Considerations

### Performance
- Implement pagination for blog feeds (load more)
- Cache frequently accessed tenant data
- Optimize images with Next.js Image component
- Use SWR for client-side data fetching

### Security
- Row Level Security (RLS) for all tenant tables
- Ensure tenants can only access their own data
- Sanitize user inputs in contact forms
- Secure Stripe webhook endpoints

### Email System
- Use Resend API for transactional emails
- Implement email queue for bulk sends
- Handle bounces and unsubscribes
- GDPR compliance for email collection

### Mobile Responsiveness
- All pages must work on mobile devices
- Sidebar converts to drawer on mobile
- Touch-friendly buttons and interactions
- Responsive typography and images

---

## Success Metrics

### User Engagement
- Time spent on blog posts
- Follower growth rate
- Email open rates
- Comment activity

### Financial
- Number of financial supporters
- Monthly recurring revenue
- Average donation amount
- Campaign success rate

### Content
- Posts published per month
- Post views
- Claps/engagement per post
- Content restriction usage

---

## Next Steps

1. **Review and approve this plan**
2. **Start with Phase 1: Frontend Blog Redesign**
3. **Create database migration scripts**
4. **Build components systematically**
5. **Test each phase before moving to next**
6. **Deploy incrementally to production**

---

**Last Updated:** November 21, 2025
