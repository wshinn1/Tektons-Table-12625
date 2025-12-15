# Modular Section Library Implementation Plan

## Overview
Convert all hardcoded marketing pages into a flexible, drag-and-drop modular section library system where sections can be reused across any page.

---

## Phase 1: Design Documentation (Your Task)

### 1.1 Screenshot All Marketing Pages
Take screenshots of every section on each marketing page. Break pages into logical sections.

**Pages to Screenshot:**
- [ ] Home page (if any new sections added since last conversion)
- [ ] About page (if any new sections added since last conversion)
- [ ] Pricing page
- [ ] Features page
- [ ] Contact page
- [ ] Donate page
- [ ] Privacy/Terms pages (if you want them editable)
- [ ] Any other marketing pages

**Screenshot Naming Convention:**
```
[page-name]-section-[number]-[brief-description].png

Examples:
- pricing-section-1-hero.png
- pricing-section-2-plan-comparison.png
- features-section-1-hero.png
- features-section-2-feature-grid.png
- contact-section-1-form.png
```

### 1.2 Organize Screenshots
Group screenshots by page in a single message or attachment, labeled clearly so I know:
- Which page each section belongs to
- The order sections should appear
- Any notes about functionality (forms, animations, etc.)

---

## Phase 2: Analysis & Architecture (My Task)

### 2.1 Section Analysis
I'll analyze all screenshots to:
- Identify unique section designs
- Find reusable patterns across pages
- Group similar sections into component variants
- Determine section categories (Heroes, Features, CTAs, Forms, etc.)

### 2.2 Component Library Design
Create a section taxonomy:
```
Heroes (full-width top sections)
├── hero-centered (text centered with CTA)
├── hero-split (image/text side-by-side)
├── hero-minimal (simple text, no image)
└── hero-calculator (with interactive element)

Features
├── features-grid-3col (3-column grid)
├── features-bento (bento box layout)
├── features-list (vertical list with icons)
└── features-tabs (tabbed content)

CTAs
├── cta-centered (centered text + button)
├── cta-split (image + text side-by-side)
└── cta-banner (full-width banner)

Content
├── text-columns (2-3 column text layout)
├── stats-grid (stats/numbers display)
├── profile (bio with image)
└── testimonials (quotes/reviews)

Forms
├── contact-form (standard contact)
├── newsletter-subscribe (email capture)
└── multi-step-form (complex forms)

... and more based on your screenshots
```

### 2.3 Database Schema Design
Create unified schema for all pages:

```sql
-- Main sections table
CREATE TABLE page_sections (
  id UUID PRIMARY KEY,
  page_id TEXT NOT NULL, -- 'homepage', 'about', 'pricing', etc.
  section_component_id TEXT NOT NULL, -- 'hero-centered', 'features-grid-3col'
  content JSONB NOT NULL, -- Section-specific data
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Section library catalog (for admin UI)
CREATE TABLE section_library (
  id TEXT PRIMARY KEY, -- 'hero-centered'
  name TEXT NOT NULL, -- 'Centered Hero'
  category TEXT NOT NULL, -- 'heroes', 'features', 'ctas'
  description TEXT,
  thumbnail_url TEXT, -- Preview image
  default_content JSONB, -- Template/starter content
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 3: Implementation (My Task)

### 3.1 Create Component Architecture
```
components/
  sections/
    heroes/
      hero-centered.tsx
      hero-split.tsx
      hero-minimal.tsx
      hero-calculator.tsx
    features/
      features-grid-3col.tsx
      features-bento.tsx
      features-list.tsx
      features-tabs.tsx
    ctas/
      cta-centered.tsx
      cta-split.tsx
      cta-banner.tsx
    content/
      text-columns.tsx
      stats-grid.tsx
      profile.tsx
      testimonials.tsx
    forms/
      contact-form.tsx
      newsletter-subscribe.tsx
    registry.ts
    types.ts
```

**Each component will:**
- Accept content as props (typed with TypeScript)
- Be fully responsive
- Support background customization (color/image/video)
- Be isolated and reusable
- Have default/fallback content

### 3.2 Component Registry
```typescript
// components/sections/registry.ts
import { ComponentType } from 'react'

// Dynamically import all section components
const sectionComponents = {
  'hero-centered': () => import('./heroes/hero-centered'),
  'hero-split': () => import('./heroes/hero-split'),
  'features-grid-3col': () => import('./features/features-grid-3col'),
  // ... etc
}

export function getSectionComponent(id: string): ComponentType<any> {
  return sectionComponents[id]
}

export const sectionCategories = {
  heroes: ['hero-centered', 'hero-split', 'hero-minimal', 'hero-calculator'],
  features: ['features-grid-3col', 'features-bento', 'features-list'],
  ctas: ['cta-centered', 'cta-split', 'cta-banner'],
  // ... etc
}
```

### 3.3 Dynamic Page Renderer
```typescript
// components/page-section-renderer.tsx
export async function PageSectionRenderer({ pageId }: { pageId: string }) {
  const sections = await getPageSections(pageId)
  
  return (
    <>
      {sections.map((section) => {
        const Component = getSectionComponent(section.section_component_id)
        return (
          <Component 
            key={section.id}
            content={section.content}
          />
        )
      })}
    </>
  )
}
```

### 3.4 Admin Page Editor
Create comprehensive admin interface at `/admin/page-editor`:

**Features:**
- Page selector (Homepage, About, Pricing, etc.)
- Current sections list with drag-and-drop reordering
- "Add Section" button that opens section library modal
- Section library modal with:
  - Category tabs
  - Visual thumbnails of each section
  - Search/filter functionality
- Per-section actions:
  - Edit content (opens section-specific form)
  - Replace with different section
  - Duplicate section
  - Delete section
  - Toggle active/inactive

**Tech Stack:**
- `@dnd-kit/core` for drag-and-drop
- `@dnd-kit/sortable` for sortable lists
- React Hook Form for section editing
- SWR for data fetching

### 3.5 Section Content Editors
Each section category gets a tailored form:
- Hero sections: title, subtitle, CTA text/link, background
- Feature sections: feature items (icon, title, description)
- CTA sections: heading, body text, button text/link
- Form sections: form fields, submit endpoint, success message
- etc.

---

## Phase 4: Migration (My Task)

### 4.1 Migrate Existing Sections
Move data from current tables to new unified system:

**Homepage sections (from `homepage_sections`):**
- hero → hero-calculator
- features → features-grid-3col
- pricing → pricing-comparison
- benefits → text-columns
- cta → cta-centered

**About sections (from `about_sections`):**
- hero → hero-centered
- tekton_explanation → text-columns
- profile → profile
- facts_grid → stats-grid
- mission_statement → text-columns
- cta → cta-centered

### 4.2 Populate Section Library
Add all section metadata to `section_library` table with:
- Component IDs
- Names and descriptions
- Categories
- Default content templates
- Thumbnails (generated or placeholder)

---

## Phase 5: Page Conversion (My Task)

Convert each marketing page:

### 5.1 Per Page
For each page (pricing, features, contact, donate):
1. Create section components based on screenshots
2. Add to component registry
3. Create database entries in `page_sections`
4. Update page route to use `PageSectionRenderer`
5. Add section metadata to library catalog

### 5.2 Update Page Routes
```typescript
// Before (hardcoded)
export default function PricingPage() {
  return <div>hardcoded content...</div>
}

// After (dynamic)
export default function PricingPage() {
  return <PageSectionRenderer pageId="pricing" />
}
```

---

## Phase 6: Testing & Rollout (My Task)

### 6.1 Testing Checklist
- [ ] All sections render correctly on all pages
- [ ] Drag-and-drop reordering works smoothly
- [ ] Section library modal displays all sections
- [ ] Adding sections inserts at correct position
- [ ] Editing section content saves properly
- [ ] Deleting sections works without errors
- [ ] All pages are mobile responsive
- [ ] Background types (color/image/video) work
- [ ] Section content is validated before saving

### 6.2 Admin Training
I'll provide documentation on:
- How to add new sections to pages
- How to reorder sections
- How to edit section content
- How to duplicate/replace sections
- Best practices for section combinations

---

## Phase 7: Future Enhancements (Optional)

### 7.1 Advanced Features
- **Section Templates:** Save common page layouts as templates
- **A/B Testing:** Test different section variants
- **Section Scheduling:** Show/hide sections based on date/time
- **Conditional Display:** Show sections based on user properties
- **Section Analytics:** Track which sections get most engagement
- **Version History:** Rollback to previous section configurations
- **Multi-language:** Support translated section content

### 7.2 New Section Types
Easy to add new sections as needed:
1. Create new component file
2. Add to registry
3. Add to section library table
4. Immediately available to use on any page

---

## Timeline Estimate

**Phase 1 (Your Task):** 1-2 hours
- Screenshot all pages and organize

**Phase 2-6 (My Task):** Once you provide screenshots
- Analysis: 30 minutes
- Architecture & Implementation: 2-3 hours
- Migration: 30 minutes
- Testing: 30 minutes

**Total:** ~4-5 hours after screenshots are provided

---

## Deliverables

You'll receive:
1. ✅ Modular section component library
2. ✅ Unified database schema for all pages
3. ✅ Drag-and-drop page editor in admin
4. ✅ Section library browser with visual previews
5. ✅ All existing pages converted to use new system
6. ✅ All new pages from screenshots built and working
7. ✅ Documentation on managing sections

---

## Next Steps

1. **You:** Take and organize screenshots of all marketing pages
2. **You:** Share all screenshots with me in one message
3. **Me:** Analyze and design the complete section library
4. **Me:** Build the entire modular system
5. **Me:** Convert all pages and migrate existing data
6. **You:** Test and provide feedback
7. **Done!** You can now manage all page content with drag-and-drop sections

---

## Questions to Answer When Providing Screenshots

1. Which pages need to be converted?
2. Are there any interactive features (calculators, forms, animations)?
3. Do any sections need special functionality?
4. Are there sections you know you'll want to reuse across multiple pages?
5. Any specific section combinations that work well together?

Let me know when you're ready with the screenshots!
