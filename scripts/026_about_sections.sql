-- Create about_sections table for editable about page content
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  section_type TEXT NOT NULL, -- 'hero', 'tekton_origin', 'founder_profile', 'personal_values', 'mission_statement', 'cta'
  title TEXT,
  subtitle TEXT,
  background_type TEXT DEFAULT 'color', -- 'color', 'image', 'video'
  background_value TEXT, -- hex color, image URL, or video CDN URL
  button_text TEXT,
  button_url TEXT,
  button_color TEXT,
  image_url TEXT, -- for founder photo, etc.
  content JSONB, -- Flexible storage for section-specific data
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

-- Allow public to read active sections
CREATE POLICY "Anyone can view active about sections"
  ON about_sections FOR SELECT
  USING (is_active = true);

-- Only authenticated users can manage sections
CREATE POLICY "Authenticated users can manage about sections"
  ON about_sections FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default sections based on the screenshots
INSERT INTO about_sections (section_key, section_type, title, subtitle, background_type, background_value, content, display_order) VALUES
-- Hero Section
('hero', 'hero', 'Built by a storyteller for storytellers', 'Tekton''s Table exists to help missionaries visually tell God''s story and build lasting relationships with their supporters.', 'gradient', 'from-accent/5 via-background to-accent/10', '{}', 1),

-- Origin Story Section
('tekton_origin', 'tekton_origin', 'What is a Tekton?', NULL, 'color', 'bg-accent/5', '{
  "paragraph1": "In the New Testament Greek, the word is \\"τέκτων\\" (tekton), which had a broader meaning than just \\"carpenter\\" - it referred to a builder, craftsman, or artisan who worked with various materials including wood and stone.",
  "paragraph2": "This is particularly relevant when thinking about Jesus, who is described as a tekton (and the son of a tekton). While traditionally translated as \\"carpenter,\\" He was likely more of a general construction worker or builder, possibly working with both wood and stone, which would have been common in the building trades of first-century Galilee.",
  "workshop_title": "The Tekton''s Workshop",
  "workshop_paragraph1": "A tekton''s workplace would typically be called a workshop or shop. In Greek, this was referred to as an \\"ergasterion\\" (ἐργαστήριον) - which literally means a place of work where craftsmen practiced their trade.",
  "workshop_paragraph2": "These workshops were simple structures with basic tools - saws, axes, adzes, chisels, planes, and measuring instruments. It was where tektons worked on various projects, from making furniture and agricultural tools to crafting doors, roof beams, and window frames.",
  "highlighted_text": "Just as Jesus worked at His father''s table building things that mattered, Tekton''s Table is your workspace to build lasting connections with those who support God''s work through you.",
  "highlighted_text_color": "#f5a390"
}', 2),

-- Founder Profile Section
('founder_profile', 'founder_profile', 'Meet Wes Shinn', 'Co-Founder & CEO', 'color', '#ffffff', '{
  "paragraph1": "My journey as a visual storyteller began over two decades ago in military photojournalism, documenting impactful stories and capturing intricate details during major national disasters. This experience taught me to remain calm under pressure and find beauty in challenging situations.",
  "paragraph2": "With 17 years of experience as a professional photographer and filmmaker, and formal education in film school, I''ve mastered the art of transforming moments into lasting memories. My cinematic eye and passion for storytelling have served hundreds of couples and families.",
  "paragraph3": "I have long been called to believe in the missions field for God''s kingdom. I''ve always believed in visual storytelling, and Tekton''s Table is a way of bridging the modern-day gap for missionaries to visually tell God''s story.",
  "image_url": "/images/wes-shinn.jpg",
  "subtitle_color": "#f5a390"
}', 3),

-- Personal Values Section
('personal_values', 'personal_values', NULL, NULL, 'color', 'bg-accent/5', '{
  "values": [
    {
      "icon": "heart",
      "title": "Family First",
      "description": "Married to Keiko for 14 years (since 2011), with three children—Hana, Elias, and Emi—and our dog River, who we consider our fourth child. Family is at the center of everything I do.",
      "iconColor": "#f5a390",
      "iconBgColor": "bg-accent/10"
    },
    {
      "icon": "heart",
      "title": "Daily Motivation",
      "description": "I spend every day with quiet time with God. I am a believer and give thanks every day to God for being alive. I also work out and make my family a priority.",
      "iconColor": "#f5a390",
      "iconBgColor": "bg-accent/10"
    },
    {
      "icon": "globe",
      "title": "Places I''ve Traveled",
      "description": "Japan, China, Colombia, Peru, Kenya, Ukraine, Kyrgyzstan, England, Mexico, and France. Each journey has deepened my understanding of global missions and the unique challenges missionaries face.",
      "iconColor": "#f5a390",
      "iconBgColor": "bg-accent/10"
    },
    {
      "icon": "camera",
      "title": "What Makes Me Smile",
      "description": "Watching couples get married and adventures with my family. There''s nothing more fulfilling than capturing life''s most important moments and experiencing them with the people I love.",
      "iconColor": "#f5a390",
      "iconBgColor": "bg-accent/10"
    }
  ]
}', 4),

-- Mission Statement Section
('mission_statement', 'mission_statement', 'Building Genuine Connections', NULL, 'color', '#ffffff', '{
  "paragraph": "Daily One Accord represents my commitment to serving churches and missionaries with the same dedication I''ve brought to capturing life''s most important moments. Just as I build genuine connections with couples to capture their authentic stories, I''m committed to understanding the unique needs of each missionary and church we serve.",
  "highlighted_text": "Tekton''s Table is more than software - it''s a workshop where God''s storytellers can build lasting relationships with their supporters.",
  "highlighted_text_color": "#f5a390",
  "border_color": "#f5a390",
  "background_color": "bg-accent/10",
  "icon": "users",
  "icon_color": "#f5a390"
}', 5),

-- CTA Section
('cta', 'cta', 'Ready to tell your story?', 'Join missionaries who are using Tekton''s Table to visually share God''s work and build lasting supporter relationships.', 'color', 'bg-accent/5', '{
  "button_text": "Get started for free",
  "button_url": "/auth/signup",
  "supporting_text": "No credit card required • Setup in 5 minutes • $0/month forever"
}', 6);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_about_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER about_sections_updated_at
  BEFORE UPDATE ON about_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_about_sections_updated_at();
