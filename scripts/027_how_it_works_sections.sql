-- Create how_it_works_sections table for editable how-it-works page content
CREATE TABLE IF NOT EXISTS how_it_works_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  background_type TEXT DEFAULT 'color',
  background_value TEXT,
  text_color TEXT,
  content JSONB,
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE how_it_works_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active how-it-works sections"
  ON how_it_works_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage how-it-works sections"
  ON how_it_works_sections FOR ALL
  USING (auth.role() = 'authenticated');

INSERT INTO how_it_works_sections (section_key, section_type, title, subtitle, background_type, background_value, text_color, content, display_order) VALUES
('hero', 'hero', 'Launch Your Mission in Minutes', 'From signup to receiving your first donation in under 30 minutes. No technical skills required. No complicated setup.', 'gradient', 'from-accent/5 to-background', '#000000',
  '{"badge": "Launch in Minutes",
    "highlightedWord": "Minutes",
    "highlightedColor": "#f5a390",
    "primaryButton": {"text": "Get Started Free", "url": "/auth/signup"},
    "secondaryButton": {"text": "View Example Site", "url": "/example"}
  }'::jsonb, 1),

('steps_timeline', 'steps_timeline', '5 Simple Steps to Launch', 'Everything you need to start fundraising today', 'color', '#ffffff', '#000000',
  '{"steps": [
    {
      "number": 1,
      "icon": "user-plus",
      "title": "Create Your Account",
      "description": "Sign up in 60 seconds with just your email. No credit card required, no hidden fees.",
      "time": "1 minute",
      "iconColor": "#f5a390",
      "iconBgColor": "#f5a390",
      "details": [
        "Enter your name and email",
        "Choose your subdomain (e.g., yourname.tektonstable.com)",
        "Verify your email",
        "You''re in!"
      ]
    },
    {
      "number": 2,
      "icon": "palette",
      "title": "Customize Your Site",
      "description": "Make it yours with photos, your story, and mission details. Our easy editor does the design for you.",
      "time": "10-15 minutes",
      "iconColor": "#f5a390",
      "iconBgColor": "#f5a390",
      "details": [
        "Upload your profile photo and cover image",
        "Write your mission statement and bio",
        "Add your support goals and needs",
        "Choose colors and fonts (optional)"
      ]
    },
    {
      "number": 3,
      "icon": "send",
      "title": "Share With Supporters",
      "description": "Send your custom link to friends, family, and churches. Post on social media to spread the word.",
      "time": "5 minutes",
      "iconColor": "#f5a390",
      "iconBgColor": "#f5a390",
      "details": [
        "Copy your custom URL",
        "Email your network with our templates",
        "Post to social media",
        "Add link to email signature"
      ]
    },
    {
      "number": 4,
      "icon": "dollar-sign",
      "title": "Receive Donations",
      "description": "Supporters donate securely with credit cards or bank transfers. Funds deposited directly to your account.",
      "time": "Instant",
      "iconColor": "#f5a390",
      "iconBgColor": "#f5a390",
      "details": [
        "Donors give securely via Stripe",
        "Automatic email receipts sent",
        "Funds available in 2-7 days",
        "Track all donations in dashboard"
      ]
    },
    {
      "number": 5,
      "icon": "bar-chart",
      "title": "Engage & Update",
      "description": "Keep supporters informed with email updates, blog posts, and prayer requests. Build lasting relationships.",
      "time": "Ongoing",
      "iconColor": "#f5a390",
      "iconBgColor": "#f5a390",
      "details": [
        "Send email newsletters (unlimited, free)",
        "Post ministry updates and photos",
        "Share prayer requests",
        "Thank donors personally"
      ]
    }
  ],
  "totalTime": "~30 minutes",
  "totalTimeSubtitle": "From zero to receiving donations",
  "totalTimeBg": "#ffe4dc"
  }'::jsonb, 2),

('video', 'video', 'See It In Action', 'Watch how easy it is to get started', 'color', '#ffe4dc', '#000000',
  '{"videoTitle": "Video Tutorial Coming Soon",
    "videoSubtitle": "Watch our step-by-step setup guide",
    "iconColor": "#f5a390",
    "iconBgColor": "#f5a390",
    "placeholderBg": "#ffe4dc"
  }'::jsonb, 3),

('features', 'features_grid', 'Everything You Need Included', 'No add-ons. No upgrades. All features from day one.', 'color', '#ffffff', '#000000',
  '{"features": [
    {"text": "No technical skills required", "iconColor": "#f5a390"},
    {"text": "Mobile-friendly from day one", "iconColor": "#f5a390"},
    {"text": "Unlimited email newsletters", "iconColor": "#f5a390"},
    {"text": "Built-in donor CRM", "iconColor": "#f5a390"},
    {"text": "Automatic tax receipts", "iconColor": "#f5a390"},
    {"text": "Prayer request system", "iconColor": "#f5a390"},
    {"text": "Blog and photo galleries", "iconColor": "#f5a390"},
    {"text": "Multi-language support", "iconColor": "#f5a390"}
  ]}'::jsonb, 4),

('faq', 'faq', 'Common Questions', null, 'color', '#f5f5f5', '#000000',
  '{"faqs": [
    {
      "question": "Do I need technical skills to set this up?",
      "answer": "Absolutely not! If you can send an email, you can use Tekton''s Table. Our editor is designed for non-technical users."
    },
    {
      "question": "How long does it take to go live?",
      "answer": "Most missionaries complete setup in 20-30 minutes. You can start receiving donations immediately after connecting your Stripe account (5 minutes)."
    },
    {
      "question": "Can I use my own domain name?",
      "answer": "Yes! You get a free subdomain (yourname.tektonstable.com), or you can connect your own domain like support.yourmission.org."
    },
    {
      "question": "What if I need help?",
      "answer": "We provide email support, live chat, video tutorials, and a comprehensive help center. Most questions are answered within 24 hours."
    },
    {
      "question": "Can I migrate from another platform?",
      "answer": "Yes! We can help you import your supporter list and content from platforms like Mailchimp, Patreon, or your old website."
    }
  ]}'::jsonb, 5),

('final_cta', 'cta', 'Ready to Launch Your Mission?', 'Join hundreds of missionaries who have launched their fundraising sites in minutes.', 'color', '#ffffff', '#000000',
  '{"buttonText": "Get Started Free",
    "buttonUrl": "/auth/signup",
    "buttonColor": "#000000",
    "supportingText": "No credit card required • Setup in 30 minutes • $0/month forever"
  }'::jsonb, 6);

CREATE OR REPLACE FUNCTION update_how_it_works_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER how_it_works_sections_updated_at
  BEFORE UPDATE ON how_it_works_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_how_it_works_sections_updated_at();
