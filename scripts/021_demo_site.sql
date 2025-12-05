-- Create demo site content system
-- This allows super admins to customize the demo missionary site

CREATE TABLE IF NOT EXISTS demo_site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE demo_site_config ENABLE ROW LEVEL SECURITY;

-- Public can read active demo content
CREATE POLICY "Anyone can view active demo config"
  ON demo_site_config FOR SELECT
  USING (is_active = true);

-- Super admins can manage demo content
CREATE POLICY "Super admins can manage demo config"
  ON demo_site_config FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Create demo posts table
CREATE TABLE IF NOT EXISTS demo_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INT DEFAULT 0
);

-- Enable RLS
ALTER TABLE demo_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published demo posts
CREATE POLICY "Anyone can view published demo posts"
  ON demo_posts FOR SELECT
  USING (status = 'published');

-- Super admins can manage demo posts
CREATE POLICY "Super admins can manage demo posts"
  ON demo_posts FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Create demo campaigns table
CREATE TABLE IF NOT EXISTS demo_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  goal_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INT DEFAULT 0
);

-- Enable RLS
ALTER TABLE demo_campaigns ENABLE ROW LEVEL SECURITY;

-- Public can read active demo campaigns
CREATE POLICY "Anyone can view active demo campaigns"
  ON demo_campaigns FOR SELECT
  USING (status = 'active');

-- Super admins can manage demo campaigns
CREATE POLICY "Super admins can manage demo campaigns"
  ON demo_campaigns FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM super_admins));

-- Insert default demo site configuration
INSERT INTO demo_site_config (section, content) VALUES
('profile', '{
  "name": "Sarah Thompson",
  "tagline": "Serving communities in Southeast Asia",
  "bio": "For the past 5 years, I have been privileged to serve alongside incredible communities in Southeast Asia. My mission is to bring hope, education, and sustainable development to underserved villages.",
  "profile_image": "/placeholder.svg?height=400&width=400",
  "mission_statement": "Empowering communities through education, healthcare, and sustainable development initiatives."
}'::jsonb),

('statistics', '{
  "supporters": 127,
  "monthly_support": 3450,
  "goal_percentage": 87,
  "countries_served": 3
}'::jsonb),

('video', '{
  "title": "My Mission Story",
  "url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "description": "Watch this short video to learn more about the work we are doing and how you can get involved."
}'::jsonb);

-- Insert sample demo posts
INSERT INTO demo_posts (title, slug, content, excerpt, featured_image, video_url, display_order) VALUES
(
  'Building Hope: New School Opens in Rural Village',
  'building-hope-new-school-opens',
  '<p>Today marks a milestone in our mission as we officially opened the doors to a brand new school building in the village of Mae Sot. This facility will serve over 200 children who previously had to walk miles to attend classes in cramped, inadequate spaces.</p><p>The journey to this moment has been incredible. Thanks to your generous support over the past year, we raised the funds needed to construct this beautiful facility. Local contractors and community members worked together to build something truly special.</p><p>The school features six spacious classrooms, a library stocked with books in both Thai and Karen languages, clean restrooms, and a playground where children can play safely. Seeing the joy on the students'' faces as they explored their new learning environment was absolutely priceless.</p><p>This is just the beginning. Our next goal is to provide scholarships for 50 students who cannot afford school supplies and uniforms. Together, we are changing lives one child at a time.</p>',
  'A new school building brings hope and opportunity to 200 children in a rural village.',
  '/placeholder.svg?height=600&width=1200',
  null,
  1
),
(
  'Medical Clinic Serves 500 Patients in First Month',
  'medical-clinic-serves-500-patients',
  '<p>Our newly established medical clinic has exceeded all expectations in its first month of operation. We have successfully treated over 500 patients, many receiving professional healthcare for the first time in their lives.</p><p>The clinic offers basic medical care, maternal health services, vaccinations for children, and health education workshops. We have partnered with local doctors and nurses who volunteer their time to ensure quality care.</p><p>One particularly moving story involves a young mother who walked three hours to bring her sick child to our clinic. The child was suffering from a treatable respiratory infection but had no access to medicine. Our team was able to provide treatment, and the child has made a full recovery.</p><p>We are currently seeking support to expand our medical supplies and add dental services. Your partnership makes stories like these possible.</p>',
  'In just one month, our medical clinic has provided life-saving care to over 500 people.',
  '/placeholder.svg?height=600&width=1200',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  2
),
(
  'Clean Water Initiative: 10 Wells Completed',
  'clean-water-initiative-10-wells',
  '<p>Access to clean water is something many of us take for granted, but for countless families in rural areas, it remains a daily struggle. That is why I am thrilled to announce that we have successfully completed construction on 10 new water wells across three villages.</p><p>Each well serves approximately 50 families, providing them with safe, clean drinking water right in their community. No longer do mothers and children need to walk hours each day to collect water from contaminated sources.</p><p>The impact of these wells extends far beyond just water access. Children now have more time to attend school instead of fetching water. Families report fewer illnesses from waterborne diseases. Women can focus on income-generating activities and caring for their families.</p><p>During the dedication ceremony for the most recent well, village elders shared their gratitude and amazement at the transformation in their community. It is a powerful reminder of why we do this work.</p>',
  'Ten new water wells bring clean, safe drinking water to hundreds of families.',
  '/placeholder.svg?height=600&width=1200',
  null,
  3
);

-- Insert sample demo campaigns
INSERT INTO demo_campaigns (title, slug, description, image_url, goal_amount, current_amount, display_order) VALUES
(
  'Emergency Flood Relief Fund',
  'emergency-flood-relief',
  'Recent flooding has devastated several communities we serve. This emergency fund will provide immediate relief including food, clean water, temporary shelter, and medical supplies to affected families.',
  '/placeholder.svg?height=400&width=800',
  15000.00,
  8750.00,
  1
),
(
  'Student Scholarship Program',
  'student-scholarship-program',
  'Help us provide full scholarships for 25 underprivileged students including tuition, books, uniforms, and school supplies for the entire academic year.',
  '/placeholder.svg?height=400&width=800',
  12000.00,
  9400.00,
  2
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_posts_status ON demo_posts(status);
CREATE INDEX IF NOT EXISTS idx_demo_posts_order ON demo_posts(display_order);
CREATE INDEX IF NOT EXISTS idx_demo_campaigns_status ON demo_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_demo_campaigns_order ON demo_campaigns(display_order);
