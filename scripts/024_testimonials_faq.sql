-- Add testimonials and FAQ sections to site_content

-- Insert testimonials section
INSERT INTO site_content (section, content) VALUES
('testimonials', '{
  "headline": "Loved by missionaries worldwide",
  "subheadline": "See what missionaries are saying about Tektons Table",
  "testimonials": [
    {
      "name": "Sarah Johnson",
      "role": "Missionary to Thailand",
      "avatar": "/placeholder.svg?height=80&width=80",
      "content": "Tektons Table saved me over $2,000 per year. I was paying for Mailchimp, Patreon, and website hosting separately. Now everything is in one place and I only pay when I receive donations.",
      "rating": 5
    },
    {
      "name": "Michael Chen",
      "role": "Church Planter in Taiwan",
      "avatar": "/placeholder.svg?height=80&width=80",
      "content": "The supporter CRM is incredible. I can finally track all my relationships in one place and see exactly who is giving and when. The automated email newsletters save me hours every month.",
      "rating": 5
    },
    {
      "name": "Rachel Martinez",
      "role": "Missionary to Spain",
      "avatar": "/placeholder.svg?height=80&width=80",
      "content": "Content locking has been a game-changer. My monthly supporters love getting exclusive prayer updates, and it has increased my recurring donations by 35%. This platform pays for itself!",
      "rating": 5
    }
  ]
}'::jsonb)
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;

-- Insert FAQ section
INSERT INTO site_content (section, content) VALUES
('faq', '{
  "headline": "Frequently Asked Questions",
  "subheadline": "Everything you need to know about Tektons Table",
  "faqs": [
    {
      "question": "How much does Tektons Table cost?",
      "answer": "Tektons Table is completely free to set up and use. There are no monthly subscription fees. We only charge a 3% platform fee on donations you receive. This means you only pay when you are successfully raising support."
    },
    {
      "question": "How does the 3% fee compare to other platforms?",
      "answer": "Most platforms charge 5-8% plus monthly subscription fees of $50-200. For example, Patreon charges 5-12% plus $0.30 per transaction. With Tektons Table, you save $600-$2,400 per year in subscription fees alone, and our 3% platform fee is lower than most competitors."
    },
    {
      "question": "Can I use my own domain name?",
      "answer": "Yes! You get a free subdomain (yourname.tektonstable.com), and you can also connect your own custom domain if you prefer (like giving.yourname.com)."
    },
    {
      "question": "What payment methods do you accept?",
      "answer": "We support all major credit and debit cards through Stripe. Donors can give one-time or set up recurring monthly donations. We support 135+ currencies worldwide."
    },
    {
      "question": "How do I receive donations?",
      "answer": "Donations are processed through Stripe Connect and deposited directly into your bank account. You control when payouts happen (daily, weekly, or monthly) through your Stripe dashboard."
    },
    {
      "question": "Is there a setup fee?",
      "answer": "No! Setting up your Tektons Table account is completely free. No credit card required. You can be up and running in less than 5 minutes."
    },
    {
      "question": "Can I send unlimited newsletters?",
      "answer": "Yes! Unlike Mailchimp or Flodesk which charge based on subscriber count, Tektons Table includes unlimited email newsletters at no extra cost. This alone saves most missionaries $240-600 per year."
    },
    {
      "question": "What is content locking?",
      "answer": "Content locking allows you to create exclusive posts that only monthly supporters can view. This rewards your most loyal supporters and encourages one-time donors to become recurring supporters."
    },
    {
      "question": "Do you support multiple languages?",
      "answer": "Yes! Tektons Table supports 6 languages: English, Spanish, French, Portuguese, Chinese, and Korean. Your donation forms and public pages can be displayed in any of these languages."
    },
    {
      "question": "How do I cancel my account?",
      "answer": "You can cancel anytime from your dashboard settings. There are no cancellation fees or penalties. Your data can be exported before you leave."
    }
  ]
}'::jsonb)
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;
