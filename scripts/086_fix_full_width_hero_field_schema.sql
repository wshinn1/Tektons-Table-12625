-- Fix the field schema for full-width-visual-hero-display-1 template
-- The component props don't match the old database schema

UPDATE section_templates
SET 
  field_schema = '{
    "fields": [
      {"key": "heading", "label": "Main Heading", "type": "text", "defaultValue": "WHAT IF YOU FALL?"},
      {"key": "subheadingItalic", "label": "Subheading (Italic)", "type": "text", "defaultValue": "but oh my darling"},
      {"key": "heading2", "label": "Second Heading", "type": "text", "defaultValue": "WHAT IF YOU FLY?"},
      {"key": "subheading", "label": "Regular Subheading", "type": "text", "defaultValue": ""},
      {
        "key": "backgroundType",
        "label": "Background Type",
        "type": "select",
        "options": [
          {"label": "Image", "value": "image"},
          {"label": "Video (CDN Link)", "value": "video"},
          {"label": "Gradient", "value": "gradient"}
        ],
        "defaultValue": "image"
      },
      {"key": "backgroundImage", "label": "Background Image URL", "type": "image"},
      {"key": "videoUrl", "label": "Video CDN URL", "type": "url"},
      {"key": "gradientStart", "label": "Gradient Start Color", "type": "color", "defaultValue": "#1e3a5f"},
      {"key": "gradientEnd", "label": "Gradient End Color", "type": "color", "defaultValue": "#0f172a"},
      {
        "key": "gradientDirection",
        "label": "Gradient Direction",
        "type": "select",
        "options": [
          {"label": "To Bottom", "value": "to bottom"},
          {"label": "To Bottom Right", "value": "to bottom right"},
          {"label": "To Right", "value": "to right"},
          {"label": "To Top Right", "value": "to top right"}
        ],
        "defaultValue": "to bottom right"
      },
      {"key": "enableParallax", "label": "Enable Parallax (Image Only)", "type": "boolean", "defaultValue": false},
      {"key": "showBorder", "label": "Show Decorative Border", "type": "boolean", "defaultValue": true},
      {"key": "borderWidth", "label": "Border Width (px)", "type": "number", "defaultValue": 2},
      {"key": "borderColor", "label": "Border Color", "type": "color", "defaultValue": "#ffffff"},
      {"key": "borderOpacity", "label": "Border Opacity (%)", "type": "number", "defaultValue": 80},
      {"key": "overlayColor", "label": "Overlay Color", "type": "color", "defaultValue": "#000000"},
      {"key": "overlayOpacity", "label": "Overlay Opacity (%)", "type": "number", "defaultValue": 40},
      {"key": "textColor", "label": "Text Color", "type": "color", "defaultValue": "#ffffff"},
      {
        "key": "headingFont",
        "label": "Heading Font",
        "type": "select",
        "options": [
          {"label": "Sans Serif", "value": "sans-serif"},
          {"label": "Serif", "value": "serif"},
          {"label": "Monospace", "value": "mono"}
        ],
        "defaultValue": "sans-serif"
      },
      {
        "key": "subheadingFont",
        "label": "Subheading Font",
        "type": "select",
        "options": [
          {"label": "Sans Serif", "value": "sans-serif"},
          {"label": "Serif", "value": "serif"},
          {"label": "Monospace", "value": "mono"}
        ],
        "defaultValue": "serif"
      },
      {"key": "showDecorativeLines", "label": "Show Decorative Lines", "type": "boolean", "defaultValue": true},
      {"key": "decorativeLineColor", "label": "Line Color", "type": "color", "defaultValue": "#ffffff"},
      {"key": "decorativeLineWidth", "label": "Line Width (px)", "type": "number", "defaultValue": 60}
    ]
  }'::jsonb,
  default_props = '{
    "heading": "WHAT IF YOU FALL?",
    "subheadingItalic": "but oh my darling",
    "heading2": "WHAT IF YOU FLY?",
    "subheading": "",
    "backgroundType": "image",
    "backgroundImage": "/inspirational-scene.jpg",
    "videoUrl": "",
    "gradientStart": "#1e3a5f",
    "gradientEnd": "#0f172a",
    "gradientDirection": "to bottom right",
    "enableParallax": false,
    "showBorder": true,
    "borderWidth": 2,
    "borderColor": "#ffffff",
    "borderOpacity": 80,
    "overlayColor": "#000000",
    "overlayOpacity": 40,
    "textColor": "#ffffff",
    "headingFont": "sans-serif",
    "subheadingFont": "serif",
    "showDecorativeLines": true,
    "decorativeLineColor": "#ffffff",
    "decorativeLineWidth": 60
  }'::jsonb
WHERE component_path = 'sections/full-width-visual-hero-display-1';

-- Also update any existing homepage sections using this template to have the correct field names
UPDATE homepage_sections
SET content = '{
  "heading": "WHAT IF YOU FALL?",
  "subheadingItalic": "but oh my darling",
  "heading2": "WHAT IF YOU FLY?",
  "backgroundType": "image",
  "backgroundImage": "/inspirational-scene.jpg",
  "gradientStart": "#1e3a5f",
  "gradientEnd": "#0f172a",
  "gradientDirection": "to bottom right",
  "showBorder": true,
  "borderWidth": 2,
  "borderColor": "#ffffff",
  "borderOpacity": 80,
  "overlayColor": "#000000",
  "overlayOpacity": 40,
  "textColor": "#ffffff",
  "headingFont": "sans-serif",
  "subheadingFont": "serif",
  "showDecorativeLines": true,
  "decorativeLineColor": "#ffffff",
  "decorativeLineWidth": 60
}'::jsonb
WHERE section_template_id = (
  SELECT id FROM section_templates 
  WHERE component_path = 'sections/full-width-visual-hero-display-1'
);
