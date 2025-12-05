-- Cleanup duplicate Visual Tekton About 1 section template
-- Keep only the oldest one (lowest id)

-- First, find the duplicate templates
DO $$
DECLARE
  keep_id uuid;
BEGIN
  -- Get the ID of the template to keep (oldest one)
  SELECT id INTO keep_id 
  FROM section_templates 
  WHERE name = 'Visual Tekton About 1' 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- Delete any duplicate templates with the same name (keeping the oldest)
  DELETE FROM section_templates 
  WHERE name = 'Visual Tekton About 1' 
  AND id != keep_id;
  
  RAISE NOTICE 'Kept template with ID: %', keep_id;
END $$;

-- Also update the field_schema to add optional button fields
UPDATE section_templates 
SET field_schema = jsonb_build_object(
  'fields', jsonb_build_array(
    jsonb_build_object('name', 'label', 'type', 'text', 'label', 'Label', 'default', 'EMPOWERING BRANDS WITH CREATIVITY'),
    jsonb_build_object('name', 'headline', 'type', 'textarea', 'label', 'Headline', 'default', 'We craft & elevate digital experiences'),
    jsonb_build_object('name', 'body1', 'type', 'textarea', 'label', 'Body Paragraph 1 (Top Left)', 'default', 'Algenix is a forward-thinking IT and digital agency dedicated to transforming businesses through innovative technology solutions.'),
    jsonb_build_object('name', 'body2', 'type', 'textarea', 'label', 'Body Paragraph 2', 'default', 'Our brand strategy service helps businesses define their identity and position in the market. We conduct thorough research and analysis to create a unique brand narrative that resonates with target audiences, ensuring long-term success.'),
    jsonb_build_object('name', 'body3', 'type', 'textarea', 'label', 'Body Paragraph 3 (Bottom Right)', 'default', 'We value creativity, collaboration, and customer focus, ensuring that every project reflects our commitment to quality and client satisfaction. Founded in 2015, we have established ourselves as a trusted partner for businesses looking to enhance their digital footprint.'),
    jsonb_build_object('name', 'media1_type', 'type', 'select', 'label', 'Media 1 Type', 'default', 'image', 'options', jsonb_build_array('image', 'cdn')),
    jsonb_build_object('name', 'media1_url', 'type', 'url', 'label', 'Media 1 URL', 'default', '/placeholder.svg?height=400&width=400'),
    jsonb_build_object('name', 'media2_type', 'type', 'select', 'label', 'Media 2 Type', 'default', 'image', 'options', jsonb_build_array('image', 'cdn')),
    jsonb_build_object('name', 'media2_url', 'type', 'url', 'label', 'Media 2 URL', 'default', '/placeholder.svg?height=800&width=600'),
    jsonb_build_object('name', 'button_text', 'type', 'text', 'label', 'Button Text (optional)', 'default', ''),
    jsonb_build_object('name', 'button_url', 'type', 'url', 'label', 'Button URL (optional)', 'default', '')
  )
)
WHERE name = 'Visual Tekton About 1';
