-- Add Full Width Visual Hero Display 1 section template to section_templates table

INSERT INTO section_templates (
  name,
  component_path,
  category,
  thumbnail_url,
  description,
  field_schema,
  default_props
) VALUES (
  'Full Width Visual Hero Display 1',
  'sections/full-width-visual-hero-display-1',
  'hero',
  '/placeholder.svg?height=400&width=800',
  'Full-width visual hero with image/video/gradient background, centered text content, decorative border, and optional parallax effect',
  '{
    "fields": [
      {"name": "mainHeading", "label": "Main Heading", "type": "text", "required": false, "placeholder": "WHAT IF YOU FALL?"},
      {"name": "italicSubheading", "label": "Italic Subheading", "type": "text", "required": false, "placeholder": "but oh my darling"},
      {"name": "secondHeading", "label": "Second Heading", "type": "text", "required": false, "placeholder": "WHAT IF YOU FLY?"},
      {"name": "backgroundType", "label": "Background Type", "type": "select", "options": ["image", "video", "gradient"], "default": "image"},
      {"name": "backgroundImage", "label": "Background Image URL", "type": "url", "required": false},
      {"name": "videoUrl", "label": "Video CDN URL", "type": "url", "required": false},
      {"name": "gradientStart", "label": "Gradient Start Color", "type": "color", "default": "#1a1a2e"},
      {"name": "gradientEnd", "label": "Gradient End Color", "type": "color", "default": "#16213e"},
      {"name": "gradientDirection", "label": "Gradient Direction", "type": "select", "options": ["to-r", "to-l", "to-t", "to-b", "to-br", "to-bl", "to-tr", "to-tl"], "default": "to-br"},
      {"name": "enableParallax", "label": "Enable Parallax (Images Only)", "type": "checkbox", "default": false},
      {"name": "showBorder", "label": "Show Decorative Border", "type": "checkbox", "default": true},
      {"name": "borderWidth", "label": "Border Width (px)", "type": "number", "default": 2, "min": 1, "max": 10},
      {"name": "borderColor", "label": "Border Color", "type": "color", "default": "#ffffff"},
      {"name": "borderOpacity", "label": "Border Opacity (%)", "type": "number", "default": 80, "min": 0, "max": 100},
      {"name": "textColor", "label": "Text Color", "type": "color", "default": "#ffffff"},
      {"name": "decorativeLineColor", "label": "Decorative Line Color", "type": "color", "default": "#ffffff"},
      {"name": "overlayOpacity", "label": "Overlay Opacity (%)", "type": "number", "default": 40, "min": 0, "max": 100}
    ]
  }'::jsonb,
  '{
    "mainHeading": "WHAT IF YOU FALL?",
    "italicSubheading": "but oh my darling",
    "secondHeading": "WHAT IF YOU FLY?",
    "backgroundType": "image",
    "backgroundImage": "/inspirational-scene.jpg",
    "videoUrl": "",
    "gradientStart": "#1a1a2e",
    "gradientEnd": "#16213e",
    "gradientDirection": "to-br",
    "enableParallax": false,
    "showBorder": true,
    "borderWidth": 2,
    "borderColor": "#ffffff",
    "borderOpacity": 80,
    "textColor": "#ffffff",
    "decorativeLineColor": "#ffffff",
    "overlayOpacity": 40
  }'::jsonb
) ON CONFLICT DO NOTHING;
