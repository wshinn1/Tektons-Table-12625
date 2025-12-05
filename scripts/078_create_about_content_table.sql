-- Create about_content table for editable about pages
CREATE TABLE IF NOT EXISTS about_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  mission_title TEXT DEFAULT 'Our Mission',
  mission_content TEXT DEFAULT 'This is a placeholder for your mission statement.',
  mission_image TEXT,
  story_title TEXT DEFAULT 'Our Story',
  story_content TEXT DEFAULT 'Share your journey, calling, and the impact you''re making.',
  story_image TEXT,
  additional_sections JSONB DEFAULT '[]',
  button_text TEXT,
  button_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view about content"
  ON about_content FOR SELECT
  USING (true);

CREATE POLICY "Tenant owners can update their about content"
  ON about_content FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Insert default content for existing tenants
INSERT INTO about_content (tenant_id)
SELECT id FROM tenants
WHERE id NOT IN (SELECT tenant_id FROM about_content);
