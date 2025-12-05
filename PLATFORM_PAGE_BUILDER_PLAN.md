# Unlayer Page Builder for Platform Site (tektonstable.com)

## Overview
Add Unlayer page builder capability to the platform site admin, allowing creation of custom pages with a visual drag-and-drop editor (same as tenant sites).

## Current State
- **Tenant sites** already have Unlayer page builder fully working:
  - `components/tenant/page-editor.tsx` - Full Unlayer editor component
  - `tenant_pages` table with `design_json` and `html_content` columns
  - Pages render at `/[tenant]/p/[slug]`
- **Platform site** has a section-based page system:
  - `pages` table with section references
  - `page_sections` table for modular sections
  - Custom `PageEditor` that adds pre-built section templates

## Goal
Add Unlayer page builder capability to the platform site (tektonstable.com) admin, similar to tenant sites.

---

## Phase 1: Database Setup
**Status:** ✅ Complete

Add columns to `pages` table to support Unlayer content:
- [x] `design_json` (JSONB) - Stores Unlayer editor state for re-editing
- [x] `html_content` (TEXT) - Rendered HTML from Unlayer
- [x] `editor_type` (TEXT) - 'sections' | 'unlayer' to distinguish between page types

**Files:**
- [x] `scripts/094_add_unlayer_to_platform_pages.sql`

---

## Phase 2: Platform Page Editor Component
**Status:** ✅ Complete

Create an Unlayer-based page editor for platform pages.

- [x] Create `components/admin/platform-page-builder.tsx`
  - Adapted from `components/tenant/page-editor.tsx`
  - Platform branding/colors
  - Platform-specific page templates (Landing, About, Contact, Features, Blank)
  - SEO fields (meta title, description)
- [x] Save as draft / Publish workflow
- [x] Page templates gallery dialog
- [x] Preview functionality
- [x] Responsive Unlayer editor with all tools enabled

**Files:**
- [x] `components/admin/platform-page-builder.tsx`

---

## Phase 3: Server Actions
**Status:** ✅ Complete

Create server actions for Unlayer page management.

- [x] `getPageForEdit()` - Fetch page by ID with design_json
- [x] `getPageBySlugForEdit()` - Fetch page by slug
- [x] `createUnlayerPage()` - Create new Unlayer page
- [x] `saveUnlayerPage()` - Save design_json and html_content
- [x] `publishUnlayerPage()` - Publish page
- [x] `unpublishUnlayerPage()` - Unpublish page
- [x] `deletePage()` - Delete any page type
- [x] `getPublishedPageBySlug()` - Get published page for rendering
- [x] `getUnlayerPages()` - List all Unlayer pages
- [x] `duplicatePage()` - Duplicate any page

**Files:**
- [x] `app/actions/pages.ts` (modified - added new functions)

---

## Phase 4: Admin UI Updates
**Status:** ✅ Complete

Update the admin pages management interface.

- [x] Modify `app/admin/pages/create/page.tsx`:
  - Added editor type selection cards (Visual Page Builder vs Section Builder)
  - Visual Page Builder marked as recommended
  - Routes to appropriate editor based on selection
- [x] Create `app/admin/pages/[slug]/builder/page.tsx`:
  - New route for Unlayer-based page editing
  - Loads PlatformPageBuilder component
  - Redirects to section editor if page uses sections
- [x] Update `app/admin/pages/page.tsx`:
  - Shows editor type badge (purple for Visual Builder, gray for Sections)
  - Different edit links based on editor_type
  - Updated URL display to show /p/slug

**Files:**
- [x] `app/admin/pages/create/page.tsx` (modified)
- [x] `app/admin/pages/[slug]/builder/page.tsx` (created)
- [x] `app/admin/pages/page.tsx` (modified)

---

## Phase 5: Public Page Rendering
**Status:** ✅ Complete

Render Unlayer pages on the public site.

- [x] Create `app/p/[slug]/page.tsx`:
  - Checks `editor_type` on page
  - If 'unlayer': renders `html_content` directly with proper styling
  - If 'sections': uses existing section renderer
- [x] Add Unlayer content styles (responsive, images, tables)
- [x] SEO metadata (title, description, keywords)

**Files:**
- [x] `app/p/[slug]/page.tsx` (created)

---

## Phase 6: Navigation Integration
**Status:** ✅ Complete

Allow Unlayer pages in platform navigation.

- [x] Update `menu_items` admin to allow linking to Unlayer pages
  - Added tabs for "Custom URL" vs "Select Page"
  - Shows all pages with draft/published status
  - Auto-fills URL and label from selected page
- [x] Add pages to sitemap generation
  - Created `app/sitemap.ts` with static and dynamic pages
  - Includes platform pages, blog posts, and help articles
- [x] Server actions for fetching pages for navigation
  - Added `getPublishedPagesForNavigation()` 
  - Added `getAllPagesForAdmin()`

**Files:**
- [x] `components/admin/menu-item-modal.tsx` (modified)
- [x] `app/sitemap.ts` (created)
- [x] `app/actions/pages.ts` (modified - added navigation functions)

---

## Files Summary

| File | Action | Phase | Status |
|------|--------|-------|--------|
| `scripts/094_add_unlayer_to_platform_pages.sql` | Create | 1 | ✅ |
| `components/admin/platform-page-builder.tsx` | Create | 2 | ✅ |
| `app/actions/pages.ts` | Modify | 3, 6 | ✅ |
| `app/admin/pages/create/page.tsx` | Modify | 4 | ✅ |
| `app/admin/pages/[slug]/builder/page.tsx` | Create | 4 | ✅ |
| `app/admin/pages/page.tsx` | Modify | 4 | ✅ |
| `app/p/[slug]/page.tsx` | Create | 5 | ✅ |
| `components/admin/menu-item-modal.tsx` | Modify | 6 | ✅ |
| `app/sitemap.ts` | Create | 6 | ✅ |

---

## Environment Requirements
- `NEXT_PUBLIC_UNLAYER_PROJECT_ID` - Already exists (used by tenant page builder)
- `NEXT_PUBLIC_SITE_URL` - Used for sitemap generation (optional, defaults to tektonstable.com)

---

## Progress
- **Phase 1**: ✅ Complete
- **Phase 2**: ✅ Complete
- **Phase 3**: ✅ Complete
- **Phase 4**: ✅ Complete
- **Phase 5**: ✅ Complete
- **Phase 6**: ✅ Complete

**Total: 6/6 Phases Complete** 🎉

---

## Usage

### Creating a New Page
1. Go to Admin > Pages > Create New Page
2. Select "Visual Page Builder (Recommended)"
3. Enter page title and slug
4. Use the drag-and-drop Unlayer editor to design your page
5. Save as draft or publish directly

### Adding Pages to Navigation
1. Go to Admin > Menu Navigation
2. Click "Add Menu Item"
3. Select the "Select Page" tab
4. Choose from available pages (shows draft status)
5. Save the menu item

### Viewing Pages
- Published pages are accessible at `/p/{slug}`
- Pages are automatically added to the sitemap
