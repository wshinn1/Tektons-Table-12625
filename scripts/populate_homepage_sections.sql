-- Populate homepage sections with existing hardcoded content from app/page.tsx
-- This migration ensures the editor fields show the current homepage content

-- Hero Section
INSERT INTO homepage_sections (section_type, title, subtitle, content, background_type, background_value, is_active, display_order, created_at, updated_at)
VALUES (
  'hero_section',
  'Everything missionaries need to raise support',
  'Replace 4+ tools with one platform. Save thousands per year. Built specifically for support-raising missionaries.',
  jsonb_build_object(
    'primaryCTA', 'Get started for free',
    'secondaryCTA', 'See pricing',
    'badge', '',
    'disclaimer', ''
  ),
  'color',
  'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 1) 50%, rgba(239, 68, 68, 0.1) 100%)',
  true,
  1,
  NOW(),
  NOW()
)
ON CONFLICT (section_type) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  background_type = EXCLUDED.background_type,
  background_value = EXCLUDED.background_value,
  updated_at = NOW();

-- Features Grid Section
INSERT INTO homepage_sections (section_type, title, subtitle, content, background_type, background_value, is_active, display_order, created_at, updated_at)
VALUES (
  'features_grid',
  'Your complete fundraising toolkit',
  'Everything you need to build relationships, share your story, and manage support—all in one place.',
  jsonb_build_object(
    'features', jsonb_build_array(
      jsonb_build_object(
        'icon', 'Users',
        'title', 'CRM & Contacts',
        'description', 'Track every conversation, prayer request, and relationship in one central hub.',
        'badge', 'Core Feature',
        'badgeColor', '#ef4444'
      ),
      jsonb_build_object(
        'icon', 'Mail',
        'title', 'Email Newsletters',
        'description', 'Send beautiful, personalized updates to your supporters without any monthly fees.',
        'badge', 'No Limits',
        'badgeColor', '#22c55e'
      ),
      jsonb_build_object(
        'icon', 'Globe',
        'title', 'Personal Fundraising Site',
        'description', 'Get your own custom website to share your story and accept donations.',
        'badge', 'Included',
        'badgeColor', '#3b82f6'
      ),
      jsonb_build_object(
        'icon', 'DollarSign',
        'title', 'Donation Processing',
        'description', 'Accept one-time and recurring donations with low 2.9% + $0.30 processing fees.',
        'badge', 'Industry Standard',
        'badgeColor', '#8b5cf6'
      ),
      jsonb_build_object(
        'icon', 'BarChart3',
        'title', 'Analytics & Reports',
        'description', 'Track your progress with detailed insights on donations, engagement, and growth.',
        'badge', 'Data-Driven',
        'badgeColor', '#f59e0b'
      ),
      jsonb_build_object(
        'icon', 'Shield',
        'title', 'Security & Compliance',
        'description', 'Bank-level encryption and PCI compliance keep your donors'' information safe.',
        'badge', 'Enterprise-Grade',
        'badgeColor', '#06b6d4'
      )
    )
  ),
  'color',
  '#ffffff',
  true,
  2,
  NOW(),
  NOW()
)
ON CONFLICT (section_type) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  background_type = EXCLUDED.background_type,
  background_value = EXCLUDED.background_value,
  updated_at = NOW();

-- Pricing Comparison Section
INSERT INTO homepage_sections (section_type, title, subtitle, content, background_type, background_value, is_active, display_order, created_at, updated_at)
VALUES (
  'pricing_comparison',
  'Save $1,620 - $3,072 per year',
  'See how Tekton''s Table compares to paying for multiple tools separately.',
  jsonb_build_object(
    'leftCard', jsonb_build_object(
      'title', 'Traditional Approach',
      'subtitle', 'Paying for multiple tools separately',
      'backgroundColor', '#fef2f2',
      'borderColor', '#fecaca',
      'titleColor', '#dc2626',
      'items', jsonb_build_array(
        jsonb_build_object('label', 'CRM/Contact Management', 'value', '$29/mo'),
        jsonb_build_object('label', 'Email Marketing Platform', 'value', '$50/mo'),
        jsonb_build_object('label', 'Website Builder', 'value', '$16/mo'),
        jsonb_build_object('label', 'Donation Platform Fees', 'value', '$40/mo')
      ),
      'monthlyTotal', '$135 - $256/mo',
      'annualTotal', '$1,620 - $3,072/yr'
    ),
    'rightCard', jsonb_build_object(
      'title', 'Tekton''s Table',
      'subtitle', 'All-in-one missionary fundraising platform',
      'backgroundColor', '#f0fdf4',
      'borderColor', '#bbf7d0',
      'titleColor', '#16a34a',
      'badgeColor', '#16a34a',
      'badge', 'Best Value',
      'items', jsonb_build_array(
        jsonb_build_object('label', 'CRM/Contact Management', 'isCheck', true),
        jsonb_build_object('label', 'Email Marketing Platform', 'isCheck', true),
        jsonb_build_object('label', 'Website Builder', 'isCheck', true),
        jsonb_build_object('label', 'Donation Platform', 'value', '2.9% + $0.30')
      ),
      'monthlyTotal', '$0/mo',
      'annualTotal', '$0/yr',
      'savings', '$1,620 - $3,072'
    )
  ),
  'color',
  '#ffffff',
  true,
  3,
  NOW(),
  NOW()
)
ON CONFLICT (section_type) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  background_type = EXCLUDED.background_type,
  background_value = EXCLUDED.background_value,
  updated_at = NOW();

-- Benefits Columns Section
INSERT INTO homepage_sections (section_type, title, subtitle, content, background_type, background_value, is_active, display_order, created_at, updated_at)
VALUES (
  'benefits_columns',
  'Built specifically for missionaries',
  'We understand the unique challenges of support raising. Our platform is designed with your ministry in mind.',
  jsonb_build_object(
    'benefits', jsonb_build_array(
      jsonb_build_object(
        'icon', 'Zap',
        'iconColor', '#ef4444',
        'iconBgColor', '#fee2e2',
        'title', 'Quick Setup',
        'description', 'Get your fundraising site live in under 5 minutes. No technical skills required.'
      ),
      jsonb_build_object(
        'icon', 'Heart',
        'iconColor', '#3b82f6',
        'iconBgColor', '#dbeafe',
        'title', 'Donor-Friendly',
        'description', 'Beautiful, mobile-optimized giving experience that makes it easy for supporters to give.'
      ),
      jsonb_build_object(
        'icon', 'TrendingUp',
        'iconColor', '#16a34a',
        'iconBgColor', '#dcfce7',
        'title', 'Track Progress',
        'description', 'Visual progress bars and goal tracking keep you and your supporters motivated.'
      )
    )
  ),
  'color',
  '#f9fafb',
  true,
  4,
  NOW(),
  NOW()
)
ON CONFLICT (section_type) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  background_type = EXCLUDED.background_type,
  background_value = EXCLUDED.background_value,
  updated_at = NOW();

-- CTA Section
INSERT INTO homepage_sections (section_type, title, subtitle, content, background_type, background_value, button_text, button_url, button_color, is_active, display_order, created_at, updated_at)
VALUES (
  'cta',
  'Ready to save thousands and raise more support?',
  'Join missionaries worldwide who are using Tekton''s Table to fund their ministries.',
  jsonb_build_object(
    'supportingText', 'No credit card required • Setup in 5 minutes • Cancel anytime'
  ),
  'color',
  '#f5f5f5',
  'Get started for free',
  '/auth/signup',
  '#000000',
  true,
  5,
  NOW(),
  NOW()
)
ON CONFLICT (section_type) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  content = EXCLUDED.content,
  background_type = EXCLUDED.background_type,
  background_value = EXCLUDED.background_value,
  button_text = EXCLUDED.button_text,
  button_url = EXCLUDED.button_url,
  button_color = EXCLUDED.button_color,
  updated_at = NOW();
