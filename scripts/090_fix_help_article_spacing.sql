-- Fix spacing in getting-started help articles
-- Add proper margins and spacing to HTML content

-- Update Complete Setup Guide
UPDATE help_articles 
SET content = jsonb_set(
  content,
  '{en}',
  to_jsonb('<div class="space-y-8">
<h2 class="text-2xl font-bold mt-8 mb-4">Welcome! Let''s Get You Started</h2>
<p class="mb-6">This guide will walk you through setting up your Tektons Table fundraising site in about 10 minutes. By the end, you''ll be ready to accept donations and share your mission with supporters.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 1: Complete Your Profile (2 minutes)</h2>
<p class="mb-4">First, let''s personalize your site:</p>
<p class="mb-2">Go to <strong>Dashboard → Settings → Profile</strong></p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Upload a profile photo (this appears in emails and on your about page)</li>
<li>Write a compelling bio (2-3 paragraphs about your mission)</li>
<li>Add your ministry name and location</li>
<li>Save your changes</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 2: Connect Stripe (3 minutes)</h2>
<p class="mb-4">To accept donations, you need to connect a Stripe account:</p>
<p class="mb-2">Go to <strong>Dashboard → Settings → Payments</strong></p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Click <strong>Connect Stripe</strong></li>
<li>Follow the prompts to create a Stripe account (if you don''t have one)</li>
<li>Provide your bank details for payouts</li>
<li>Complete identity verification</li>
</ul>
<p class="mb-6 p-4 bg-blue-50 rounded-lg"><strong>Note:</strong> Stripe may take 1-2 business days to fully verify your account, but you can start testing immediately.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 3: Customize Your Site (2 minutes)</h2>
<p class="mb-4">Make your site feel like home:</p>
<p class="mb-2">Go to <strong>Dashboard → Settings → Site</strong></p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Choose your color scheme</li>
<li>Upload a header image for your homepage</li>
<li>Write a welcoming homepage message</li>
<li>Set your site title and description</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 4: Set a Fundraising Goal (1 minute)</h2>
<p class="mb-4">Give supporters something to rally around:</p>
<p class="mb-2">Go to <strong>Dashboard → Settings → Goals</strong></p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Set a monthly or annual goal amount</li>
<li>Write a compelling goal description</li>
<li>Choose whether to display progress publicly</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 5: Share Your Site (2 minutes)</h2>
<p class="mb-4">Now you''re ready to share your mission:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Copy your unique site URL (tektonstable.com/yourname)</li>
<li>Share on social media</li>
<li>Email your network</li>
<li>Add to your email signature</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Next Steps</h2>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Create blog posts to share updates</li>
<li>Add prayer requests</li>
<li>Set up recurring donation tiers</li>
<li>Customize your email templates</li>
</ul>

<p class="mb-6 mt-8 p-4 bg-green-50 rounded-lg">Congratulations! You''re all set up and ready to start raising support for your ministry.</p>
</div>'::text)
)
WHERE slug = 'complete-setup-guide';

-- Update Connecting Stripe Account
UPDATE help_articles 
SET content = jsonb_set(
  content,
  '{en}',
  to_jsonb('<div class="space-y-8">
<h2 class="text-2xl font-bold mt-8 mb-4">Why Connect Stripe?</h2>
<p class="mb-6">Stripe is the payment processor that allows you to accept credit card donations securely. All donations flow through Stripe directly to your bank account.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 1: Start the Connection Process</h2>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Log in to your Tektons Table dashboard</li>
<li>Go to <strong>Settings → Payments</strong></li>
<li>Click the <strong>Connect Stripe</strong> button</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 2: Create or Connect Your Stripe Account</h2>
<p class="mb-4">You''ll be redirected to Stripe where you can:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Create a new Stripe account</strong> if you don''t have one</li>
<li><strong>Log in</strong> if you already have a Stripe account</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 3: Complete Your Business Profile</h2>
<p class="mb-4">Stripe will ask for information including:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Business type (select "Individual" or "Nonprofit")</li>
<li>Your name and date of birth</li>
<li>Business address</li>
<li>Phone number</li>
<li>Tax ID (SSN or EIN)</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 4: Add Banking Information</h2>
<p class="mb-6">Provide your bank account details so Stripe can deposit donations:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Bank routing number</li>
<li>Account number</li>
<li>Account holder name</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Step 5: Verify Your Identity</h2>
<p class="mb-6">Stripe may ask you to upload a government ID to verify your identity. This is required by financial regulations.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Verification Timeline</h2>
<p class="mb-6 p-4 bg-blue-50 rounded-lg"><strong>Important:</strong> Stripe typically takes 1-2 business days to fully verify your account. However, you can start accepting test donations immediately.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Fees</h2>
<p class="mb-6">Stripe charges 2.9% + $0.30 per successful transaction. Tektons Table adds a small 2% platform fee to support ongoing development and hosting.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Troubleshooting</h2>
<p class="mb-4">If you encounter issues:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Make sure all information matches your government ID exactly</li>
<li>Check that your bank account is active and accepts ACH deposits</li>
<li>Contact Stripe support if verification is delayed beyond 3 business days</li>
</ul>
</div>'::text)
)
WHERE slug = 'connecting-stripe-account';

-- Update How to Accept Donations
UPDATE help_articles 
SET content = jsonb_set(
  content,
  '{en}',
  to_jsonb('<div class="space-y-8">
<h2 class="text-2xl font-bold mt-8 mb-4">Prerequisites</h2>
<p class="mb-6">Before you can accept donations, you must connect your Stripe account. See our guide on "Connecting Your Stripe Account" if you haven''t done this yet.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Setting Up Donation Tiers</h2>
<p class="mb-4">Donation tiers make it easy for supporters to give at different levels:</p>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Go to <strong>Dashboard → Settings → Donation Tiers</strong></li>
<li>Click <strong>Create New Tier</strong></li>
<li>Set the amount (e.g., $25, $50, $100)</li>
<li>Add a name (e.g., "Bronze Supporter", "Silver Partner")</li>
<li>Write a description of what this support level means</li>
<li>Choose whether to allow recurring donations at this level</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4">Customizing Your Donation Page</h2>
<p class="mb-4">Make your donation experience compelling:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Go to <strong>Settings → Donation Page</strong></li>
<li>Add a thank you message that donors see after giving</li>
<li>Upload images that tell your story</li>
<li>Enable or disable anonymous donations</li>
<li>Set suggested tip amounts for platform support</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Sharing Your Donation Link</h2>
<p class="mb-4">Your donation page URL is:</p>
<p class="mb-6 p-4 bg-gray-50 rounded-lg font-mono">tektonstable.com/yourname/give</p>
<p class="mb-4">Share this link:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>On social media posts</li>
<li>In email newsletters</li>
<li>In your email signature</li>
<li>On prayer cards and physical materials</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Receiving Donations</h2>
<p class="mb-6">When someone donates:</p>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>They''ll receive an immediate email receipt</li>
<li>You''ll receive a notification email</li>
<li>The donation appears in your dashboard</li>
<li>Stripe processes the payment and deposits it in your bank account (typically 2-7 business days)</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4">Managing Donations</h2>
<p class="mb-4">Track and manage donations from your dashboard:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>View all donations at <strong>Dashboard → Donations</strong></li>
<li>Export donation data for taxes and reporting</li>
<li>Send thank you emails to donors</li>
<li>Track recurring donation schedules</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Tax Receipts</h2>
<p class="mb-6">Tektons Table automatically generates tax receipts for all donations. Donors receive them by email immediately after giving.</p>
</div>'::text)
)
WHERE slug = 'how-to-accept-donations';

-- Update Creating Fundraising Goals
UPDATE help_articles 
SET content = jsonb_set(
  content,
  '{en}',
  to_jsonb('<div class="space-y-8">
<h2 class="text-2xl font-bold mt-8 mb-4">Why Set Fundraising Goals?</h2>
<p class="mb-6">Goals give your supporters something tangible to rally around. Studies show that campaigns with visible goals raise 2-3x more than those without.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Types of Goals</h2>
<p class="mb-4">You can set different types of fundraising goals:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Monthly Goal:</strong> Ongoing support target (e.g., "$5,000/month")</li>
<li><strong>Annual Goal:</strong> Year-long target (e.g., "$60,000/year")</li>
<li><strong>Campaign Goal:</strong> Project-specific target (e.g., "$10,000 for new vehicle")</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Setting Up Your Goal</h2>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Go to <strong>Dashboard → Settings → Goals</strong></li>
<li>Click <strong>Create New Goal</strong></li>
<li>Choose goal type (monthly, annual, or campaign)</li>
<li>Set the target amount</li>
<li>Write a compelling goal description</li>
<li>Choose visibility settings (public or private)</li>
<li>Set start and end dates (for campaign goals)</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4">Goal Visibility Options</h2>
<p class="mb-4">Control how your goal appears to supporters:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Show Progress Bar:</strong> Displays visual progress toward goal</li>
<li><strong>Show Amount Raised:</strong> Shows exact dollar amount</li>
<li><strong>Show Percentage:</strong> Displays percentage of goal reached</li>
<li><strong>Private Goal:</strong> Track internally without public display</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Writing Effective Goal Descriptions</h2>
<p class="mb-4">Make your goal compelling by:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Explaining exactly what the funds will be used for</li>
<li>Sharing the impact of reaching the goal</li>
<li>Being specific and realistic</li>
<li>Creating urgency when appropriate</li>
</ul>

<p class="mb-6 p-4 bg-blue-50 rounded-lg"><strong>Example:</strong> "We''re raising $8,000 to purchase a reliable vehicle for visiting remote villages. This will allow us to reach 12 new communities with medical care and ministry."</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Tracking Progress</h2>
<p class="mb-6">Monitor your fundraising progress in real-time from your dashboard. You''ll see total raised, percentage toward goal, and a list of recent donations.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Celebrating Milestones</h2>
<p class="mb-4">When you reach key milestones:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Share updates with your supporters</li>
<li>Post photos and stories showing the impact</li>
<li>Send thank you emails</li>
<li>Set a new stretch goal if you exceed your target</li>
</ul>
</div>'::text)
)
WHERE slug = 'creating-fundraising-goals';

-- Update How Tektons Table Works
UPDATE help_articles 
SET content = jsonb_set(
  content,
  '{en}',
  to_jsonb('<div class="space-y-8">
<h2 class="text-2xl font-bold mt-8 mb-4">What is Tektons Table?</h2>
<p class="mb-6">Tektons Table is a fundraising platform specifically designed for missionaries and ministry workers. We provide you with a beautiful, personalized fundraising website that makes it easy for supporters to give to your mission.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">How It Works</h2>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li><strong>You sign up</strong> and create your unique fundraising site</li>
<li><strong>Customize your site</strong> with your story, photos, and mission details</li>
<li><strong>Share your link</strong> with friends, family, and supporters</li>
<li><strong>Accept donations</strong> securely through Stripe</li>
<li><strong>Receive funds</strong> directly in your bank account</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4">Key Features</h2>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Personal Fundraising Site:</strong> Your own URL (tektonstable.com/yourname)</li>
<li><strong>Secure Payments:</strong> Credit card processing through Stripe</li>
<li><strong>Recurring Donations:</strong> Let supporters give monthly or annually</li>
<li><strong>Prayer Requests:</strong> Share needs with your community</li>
<li><strong>Blog Updates:</strong> Keep supporters informed with stories and updates</li>
<li><strong>Email Receipts:</strong> Automatic tax receipts for all donors</li>
<li><strong>Goal Tracking:</strong> Visual progress bars for fundraising goals</li>
<li><strong>Mobile Optimized:</strong> Works beautifully on all devices</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Payment Processing</h2>
<p class="mb-4">We use Stripe to process all donations:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Donations are secure and PCI compliant</li>
<li>Funds go directly from donor to your bank account</li>
<li>We never hold your money</li>
<li>Typical payout time is 2-7 business days</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Fees</h2>
<p class="mb-6">We believe in transparent pricing:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Platform Fee:</strong> 2% of each donation</li>
<li><strong>Stripe Fee:</strong> 2.9% + $0.30 per transaction</li>
<li><strong>Total:</strong> Approximately 5% of each donation goes to fees</li>
</ul>
<p class="mb-6">Donors can optionally add a tip to cover fees, allowing 100% of their intended gift to reach you.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Your Data & Privacy</h2>
<p class="mb-6">Your data is secure and private:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>We never sell your donor information</li>
<li>All data is encrypted in transit and at rest</li>
<li>You own your donor relationships</li>
<li>You can export all your data anytime</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Support</h2>
<p class="mb-6">We''re here to help you succeed:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Email support at support@tektonstable.com</li>
<li>Comprehensive help documentation</li>
<li>Video tutorials and guides</li>
<li>Fast response times</li>
</ul>
</div>'::text)
)
WHERE slug = 'how-tektons-table-works';

-- Update Recurring Donations
UPDATE help_articles 
SET content = jsonb_set(
  content,
  '{en}',
  to_jsonb('<div class="space-y-8">
<h2 class="text-2xl font-bold mt-8 mb-4">Why Recurring Donations?</h2>
<p class="mb-6">Recurring donations provide predictable monthly income that allows you to plan and budget effectively. Monthly supporters are the foundation of sustainable missionary support.</p>

<h2 class="text-2xl font-bold mt-8 mb-4">Benefits of Monthly Giving</h2>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>Predictable Income:</strong> Know what to expect each month</li>
<li><strong>Higher Lifetime Value:</strong> Monthly donors give 42% more over time than one-time donors</li>
<li><strong>Convenience:</strong> Supporters don''t need to remember to give each month</li>
<li><strong>Stronger Relationships:</strong> Monthly partners are more engaged with your mission</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Setting Up Recurring Donation Tiers</h2>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Go to <strong>Dashboard → Settings → Donation Tiers</strong></li>
<li>Click <strong>Create New Tier</strong></li>
<li>Set the monthly amount</li>
<li>Check the <strong>Allow Recurring</strong> option</li>
<li>Add a compelling tier name (e.g., "Ministry Partner", "Champion")</li>
<li>Describe the impact of monthly support at this level</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4">Recommended Tier Structure</h2>
<p class="mb-4">Consider offering multiple tiers to accommodate different budget levels:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li><strong>$25/month:</strong> "Prayer Partner" - Basic monthly support</li>
<li><strong>$50/month:</strong> "Ministry Partner" - Mid-level support</li>
<li><strong>$100/month:</strong> "Champion" - High-level partnership</li>
<li><strong>Custom Amount:</strong> Always allow custom recurring amounts</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">How Recurring Donations Work</h2>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Donor selects a recurring tier and enters payment information</li>
<li>First payment processes immediately</li>
<li>Subsequent payments automatically process on the same day each month</li>
<li>Donor receives receipt by email for each payment</li>
<li>Funds deposit to your bank account as usual</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4">Managing Recurring Donations</h2>
<p class="mb-4">Track your monthly supporters:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>View all recurring donations at <strong>Dashboard → Recurring</strong></li>
<li>See next scheduled payment dates</li>
<li>Monitor cancellations and payment failures</li>
<li>Export recurring donor list</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Donor Management</h2>
<p class="mb-6">Donors can manage their recurring gifts:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Update payment method</li>
<li>Change donation amount</li>
<li>Pause or cancel subscription</li>
<li>Update billing address</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4">Handling Failed Payments</h2>
<p class="mb-4">If a recurring payment fails:</p>
<ol class="list-decimal pl-6 mb-6 space-y-2">
<li>Stripe automatically retries the payment over 2 weeks</li>
<li>Donor receives email notification of the failure</li>
<li>You receive notification if retries are unsuccessful</li>
<li>Reach out personally to help them update payment method</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4">Best Practices</h2>
<ul class="list-disc pl-6 mb-6 space-y-2">
<li>Send personalized thank yous to new monthly partners</li>
<li>Provide exclusive updates to recurring donors</li>
<li>Recognize milestones (6 months, 1 year of giving)</li>
<li>Make it easy for supporters to upgrade their monthly amount</li>
<li>Send quarterly impact reports showing how recurring support is used</li>
</ul>

<p class="mb-6 p-4 bg-green-50 rounded-lg"><strong>Pro Tip:</strong> Frame monthly giving as joining your "mission team" rather than just making a donation. This creates a stronger sense of partnership and belonging.</p>
</div>'::text)
)
WHERE slug = 'recurring-donations';
