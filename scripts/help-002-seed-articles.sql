-- Insert help articles
-- Complete Setup Guide
INSERT INTO help_articles (
  id, slug, category, title, content, is_published, view_count, 
  helpful_count, not_helpful_count, order_index, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'complete-setup-guide',
  'getting-started',
  '{"en": "Complete Setup Guide (10 Minutes)", "es": "Guía de Configuración Completa (10 Minutos)"}'::jsonb,
  '{"en": "<h2>Get Started in 10 Minutes</h2><p>Follow these simple steps to get your fundraising site live:</p><h3>Step 1: Create Your Account (2 minutes)</h3><p>Click ''Sign Up'' and enter your email address and password. You''ll receive a confirmation email - click the link to verify your account.</p><h3>Step 2: Complete Your Profile (3 minutes)</h3><p>Navigate to <strong>Dashboard → Settings</strong> and fill in:</p><ul><li>Your full name and ministry organization</li><li>Your mission statement</li><li>Profile photo</li><li>Location and contact information</li></ul><h3>Step 3: Connect Stripe (3 minutes)</h3><p>To receive donations, you need to connect your Stripe account:</p><ol><li>Go to <strong>Dashboard → Financial → Stripe</strong></li><li>Click ''Connect Stripe Account''</li><li>Follow the Stripe onboarding process</li><li>Provide your banking information for payouts</li></ol><h3>Step 4: Customize Your Site (2 minutes)</h3><p>Make your site uniquely yours:</p><ul><li>Set your custom subdomain (e.g., yourname.tektonstable.com)</li><li>Choose your primary color theme</li><li>Add your about content and mission statement</li><li>Upload a cover photo</li></ul><h3>Step 5: Go Live!</h3><p>Once you''ve completed these steps, your fundraising site is ready to share! You can always customize more later in your dashboard.</p><p><strong>Next Steps:</strong></p><ul><li>Create your first blog post</li><li>Set up your fundraising goal</li><li>Share your site on social media</li></ul>"}'::jsonb,
  true,
  0,
  0,
  0,
  1,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Connecting Stripe Account
INSERT INTO help_articles (
  id, slug, category, title, content, is_published, view_count,
  helpful_count, not_helpful_count, order_index, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'connecting-stripe-account',
  'financial-management',
  '{"en": "Connecting Your Stripe Account", "es": "Conectar tu Cuenta de Stripe"}'::jsonb,
  '{"en": "<h2>Why Stripe?</h2><p>Stripe is the most trusted payment processor in the world, used by millions of businesses and nonprofits. It''s secure, reliable, and provides the best experience for your supporters.</p><h3>Benefits of Stripe:</h3><ul><li>PCI-compliant security (bank-level encryption)</li><li>Accept all major credit cards and digital wallets</li><li>Automatic fraud detection</li><li>Fast payouts (typically 2 business days)</li><li>Detailed reporting and analytics</li><li>Nonprofit pricing available (reduced fees)</li></ul><h2>How to Connect</h2><h3>Step 1: Navigate to Stripe Settings</h3><p>From your dashboard, go to <strong>Dashboard → Financial → Connect Stripe</strong></p><h3>Step 2: Create or Connect Account</h3><p>Click ''Connect Stripe Account''. You''ll be redirected to Stripe where you can either:</p><ul><li>Create a new Stripe account (if you don''t have one)</li><li>Sign in to your existing Stripe account</li></ul><h3>Step 3: Provide Business Information</h3><p>Stripe will ask for:</p><ul><li>Business type (Individual or Organization)</li><li>Tax ID or EIN (for nonprofits)</li><li>Banking information for payouts</li><li>Personal identification for verification</li></ul><h3>Step 4: Verification</h3><p>Stripe may take 1-2 business days to verify your information. You''ll receive an email when your account is approved.</p><h2>Nonprofit Pricing</h2><p>If you''re a registered 501(c)(3) nonprofit, you can apply for discounted Stripe rates (2.2% + $0.30 instead of 2.9% + $0.30).</p><p>To apply:</p><ol><li>Log into your Stripe Dashboard</li><li>Go to Settings → Business Settings</li><li>Look for ''Nonprofit Pricing'' and click ''Apply''</li><li>Upload your IRS determination letter</li></ol><h2>Troubleshooting</h2><p><strong>Issue:</strong> My Stripe account is pending</p><p><strong>Solution:</strong> This is normal! Stripe reviews all accounts for security. Check your email for any additional information requests.</p><p><strong>Issue:</strong> I can''t connect my account</p><p><strong>Solution:</strong> Make sure you''re using the same email for both Tekton''s Table and Stripe. Contact support if issues persist.</p>"}'::jsonb,
  true,
  0,
  0,
  0,
  2,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- How to Accept Donations
INSERT INTO help_articles (
  id, slug, category, title, content, is_published, view_count,
  helpful_count, not_helpful_count, order_index, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'accept-donations',
  'fundraising',
  '{"en": "How to Accept Donations", "es": "Cómo Aceptar Donaciones"}'::jsonb,
  '{"en": "<h2>Your Donation Page</h2><p>Once you''ve connected Stripe, your donation page is automatically created and ready to accept donations!</p><h3>How It Works</h3><p>Every fundraising site comes with a donation page where supporters can:</p><ul><li>Choose from suggested donation amounts or enter a custom amount</li><li>Add an optional tip to support Tekton''s Table</li><li>Cover processing fees (optional for the donor)</li><li>Set up one-time or recurring monthly donations</li><li>Pay securely with credit card or digital wallets</li></ul><h2>Donation Flow</h2><ol><li>Supporter clicks ''Donate'' on your site</li><li>They select or enter an amount</li><li>They enter their payment information (handled securely by Stripe)</li><li>Payment is processed instantly</li><li>Supporter receives a confirmation email</li><li>You receive a notification and the funds appear in your Stripe balance</li></ol><h2>Customizing Your Donation Settings</h2><p>Navigate to <strong>Dashboard → Giving Settings</strong> to customize:</p><h3>Suggested Amounts</h3><p>Set 3-4 suggested donation amounts that appear as buttons (e.g., $25, $50, $100, $250)</p><h3>Thank You Message</h3><p>Personalize the message supporters see after donating</p><h3>Fundraising Goal</h3><p>Set a target amount and show progress on your site</p><h3>Fee Coverage</h3><p>Choose whether to give supporters the option to cover processing fees</p><h2>Processing Fees</h2><p>Standard Stripe fees apply:</p><ul><li>2.9% + $0.30 per transaction (standard)</li><li>2.2% + $0.30 per transaction (nonprofit pricing)</li></ul><p>Tekton''s Table charges a small platform fee (typically 2-3%) to maintain and improve the platform. You can see your exact fee in your dashboard.</p><h2>Receiving Your Funds</h2><p>Donations are deposited directly into your bank account via Stripe:</p><ul><li>Standard payout timing: 2 business days</li><li>You can change payout schedule in your Stripe dashboard</li><li>View all transactions and payouts in Dashboard → Financial</li></ul><h2>Tax Receipts</h2><p>Donors automatically receive an email receipt after their donation, which they can use for tax purposes. The receipt includes:</p><ul><li>Donation amount</li><li>Date and time</li><li>Your organization name</li><li>Transaction ID</li></ul>"}'::jsonb,
  true,
  0,
  0,
  0,
  3,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Setting Up Recurring Donations
INSERT INTO help_articles (
  id, slug, category, title, content, is_published, view_count,
  helpful_count, not_helpful_count, order_index, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'recurring-donations',
  'fundraising',
  '{"en": "Setting Up Recurring Donations", "es": "Configurar Donaciones Recurrentes"}'::jsonb,
  '{"en": "<h2>Why Recurring Donations Matter</h2><p>Recurring donations provide stable, predictable support for your mission. Monthly supporters are 5x more valuable than one-time donors over their lifetime.</p><h3>Benefits of Recurring Giving:</h3><ul><li>Predictable monthly income for planning</li><li>Higher lifetime value per supporter</li><li>Lower fundraising costs</li><li>Stronger donor relationships</li><li>Automatic processing - set it and forget it</li></ul><h2>How It Works</h2><p><strong>Automatic Setup:</strong> Recurring donations are automatically enabled when you connect Stripe. No additional setup required!</p><h3>For Your Supporters:</h3><ol><li>On your donation page, they select ''Monthly'' instead of ''One-time''</li><li>They enter their desired monthly amount</li><li>They complete payment information</li><li>Stripe automatically charges them on the same day each month</li><li>They can cancel or update their subscription anytime</li></ol><h2>Managing Recurring Supporters</h2><p>View all your recurring supporters in <strong>Dashboard → Supporters</strong>:</p><ul><li>See who gives monthly and how much</li><li>View total monthly recurring revenue</li><li>Track when subscriptions start/cancel</li><li>Export supporter data</li><li>Send targeted communications to monthly supporters</li></ul><h2>Subscription Management</h2><h3>Supporters Can:</h3><ul><li>Update payment methods</li><li>Change monthly amount</li><li>Pause or cancel subscriptions</li><li>All through their email receipts or by contacting you</li></ul><h3>You Can:</h3><ul><li>Cancel subscriptions if requested</li><li>Update amounts (with supporter permission)</li><li>Issue refunds if needed</li><li>Access through Dashboard → Financial → Subscriptions</li></ul><h2>Failed Payments</h2><p>Stripe automatically handles failed payments:</p><ol><li>If a card is declined, Stripe retries up to 4 times over 3 weeks</li><li>Stripe emails the supporter automatically about the failed payment</li><li>If all retries fail, the subscription is canceled</li><li>You''re notified so you can follow up personally</li></ol><h2>Best Practices</h2><h3>Communicate Value</h3><p>On your donation page and in communications, explain the impact of monthly giving:</p><ul><li>''$25/month provides meals for one family''</li><li>''Monthly supporters sustain our daily ministry''</li><li>Show specific outcomes enabled by recurring support</li></ul><h3>Recognition</h3><p>Make monthly supporters feel special:</p><ul><li>Send them exclusive updates</li><li>Recognize them in newsletters</li><li>Offer special perks or recognition levels</li></ul><h3>Stewardship</h3><p>Thank monthly supporters regularly:</p><ul><li>Anniversary emails (''Thank you for 1 year of support!'')</li><li>Impact reports showing what their support accomplished</li><li>Personal updates and prayer requests</li></ul>"}'::jsonb,
  true,
  0,
  0,
  0,
  4,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Creating Fundraising Goals
INSERT INTO help_articles (
  id, slug, category, title, content, is_published, view_count,
  helpful_count, not_helpful_count, order_index, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'fundraising-goals',
  'fundraising',
  '{"en": "Creating Fundraising Goals", "es": "Crear Objetivos de Recaudación"}'::jsonb,
  '{"en": "<h2>The Power of Visible Goals</h2><p>Fundraising goals help motivate donors and show progress toward your mission. Studies show that campaigns with visible goals raise 47% more than those without.</p><h3>Why Goals Work:</h3><ul><li>Create urgency and momentum</li><li>Show donors their impact contributes to something bigger</li><li>Build excitement as you get closer to the goal</li><li>Provide accountability and transparency</li></ul><h2>Setting Your Goal</h2><p>Navigate to <strong>Dashboard → Settings → Fundraising Goals</strong></p><h3>Step 1: Define Your Goal</h3><p>Enter:</p><ul><li><strong>Target Amount:</strong> How much you need to raise</li><li><strong>Goal Title:</strong> Give it a compelling name (e.g., ''New Vehicle Fund'', ''Annual Support Goal'')</li><li><strong>Description:</strong> Explain what the funds will accomplish</li><li><strong>Deadline:</strong> (Optional) Set a target date</li></ul><h3>Step 2: Display Settings</h3><p>Choose how to display your goal:</p><ul><li><strong>Show on Homepage:</strong> Display progress on your main fundraising page</li><li><strong>Widget Location:</strong> Choose where the progress bar appears</li><li><strong>Show Dollar Amount:</strong> Display actual amounts or just percentage</li><li><strong>Show Donor Count:</strong> Show how many people have contributed</li></ul><h2>Types of Goals</h2><h3>Annual Support Goal</h3><p>Set your total annual budget and show year-round progress:</p><ul><li>Example: ''$120,000 to fund our ministry for 2025''</li><li>Resets annually</li><li>Shows overall health and support</li></ul><h3>Project-Specific Goals</h3><p>Raise funds for a specific need:</p><ul><li>Example: ''$35,000 for a new van''</li><li>Has a clear endpoint</li><li>Creates urgency</li></ul><h3>Monthly Support Goals</h3><p>Focus on building recurring support:</p><ul><li>Example: ''100 monthly supporters at $50/month''</li><li>Emphasizes sustainable support</li><li>Can show both dollar and supporter count goals</li></ul><h2>Goal Best Practices</h2><h3>Be Specific</h3><p>Vague goals don''t inspire. Instead of ''General Support'', use:</p><ul><li>''6 Months of Living Expenses''</li><li>''Summer Ministry Trip to Thailand''</li><li>''New Sound Equipment for Church Planting''</li></ul><h3>Tell a Story</h3><p>In your goal description, explain:</p><ul><li>Why this matters</li><li>What will happen when the goal is met</li><li>The impact on your ministry and those you serve</li></ul><h3>Set Achievable Goals</h3><p>Goals should be challenging but realistic:</p><ul><li>Base on past giving patterns</li><li>Consider your supporter base size</li><li>Break large needs into smaller campaign goals</li></ul><h3>Update Progress</h3><p>The progress bar updates automatically as donations come in, but you should:</p><ul><li>Post updates when you hit milestones (25%, 50%, 75%)</li><li>Thank supporters publicly for progress</li><li>Share what''s still needed</li></ul><h2>Multiple Goals</h2><p>You can create multiple fundraising goals:</p><ul><li>One primary goal displayed on your homepage</li><li>Additional goals for specific projects</li><li>Archive completed goals to show past success</li></ul><h2>After Reaching Your Goal</h2><p>When you hit your target:</p><ul><li>Celebrate publicly and thank all supporters</li><li>Share photos/updates showing what was accomplished</li><li>Set a new goal to maintain momentum</li><li>Consider continuing to accept ''stretch goal'' support</li></ul>"}'::jsonb,
  true,
  0,
  0,
  0,
  5,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- How Tektons Table Works
INSERT INTO help_articles (
  id, slug, category, title, content, is_published, view_count,
  helpful_count, not_helpful_count, order_index, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'how-tektons-table-works',
  'getting-started',
  '{"en": "How Tektons Table Works", "es": "Cómo Funciona Tektons Table"}'::jsonb,
  '{"en": "<h2>Your Complete Fundraising Platform</h2><p>Tekton''s Table is a complete fundraising platform designed specifically for missionaries and non-profit organizations. We handle all the technical complexity so you can focus on your mission.</p><h2>Platform Overview</h2><h3>Your Own Fundraising Website</h3><p>Each missionary gets their own professional fundraising site:</p><ul><li><strong>Custom URL:</strong> yourname.tektonstable.com</li><li><strong>Beautiful Design:</strong> Professional, mobile-responsive layout</li><li><strong>Your Branding:</strong> Custom colors, logo, and content</li><li><strong>Built-in Blog:</strong> Share updates and stories</li><li><strong>Donation Processing:</strong> Secure, PCI-compliant payments</li></ul><h3>Complete Dashboard</h3><p>Manage everything from one place:</p><ul><li>View donation history and analytics</li><li>Manage supporters and send emails</li><li>Create blog posts and updates</li><li>Track fundraising goals</li><li>Export financial reports</li><li>Customize your site settings</li></ul><h2>How Donations Work</h2><ol><li><strong>Supporter gives on your site</strong><br/>They enter their payment information securely through Stripe</li><li><strong>Payment is processed instantly</strong><br/>Funds are verified and captured immediately</li><li><strong>Fees are deducted</strong><br/>Stripe processing fees + Tekton''s Table platform fee</li><li><strong>You receive the funds</strong><br/>Net amount deposited to your bank in 2 business days</li><li><strong>Everyone gets notifications</strong><br/>You and the donor receive email confirmations</li></ol><h2>Pricing & Fees</h2><h3>Platform Fee</h3><p>Tekton''s Table charges a small platform fee (typically 2-3%) to maintain and improve the platform. Your exact fee is shown in your dashboard.</p><h3>Payment Processing</h3><p>Stripe charges standard payment processing fees:</p><ul><li>2.9% + $0.30 per transaction (standard)</li><li>2.2% + $0.30 for registered nonprofits</li></ul><h3>Fee Coverage Option</h3><p>Supporters can choose to cover processing fees, so you receive the full donation amount.</p><h2>Key Features</h2><h3>Content & Communication</h3><ul><li><strong>Blog Platform:</strong> Share stories, updates, and prayer requests</li><li><strong>Email Newsletters:</strong> Send updates to all your supporters</li><li><strong>Subscriber Management:</strong> Build and manage your email list</li><li><strong>Social Sharing:</strong> Easy sharing to social media</li></ul><h3>Fundraising Tools</h3><ul><li><strong>One-Time Donations:</strong> Accept single gifts of any amount</li><li><strong>Recurring Giving:</strong> Monthly subscription support</li><li><strong>Fundraising Goals:</strong> Show progress toward targets</li><li><strong>Custom Campaigns:</strong> Create specific project fundraisers</li></ul><h3>Supporter Management</h3><ul><li><strong>Donor Database:</strong> Track all your supporters</li><li><strong>Giving History:</strong> See who gives and how much</li><li><strong>Communication Tools:</strong> Email supporters directly</li><li><strong>Export Data:</strong> Download reports for tax time or analysis</li></ul><h3>Financial Management</h3><ul><li><strong>Real-Time Dashboard:</strong> See donations as they happen</li><li><strong>Financial Reports:</strong> Monthly and annual summaries</li><li><strong>Payout Tracking:</strong> Know when funds hit your bank</li><li><strong>Tax Documentation:</strong> Automatic receipt generation</li></ul><h2>Security & Compliance</h2><p>Your supporters'' data is protected:</p><ul><li><strong>PCI-DSS Compliant:</strong> Bank-level encryption for all payments</li><li><strong>Secure Infrastructure:</strong> Hosted on enterprise-grade servers</li><li><strong>Data Privacy:</strong> We never sell or share supporter information</li><li><strong>HTTPS Everywhere:</strong> All pages encrypted</li></ul><h2>Support & Resources</h2><p>We''re here to help:</p><ul><li><strong>Help Center:</strong> Comprehensive guides and tutorials</li><li><strong>Email Support:</strong> Get help from our team</li><li><strong>Video Tutorials:</strong> Step-by-step walkthroughs</li><li><strong>Community Forum:</strong> Connect with other missionaries</li></ul><h2>Getting Started</h2><p>Ready to launch your fundraising site?</p><ol><li>Sign up for a free account</li><li>Complete the 10-minute setup guide</li><li>Connect your Stripe account</li><li>Customize your site</li><li>Start accepting donations!</li></ol><p>No technical skills required - we make it easy!</p>"}'::jsonb,
  true,
  0,
  0,
  0,
  6,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;
