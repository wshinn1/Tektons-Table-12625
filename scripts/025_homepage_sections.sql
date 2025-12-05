-- Add new homepage sections to site_content table

-- Features Grid Section (Section 2)
INSERT INTO site_content (section, content) VALUES
('features_grid', '{
  "headline": "Your complete fundraising toolkit",
  "subheadline": "Everything you need to connect with supporters, share updates, and receive donations — all in one place.",
  "backgroundColor": "#f9fafb",
  "backgroundType": "color",
  "features": [
    {
      "icon": "Mail",
      "iconColor": "#F5A390",
      "title": "Email Newsletter System",
      "description": "Send unlimited newsletters to your supporters at no extra cost",
      "highlight": "Saves $240-600/year vs Mailchimp/Flodesk"
    },
    {
      "icon": "Globe",
      "iconColor": "#F5A390",
      "title": "Custom Fundraising Page",
      "description": "Your own subdomain with beautiful donation forms and progress tracking",
      "highlight": "Accept one-time & recurring donations"
    },
    {
      "icon": "BarChart3",
      "iconColor": "#F5A390",
      "title": "Supporter CRM Dashboard",
      "description": "Track donors, view analytics, and manage your relationships",
      "highlight": "See who gives, when, and how much"
    },
    {
      "icon": "Lock",
      "iconColor": "#F5A390",
      "title": "Content Locking",
      "description": "Reward monthly supporters with exclusive prayer updates and content",
      "highlight": "Increase recurring donations by 40%"
    },
    {
      "icon": "Target",
      "iconColor": "#F5A390",
      "title": "Funding Goals & Progress",
      "description": "Show supporters your support-raising progress with visual bars",
      "highlight": "Drive urgency and transparency"
    },
    {
      "icon": "DollarSign",
      "iconColor": "#F5A390",
      "title": "Global Payment Support",
      "description": "Accept 135+ currencies worldwide via Stripe Connect",
      "highlight": "Multi-language support (6 languages)"
    }
  ]
}'::jsonb)
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;

-- Pricing Comparison Section (Section 3)  
INSERT INTO site_content (section, content) VALUES
('pricing_comparison', '{
  "headline": "Save $1,620 - $3,072 per year",
  "subheadline": "Stop paying monthly subscriptions for multiple tools",
  "backgroundColor": "#FEE9E5",
  "backgroundType": "color",
  "leftCard": {
    "title": "What You Pay Now",
    "subtitle": "Typical missionary stack",
    "borderColor": "#FCA5A5",
    "items": [
      {"label": "Mailchimp/Flodesk", "value": "$20-50/mo"},
      {"label": "Patreon/Donorbox", "value": "$49-200/mo"},
      {"label": "Website hosting", "value": "$10-20/mo"},
      {"label": "CRM/Analytics", "value": "$50-100/mo"}
    ],
    "monthlyTotal": "$135-256",
    "annualTotal": "$1,620-3,072",
    "totalColor": "#DC2626"
  },
  "rightCard": {
    "title": "Tektons Table",
    "subtitle": "All-in-one platform",
    "badge": "Recommended",
    "badgeColor": "#F5A390",
    "backgroundColor": "#FEE9E5",
    "borderColor": "#F5A390",
    "items": [
      {"label": "Monthly subscription", "value": "$0"},
      {"label": "Platform fee", "value": "3% per donation"},
      {"label": "All features included", "checkmark": true},
      {"label": "Unlimited newsletters", "checkmark": true}
    ],
    "monthlyTotal": "$0",
    "annualTotal": "$0",
    "savingsBox": {
      "title": "Annual Savings",
      "amount": "$1,620 - $3,072",
      "backgroundColor": "#FEE9E5",
      "textColor": "#F5A390"
    }
  }
}'::jsonb)
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;

-- Three Column Benefits Section (Section 4)
INSERT INTO site_content (section, content) VALUES
('three_column_benefits', '{
  "headline": "Built specifically for missionaries",
  "subheadline": "Features designed for support-raising, not generic crowdfunding",
  "backgroundColor": "#f9fafb",
  "backgroundType": "color",
  "columns": [
    {
      "icon": "Users",
      "iconBackgroundColor": "#FEE9E5",
      "iconColor": "#F5A390",
      "title": "Supporter-Focused",
      "description": "Build lasting relationships with your support team through regular updates and content"
    },
    {
      "icon": "Target",
      "iconBackgroundColor": "#FEE9E5",
      "iconColor": "#F5A390",
      "title": "Mission-Specific",
      "description": "Features like prayer updates, content locking, and funding goals built for missionaries"
    },
    {
      "icon": "Check",
      "iconBackgroundColor": "#FEE9E5",
      "iconColor": "#F5A390",
      "title": "Completely Free",
      "description": "Zero monthly fees means more money goes to your mission, not software subscriptions"
    }
  ]
}'::jsonb)
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;

-- Final CTA Section (Section 5)
INSERT INTO site_content (section, content) VALUES
('final_cta', '{
  "headline": "Ready to save thousands and raise more support?",
  "subheadline": "Join missionaries who are already using Tekton''s Table to connect with supporters and raise funds efficiently.",
  "backgroundColor": "#f9fafb",
  "backgroundType": "color",
  "button": {
    "text": "Get started for free",
    "url": "/auth/signup",
    "backgroundColor": "#1B3A5F",
    "textColor": "#FFFFFF"
  },
  "disclaimer": "No credit card required • Setup in 5 minutes • $0/month forever"
}'::jsonb)
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;
