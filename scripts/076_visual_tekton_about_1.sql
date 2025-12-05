-- Add Visual Tekton About 1 section template to section_templates table

INSERT INTO section_templates (
  name,
  component_path,
  category,
  thumbnail_url,
  description,
  field_schema,
  default_props
) VALUES (
  'Visual Tekton About 1',
  'sections/visual-tekton-about-1',
  'About',
  '/placeholder.svg?height=200&width=400',
  'Modern asymmetric about section with headline, body text, and two media slots (image or video) with rounded corners',
  '{
    "fields": [
      {"name": "label", "label": "Label", "type": "text", "required": false},
      {"name": "headline", "label": "Headline", "type": "text", "required": true},
      {"name": "body1", "label": "Body Paragraph 1", "type": "textarea", "required": false},
      {"name": "body2", "label": "Body Paragraph 2", "type": "textarea", "required": false},
      {"name": "body3", "label": "Body Paragraph 3 (Bottom Right)", "type": "textarea", "required": false},
      {"name": "media1_type", "label": "Media 1 Type", "type": "select", "options": ["image", "cdn"], "default": "image"},
      {"name": "media1_url", "label": "Media 1 URL", "type": "url", "required": false},
      {"name": "media2_type", "label": "Media 2 Type", "type": "select", "options": ["image", "cdn"], "default": "image"},
      {"name": "media2_url", "label": "Media 2 URL", "type": "url", "required": false}
    ]
  }'::jsonb,
  $json${
    "label": "EMPOWERING BRANDS WITH CREATIVITY",
    "headline": "We craft & elevate digital experiences",
    "body1": "Algenix is a forward-thinking IT and digital agency dedicated to transforming businesses through innovative technology solutions.",
    "body2": "Our brand strategy service helps businesses define their identity and position in the market. We conduct thorough research and analysis to create a unique brand narrative that resonates with target audiences, ensuring long-term success.",
    "body3": "We value creativity, collaboration, and customer focus, ensuring that every project reflects our commitment to quality and client satisfaction. Founded in 2015, we have established ourselves as a trusted partner for businesses looking to enhance their digital footprint.",
    "media1_type": "image",
    "media1_url": "/placeholder.svg?height=600&width=500",
    "media2_type": "image",
    "media2_url": "/placeholder.svg?height=800&width=600"
  }$json$::jsonb
) ON CONFLICT DO NOTHING;
