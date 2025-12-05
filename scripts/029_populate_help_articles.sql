-- Populate comprehensive help articles for Tektons Table

-- First, add help categories
INSERT INTO help_categories (name, slug, icon, order_index) VALUES
  ('{"en": "Getting Started", "es": "Empezando"}', 'getting-started', '🚀', 1),
  ('{"en": "Fundraising", "es": "Recaudación de fondos"}', 'fundraising', '💰', 2),
  ('{"en": "Content & Communication", "es": "Contenido y Comunicación"}', 'content', '✍️', 3),
  ('{"en": "Financial Management", "es": "Gestión Financiera"}', 'financial', '💳', 4),
  ('{"en": "Settings & Customization", "es": "Configuración"}', 'settings', '⚙️', 5)
ON CONFLICT (slug) DO NOTHING;

-- Getting Started Articles

INSERT INTO help_articles (slug, title, content, category, subcategory, order_index, is_published) VALUES
(
  'how-it-works',
  '{"en": "How Tektons Table Works", "es": "Cómo funciona Tektons Table"}',
  '{"en": "Tektons Table is a complete fundraising platform designed specifically for missionaries and non-profit organizations. Here''s how it works:\n\n**Your Own Fundraising Website**\nWhen you sign up, you instantly get your own professional fundraising website with a custom subdomain (like yourname.tektonstable.com). This is your personal hub where supporters can learn about your mission and donate.\n\n**Secure Payment Processing**\nAll donations are processed securely through Stripe, the world''s leading payment processor. Money goes directly to your connected bank account - nothing is stored on our platform. We simply facilitate the connection.\n\n**Complete Control**\nYou control your content, your donors, and your fundraising goals. Share updates through blog posts, send newsletters, and track your progress all from one dashboard.\n\n**Global Support**\nWe support 14 languages and accept donations from around the world, making it easy to connect with supporters wherever they are.\n\n**Simple Pricing**\nOur platform fee is just 3.5% + standard Stripe fees (2.9% + $0.30). That''s it - no hidden costs, no monthly fees, no surprises.", "es": "Tektons Table es una plataforma completa de recaudación de fondos diseñada específicamente para misioneros y organizaciones sin fines de lucro..."}',
  'getting-started',
  'overview',
  1,
  true
),
(
  'setup-guide',
  '{"en": "Complete Setup Guide (10 Minutes)", "es": "Guía de configuración completa (10 minutos)"}',
  '{"en": "Get your fundraising site live in just 10 minutes by following these steps:\n\n**Step 1: Create Your Account (2 minutes)**\n- Click ''Sign Up'' and enter your email and password\n- Verify your email address\n- You''ll be automatically logged in\n\n**Step 2: Complete Onboarding (3 minutes)**\n- **Profile Setup**: Enter your name, missionary organization, and field location\n- **Customize Your Site**: Choose your subdomain (e.g., john.tektonstable.com), add a tagline, and write a brief bio about your mission\n- **Language & Settings**: Select your primary language (14 available) and indicate if you''re a registered 501(c)(3) nonprofit\n\n**Step 3: Connect Stripe (5 minutes)**\n- Click ''Connect Stripe'' in your dashboard\n- Create a Stripe account or connect your existing one\n- Provide your bank account information\n- Stripe will verify your identity (usually instant)\n\n**Step 4: You''re Live!**\nThat''s it! Your fundraising site is now live and ready to accept donations. Share your custom URL with supporters and start raising funds.\n\n**Next Steps:**\n- Add a profile photo\n- Create your first blog post\n- Set up a fundraising goal\n- Customize your thank you message", "es": "Pon tu sitio de recaudación de fondos en línea en solo 10 minutos siguiendo estos pasos..."}',
  'getting-started',
  'setup',
  2,
  true
),
(
  'stripe-connection',
  '{"en": "Connecting Your Stripe Account", "es": "Conectando tu cuenta de Stripe"}',
  '{"en": "Stripe is how you receive donations. Here''s everything you need to know:\n\n**Why Stripe?**\nStripe is the most trusted payment processor in the world, used by millions of businesses. It''s secure, reliable, and supports global payments.\n\n**Setting Up Stripe:**\n1. Go to your Dashboard and click ''Connect Stripe''\n2. You''ll be redirected to Stripe''s secure portal\n3. Create a new account or log in to your existing Stripe account\n4. Provide your business/organization information\n5. Add your bank account details where you want funds deposited\n6. Complete identity verification (usually instant with ID/passport)\n\n**How Payments Work:**\n- Donors enter their payment info on your fundraising page\n- Stripe processes the payment securely\n- Funds go directly to your bank account (not through Tektons Table)\n- You''ll see funds in your bank within 2-7 business days (depending on your bank)\n\n**Fees:**\n- Tektons Table platform fee: 3.5%\n- Stripe processing fee: 2.9% + $0.30 per transaction\n- Total: 6.4% + $0.30 per donation\n- Nonprofits: If you''re a registered 501(c)(3), you can apply for Stripe''s reduced nonprofit rates (2.2% + $0.30)\n\n**Security:**\nTektons Table never stores or has access to payment information. All payment data is handled directly by Stripe using bank-level encryption.", "es": "Stripe es como recibes donaciones..."}',
  'getting-started',
  'stripe',
  3,
  true
);

-- Fundraising Articles

INSERT INTO help_articles (slug, title, content, category, subcategory, order_index, is_published) VALUES
(
  'accepting-donations',
  '{"en": "How to Accept Donations", "es": "Cómo aceptar donaciones"}',
  '{"en": "Once you''ve connected Stripe, your site is automatically set up to accept donations. Here''s how it works:\n\n**Your Donation Page**\nEvery fundraising site includes a donation page at yourname.tektonstable.com/donate. This page is:\n- Mobile-optimized\n- Secure (SSL encrypted)\n- Professionally designed\n- Ready to accept payments\n\n**Donation Options:**\nDonors can choose:\n- One-time donation\n- Monthly recurring donation\n- Custom amounts or suggested amounts\n- Add a personal message\n\n**Payment Methods Accepted:**\n- Credit cards (Visa, Mastercard, Amex, Discover)\n- Debit cards\n- Digital wallets (Apple Pay, Google Pay)\n- ACH bank transfers (in supported countries)\n\n**After a Donation:**\n1. Donor receives instant email receipt\n2. You receive email notification\n3. Donation appears in your dashboard\n4. Funds transfer to your bank (2-7 days)\n5. Thank you email sent automatically (customizable)\n\n**Sharing Your Donation Link:**\n- Direct link: yourname.tektonstable.com/donate\n- Share via email, social media, newsletters\n- Add to your website or bio links\n- Include in prayer letters or support updates", "es": "Una vez que hayas conectado Stripe..."}',
  'fundraising',
  'donations',
  1,
  true
),
(
  'recurring-donations',
  '{"en": "Setting Up Recurring Donations", "es": "Configurar donaciones recurrentes"}',
  '{"en": "Recurring donations provide stable, predictable support for your mission.\n\n**Automatic Setup**\nRecurring donations are automatically enabled when you connect Stripe. No additional setup required!\n\n**How It Works:**\n- Donors select ''Monthly Donation'' on your donation page\n- They enter their payment information\n- Stripe automatically charges them each month\n- You receive consistent monthly support\n\n**Donor Experience:**\n- Donors can choose their monthly amount\n- They receive a confirmation email\n- Monthly receipts are sent automatically\n- They can cancel anytime from their donor portal\n\n**Managing Recurring Donors:**\nFrom your dashboard, you can:\n- View all recurring donors\n- See total monthly recurring revenue\n- Track donor retention\n- Send special updates to monthly supporters\n\n**Best Practices:**\n- Highlight the impact of monthly giving (\"$50/month provides...\")\n- Show how reliable support helps long-term planning\n- Offer special perks for monthly donors (exclusive updates, prayer requests)\n- Send occasional thank you messages to monthly supporters", "es": "Las donaciones recurrentes proporcionan apoyo estable..."}',
  'fundraising',
  'recurring',
  2,
  true
),
(
  'fundraising-goals',
  '{"en": "Creating Fundraising Goals", "es": "Crear metas de recaudación"}',
  '{"en": "Fundraising goals help motivate donors and show progress toward your mission.\n\n**Creating a Goal:**\n1. Go to Dashboard → Settings → Fundraising Goals\n2. Enter your target amount\n3. Set a deadline (optional)\n4. Add a description of what the funds will support\n5. Save your goal\n\n**Goal Display:**\nYour goal appears on your public fundraising page showing:\n- Progress bar\n- Amount raised vs target\n- Percentage complete\n- Days remaining (if deadline set)\n- Recent donors (privacy-respecting)\n\n**Multiple Goals:**\nYou can create multiple goals for different projects:\n- Monthly support target\n- Special project (vehicle, equipment, etc.)\n- Emergency fund\n- Annual budget goal\n\n**Tips for Effective Goals:**\n- Be specific about what funds will accomplish\n- Break large goals into smaller milestones\n- Update supporters on progress\n- Celebrate when goals are reached\n- Share stories of impact when goals are met", "es": "Las metas de recaudación de fondos ayudan a motivar a los donantes..."}',
  'fundraising',
  'goals',
  3,
  true
);

-- Content & Communication Articles

INSERT INTO help_articles (slug, title, content, category, subcategory, order_index, is_published) VALUES
(
  'creating-blog-posts',
  '{"en": "Creating Blog Posts & Updates", "es": "Crear publicaciones de blog"}',
  '{"en": "Keep supporters engaged with regular updates about your mission.\n\n**Creating a Post:**\n1. Go to Dashboard → Blog → New Post\n2. Enter a compelling title\n3. Write your content (rich text editor with formatting)\n4. Add images (optional but recommended)\n5. Choose categories/tags\n6. Set as Draft or Publish immediately\n\n**Best Practices:**\n- Post consistently (weekly or bi-weekly)\n- Include photos from your mission field\n- Share both victories and challenges\n- Tell stories of people impacted\n- Ask for specific prayer requests\n- Keep posts 300-800 words\n\n**Content Ideas:**\n- Daily life in your mission field\n- Cultural insights and learning\n- People you''re serving\n- Ministry projects and progress\n- Prayer requests and praises\n- Thank you messages to supporters\n\n**Formatting Tips:**\n- Use headings to break up text\n- Add bullet points for easy reading\n- Include at least one compelling image\n- End with a call-to-action (pray, share, give)\n- Proofread before publishing", "es": "Mantén a los seguidores comprometidos con actualizaciones regulares..."}',
  'content',
  'blog',
  1,
  true
),
(
  'sending-newsletters',
  '{"en": "Sending Email Newsletters", "es": "Enviar boletines por correo"}',
  '{"en": "Stay connected with your supporters through email newsletters.\n\n**Creating a Newsletter:**\n1. Dashboard → Newsletters → Create New\n2. Choose your template\n3. Write your message\n4. Add images and links\n5. Preview before sending\n6. Send immediately or schedule\n\n**Building Your Email List:**\n- Donors are automatically added to your list (with their consent)\n- Add contacts manually\n- Import from CSV file\n- Embed signup form on external sites\n\n**Newsletter Ideas:**\n- Monthly mission update\n- Quarterly impact report\n- Special prayer requests\n- Upcoming events or trips\n- Fundraising campaign launches\n- Holiday greetings\n\n**Best Practices:**\n- Send consistently (monthly recommended)\n- Keep subject lines clear and compelling\n- Personalize when possible\n- Include images and stories\n- Add clear donation links\n- Respect unsubscribe requests\n- Mobile-optimize content\n\n**Compliance:**\n- All newsletters include unsubscribe links\n- We comply with CAN-SPAM and GDPR\n- Respect subscriber preferences", "es": "Mantente conectado con tus seguidores a través de boletines..."}',
  'content',
  'newsletters',
  2,
  true
);

-- Financial Management Articles

INSERT INTO help_articles (slug, title, content, category, subcategory, order_index, is_published) VALUES
(
  'financial-overview',
  '{"en": "Understanding Your Finances", "es": "Comprender tus finanzas"}',
  '{"en": "Here''s how money flows through Tektons Table:\n\n**The Money Flow:**\n1. Donor gives on your fundraising page\n2. Stripe processes payment securely\n3. Platform fee (3.5%) + Stripe fees (2.9% + $0.30) are deducted\n4. Remaining funds go to your bank account\n5. You receive payout in 2-7 business days\n\n**Important: We Don''t Store Money**\nTektons Table never holds your funds. All donations go directly through Stripe to your bank account. We simply facilitate the connection.\n\n**Fee Breakdown:**\n- Platform fee: 3.5% (covers hosting, support, features)\n- Stripe fee: 2.9% + $0.30 per transaction\n- Total: 6.4% + $0.30\n- Example: $100 donation = $93.30 to you\n\n**For Nonprofits:**\nRegistered 501(c)(3) organizations can apply for Stripe''s nonprofit discount rate (2.2% + $0.30), reducing your total fees to 5.7% + $0.30.\n\n**Tracking Finances:**\nYour dashboard shows:\n- Total donations received\n- Monthly recurring revenue\n- Individual donor history\n- Export reports for accounting\n- Year-to-date totals\n\n**Tax Receipts:**\nDonors automatically receive email receipts for tax purposes. You can customize the receipt template with your organization''s tax information.", "es": "Así es como fluye el dinero a través de Tektons Table..."}',
  'financial',
  'overview',
  1,
  true
),
(
  'stripe-payouts',
  '{"en": "How Stripe Payouts Work", "es": "Cómo funcionan los pagos de Stripe"}',
  '{"en": "Understanding when and how you receive your donations.\n\n**Payout Schedule:**\n- New accounts: 7-14 days for first payout (Stripe security)\n- After that: Rolling 2-7 day schedule\n- Automatic deposits to your bank account\n- No action required from you\n\n**Payout Process:**\n1. Donor makes donation\n2. Stripe holds funds briefly for security\n3. Funds are transferred to your bank\n4. Money appears in your account\n\n**Checking Payout Status:**\nLog into your Stripe Dashboard to see:\n- Pending payouts\n- Completed payouts\n- Payout schedule\n- Bank account details\n\n**Changing Payout Schedule:**\nYou can adjust payout frequency in your Stripe Dashboard:\n- Daily\n- Weekly\n- Monthly\n- Manual (on-demand)\n\n**Troubleshooting Delays:**\nIf payouts are delayed:\n- Check Stripe Dashboard for notices\n- Verify bank account information\n- Ensure identity verification is complete\n- Contact Stripe support for bank-specific issues\n\n**International Payouts:**\nStripe supports payouts in 40+ countries. Check Stripe''s supported countries list for your region.", "es": "Comprender cuándo y cómo recibes tus donaciones..."}',
  'financial',
  'payouts',
  2,
  true
);

-- Settings & Customization Articles

INSERT INTO help_articles (slug, title, content, category, subcategory, order_index, is_published) VALUES
(
  'customize-site',
  '{"en": "Customizing Your Fundraising Site", "es": "Personalizar tu sitio"}',
  '{"en": "Make your fundraising site reflect your unique mission.\n\n**Basic Customization:**\n- Profile photo and cover image\n- Bio and mission statement\n- Tagline and description\n- Contact information\n- Social media links\n\n**Advanced Options:**\n- Custom domain (yourname.org instead of .tektonstable.com)\n- Color scheme customization\n- Logo upload\n- Custom thank you messages\n- Donation page messaging\n\n**Branding Tips:**\n- Use high-quality photos from your field\n- Keep messaging clear and compelling\n- Update content regularly\n- Show impact through stories and images\n- Make donation process obvious\n\n**Language Settings:**\nYour site supports 14 languages:\n- English, Spanish, Portuguese, French\n- Korean, Chinese, German, Italian\n- Russian, Arabic, Swahili, Tagalog\n- Japanese, Hindi\n\nSupporters automatically see content in their preferred language when available.", "es": "Haz que tu sitio de recaudación refleje tu misión única..."}',
  'settings',
  'customize',
  1,
  true
),
(
  'language-support',
  '{"en": "Multi-Language Support", "es": "Soporte multilingüe"}',
  '{"en": "Reach supporters globally with our 14-language support system.\n\n**Supported Languages:**\n- English\n- Spanish (Español)\n- Portuguese (Português)\n- French (Français)\n- Korean (한국어)\n- Chinese (中文)\n- German (Deutsch)\n- Italian (Italiano)\n- Russian (Русский)\n- Arabic (العربية)\n- Swahili (Kiswahili)\n- Tagalog\n- Japanese (日本語)\n- Hindi (हिन्दी)\n\n**How It Works:**\n- Set your primary language in Settings\n- Supporters see the interface in their browser''s language\n- You write content in your chosen language\n- Consider translating key pages for your audience\n\n**Translation Tips:**\n- Focus on donation page, bio, and top blog posts\n- Use Google Translate for basic translations\n- Have native speakers review if possible\n- Cultural adaptation matters beyond word-for-word\n\n**Language Priority:**\nThe system displays languages in this order:\n1. Supporter''s browser language (if available)\n2. Your site''s primary language\n3. English (fallback)", "es": "Llega a seguidores globales con nuestro sistema de 14 idiomas..."}',
  'settings',
  'language',
  2,
  true
);

-- Create full-text search index for help articles
CREATE INDEX IF NOT EXISTS idx_help_articles_search ON help_articles 
USING gin(to_tsvector('english', content::text));
