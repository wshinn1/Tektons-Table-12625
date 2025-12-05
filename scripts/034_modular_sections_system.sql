-- Phase 2: Modular Sections System Database Schema
-- Create tables for pages, section templates, and page sections

-- Pages table: Main pages on the site (Home, About, Contact, etc.)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_global BOOLEAN DEFAULT true, -- true = main site, false = tenant-specific
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Section Templates: Reusable component definitions
CREATE TABLE IF NOT EXISTS section_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  component_path TEXT NOT NULL, -- e.g., 'sections/hero-overlay'
  thumbnail_url TEXT,
  category TEXT NOT NULL, -- 'hero', 'content', 'cta', 'gallery', 'testimonial', etc.
  description TEXT,
  default_props JSONB DEFAULT '{}', -- Default field values
  field_schema JSONB NOT NULL, -- Schema defining editable fields
  is_global BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Page Sections: Instances of sections placed on pages
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  section_template_id UUID REFERENCES section_templates(id) ON DELETE RESTRICT,
  order_index INTEGER NOT NULL,
  props JSONB NOT NULL DEFAULT '{}', -- All editable field values
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_id, order_index)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_pages_tenant ON pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_section_templates_category ON section_templates(category);
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections(page_id, order_index);

-- RLS Policies
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Pages: Public can view published pages
CREATE POLICY pages_select_published ON pages
  FOR SELECT
  USING (is_published = true);

-- Pages: Super admins can manage all pages
CREATE POLICY pages_super_admin_all ON pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Section Templates: Public can view templates
CREATE POLICY section_templates_select ON section_templates
  FOR SELECT
  USING (true);

-- Section Templates: Super admins can manage templates
CREATE POLICY section_templates_super_admin_all ON section_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Page Sections: Public can view sections of published pages
CREATE POLICY page_sections_select_published ON page_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_sections.page_id
      AND pages.is_published = true
    )
  );

-- Page Sections: Super admins can manage all sections
CREATE POLICY page_sections_super_admin_all ON page_sections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Insert initial homepage
INSERT INTO pages (slug, title, meta_description, is_published, is_global)
VALUES (
  'home',
  'Tekton''s Table - Missionary Fundraising Platform',
  'Everything missionaries need to raise support. Fundraising platform built for missionaries and nonprofits.',
  true,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Create a basic hero section template
INSERT INTO section_templates (
  name,
  component_path,
  category,
  description,
  field_schema,
  default_props
) VALUES (
  'Hero Overlay',
  'sections/hero-overlay',
  'hero',
  'Full-width hero section with background image/video and text overlay',
  '{
    "fields": [
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "required": true
      },
      {
        "name": "subtitle",
        "label": "Subtitle",
        "type": "textarea",
        "required": false
      },
      {
        "name": "backgroundType",
        "label": "Background Type",
        "type": "select",
        "options": ["image", "video"],
        "default": "image"
      },
      {
        "name": "backgroundUrl",
        "label": "Background URL",
        "type": "url",
        "required": true
      },
      {
        "name": "overlayColor",
        "label": "Overlay Color",
        "type": "color",
        "default": "#000000"
      },
      {
        "name": "overlayOpacity",
        "label": "Overlay Opacity",
        "type": "number",
        "min": 0,
        "max": 100,
        "default": 50
      },
      {
        "name": "textColor",
        "label": "Text Color",
        "type": "color",
        "default": "#FFFFFF"
      },
      {
        "name": "buttonText",
        "label": "Button Text",
        "type": "text",
        "required": false
      },
      {
        "name": "buttonLink",
        "label": "Button Link",
        "type": "url",
        "required": false
      },
      {
        "name": "buttonColor",
        "label": "Button Color",
        "type": "color",
        "default": "#0066CC"
      }
    ]
  }',
  '{
    "title": "Everything missionaries need to raise support",
    "subtitle": "$0/month Forever",
    "backgroundType": "image",
    "backgroundUrl": "/placeholder.svg?height=800&width=1920",
    "overlayColor": "#000000",
    "overlayOpacity": 30,
    "textColor": "#FFFFFF",
    "buttonText": "Get Started Free",
    "buttonLink": "/auth/signup",
    "buttonColor": "#0066CC"
  }'
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE pages IS 'Main pages of the site (homepage, about, contact, etc.)';
COMMENT ON TABLE section_templates IS 'Reusable section component definitions with field schemas';
COMMENT ON TABLE page_sections IS 'Instances of sections placed on specific pages with their props';
