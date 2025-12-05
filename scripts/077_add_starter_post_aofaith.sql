-- Add the starter blog post for the aofaith tenant
-- This is a one-time script for an existing tenant
-- Fixed column names to match actual blog_posts table schema

INSERT INTO blog_posts (
  tenant_id,
  author_id,
  title,
  subtitle,
  slug,
  excerpt,
  content,
  featured_image_url,
  status,
  published_at,
  meta_description,
  read_time_minutes,
  allow_comments,
  followers_only,
  show_featured_image
)
SELECT 
  t.id as tenant_id,
  t.id as author_id,
  'Getting Started: Your Setup Guide' as title,
  'Everything you need to know to get your missionary support page up and running' as subtitle,
  'the-setup' as slug,
  'Welcome to your new supporter page! This guide will walk you through the essential steps to get your page up and running.' as excerpt,
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Welcome to your new supporter page! This guide will walk you through the essential steps to get everything set up and ready to receive support from your community."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [
          {
            "type": "text",
            "text": "Step 1: Connect Your Stripe Account"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "To receive donations, you''ll need to connect a Stripe account. Go to "
          },
          {
            "type": "text",
            "marks": [{ "type": "bold" }],
            "text": "Manage Giving"
          },
          {
            "type": "text",
            "text": " in your dashboard and click "
          },
          {
            "type": "text",
            "marks": [{ "type": "bold" }],
            "text": "Connect with Stripe"
          },
          {
            "type": "text",
            "text": ". This secure process takes just a few minutes and enables you to accept credit card donations."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [
          {
            "type": "text",
            "text": "Step 2: Create Your First Campaign"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Campaigns help you organize your fundraising efforts. In "
          },
          {
            "type": "text",
            "marks": [{ "type": "bold" }],
            "text": "Manage Giving"
          },
          {
            "type": "text",
            "text": ", click "
          },
          {
            "type": "text",
            "marks": [{ "type": "bold" }],
            "text": "Create Campaign"
          },
          {
            "type": "text",
            "text": " to set up your first fundraising goal. Add a title, description, goal amount, and an engaging image."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [
          {
            "type": "text",
            "text": "Step 3: Customize Your Site"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Make your page your own! Visit "
          },
          {
            "type": "text",
            "marks": [{ "type": "bold" }],
            "text": "Settings"
          },
          {
            "type": "text",
            "text": " to update your site name, upload a logo, and customize your About page to tell your story."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [
          {
            "type": "text",
            "text": "Step 4: Write Your First Update"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Keep your supporters engaged by sharing updates. Go to "
          },
          {
            "type": "text",
            "marks": [{ "type": "bold" }],
            "text": "Manage Content"
          },
          {
            "type": "text",
            "text": " and create a blog post to share news, progress reports, or personal stories with your community."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [
          {
            "type": "text",
            "text": "Step 5: Invite Your Supporters"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Share your page URL with friends, family, and your community. You can also use "
          },
          {
            "type": "text",
            "marks": [{ "type": "bold" }],
            "text": "Manage Supporters"
          },
          {
            "type": "text",
            "text": " to send email updates and newsletters to keep everyone informed about your journey."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "That''s it! You''re ready to start receiving support. Feel free to delete or unpublish this post once you''ve completed your setup."
          }
        ]
      }
    ]
  }'::jsonb as content,
  NULL as featured_image_url,
  'published' as status,
  NOW() as published_at,
  'Complete setup guide for your Tektons Table missionary support page' as meta_description,
  3 as read_time_minutes,
  true as allow_comments,
  false as followers_only,
  true as show_featured_image
FROM tenants t
WHERE t.subdomain = 'aofaith'
-- Cast both sides to text to avoid UUID type mismatch
AND NOT EXISTS (
  SELECT 1 FROM blog_posts bp 
  WHERE bp.tenant_id::text = t.id::text AND bp.slug = 'the-setup'
);
