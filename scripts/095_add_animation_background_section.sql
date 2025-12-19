-- Add Animation Background 1 section template
INSERT INTO section_templates (
  id,
  name,
  description,
  category,
  preview_image_url,
  field_schema,
  default_props,
  component_path,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Animation Background 1 (Prism)',
  'A stunning animated prism background with customizable text overlay. Features rotating crystal effects with adjustable colors, glow, and animation settings.',
  'animation_background_1',
  NULL,
  '{
    "fields": [
      {"key": "headline", "type": "text", "label": "Headline", "required": true, "defaultValue": "Welcome"},
      {"key": "subheadline", "type": "textarea", "label": "Subheadline", "required": false},
      {"key": "buttonText", "type": "text", "label": "Button Text", "required": false},
      {"key": "buttonUrl", "type": "text", "label": "Button URL", "required": false, "defaultValue": "#"},
      {"key": "buttonColor", "type": "color", "label": "Button Color", "defaultValue": "#ffffff"},
      {"key": "buttonTextColor", "type": "color", "label": "Button Text Color", "defaultValue": "#000000"},
      {"key": "textColor", "type": "color", "label": "Text Color", "defaultValue": "#ffffff"},
      {"key": "sectionHeight", "type": "number", "label": "Section Height (px)", "min": 300, "max": 1200, "defaultValue": 600},
      {"key": "animationType", "type": "select", "label": "Animation Type", "options": [{"value": "rotate", "label": "Rotate"}, {"value": "hover", "label": "Hover Interactive"}, {"value": "3drotate", "label": "3D Rotate"}], "defaultValue": "rotate"},
      {"key": "timeScale", "type": "number", "label": "Animation Speed", "min": 0, "max": 2, "defaultValue": 0.5},
      {"key": "prismHeight", "type": "number", "label": "Prism Height", "min": 1, "max": 10, "defaultValue": 3.5},
      {"key": "baseWidth", "type": "number", "label": "Base Width", "min": 1, "max": 10, "defaultValue": 5.5},
      {"key": "scale", "type": "number", "label": "Scale", "min": 1, "max": 10, "defaultValue": 3.6},
      {"key": "hueShift", "type": "number", "label": "Hue Shift", "min": -3.14, "max": 3.14, "defaultValue": 0},
      {"key": "colorFrequency", "type": "number", "label": "Color Frequency", "min": 0.1, "max": 5, "defaultValue": 1},
      {"key": "noise", "type": "number", "label": "Noise", "min": 0, "max": 1, "defaultValue": 0.5},
      {"key": "glow", "type": "number", "label": "Glow Intensity", "min": 0, "max": 3, "defaultValue": 1},
      {"key": "overlayOpacity", "type": "number", "label": "Overlay Opacity (%)", "min": 0, "max": 100, "defaultValue": 30},
      {"key": "overlayColor", "type": "color", "label": "Overlay Color", "defaultValue": "#000000"}
    ]
  }'::jsonb,
  '{
    "headline": "Welcome to Our Platform",
    "subheadline": "Experience the future of web design with stunning animated backgrounds",
    "buttonText": "Get Started",
    "buttonUrl": "/auth/signup",
    "buttonColor": "#ffffff",
    "buttonTextColor": "#000000",
    "textColor": "#ffffff",
    "sectionHeight": 600,
    "animationType": "rotate",
    "timeScale": 0.5,
    "prismHeight": 3.5,
    "baseWidth": 5.5,
    "scale": 3.6,
    "hueShift": 0,
    "colorFrequency": 1,
    "noise": 0.5,
    "glow": 1,
    "overlayOpacity": 30,
    "overlayColor": "#000000"
  }'::jsonb,
  'components/backgrounds/prism',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
