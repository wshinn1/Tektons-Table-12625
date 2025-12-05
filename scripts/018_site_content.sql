-- Site Content Management System
-- Allows super admins to edit landing page content through admin interface

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(100) NOT NULL UNIQUE, -- hero, features, pricing, cta, etc.
  content JSONB NOT NULL, -- Flexible structure for different content types
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public can read active content
CREATE POLICY "Anyone can view active site content"
  ON site_content FOR SELECT
  USING (is_active = true);

-- Super admins can manage all content
CREATE POLICY "Super admins can manage site content"
  ON site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Insert default landing page content
INSERT INTO site_content (section, content) VALUES
('hero', '{
  "badge": "$0/month Forever",
  "headline": "Everything missionaries need to raise support",
  "subheadline": "Stop paying $200+/month for multiple tools. Get fundraising pages, email newsletters, CRM, and more — all in one platform for zero monthly fees.",
  "primaryCTA": "Get started — it''s free",
  "secondaryCTA": "See pricing details",
  "disclaimer": "No credit card required • Setup in 5 minutes • Cancel anytime"
}'::jsonb),

('savings_card', '{
  "title": "Annual savings",
  "amount": "$1,620 - $3,072",
  "items": [
    {"label": "Email newsletters", "value": "$240-600/yr saved"},
    {"label": "Fundraising platform", "value": "$588-2,400/yr saved"},
    {"label": "CRM & analytics", "value": "Included free"},
    {"label": "Payment processing", "value": "Only 3% fee"}
  ]
}'::jsonb),

('features_section', '{
  "headline": "Your complete fundraising toolkit",
  "subheadline": "Everything you need to connect with supporters, share updates, and receive donations — all in one place.",
  "features": [
    {
      "icon": "Mail",
      "title": "Email Newsletter System",
      "description": "Send unlimited newsletters to your supporters at no extra cost",
      "highlight": "Saves $240-600/year vs Mailchimp/Flodesk"
    },
    {
      "icon": "Globe",
      "title": "Custom Fundraising Page",
      "description": "Your own subdomain with beautiful donation forms and progress tracking",
      "highlight": "Accept one-time & recurring donations"
    },
    {
      "icon": "BarChart3",
      "title": "Supporter CRM Dashboard",
      "description": "Track donors, view analytics, and manage your relationships",
      "highlight": "See who gives, when, and how much"
    },
    {
      "icon": "Lock",
      "title": "Content Locking",
      "description": "Reward monthly supporters with exclusive prayer updates and content",
      "highlight": "Increase recurring donations by 40%"
    },
    {
      "icon": "Target",
      "title": "Funding Goals & Progress",
      "description": "Show supporters your support-raising progress with visual bars",
      "highlight": "Drive urgency and transparency"
    },
    {
      "icon": "CreditCard",
      "title": "Global Payment Support",
      "description": "Accept 135+ currencies worldwide via Stripe Connect",
      "highlight": "Multi-language support (6 languages)"
    }
  ]
}'::jsonb),

('pricing_section', '{
  "headline": "Save $1,620 - $3,072 per year",
  "subheadline": "Stop paying monthly subscriptions for multiple tools",
  "current_stack": {
    "title": "What You Pay Now",
    "subtitle": "Typical missionary stack",
    "items": [
      {"label": "Mailchimp/Flodesk", "value": "$20-50/mo"},
      {"label": "Patreon/Donorbox", "value": "$49-200/mo"},
      {"label": "Website hosting", "value": "$10-20/mo"},
      {"label": "CRM/Analytics", "value": "$50-100/mo"}
    ],
    "monthlyTotal": "$135-256",
    "annualTotal": "$1,620-3,072"
  },
  "tektons_table": {
    "title": "Tektons Table",
    "subtitle": "All-in-one platform",
    "badge": "Recommended",
    "items": [
      {"label": "Monthly subscription", "value": "$0", "strikethrough": true},
      {"label": "Platform fee", "value": "3% per donation"},
      {"label": "All features included", "checkmark": true},
      {"label": "Unlimited newsletters", "checkmark": true}
    ],
    "monthlyTotal": "$0",
    "annualTotal": "$0",
    "savings": "$1,620 - $3,072"
  },
  "footer": "Only pay 3% when you receive donations. No hidden fees. No monthly charges."
}'::jsonb),

('social_proof', '{
  "headline": "Built specifically for missionaries",
  "subheadline": "Features designed for support-raising, not generic crowdfunding",
  "items": [
    {
      "icon": "Users",
      "title": "Supporter-Focused",
      "description": "Build lasting relationships with your support team through regular updates and content"
    },
    {
      "icon": "Target",
      "title": "Mission-Specific",
      "description": "Features like prayer updates, content locking, and funding goals built for missionaries"
    },
    {
      "icon": "Check",
      "title": "Completely Free",
      "description": "Zero monthly fees means more money goes to your mission, not software subscriptions"
    }
  ]
}'::jsonb),

('final_cta', '{
  "headline": "Ready to save thousands and raise more support?",
  "subheadline": "Join missionaries who are already using Tektons Table to connect with supporters and raise funds efficiently.",
  "buttonText": "Get started for free",
  "disclaimer": "No credit card required • Setup in 5 minutes • $0/month forever"
}'::jsonb),

('announcement_banner', '{
  "enabled": true,
  "text": "Multi-language support now available - 6 languages supported",
  "ctaText": "Get started",
  "ctaLink": "/auth/signup"
}'::jsonb);

-- Add updated_at trigger
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
