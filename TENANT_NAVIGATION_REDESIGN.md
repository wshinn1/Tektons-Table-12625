# Tenant Navigation Redesign Plan

## Overview
Redesign tenant site navigation to use a top navbar for public visitors and left sidebars for authenticated users (admins and donors).

## Current State
- Navigation is in a left sidebar for all users
- Supporter dashboard exists at `/supporter/dashboard` and `/supporter/giving`
- Stripe integration is functional
- Menu management exists at `/admin/menu`

## Target State
- **Public visitors**: Horizontal top navbar (scrolls away)
- **Tenant admins**: Left sidebar with admin tools, default landing = Manage Giving
- **Donors**: Left sidebar with financial reports and recurring management
- **Blog posts**: Optional show/hide navigation per post
- **Navigation management**: Full control at `/admin/navigation`

---

## Phases

### Phase 1: Database Schema Updates ✅
- [x] Add `navbar_visible` column to `blog_posts` table
- [x] Add `menu_location` column to `tenant_menu_items` table (`navbar` | `sidebar_admin` | `sidebar_donor`)
- [x] Update existing menu items to have `menu_location = 'navbar'`
- [x] Add default admin and donor sidebar items for wesshinn tenant
- [x] Update seed function for future tenants

**Migration file:** `scripts/088_tenant_navigation_redesign.sql`
**Completed:** Dec 4, 2025

### Phase 2: Top Navbar for Public Navigation ✅
- [x] Create `TenantNavbar` component (horizontal, scrolls away)
- [x] Create `TenantAdminSidebar` component (dark theme, collapsible)
- [x] Move public menu items to top navbar
- [x] Update tenant layout to render navbar at top for public visitors
- [x] Update tenant layout to render admin sidebar for admin pages
- [x] Navbar fetches menu items from database
- [x] Support campaigns dropdown in navbar
- [x] Added `isDonor` state detection

**Files created/updated:**
- `components/tenant/tenant-navbar.tsx` (new)
- `components/tenant/tenant-admin-sidebar.tsx` (new)
- `app/[tenant]/layout.tsx` (updated)
- `app/actions/tenant-menu.ts` (added `getMenuItemsByLocation`)

**Completed:** Dec 4, 2025

### Phase 3: Blog Post Show/Hide Navigation ✅
- [x] Add `navbarVisible` field to blog post creation/editing
- [x] Add toggle in blog post editor for "Show Navigation on this post"
- [x] Update blog post page to respect `navbar_visible` setting
- [x] Add floating "Show Navigation" button when navbar is hidden

**Files updated:**
- `app/actions/blog.ts` (added `navbarVisible` parameter)
- `app/[tenant]/admin/blog/create/page.tsx` (added toggle)
- `app/[tenant]/admin/blog/[id]/edit/page.tsx` (added toggle)
- `app/[tenant]/blog/[slug]/page.tsx` (added show navigation button)

**Completed:** Dec 4, 2025

### Phase 4: Admin Sidebar & Default Landing Page ✅
- [x] Create `TenantAdminSidebar` component (completed in Phase 2)
- [x] Update tenant layout to show admin sidebar when logged in as owner (completed in Phase 2)
- [x] Change default landing page after admin login to Manage Giving

**Files updated:**
- `app/[tenant]/auth/login/page.tsx` (changed default redirect to `/admin/giving`)

**Completed:** Dec 4, 2025

### Phase 5: Donor Sidebar & Financial Reports ✅
- [x] Create `TenantDonorSidebar` component
- [x] Create `/[tenant]/donor/layout.tsx` (donor auth check + sidebar)
- [x] Create `/[tenant]/donor/page.tsx` (dashboard with stats)
- [x] Create `/[tenant]/donor/giving/page.tsx` (giving history by year)
- [x] Create `/[tenant]/donor/recurring/page.tsx` (manage subscriptions)
- [x] Create `/[tenant]/donor/settings/page.tsx` (email preferences)
- [x] Create `/api/stripe/customer-portal/route.ts` (Stripe portal redirect)
- [x] Filter donor data to show only donations for current tenant

**Files created:**
- `components/tenant/tenant-donor-sidebar.tsx`
- `app/[tenant]/donor/layout.tsx`
- `app/[tenant]/donor/page.tsx`
- `app/[tenant]/donor/giving/page.tsx`
- `app/[tenant]/donor/recurring/page.tsx`
- `app/[tenant]/donor/settings/page.tsx`
- `app/api/stripe/customer-portal/route.ts`

**Completed:** Dec 4, 2025

### Phase 6: Navigation Management UI ✅
- [x] Create `/admin/navigation` page
- [x] Create `NavigationManager` component with tabs for each location
- [x] Support add/edit/remove/reorder menu items
- [x] Support linking to built-in pages, custom pages, and external URLs
- [x] Preview of navbar and sidebar appearance
- [x] Remove duplicate "Menu Manager" from admin sidebar

**Files created/updated:**
- `app/[tenant]/admin/navigation/page.tsx` (new)
- `components/tenant/navigation-manager.tsx` (new)
- `components/tenant/tenant-admin-sidebar.tsx` (removed duplicate Menu Manager)

**Completed:** Dec 4, 2025

---

## Progress Log

| Phase | Status | Date Completed | Notes |
|-------|--------|----------------|-------|
| 1 | ✅ Complete | Dec 4, 2025 | Run `scripts/088_tenant_navigation_redesign.sql` |
| 2 | ✅ Complete | Dec 4, 2025 | Top navbar + admin sidebar created |
| 3 | ✅ Complete | Dec 4, 2025 | Blog post navigation toggle implemented |
| 4 | ✅ Complete | Dec 4, 2025 | Default redirect changed to /admin/giving |
| 5 | ✅ Complete | Dec 4, 2025 | Donor portal with Stripe integration |
| 6 | ✅ Complete | Dec 4, 2025 | Navigation management with tabs and preview |

---

## All Phases Complete! 🎉

The tenant navigation redesign is now complete. Summary of changes:
- Public visitors see a horizontal top navbar that scrolls away
- Admin users see a dark collapsible sidebar with all admin tools
- Donors see a dedicated sidebar with their giving history and subscription management
- Blog posts can optionally hide navigation for distraction-free reading
- Admins can manage all navigation menus from `/admin/navigation` with live preview
