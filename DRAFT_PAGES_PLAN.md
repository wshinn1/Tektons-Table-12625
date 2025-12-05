# Draft Pages System Implementation Plan

## Overview
Create an admin system for managing HTML draft pages that serve as content/layout blueprints for frontend site pages. These drafts help plan content and structure before building production React components.

---

## Phase 1: Draft Pages Infrastructure ✅ COMPLETE

**Goal:** Create database schema and admin UI for managing draft pages

### Completed Tasks
- [x] Create `draft_pages` database table (script 040)
- [x] Build server actions (`app/actions/drafts.ts`)
- [x] Create list view (`app/admin/drafts/page.tsx`)
- [x] Create editor page (`app/admin/drafts/[id]/page.tsx`)
- [x] Build draft editor component with live preview
- [x] Add "Draft Pages" to admin sidebar under System

### Files Created
- `scripts/040_draft_pages_system.sql` - Database schema
- `app/actions/drafts.ts` - CRUD operations
- `app/admin/drafts/page.tsx` - List all drafts
- `app/admin/drafts/new/page.tsx` - Create new draft
- `app/admin/drafts/[id]/page.tsx` - Edit draft
- `components/admin/drafts/draft-editor.tsx` - Editor with preview

---

## Phase 2: Initial Draft Pages ✅ COMPLETE

**Goal:** Create 3 initial HTML draft pages with content

### Completed Tasks
- [x] Research competitor pricing and features
- [x] Create Pricing Comparison page draft
- [x] Create How It Works page draft
- [x] Create Security & Trust page draft
- [x] Populate database with initial drafts (script 041)

### Draft Pages Created

**1. Pricing Comparison**
- Slug: `/pricing-comparison`
- Category: `marketing`
- Features:
  - Hero section
  - Comparison table (12+ competitors)
  - Cost calculator
  - Missions agency limitations
  - CTA section

**2. How It Works**
- Slug: `/how-it-works`
- Category: `marketing`
- Features:
  - Hero section
  - 5-step timeline
  - Screenshot placeholders
  - Video embed placeholder
  - FAQ section
  - CTA section

**3. Security & Trust**
- Slug: `/security`
- Category: `marketing`
- Features:
  - Hero section
  - Stripe partnership badges
  - PCI compliance info
  - Encryption details
  - Trust badges
  - Testimonials
  - CTA section

### Files Created
- `scripts/041_create_initial_drafts.sql` - Initial 3 draft pages

---

## Phase 3: Draft Page Enhancements ✅ COMPLETE

**Goal:** Add version history, export functionality, and enhanced features

### Completed Tasks
- [x] Create version history database table (script 043)
- [x] Add automatic version saving on HTML changes
- [x] Build version history UI with restore capability
- [x] Add "Copy HTML" export button
- [x] Add "Download HTML" export button
- [x] Add "Duplicate Draft" feature
- [x] Update Pricing Comparison with researched competitor data (script 042)

### Competitor Research Completed

| Platform | Fee Structure | Key Limitations |
|----------|--------------|-----------------|
| TektonStable | **3.5% all-inclusive** | Mission-focused, full features |
| GoFundMe | 2.9% + $0.30 | No custom domain, limited branding |
| Patreon | 10% platform fee | Membership focused, not one-time |
| GiveSendGo | 0% platform (acquired FaithLauncher) | Limited features |
| DonorBox | 2.95% or 1.75% ($150/mo) | Monthly fees for features |
| Givebutter | 1-5% or donor tips | Donor-pressured fee model |
| Classy | $299/mo + fees | Enterprise pricing, complex |
| Fundly | 0% platform + 2.9% + $0.30 | Limited missionary features |
| Overflow | 3% + $1200-2500/year | Crypto-focused, expensive |
| Kindest | Platform fee + 2.9% + $0.30 | General fundraising |

### Features Implemented
- [x] Version history tracking (auto-save on changes)
- [x] Version restore (one-click rollback)
- [x] Export to clipboard (Copy HTML button)
- [x] Export to file (Download .html button)
- [x] Duplicate draft functionality
- [x] Enhanced preview with responsive styling

### Files Created
- `scripts/042_update_pricing_comparison.sql` - Updated with research
- `scripts/043_draft_version_history.sql` - Version tracking

### Files Updated
- `app/actions/drafts.ts` - Added version and export actions
- `components/admin/drafts/draft-editor.tsx` - Added export and version UI

---

## Phase 4: Production Implementation ✅ COMPLETE

**Goal:** Convert HTML drafts to production React components

### Completed Tasks
- [x] Created `/app/pricing/page.tsx` with full comparison table
- [x] Created `/app/how-it-works/page.tsx` with 5-step timeline
- [x] Created `/app/security/page.tsx` with trust messaging
- [x] Built reusable layouts and components
- [x] Matched site branding (blue/teal accents, Geist fonts)
- [x] Made pages fully responsive and accessible
- [x] Added comprehensive content from draft research
- [x] Cross-linked all marketing pages in navigation

### Production Pages Created

**1. Pricing Comparison (`/pricing`)**
- Hero with transparent pricing message
- 6-platform comparison cards (TektonStable, GoFundMe, Patreon, DonorBox, Givebutter, Classy)
- Cost calculator with actual received amounts
- Mission agency comparison (YWAM, OM, Cru)
- Annual savings showcase ($1,620-3,072/year)
- Fully responsive card grid layouts

**2. How It Works (`/how-it-works`)**
- 5-step timeline with visual progression
- Time estimates for each step (total ~30 min)
- Detailed task breakdowns per step
- Video/screenshot section placeholders
- Features grid (8 key features)
- FAQ accordion with common questions
- Multiple CTAs throughout

**3. Security & Trust (`/security`)**
- Prominent "payment data never stored" section
- 6 security features with detailed explanations
- Stripe partnership highlight
- Trust badges grid (6 certifications)
- Data collection transparency
- User rights section (GDPR/CCPA)
- Privacy controls explained

### Design System Applied
- Consistent header/footer across all marketing pages
- Blue/teal accent colors (`--accent: oklch(0.50 0.18 220)`)
- Geist Sans/Mono font family
- Card-based layouts with `hover:shadow-lg` effects
- Lucide React icons throughout
- Responsive grids: `md:grid-cols-2 lg:grid-cols-3`
- Accent badges for highlights
- `text-balance` and `text-pretty` for optimal typography

### Technical Implementation
- Server-side rendered pages (Next.js 16 App Router)
- SEO metadata for each page
- Accessible markup (semantic HTML, ARIA)
- Mobile-first responsive design
- Fast page loads (no heavy dependencies)
- Cross-navigation between marketing pages

### Files Created
- `app/pricing/page.tsx` (506 lines)
- `app/how-it-works/page.tsx` (408 lines)
- `app/security/page.tsx` (521 lines)

### Metadata & SEO
Each page includes:
- Descriptive title tags
- Meta descriptions
- OpenGraph ready structure
- Semantic heading hierarchy
- Internal linking between pages

---

## Project Status: ALL PHASES COMPLETE ✅

**Phases Completed:**
1. ✅ **Phase 1: Infrastructure** - Database, admin UI, editor with preview
2. ✅ **Phase 2: Initial Drafts** - 3 marketing pages with researched content
3. ✅ **Phase 3: Enhancements** - Version history, export, competitor research
4. ✅ **Phase 4: Production Pages** - Live React pages deployed

### Final System Capabilities
- **Admin Draft System**: Create/edit HTML drafts with live preview
- **Version Control**: Track changes, restore previous versions
- **Export Tools**: Copy HTML or download files
- **Production Pages**: 3 professional marketing pages live
- **Research Data**: Accurate competitor pricing and features
- **Design Consistency**: All pages match site branding

### Live Marketing Pages
- `/pricing` - Compare costs and save $1,620-3,072/year
- `/how-it-works` - 5-step launch process in 30 minutes
- `/security` - Trust and safety messaging

### Future Enhancements (Optional)
- Add more marketing pages (About, FAQ, Contact, Blog)
- A/B testing framework for page variants
- Analytics tracking on marketing pages
- Conversion optimization tools
- Multi-language support for marketing content

---

**Last Updated:** November 20, 2025
**Status:** All Phases Complete ✅
**Outcome:** Production-ready marketing pages with admin draft system
