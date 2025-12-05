-- Populate section templates with initial sections

-- Hero Overlay
INSERT INTO section_templates (name, component_path, category, thumbnail_url, description, field_schema, default_props)
VALUES (
  'Hero Overlay',
  'sections/hero-overlay',
  'hero',
  '/placeholder.svg?height=200&width=400',
  'Full-width hero section with background image and text overlay',
  '{
    "fields": [
      {"name": "badge", "label": "Badge Text", "type": "text", "required": false},
      {"name": "headline", "label": "Headline", "type": "text", "required": true},
      {"name": "subheadline", "label": "Subheadline", "type": "textarea", "required": false},
      {"name": "primaryCTA", "label": "Primary Button Text", "type": "text", "required": false},
      {"name": "primaryCTALink", "label": "Primary Button Link", "type": "url", "required": false},
      {"name": "secondaryCTA", "label": "Secondary Button Text", "type": "text", "required": false},
      {"name": "secondaryCTALink", "label": "Secondary Button Link", "type": "url", "required": false},
      {"name": "disclaimer", "label": "Disclaimer Text", "type": "text", "required": false},
      {"name": "backgroundImage", "label": "Background Image URL", "type": "url", "required": false}
    ]
  }'::jsonb,
  '{"badge":"","headline":"Your Headline Here","subheadline":"","primaryCTA":"Get Started","primaryCTALink":"/auth/signup","secondaryCTA":"Learn More","secondaryCTALink":"#features","disclaimer":"","backgroundImage":""}'::jsonb
) ON CONFLICT DO NOTHING;

-- Features Grid
INSERT INTO section_templates (name, component_path, category, thumbnail_url, description, field_schema, default_props)
VALUES (
  'Features Grid',
  'sections/features-grid',
  'content',
  '/placeholder.svg?height=200&width=400',
  'Grid layout displaying features with icons and descriptions',
  '{
    "fields": [
      {"name": "headline", "label": "Headline", "type": "text", "required": true},
      {"name": "subheadline", "label": "Subheadline", "type": "textarea", "required": false},
      {"name": "backgroundColor", "label": "Background Color", "type": "text", "default": "bg-accent/5"},
      {"name": "features", "label": "Features", "type": "array", "required": false}
    ]
  }'::jsonb,
  '{"headline":"Features","subheadline":"","backgroundColor":"bg-accent/5","features":[]}'::jsonb
) ON CONFLICT DO NOTHING;

-- Pricing Comparison
INSERT INTO section_templates (name, component_path, category, thumbnail_url, description, field_schema, default_props)
VALUES (
  'Pricing Comparison',
  'sections/pricing-comparison',
  'pricing',
  '/placeholder.svg?height=200&width=400',
  'Side-by-side pricing comparison with savings calculator',
  '{
    "fields": [
      {"name": "headline", "label": "Headline", "type": "text", "required": true},
      {"name": "subheadline", "label": "Subheadline", "type": "textarea", "required": false},
      {"name": "currentStackTitle", "label": "Current Stack Title", "type": "text", "required": true},
      {"name": "currentStackItems", "label": "Current Stack Items", "type": "array", "required": false},
      {"name": "platformTitle", "label": "Platform Title", "type": "text", "required": true},
      {"name": "platformItems", "label": "Platform Items", "type": "array", "required": false},
      {"name": "savingsAmount", "label": "Savings Amount", "type": "text", "required": false},
      {"name": "ctaText", "label": "CTA Button Text", "type": "text", "required": false},
      {"name": "ctaLink", "label": "CTA Button Link", "type": "url", "required": false}
    ]
  }'::jsonb,
  '{"headline":"Pricing","subheadline":"","currentStackTitle":"What You Pay Now","currentStackItems":[],"platformTitle":"Tektons Table","platformItems":[],"savingsAmount":"","ctaText":"Start saving today","ctaLink":"/auth/signup"}'::jsonb
) ON CONFLICT DO NOTHING;

-- CTA Section
INSERT INTO section_templates (name, component_path, category, thumbnail_url, description, field_schema, default_props)
VALUES (
  'CTA Section',
  'sections/cta-section',
  'cta',
  '/placeholder.svg?height=200&width=400',
  'Call-to-action section with headline and button',
  '{
    "fields": [
      {"name": "headline", "label": "Headline", "type": "text", "required": true},
      {"name": "subheadline", "label": "Subheadline", "type": "textarea", "required": false},
      {"name": "ctaText", "label": "Button Text", "type": "text", "required": true},
      {"name": "ctaLink", "label": "Button Link", "type": "url", "required": true},
      {"name": "disclaimer", "label": "Disclaimer Text", "type": "text", "required": false},
      {"name": "backgroundColor", "label": "Background Color", "type": "text", "default": "bg-background"}
    ]
  }'::jsonb,
  '{"headline":"Ready to get started?","subheadline":"","ctaText":"Get Started","ctaLink":"/auth/signup","disclaimer":"","backgroundColor":"bg-background"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Testimonials
INSERT INTO section_templates (name, component_path, category, thumbnail_url, description, field_schema, default_props)
VALUES (
  'Testimonials',
  'sections/testimonials',
  'social-proof',
  '/placeholder.svg?height=200&width=400',
  'Testimonial carousel or grid from satisfied users',
  '{
    "fields": [
      {"name": "headline", "label": "Headline", "type": "text", "required": true},
      {"name": "subheadline", "label": "Subheadline", "type": "textarea", "required": false},
      {"name": "backgroundColor", "label": "Background Color", "type": "text", "default": "bg-muted/30"},
      {"name": "testimonials", "label": "Testimonials", "type": "array", "required": false}
    ]
  }'::jsonb,
  '{"headline":"What our users say","subheadline":"","backgroundColor":"bg-muted/30","testimonials":[]}'::jsonb
) ON CONFLICT DO NOTHING;
