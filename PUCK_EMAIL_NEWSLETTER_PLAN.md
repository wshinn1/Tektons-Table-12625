# Puck-Based Email Newsletter Builder for Tenant Sites

## Overview

This plan outlines the implementation of a visual drag-and-drop email newsletter builder for tenant sites using the Puck editor framework. This will replace the current textarea-based newsletter composer with a modern WYSIWYG experience.

## Current System Overview

### Existing Newsletter System
- `tenant_newsletters` table stores newsletters with `content` (HTML), `design_json` (editor state), `subject`, `status`, etc.
- `NewsletterComposer` component - basic textarea-based editor
- `sendNewsletter()` action sends HTML to subscribers via Resend
- Already has support for `design_json` column for storing editor state

### Existing Puck System
- Full-featured page builder with 20+ blocks (Heading, Text, Button, Image, Columns, Hero, etc.)
- Stores content as JSON (`puck_data`) and can render to React
- Custom field types: font picker, color picker, image uploader

---

## Implementation Phases

### Phase 1: Email-Safe Block Library ✅ COMPLETE
Create a separate Puck config with email-compatible blocks:

| Web Block | Email Block | Notes |
|-----------|-------------|-------|
| HeadingBlock | EmailHeading | Uses inline styles, web-safe fonts |
| TextBlock | EmailText | Table-based centering |
| ButtonBlock | EmailButton | Table-based button (Outlook-safe) |
| ImageBlock | EmailImage | Fixed width, hosted URLs |
| Columns | EmailColumns | `<table>` layout |
| Divider | EmailDivider | HR with inline styles |
| Spacer | EmailSpacer | Height-based spacing |

**New email-only blocks:**
- `EmailHeader` - Logo + preheader text
- `EmailFooter` - Unsubscribe link, address, social links
- `EmailSocialIcons` - Table-based social links

**Files Created:**
- `lib/puck-email-config.tsx` - Email-specific Puck configuration with 11 blocks

### Phase 2: Email Renderer ✅ COMPLETE
Create `renderPuckToEmailHtml()` function that:
1. Takes Puck JSON data
2. Walks the component tree
3. Outputs email-compatible HTML with:
   - Inline CSS (no external stylesheets)
   - Table-based layouts
   - Web-safe fonts with fallbacks
   - MSO conditionals for Outlook

**Files Created:**
- `lib/puck-email-renderer.ts` - JSON to email HTML converter

### Phase 3: Newsletter Composer Integration ✅ COMPLETE
Update `NewsletterComposer` to use Puck:

\`\`\`
┌─────────────────────────────────────────────────────────┐
│ Newsletter Editor                                        │
├─────────────────────────────────────────────────────────┤
│ Subject: [________________________]                      │
│ Preview Text: [________________________]                 │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────────────────────────────────────┐ │
│ │ Blocks  │ │        Preview Canvas                   │ │
│ │─────────│ │                                         │ │
│ │ Header  │ │   [Your Email Content Here]             │ │
│ │ Text    │ │                                         │ │
│ │ Image   │ │                                         │ │
│ │ Button  │ │                                         │ │
│ │ Columns │ │                                         │ │
│ │ Divider │ │                                         │ │
│ │ Footer  │ │                                         │ │
│ └─────────┘ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ [Send Test] [Save Draft] [Schedule] [Send Now]          │
└─────────────────────────────────────────────────────────┘
\`\`\`

**Files Created:**
- `components/tenant/newsletter-puck-editor.tsx` - Puck-based composer
- Updated `app/[tenant]/admin/newsletter/compose/page.tsx`
- Updated `app/[tenant]/admin/newsletter/edit/[id]/page.tsx`

### Phase 4: Database Updates ✅ COMPLETE
- Added `puck_data JSONB` column to `tenant_newsletters`
- Kept existing `content` column for rendered HTML cache

**Files:**
- `scripts/097_add_puck_data_to_newsletters.sql` - Database migration (executed)

### Phase 5: Send Flow ✅ COMPLETE
1. User designs newsletter in Puck editor
2. On save/send: `renderPuckToEmailHtml(puckData)` generates HTML
3. Store both `puck_data` (for re-editing) and `content` (rendered HTML)
4. Send HTML via Resend

**Files:**
- Updated `app/actions/newsletter.ts` - Added Puck data support and email HTML rendering

---

## Technical Considerations

1. **Email Client Compatibility**: Must support Outlook 2016+, Gmail, Apple Mail, Yahoo
2. **Image Hosting**: Images must be uploaded to Vercel Blob (not base64)
3. **Fonts**: Limited to web-safe fonts (Arial, Georgia, Times New Roman, etc.)
4. **Max Width**: 600px standard email width
5. **Dark Mode**: Add meta tags and media queries for dark mode support

---

## Estimated Effort

- Phase 1: 2-3 hours (email blocks) ✅ COMPLETE
- Phase 2: 2 hours (renderer) ✅ COMPLETE
- Phase 3: 1-2 hours (UI integration) ✅ COMPLETE
- Phase 4: 30 min (database) ✅ COMPLETE
- Phase 5: 1 hour (send flow) ✅ COMPLETE

**Total: ~7-8 hours of development**

---

## Architecture Notes

### Separation from Page Builder
This implementation is completely separate from the existing Puck page builder:

- **Separate Config**: `lib/puck-email-config.tsx` vs `lib/puck-config.tsx`
- **Separate Components**: `newsletter-puck-editor.tsx` vs `puck-page-editor.tsx`
- **Separate Data**: `tenant_newsletters.puck_data` vs `tenant_pages.puck_data`
- **Separate Renderer**: Custom email HTML vs Puck's React renderer

Changes to the email builder will not impact the page builder.

---

## Status: ✅ ALL PHASES COMPLETE

The Puck email newsletter builder is fully implemented and ready for testing. Tenant admins can now access the visual email builder at `/[tenant]/admin/newsletter/compose`.
