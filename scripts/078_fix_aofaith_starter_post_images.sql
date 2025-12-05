-- Fix images for aofaith starter blog post
UPDATE blog_posts
SET 
  featured_image_url = 'https://ram90tjooucmwuhd.public.blob.vercel-storage.com/blog/wesshinn/1764774431297-Tektons_Table_whitebg.png',
  content = '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "This is a short walkthrough on the initial setup for getting launched. You''ll want to follow these steps."
          }
        ]
      },
      {
        "type": "image",
        "attrs": {
          "src": "https://ram90tjooucmwuhd.public.blob.vercel-storage.com/blog/wesshinn/1764774431297-Tektons_Table_whitebg.png",
          "alt": "The Setup Guide",
          "title": null
        }
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
            "text": "To receive donations and support from your community, you''ll need to connect a Stripe account. Go to your Dashboard and click on \"Settings\", then find the Stripe Connect section and follow the prompts to connect your account."
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
            "text": "Campaigns help you organize your fundraising efforts. Navigate to \"Manage Giving\" in your dashboard to create your first campaign. Set a goal, add a compelling description, and share it with your supporters."
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
            "text": "Make your page uniquely yours! Go to Settings to update your profile photo, bio, and site colors. A personalized page helps supporters connect with your mission."
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
            "text": "Keep your supporters engaged by sharing regular updates. You can write blog posts like this one to share your journey, prayer requests, and testimonials."
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
            "text": "Share your page URL with friends, family, and your community. They can subscribe to receive updates and contribute to your mission."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "marks": [{ "type": "bold" }],
            "text": "You''re all set! Feel free to edit or unpublish this post once you''ve completed your setup."
          }
        ]
      }
    ]
  }'::jsonb
WHERE slug = 'the-setup' 
  AND tenant_id::text = (SELECT id::text FROM tenants WHERE subdomain = 'aofaith');
